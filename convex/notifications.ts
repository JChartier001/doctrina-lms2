import { v } from 'convex/values';

import { mutation, query } from './_generated/server';

export const listForUser = query({
	args: { userId: v.id('users') },
	handler: async (ctx, { userId }) => {
		return await ctx.db
			.query('notifications')
			.withIndex('by_user_created', q => q.eq('userId', userId))
			.order('desc')
			.collect();
	},
});

export const markRead = mutation({
	args: { id: v.id('notifications') },
	handler: async (ctx, { id }) => {
		await ctx.db.patch(id, { read: true });
		return id;
	},
});

export const markAllRead = mutation({
	args: { userId: v.id('users') },
	handler: async (ctx, { userId }) => {
		const items = await ctx.db
			.query('notifications')
			.withIndex('by_user_created', q => q.eq('userId', userId))
			.collect();
		await Promise.all(items.map(n => ctx.db.patch(n._id, { read: true })));
		return items.length;
	},
});

export const create = mutation({
	args: {
		userId: v.id('users'),
		title: v.string(),
		description: v.string(),
		type: v.union(
			v.literal('course_update'),
			v.literal('message'),
			v.literal('announcement'),
			v.literal('community'),
			v.literal('live_session'),
			v.literal('certificate'),
			v.literal('milestone'),
		),
		link: v.optional(v.string()),
		metadata: v.optional(v.any()),
	},
	handler: async (ctx, args) => {
		const id = await ctx.db.insert('notifications', {
			...args,
			read: false,
			createdAt: Date.now(),
		});
		return id;
	},
});

export const remove = mutation({
	args: { id: v.id('notifications') },
	handler: async (ctx, { id }) => {
		await ctx.db.delete(id);
		return id;
	},
});
