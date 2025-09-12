import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const list = query({
	args: {
		limit: v.optional(v.number()),
		courseId: v.optional(v.id('courses')),
	},
	handler: async (ctx, { limit, courseId }) => {
		let q = ctx.db
			.query('resources')
			.withIndex('by_course', q => (courseId ? q.eq('courseId', courseId) : q))
			.order('desc');

		const items = await q.collect();
		return limit ? items.slice(0, limit) : items;
	},
});

export const featured = query({
	args: { limit: v.optional(v.number()) },
	handler: async (ctx, { limit }) => {
		const items = await ctx.db.query('resources').collect();
		const filtered = items.filter(r => r.featured);
		return limit ? filtered.slice(0, limit) : filtered;
	},
});

export const get = query({
	args: { id: v.id('resources') },
	handler: async (ctx, { id }) => ctx.db.get(id),
});

export const search = query({
	args: { query: v.string(), limit: v.optional(v.number()) },
	handler: async (ctx, { query, limit }) => {
		const q = query.toLowerCase().trim();
		if (!q) return [];
		const items = await ctx.db.query('resources').collect();
		const res = items.filter(
			r =>
				r.title.toLowerCase().includes(q) ||
				r.description.toLowerCase().includes(q) ||
				r.tags.some(t => t.toLowerCase().includes(q)) ||
				r.categories.some(c => c.toLowerCase().includes(q))
		);
		return limit ? res.slice(0, limit) : res;
	},
});

export const create = mutation({
	args: {
		title: v.string(),
		description: v.string(),
		type: v.string(),
		categories: v.array(v.string()),
		tags: v.array(v.string()),
		url: v.string(),
		thumbnailUrl: v.optional(v.string()),
		author: v.string(),
		dateAdded: v.string(),
		featured: v.boolean(),
		downloadCount: v.number(),
		favoriteCount: v.number(),
		rating: v.number(),
		reviewCount: v.number(),
		difficulty: v.union(
			v.literal('beginner'),
			v.literal('intermediate'),
			v.literal('advanced')
		),
		duration: v.optional(v.string()),
		fileSize: v.optional(v.string()),
		courseId: v.optional(v.id('courses')),
		restricted: v.boolean(),
	},
	handler: async (ctx, args) => ctx.db.insert('resources', args),
});

export const update = mutation({
	args: {
		id: v.id('resources'),
		title: v.optional(v.string()),
		description: v.optional(v.string()),
		type: v.optional(v.string()),
		categories: v.optional(v.array(v.string())),
		tags: v.optional(v.array(v.string())),
		url: v.optional(v.string()),
		thumbnailUrl: v.optional(v.string()),
		author: v.optional(v.string()),
		dateAdded: v.optional(v.string()),
		featured: v.optional(v.boolean()),
		downloadCount: v.optional(v.number()),
		favoriteCount: v.optional(v.number()),
		rating: v.optional(v.number()),
		reviewCount: v.optional(v.number()),
		difficulty: v.optional(
			v.union(
				v.literal('beginner'),
				v.literal('intermediate'),
				v.literal('advanced')
			)
		),
		duration: v.optional(v.string()),
		fileSize: v.optional(v.string()),
		courseId: v.optional(v.id('courses')),
		restricted: v.optional(v.boolean()),
	},
	handler: async (ctx, { id, ...updates }) => {
		await ctx.db.patch(id, updates);
		return id;
	},
});

export const remove = mutation({
	args: { id: v.id('resources') },
	handler: async (ctx, { id }) => {
		await ctx.db.delete(id);
		return id;
	},
});
