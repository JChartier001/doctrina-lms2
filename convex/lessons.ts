import { v } from 'convex/values';

import { api } from './_generated/api';
import { Doc } from './_generated/dataModel';
import { mutation, query } from './_generated/server';
import { verifyInstructorAccess } from './authHelpers';

/**
 * Create a new lesson in a module
 */
export const create = mutation({
	args: {
		moduleId: v.id('courseModules'),
		title: v.string(),
		description: v.optional(v.string()),
		type: v.union(v.literal('video'), v.literal('quiz'), v.literal('assignment')),
		duration: v.optional(v.string()),
		videoUrl: v.optional(v.string()),
		videoId: v.optional(v.string()),
		content: v.optional(v.string()),
		isPreview: v.optional(v.boolean()),
		order: v.number(),
	},
	handler: async (ctx, args) => {
		// Get course ID from module
		const courseModule = await ctx.db.get(args.moduleId);
		if (!courseModule) {
			throw new Error('Module not found');
		}

		// Verify instructor authorization
		await verifyInstructorAccess(ctx, courseModule.courseId);

		// Create lesson
		const lessonId = await ctx.db.insert('lessons', {
			...args,
			isPreview: args.isPreview ?? false,
			createdAt: Date.now(),
		});

		return lessonId;
	},
});

/**
 * List all lessons for a module
 */
export const list = query({
	args: { moduleId: v.id('courseModules') },
	handler: async (ctx, { moduleId }) => {
		const lessons = await ctx.db
			.query('lessons')
			.withIndex('by_module', q => q.eq('moduleId', moduleId))
			.collect();

		// Sort by order field
		return lessons.sort((a, b) => a.order - b.order);
	},
});

/**
 * Get a single lesson with access control
 * - Preview lessons: accessible to anyone
 * - Non-preview lessons: accessible to enrolled students or course instructor
 */
export const get = query({
	args: { lessonId: v.id('lessons') },
	handler: async (ctx, { lessonId }) => {
		const lesson = await ctx.db.get(lessonId);
		if (!lesson) {
			return null;
		}

		// If preview lesson, allow anyone
		if (lesson.isPreview) {
			return lesson;
		}

		// Check authentication for non-preview lessons
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error('Must be authenticated to access this lesson');
		}

		// Get course via module
		const courseModule = await ctx.db.get(lesson.moduleId);
		if (!courseModule) {
			throw new Error('Module not found');
		}

		const course = await ctx.db.get(courseModule.courseId);
		if (!course) {
			throw new Error('Course not found');
		}

		// Get user to check instructor status
		const user: Doc<'users'> | null = await ctx.runQuery(api.users.getByExternalId, {
			externalId: identity.subject,
		});

		if (!user) {
			throw new Error('User not found');
		}

		// Check if user is the instructor
		if (course.instructorId === user?._id) {
			return lesson;
		}

		// Check if user is enrolled in the course

		const enrollment = await ctx.db
			.query('enrollments')
			.withIndex('by_user_course', q => q.eq('userId', user._id).eq('courseId', course._id))
			.first();

		if (!enrollment) {
			throw new Error('Not enrolled in this course');
		}

		return lesson;
	},
});

/**
 * Update a lesson
 */
export const update = mutation({
	args: {
		lessonId: v.id('lessons'),
		title: v.optional(v.string()),
		description: v.optional(v.string()),
		duration: v.optional(v.string()),
		videoUrl: v.optional(v.string()),
		videoId: v.optional(v.string()),
		content: v.optional(v.string()),
		isPreview: v.optional(v.boolean()),
		order: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const { lessonId, ...updates } = args;

		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error('Not authenticated');
		}

		// Verify ownership
		const lesson = await ctx.db.get(lessonId);
		if (!lesson) {
			throw new Error('Lesson not found');
		}

		const courseModule = await ctx.db.get(lesson.moduleId);
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

		// Update lesson
		await ctx.db.patch(lessonId, updates);
	},
});

/**
 * Delete a lesson
 */
export const remove = mutation({
	args: { lessonId: v.id('lessons') },
	handler: async (ctx, { lessonId }) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error('Not authenticated');
		}

		// Verify ownership
		const lesson = await ctx.db.get(lessonId);
		if (!lesson) {
			throw new Error('Lesson not found');
		}

		const courseModule = await ctx.db.get(lesson.moduleId);
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

		// Delete lesson progress records for this lesson
		const progressRecords = await ctx.db
			.query('lessonProgress')
			.withIndex('by_lesson', q => q.eq('lessonId', lessonId))
			.collect();

		for (const progress of progressRecords) {
			await ctx.db.delete(progress._id);
		}

		// Delete lesson
		await ctx.db.delete(lessonId);
	},
});

/**
 * Reorder lessons within a module
 */
export const reorder = mutation({
	args: {
		moduleId: v.id('courseModules'),
		lessonIds: v.array(v.id('lessons')),
	},
	handler: async (ctx, { moduleId, lessonIds }) => {
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

		// Update order for each lesson
		for (let i = 0; i < lessonIds.length; i++) {
			await ctx.db.patch(lessonIds[i], { order: i });
		}
	},
});
