import { v } from 'convex/values';

import { api } from './_generated/api';
import { Doc } from './_generated/dataModel';
import { query } from './_generated/server';
import { mutation } from './triggers';

/**
 * Mark a lesson as complete for the authenticated user
 * Idempotent - returns existing progress record if already marked complete
 *
 * @param lessonId - ID of the lesson to mark complete
 * @returns ID of the lessonProgress record
 * @throws "Not authenticated" if user is not logged in
 * @throws "Not enrolled in this course" if user lacks enrollment
 */
export const markComplete = mutation({
	args: {
		lessonId: v.id('lessons'),
	},
	handler: async (ctx, { lessonId }): Promise<string> => {
		// Authentication check (Constraint #1)
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error('Not authenticated');
		}

		// Look up user by external ID to get Convex ID
		const user: Doc<'users'> | null = await ctx.runQuery(api.users.getByExternalId, {
			externalId: identity.subject,
		});

		if (!user) {
			throw new Error('User not found');
		}

		// Load lesson → get moduleId → get courseId
		const lesson: Doc<'lessons'> | null = await ctx.db.get(lessonId);
		if (!lesson) {
			throw new Error('Lesson not found');
		}

		const courseModule: Doc<'courseModules'> | null = await ctx.db.get(lesson.moduleId);
		if (!courseModule) {
			throw new Error('Module not found');
		}

		const courseId = courseModule.courseId;

		// Verify enrollment exists (Constraint #2 - row-level security, AC-101.6)
		const enrollment: Doc<'enrollments'> | null = await ctx.db
			.query('enrollments')
			.withIndex('by_user_course', q => q.eq('userId', user._id).eq('courseId', courseId))
			.first();

		if (!enrollment) {
			throw new Error('Not enrolled in this course');
		}

		// Check for existing progress record (Constraint #8 - idempotency, AC-101.5)
		const existing: Doc<'lessonProgress'> | null = await ctx.db
			.query('lessonProgress')
			.withIndex('by_user_lesson', q => q.eq('userId', user._id).eq('lessonId', lessonId))
			.first();

		if (existing) {
			// Already marked complete - return existing ID (idempotent)
			return existing._id;
		}

		// Create new progress record (Constraint #4 - Unix epoch milliseconds)
		const progressId = await ctx.db.insert('lessonProgress', {
			userId: user._id,
			lessonId,
			completedAt: Date.now(),
		});

		// Recalculate course progress (AC-101.2)
		await ctx.runMutation(api.lessonProgress.recalculateProgress, {
			enrollmentId: enrollment._id,
		});

		return progressId;
	},
});

/**
 * Recalculate course progress percentage after lesson completion
 * Internal mutation called by markComplete()
 * Triggers certificate generation at 100% completion
 *
 * @param enrollmentId - ID of the enrollment to recalculate
 * @returns Object with progressPercent and completedAt
 */
export const recalculateProgress = mutation({
	args: {
		enrollmentId: v.id('enrollments'),
	},
	handler: async (ctx, { enrollmentId }) => {
		const enrollment = await ctx.db.get(enrollmentId);
		if (!enrollment) {
			throw new Error('Enrollment not found');
		}

		const courseId = enrollment.courseId;

		// Query all modules for course, ordered (Constraint #3 - indexed queries)
		const modules = await ctx.db
			.query('courseModules')
			.withIndex('by_course', q => q.eq('courseId', courseId))
			.collect();

		const sortedModules = modules.sort((a, b) => a.order - b.order);

		// Count total lessons across all modules (AC-101.8)
		let totalLessons = 0;
		const allLessonIds: string[] = [];

		for (const courseModule of sortedModules) {
			const lessons = await ctx.db
				.query('lessons')
				.withIndex('by_module', q => q.eq('moduleId', courseModule._id))
				.collect();

			totalLessons += lessons.length;
			allLessonIds.push(...lessons.map(l => l._id));
		}

		// Query progress records for this user (Constraint #3 - indexed query)
		const progressRecords = await ctx.db
			.query('lessonProgress')
			.withIndex('by_user', q => q.eq('userId', enrollment.userId))
			.collect();

		// Filter to only lessons in this course
		const completedLessonIds = new Set(
			progressRecords.filter(p => allLessonIds.includes(p.lessonId)).map(p => p.lessonId),
		);

		const completedCount = completedLessonIds.size;

		// Calculate progress percentage (AC-101.2, AC-101.8)
		const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

		// Determine completion timestamp (AC-101.4)
		const completedAt = progressPercent === 100 ? Date.now() : undefined;

		// Update enrollment record
		await ctx.db.patch(enrollmentId, {
			progressPercent,
			...(completedAt !== undefined && { completedAt }),
		});

		return { progressPercent, completedAt: completedAt ?? null };
	},
});

/**
 * Get progress summary for authenticated user in a specific course
 * Returns null if user is not enrolled
 *
 * @param courseId - ID of the course to get progress for
 * @returns Progress object with completion details, or null if not enrolled
 */
export const getUserProgress = query({
	args: { courseId: v.id('courses') },
	handler: async (
		ctx,
		{ courseId },
	): Promise<{
		enrollmentId: string;
		total: number;
		completed: number;
		percent: number;
		completedLessonIds: string[];
	} | null> => {
		// Authentication check (Constraint #1)
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			return null;
		}

		const user: Doc<'users'> | null = await ctx.runQuery(api.users.getByExternalId, {
			externalId: identity.subject,
		});

		if (!user) {
			return null;
		}

		// Find enrollment (AC-101.3)
		const enrollment = await ctx.db
			.query('enrollments')
			.withIndex('by_user_course', q => q.eq('userId', user._id).eq('courseId', courseId))
			.first();

		if (!enrollment) {
			return null;
		}

		// Get all modules and lessons for course
		const modules = await ctx.db
			.query('courseModules')
			.withIndex('by_course', q => q.eq('courseId', courseId))
			.collect();

		let totalLessons = 0;
		const allLessonIds: string[] = [];

		for (const courseModule of modules) {
			const lessons = await ctx.db
				.query('lessons')
				.withIndex('by_module', q => q.eq('moduleId', courseModule._id))
				.collect();

			totalLessons += lessons.length;
			allLessonIds.push(...lessons.map(l => l._id));
		}

		// Query progress records for user (Constraint #2 - row-level security)
		const progressRecords = await ctx.db
			.query('lessonProgress')
			.withIndex('by_user', q => q.eq('userId', user._id))
			.collect();

		// Filter to lessons in this course
		const completedLessonIds = progressRecords.filter(p => allLessonIds.includes(p.lessonId)).map(p => p.lessonId);

		return {
			enrollmentId: enrollment._id,
			total: totalLessons,
			completed: completedLessonIds.length,
			percent: enrollment.progressPercent,
			completedLessonIds,
		};
	},
});

/**
 * Get the next incomplete lesson for "Continue Learning" functionality
 * Returns first lesson if all lessons are complete (for review)
 *
 * @param courseId - ID of the course
 * @returns Lesson ID of next incomplete lesson, or null if course has no lessons
 */
export const getNextIncompleteLesson = query({
	args: { courseId: v.id('courses') },
	handler: async (ctx, { courseId }): Promise<string | null> => {
		// Authentication check (Constraint #1)
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			return null;
		}

		const user: Doc<'users'> | null = await ctx.runQuery(api.users.getByExternalId, {
			externalId: identity.subject,
		});

		if (!user) {
			return null;
		}

		// Get all modules and lessons in order (AC-101.7)
		const modules = await ctx.db
			.query('courseModules')
			.withIndex('by_course', q => q.eq('courseId', courseId))
			.collect();

		const sortedModules = modules.sort((a, b) => a.order - b.order);

		// Iterate through modules and lessons sequentially
		for (const courseModule of sortedModules) {
			const lessons = await ctx.db
				.query('lessons')
				.withIndex('by_module', q => q.eq('moduleId', courseModule._id))
				.collect();

			const sortedLessons = lessons.sort((a, b) => a.order - b.order);

			for (const lesson of sortedLessons) {
				// Check if lesson is complete
				const progress = await ctx.db
					.query('lessonProgress')
					.withIndex('by_user_lesson', q => q.eq('userId', user._id).eq('lessonId', lesson._id))
					.first();

				if (!progress) {
					// Found first incomplete lesson
					return lesson._id;
				}
			}
		}

		// All lessons complete - return first lesson for review
		if (sortedModules.length > 0) {
			const firstModule = sortedModules[0];
			const firstModuleLessons = await ctx.db
				.query('lessons')
				.withIndex('by_module', q => q.eq('moduleId', firstModule._id))
				.collect();

			const sortedFirstLessons = firstModuleLessons.sort((a, b) => a.order - b.order);

			if (sortedFirstLessons.length > 0) {
				return sortedFirstLessons[0]._id;
			}
		}

		return null;
	},
});
