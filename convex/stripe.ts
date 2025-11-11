import type { Stripe } from 'stripe';

import { api } from './_generated/api';
import { Doc, Id } from './_generated/dataModel';
import { MutationCtx } from './_generated/server';
import { validateRequest } from './http';

export const handleStripeWebhook = async (ctx: MutationCtx, request: Request): Promise<Response> => {
	const event = await validateRequest(request, 'stripe');
	if (!event) {
		return new Response('Error occurred', { status: 400 });
	}
	try {
		switch (event.type) {
			case 'checkout.session.completed': {
				const session = event.data.object as Stripe.Checkout.Session;
				const { courseId, userId: externalUserId } = session.metadata || {};

				if (!courseId || !externalUserId) {
					console.error('Missing metadata:', session.metadata);
					throw new Error('Missing courseId or userId in metadata');
				}

				// Look up user by externalId to get Convex ID
				const user: Doc<'users'> | null = await ctx.runQuery(api.users.getByExternalId, {
					externalId: externalUserId,
				});

				if (!user) {
					console.error('User not found for externalId:', externalUserId);
					throw new Error(`User not found for externalId: ${externalUserId}`);
				}

				console.log('Processing purchase:', { courseId, userId: user._id, externalUserId });

				const purchaseId = await ctx.db.insert('purchases', {
					userId: user._id,
					courseId: courseId as Id<'courses'>,
					amount: (session.amount_total || 0) / 100,
					stripeSessionId: session.id,
					status: 'complete',
					createdAt: Date.now(),
				});

				console.log('Created purchase:', purchaseId);

				// Create enrollment
				const enrollmentId = await ctx.db.insert('enrollments', {
					userId: user._id,
					courseId: courseId as Id<'courses'>,
					purchaseId,
					enrolledAt: Date.now(),
					progressPercent: 0,
				});

				console.log('Created enrollment:', enrollmentId);

				break;
			}

			case 'charge.refunded': {
				const charge = event.data.object as Stripe.Charge;
				console.log('Refund processed:', charge.id);
				// TODO: Handle refunds - update purchase status, revoke enrollment
				break;
			}

			default:
				console.log('Unhandled event type:', event.type);
		}
		return new Response(null, { status: 200 });
	} catch (error: unknown) {
		console.error('Error processing webhook:', error);
		return new Response(null, { status: 500 });
	}
};
