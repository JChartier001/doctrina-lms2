import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { literals } from 'convex-helpers/validators';

const status = literals('scheduled', 'live', 'completed', 'cancelled');

export const list = query({
	args: {
		status: v.optional(status),
	},
	handler: async (ctx, { status }) => {
		let items;
		if (status) {
			items = await ctx.db
				.query('liveSessions')
				.withIndex('by_status', q => q.eq('status', status))
				.collect();
		} else {
			items = await ctx.db.query('liveSessions').collect();
		}
		return items;
	},
});

export const get = query({
	args: { id: v.id('liveSessions') },
	handler: async (ctx, { id }) => ctx.db.get(id),
});

export const upcoming = query({
	args: {},
	handler: async ctx => {
		return await ctx.db
			.query('liveSessions')
			.withIndex('by_status', q => q.eq('status', 'scheduled'))
			.collect();
	},
});

export const past = query({
	args: {},
	handler: async ctx => {
		return await ctx.db
			.query('liveSessions')
			.withIndex('by_status', q => q.eq('status', 'completed'))
			.collect();
	},
});

export const create = mutation({
	args: {
		title: v.string(),
		description: v.string(),
		instructorId: v.id('users'),
		scheduledFor: v.number(),
		duration: v.number(),
		isRecorded: v.boolean(),
		maxParticipants: v.number(),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert('liveSessions', {
			...args,
			status: 'scheduled',
		});
	},
});

export const update = mutation({
	args: {
		id: v.id('liveSessions'),
		title: v.optional(v.string()),
		description: v.optional(v.string()),
		scheduledFor: v.optional(v.number()),
		duration: v.optional(v.number()),
		isRecorded: v.optional(v.boolean()),
		maxParticipants: v.optional(v.number()),
		recordingUrl: v.optional(v.string()),
		status: v.optional(status),
	},
	handler: async (ctx, { id, ...updates }) => {
		await ctx.db.patch(id, updates);
		return id;
	},
});

export const remove = mutation({
	args: { id: v.id('liveSessions') },
	handler: async (ctx, { id }) => {
		await ctx.db.delete(id);
		return id;
	},
});

export const join = mutation({
	args: { sessionId: v.id('liveSessions'), userId: v.id('users') },
	handler: async (ctx, { sessionId, userId }) => {
		const session = await ctx.db.get(sessionId);
		if (!session) throw new Error('Session not found');
		const count = await ctx.db
			.query('sessionParticipants')
			.withIndex('by_session', q => q.eq('sessionId', sessionId))
			.collect()
			.then(a => a.length);
		if (count >= session.maxParticipants) throw new Error('Session is full');
		const existing = await ctx.db
			.query('sessionParticipants')
			.withIndex('by_session', q => q.eq('sessionId', sessionId))
			.collect();
		if (existing.some(p => p.userId === userId)) return true;
		await ctx.db.insert('sessionParticipants', {
			sessionId,
			userId,
			joinedAt: Date.now(),
		});
		return true;
	},
});

export const leave = mutation({
	args: { sessionId: v.id('liveSessions'), userId: v.id('users') },
	handler: async (ctx, { sessionId, userId }) => {
		const items = await ctx.db
			.query('sessionParticipants')
			.withIndex('by_session', q => q.eq('sessionId', sessionId))
			.collect();
		const found = items.find(p => p.userId === userId);
		if (found) await ctx.db.delete(found._id);
		return true;
	},
});

export const start = mutation({
	args: { id: v.id('liveSessions') },
	handler: async (ctx, { id }) => {
		await ctx.db.patch(id, { status: 'live' });
		return id;
	},
});

export const end = mutation({
	args: { id: v.id('liveSessions') },
	handler: async (ctx, { id }) => {
		const session = await ctx.db.get(id);
		if (!session) throw new Error('Session not found');
		await ctx.db.patch(id, {
			status: 'completed',
			recordingUrl: session.isRecorded
				? `/recordings/session-${id}.mp4`
				: undefined,
		});
		return id;
	},
});

export const cancel = mutation({
	args: { id: v.id('liveSessions') },
	handler: async (ctx, { id }) => {
		await ctx.db.patch(id, { status: 'cancelled' });
		return id;
	},
});
