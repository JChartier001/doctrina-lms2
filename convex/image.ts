import { v } from 'convex/values';

import { mutation, query } from './_generated/server';

export const generateUploadUrl = mutation({
	handler: async ctx => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error('Must be logged in');
		}

		return await ctx.storage.generateUploadUrl();
	},
});

export const getImageUrl = query({
	args: {
		storageId: v.id('_storage'),
	},
	handler: async (ctx, args) => {
		return await ctx.storage.getUrl(args.storageId);
	},
});
