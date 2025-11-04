import type { Stripe } from 'stripe';

import { Id } from './_generated/dataModel';
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
				const { courseId, userId } = session.metadata || {};

				if (!courseId || !userId) {
					console.error('Missing metadata:', session.metadata);
					throw new Error('Missing courseId or userId in metadata');
				}

				console.log('Processing purchase:', { courseId, userId });

				const purchaseId = await ctx.db.insert('purchases', {
					userId: userId as Id<'users'>,
					courseId: courseId as Id<'courses'>,
					amount: (session.amount_total || 0) / 100,
					stripeSessionId: session.id,
					status: 'complete',
					createdAt: Date.now(),
				});
				// Create purchase record

				console.log('Created purchase:', purchaseId);

				// Create enrollment
				const enrollmentId = await ctx.db.insert('enrollments', {
					userId,
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
