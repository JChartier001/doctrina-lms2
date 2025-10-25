import { v } from 'convex/values';

import { mutation, query } from './_generated/server';

export const listForUser = query({
	args: { userId: v.id('users') },
	handler: async (ctx, { userId }) => {
		const links = await ctx.db
			.query('favorites')
			.withIndex('by_user_resource', q => q.eq('userId', userId))
			.collect();
		const resourceIds = links.map(l => l.resourceId);
		const resources = await Promise.all(resourceIds.map(id => ctx.db.get(id)));
		return resources.filter(Boolean);
	},
});

export const isFavorited = query({
	args: { userId: v.id('users'), resourceId: v.id('resources') },
	handler: async (ctx, { userId, resourceId }) => {
		const link = await ctx.db
			.query('favorites')
			.withIndex('by_user_resource', q => q.eq('userId', userId).eq('resourceId', resourceId))
			.first();
		return Boolean(link);
	},
});

export const add = mutation({
	args: { userId: v.id('users'), resourceId: v.id('resources') },
	handler: async (ctx, { userId, resourceId }) => {
		const existing = await ctx.db
			.query('favorites')
			.withIndex('by_user_resource', q => q.eq('userId', userId).eq('resourceId', resourceId))
			.first();
		if (existing) return existing._id;
		return await ctx.db.insert('favorites', {
			userId,
			resourceId,
			createdAt: Date.now(),
		});
	},
});

export const remove = mutation({
	args: { userId: v.id('users'), resourceId: v.id('resources') },
	handler: async (ctx, { userId, resourceId }) => {
		const existing = await ctx.db
			.query('favorites')
			.withIndex('by_user_resource', q => q.eq('userId', userId).eq('resourceId', resourceId))
			.first();
		if (existing) await ctx.db.delete(existing._id);
		return true;
	},
});
