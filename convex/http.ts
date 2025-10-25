import type { WebhookEvent } from '@clerk/backend';
import { httpRouter } from 'convex/server';
import { Webhook } from 'svix';

import { api, internal } from './_generated/api';
import { httpAction, MutationCtx } from './_generated/server';
import dayjs from '../lib/dayjs';

const http = httpRouter();

const now = dayjs().format('YYYY-MM-DD HH:mm:ss');

export async function handleWebhook(
	ctx: MutationCtx,
	request: Request
): Promise<Response> {
	const event = await validateRequest(request);
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
		return await handleWebhook(ctx as unknown as MutationCtx, request);
	}),
});

export async function validateRequest(
	req: Request
): Promise<WebhookEvent | null> {
	const payloadString = await req.text();
	console.log(
		req.headers,
		payloadString,
		'headers and payload string',
		process.env.CLERK_WEBHOOK_SECRET
	);
	const svixHeaders = {
		'svix-id': req.headers.get('svix-id')!,
		'svix-timestamp': req.headers.get('svix-timestamp')!,
		'svix-signature': req.headers.get('svix-signature')!,
	};
	const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
	try {
		return wh.verify(payloadString, svixHeaders) as unknown as WebhookEvent;
	} catch (error) {
		console.error('Error verifying webhook event', error);
		return null;
	}
}

export default http;
