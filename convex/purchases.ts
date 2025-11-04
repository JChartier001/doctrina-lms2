import { v } from 'convex/values';

import { mutation, query } from './_generated/server';

export const listForUser = query({
	args: { userId: v.string() },
	handler: async (ctx, { userId }) => {
		return await ctx.db
			.query('purchases')
			.withIndex('by_user', q => q.eq('userId', userId))
			.collect();
	},
});

export const create = mutation({
	args: {
		userId: v.string(), // Clerk external ID
		courseId: v.id('courses'),
		amount: v.number(),
		stripeSessionId: v.optional(v.string()),
		status: v.union(v.literal('open'), v.literal('complete'), v.literal('expired')),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert('purchases', {
			...args,
			createdAt: Date.now(),
		});
	},
});

export const complete = mutation({
	args: { id: v.id('purchases') },
	handler: async (ctx, { id }) => {
		await ctx.db.patch(id, { status: 'complete' });
		return id;
	},
});

export const expire = mutation({
	args: { id: v.id('purchases') },
	handler: async (ctx, { id }) => {
		await ctx.db.patch(id, { status: 'expired' });
		return id;
	},
});
