import { v } from 'convex/values';

import { mutation, query } from './_generated/server';

export const list = query({
	args: { instructorId: v.optional(v.id('users')) },
	handler: async (ctx, { instructorId }) => {
		if (instructorId) {
			return await ctx.db
				.query('courses')
				.withIndex('by_instructor', q => q.eq('instructorId', instructorId))
				.order('desc')
				.collect();
		}
		return await ctx.db.query('courses').order('desc').collect();
	},
});

export const get = query({
	args: { id: v.id('courses') },
	handler: async (ctx, { id }) => ctx.db.get(id),
});

export const create = mutation({
	args: {
		title: v.string(),
		description: v.string(),
		instructorId: v.id('users'),
		level: v.optional(v.union(v.literal('beginner'), v.literal('intermediate'), v.literal('advanced'))),
		duration: v.optional(v.string()),
		price: v.optional(v.number()),
		thumbnailUrl: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const now = Date.now();
		const id = await ctx.db.insert('courses', {
			...args,
			rating: 0,
			reviewCount: 0,
			createdAt: now,
			updatedAt: now,
		});
		return id;
	},
});

export const update = mutation({
	args: {
		id: v.id('courses'),
		title: v.optional(v.string()),
		description: v.optional(v.string()),
		level: v.optional(v.union(v.literal('beginner'), v.literal('intermediate'), v.literal('advanced'))),
		duration: v.optional(v.string()),
		price: v.optional(v.number()),
		thumbnailUrl: v.optional(v.string()),
	},
	handler: async (ctx, { id, ...updates }) => {
		const existing = await ctx.db.get(id);
		if (!existing) throw new Error('Course not found');
		await ctx.db.patch(id, { ...updates, updatedAt: Date.now() });
		return id;
	},
});

export const remove = mutation({
	args: { id: v.id('courses') },
	handler: async (ctx, { id }) => {
		await ctx.db.delete(id);
		return id;
	},
});

/**
 * Get course with full curriculum, instructor details, and enrollment count
 * Used by course detail page (/courses/[id])
 */
export const getWithCurriculum = query({
	args: { courseId: v.id('courses') },
	handler: async (ctx, { courseId }) => {
		const course = await ctx.db.get(courseId);
		if (!course) {
			return null;
		}

		// Get all modules for this course
		const modules = await ctx.db
			.query('courseModules')
			.withIndex('by_course', q => q.eq('courseId', courseId))
			.collect();

		const sortedModules = modules.sort((a, b) => a.order - b.order);

		// Get lessons for each module
		const curriculum = await Promise.all(
			sortedModules.map(async module => {
				const lessons = await ctx.db
					.query('lessons')
					.withIndex('by_module', q => q.eq('moduleId', module._id))
					.collect();

				const sortedLessons = lessons.sort((a, b) => a.order - b.order);

				return {
					id: module._id,
					title: module.title,
					description: module.description,
					lessons: sortedLessons.map(l => ({
						id: l._id,
						title: l.title,
						type: l.type,
						duration: l.duration || '0:00',
						isPreview: l.isPreview,
					})),
				};
			}),
		);

		// Get instructor details
		const instructor = await ctx.db
			.query('users')
			.withIndex('by_externalId', q => q.eq('externalId', course.instructorId))
			.first();

		// Get enrollment count
		const enrollments = await ctx.db
			.query('enrollments')
			.withIndex('by_course', q => q.eq('courseId', courseId))
			.collect();

		// Get reviews
		const reviews = await ctx.db
			.query('courseReviews')
			.withIndex('by_course', q => q.eq('courseId', courseId))
			.filter(q => q.eq(q.field('hidden'), false))
			.collect();

		// Calculate average rating
		const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null;

		// Total lesson count
		const totalLessons = curriculum.reduce((sum, m) => sum + m.lessons.length, 0);

		return {
			...course,
			curriculum,
			instructor: instructor
				? {
						name: `${instructor.firstName} ${instructor.lastName}`,
						title: instructor.title || '',
						bio: instructor.bio || '',
						image: instructor.profilePhotoUrl || instructor.image,
					}
				: null,
			students: enrollments.length,
			lessons: totalLessons,
			rating: avgRating,
			reviewCount: reviews.length,
		};
	},
});
