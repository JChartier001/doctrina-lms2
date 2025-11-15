import type { WebhookEvent } from '@clerk/backend';
import { httpRouter } from 'convex/server';
import { ConvexError } from 'convex/values';
import type { Stripe } from 'stripe';
import { Webhook } from 'svix';

import { internal } from './_generated/api';
import { httpAction, MutationCtx } from './_generated/server';
import { stripe } from './lib/stripeClient';
import { handleStripeWebhook } from './stripe';

const http = httpRouter();

export async function validateRequest(
	req: Request,
	type: 'clerk' | 'stripe',
): Promise<WebhookEvent | Stripe.Event | null> {
	const payloadString = await req.text();
	const svixHeaders = {
		'svix-id': req.headers.get('svix-id')!,
		'svix-timestamp': req.headers.get('svix-timestamp')!,
		'svix-signature': req.headers.get('svix-signature')!,
	};
	try {
		if (type === 'clerk') {
			const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
			return wh.verify(payloadString, svixHeaders) as unknown as WebhookEvent;
		} else if (type === 'stripe') {
			const signature = req.headers.get('stripe-signature') as string;
			if (!signature) {
				throw new ConvexError({ code: 'MISSING_STRIPE_SIGNATURE_HEADER' });
			}

			const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
			return stripe.webhooks.constructEvent(payloadString, signature, webhookSecret);
		}
		return null;
	} catch (error) {
		console.error('Error verifying webhook event', error);
		return null;
	}
}

export async function handleClerkWebhook(ctx: MutationCtx, request: Request): Promise<Response> {
	const event = await validateRequest(request, 'clerk');
	if (!event) {
		return new Response('Error occurred', { status: 400 });
	}
	console.log(event, 'webhook hit');
	switch (event.type) {
		case 'user.created': // intentional fallthrough
		case 'user.updated':
			await ctx.runMutation(internal.users.upsertFromClerk, {
				data: { ...event.data, externalId: event.data.id },
			});
			break;

		case 'user.deleted': {
			await ctx.runMutation(internal.users.deleteFromClerk, {
				externalId: event.data.id!,
			});
			break;
		}

		default:
			console.log('Ignored webhook event', event.type);
	}

	return new Response(null, { status: 200 });
}

http.route({
	path: '/clerk-users-webhook',
	method: 'POST',
	handler: httpAction(async (ctx, request) => {
		return await handleClerkWebhook(ctx as unknown as MutationCtx, request);
	}),
});

http.route({
	path: '/stripe-webhook',
	method: 'POST',
	handler: httpAction(async (ctx, request) => {
		return await handleStripeWebhook(ctx as unknown as MutationCtx, request);
	}),
});

export default http;
