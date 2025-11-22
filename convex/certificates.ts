import { v } from 'convex/values';

// TODO: Uncomment when implementing authentication
// import { api } from './_generated/api';
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

/**
 * List all certificates (admin only)
 * Returns all certificates in the system with user and course information
 */
export const listAll = query({
	args: {},
	handler: async ctx => {
		// TODO: Add authentication check in production
		// const identity = await ctx.auth.getUserIdentity();
		// if (!identity) throw new Error('Unauthorized: Must be logged in');

		// TODO: Add admin role check in production
		// const user = await ctx.runQuery(api.users.getByExternalId, { externalId: identity.subject });
		// if (!user?.isAdmin) throw new Error('Forbidden: Admin access required');

		return await ctx.db.query('certificates').collect();
	},
});

/**
 * List certificate templates
 * Returns available certificate template configurations
 */
export const listTemplates = query({
	args: {},
	handler: async _ctx => {
		// Certificate templates - these would typically come from a database table
		// For now, returning a static list of available templates
		return [
			{
				id: 'modern-blue',
				name: 'Modern Blue',
				description: 'Clean and professional blue design',
				previewUrl: '/templates/modern-blue-preview.png',
			},
			{
				id: 'classic-gold',
				name: 'Classic Gold',
				description: 'Traditional certificate with gold accents',
				previewUrl: '/templates/classic-gold-preview.png',
			},
			{
				id: 'minimalist',
				name: 'Minimalist',
				description: 'Simple and elegant design',
				previewUrl: '/templates/minimalist-preview.png',
			},
		];
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
		// Check if certificate exists before attempting deletion
		const certificate = await ctx.db.get(id);
		if (certificate) {
			await ctx.db.delete(id);
		}
		return id;
	},
});
