import { v } from 'convex/values';

import { mutation, query } from './_generated/server';

export const listForUser = query({
	args: { userId: v.id('users') },
	handler: async (ctx, { userId }) => {
		return await ctx.db
			.query('certificates')
			.withIndex('by_user', q => q.eq('userId', userId))
			.collect();
	},
});

export const get = query({
	args: { id: v.id('certificates') },
	handler: async (ctx, { id }) => ctx.db.get(id),
});

export const verify = query({
	args: { code: v.string() },
	handler: async (ctx, { code }) => {
		return await ctx.db
			.query('certificates')
			.withIndex('by_verification', q => q.eq('verificationCode', code))
			.first();
	},
});

export const generate = mutation({
	args: {
		userId: v.id('users'),
		userName: v.string(),
		courseId: v.id('courses'),
		courseName: v.string(),
		instructorId: v.id('users'),
		instructorName: v.string(),
		templateId: v.string(),
	},
	handler: async (ctx, args) => {
		const existing = await ctx.db
			.query('certificates')
			.withIndex('by_user', q => q.eq('userId', args.userId))
			.collect();
		const dup = existing.find(c => c.courseId === args.courseId);
		if (dup) return dup._id;

		const verificationCode = `DOCTRINA-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
		return await ctx.db.insert('certificates', {
			...args,
			issueDate: new Date().toISOString().split('T')[0],
			verificationCode,
		});
	},
});

export const remove = mutation({
	args: { id: v.id('certificates') },
	handler: async (ctx, { id }) => {
		await ctx.db.delete(id);
		return id;
	},
});
