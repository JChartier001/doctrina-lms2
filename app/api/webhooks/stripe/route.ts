import { ConvexHttpClient } from 'convex/browser';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: '2025-09-30.clover',
});

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
	const body = await req.text();
	const headersList = await headers();
	const signature = headersList.get('stripe-signature');

	if (!signature) {
		console.error('No Stripe signature found');
		return NextResponse.json({ error: 'No signature' }, { status: 400 });
	}

	let event: Stripe.Event;

	try {
		event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
	} catch (err: unknown) {
		console.error('Webhook signature verification failed:', (err as Error).message);
		return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
	}

	console.log('Received Stripe event:', event.type);

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

				// Create purchase record
				const purchaseId = await convex.mutation(api.purchases.create, {
					userId: userId as Id<'users'>,
					courseId: courseId as Id<'courses'>,
					amount: (session.amount_total || 0) / 100,
					stripeSessionId: session.id,
					status: 'complete',
				});

				console.log('Created purchase:', purchaseId);

				// Create enrollment
				const enrollmentId = await convex.mutation(api.enrollments.create, {
					userId,
					courseId: courseId as Id<'courses'>,
					purchaseId,
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

		return NextResponse.json({ received: true });
	} catch (error: unknown) {
		console.error('Error processing webhook:', error);
		return NextResponse.json({ error: (error as Error).message }, { status: 500 });
	}
}
