import { v } from 'convex/values';

import { api } from './_generated/api';
import { Doc } from './_generated/dataModel';
import { mutation, query } from './_generated/server';
import { verifyInstructorAccess } from './authHelpers';

/**
 * Create a new course module (section)
 */
export const create = mutation({
	args: {
		courseId: v.id('courses'),
		title: v.string(),
		description: v.optional(v.string()),
		order: v.number(),
	},
	handler: async (ctx, args) => {
		// Verify instructor authorization
		await verifyInstructorAccess(ctx, args.courseId);

		// Create module
		const moduleId = await ctx.db.insert('courseModules', {
			...args,
			createdAt: Date.now(),
		});

		return moduleId;
	},
});

/**
 * List all modules for a course
 */
export const list = query({
	args: { courseId: v.id('courses') },
	handler: async (ctx, { courseId }) => {
		const modules = await ctx.db
			.query('courseModules')
			.withIndex('by_course', q => q.eq('courseId', courseId))
			.collect();

		// Sort by order field
		return modules.sort((a, b) => a.order - b.order);
	},
});

/**
 * Get a single module by ID
 */
export const get = query({
	args: { moduleId: v.id('courseModules') },
	handler: async (ctx, { moduleId }) => {
		return await ctx.db.get(moduleId);
	},
});

/**
 * Update a course module
 */
export const update = mutation({
	args: {
		moduleId: v.id('courseModules'),
		title: v.optional(v.string()),
		description: v.optional(v.string()),
		order: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const { moduleId, ...updates } = args;

		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error('Not authenticated');
		}

		// Verify ownership
		const courseModule = await ctx.db.get(moduleId);
		if (!courseModule) {
			throw new Error('Module not found');
		}

		const course = await ctx.db.get(courseModule.courseId);
		if (!course) {
			throw new Error('Course not found');
		}

		const user: Doc<'users'> | null = await ctx.runQuery(api.users.getByExternalId, {
			externalId: identity.subject,
		});

		if (course.instructorId !== user?._id) {
			throw new Error('Not authorized');
		}

		// Update module
		await ctx.db.patch(moduleId, updates);
	},
});

/**
 * Delete a course module and all its lessons
 */
export const remove = mutation({
	args: { moduleId: v.id('courseModules') },
	handler: async (ctx, { moduleId }) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error('Not authenticated');
		}

		// Verify ownership
		const courseModule = await ctx.db.get(moduleId);
		if (!courseModule) {
			throw new Error('Module not found');
		}

		const course = await ctx.db.get(courseModule.courseId);
		if (!course) {
			throw new Error('Course not found');
		}

		const user: Doc<'users'> | null = await ctx.runQuery(api.users.getByExternalId, {
			externalId: identity.subject,
		});

		if (course.instructorId !== user?._id) {
			throw new Error('Not authorized');
		}

		// Delete all lessons in module first (cascade delete)
		const lessons = await ctx.db
			.query('lessons')
			.withIndex('by_module', q => q.eq('moduleId', moduleId))
			.collect();

		for (const lesson of lessons) {
			// Delete lesson progress records
			const progressRecords = await ctx.db
				.query('lessonProgress')
				.withIndex('by_lesson', q => q.eq('lessonId', lesson._id))
				.collect();

			for (const progress of progressRecords) {
				await ctx.db.delete(progress._id);
			}

			// Delete lesson
			await ctx.db.delete(lesson._id);
		}

		// Delete module
		await ctx.db.delete(moduleId);
	},
});

/**
 * Reorder modules for a course
 */
export const reorder = mutation({
	args: {
		courseId: v.id('courses'),
		moduleIds: v.array(v.id('courseModules')),
	},
	handler: async (ctx, { courseId, moduleIds }) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error('Not authenticated');
		}

		const course = await ctx.db.get(courseId);
		if (!course) {
			throw new Error('Course not found');
		}
		const user: Doc<'users'> | null = await ctx.runQuery(api.users.getByExternalId, {
			externalId: identity.subject,
		});

		if (course.instructorId !== user?._id) {
			throw new Error('Not authorized');
		}

		// Update order for each module
		for (let i = 0; i < moduleIds.length; i++) {
			await ctx.db.patch(moduleIds[i], { order: i });
		}
	},
});
