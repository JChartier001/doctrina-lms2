import { v } from 'convex/values';

import { api } from './_generated/api';
import type { Doc, Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';
import { verifyInstructorAccess } from './authHelpers';

/**
 * Create a course enrollment (called after successful payment)
 * Idempotent - won't create duplicate enrollments
 */
export const create = mutation({
	args: {
		userId: v.id('users'),
		courseId: v.id('courses'),
		purchaseId: v.id('purchases'),
	},
	handler: async (ctx, args) => {
		// Check if already enrolled (idempotent for webhook retries)
		const existing = await ctx.db
			.query('enrollments')
			.withIndex('by_user_course', q => q.eq('userId', args.userId).eq('courseId', args.courseId))
			.first();

		if (existing) {
			console.log('User already enrolled, returning existing enrollment');
			return existing._id;
		}

		// Create enrollment
		const enrollmentId = await ctx.db.insert('enrollments', {
			...args,
			enrolledAt: Date.now(),
			progressPercent: 0,
		});

		// Create welcome notification
		const course = await ctx.db.get(args.courseId);
		const user = await ctx.db.get(args.userId);

		if (course && user) {
			await ctx.db.insert('notifications', {
				userId: user._id,
				title: 'Course enrolled!',
				description: `You've successfully enrolled in "${course.title}". Start learning now!`,
				type: 'course_update',
				read: false,
				createdAt: Date.now(),
				link: `/courses/${args.courseId}/learn`,
			});
		}

		return enrollmentId;
	},
});

/**
 * Check if a user is enrolled in a course
 */
export const isEnrolled = query({
	args: {
		userId: v.id('users'),
		courseId: v.id('courses'),
	},
	handler: async (ctx, { userId, courseId }) => {
		const enrollment = await ctx.db
			.query('enrollments')
			.withIndex('by_user_course', q => q.eq('userId', userId).eq('courseId', courseId))
			.first();

		return !!enrollment;
	},
});

/**
 * Get current user's enrollment status for a course
 */
export const getCurrentUserEnrollment = query({
	args: { courseId: v.id('courses') },
	handler: async (ctx, { courseId }): Promise<Doc<'enrollments'> | null> => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			return null;
		}

		// Look up user by externalId to get Convex ID
		const user: Doc<'users'> | null = await ctx.runQuery(api.users.getByExternalId, {
			externalId: identity.subject,
		});

		if (!user) {
			return null;
		}

		const enrollment: Doc<'enrollments'> | null = await ctx.db
			.query('enrollments')
			.withIndex('by_user_course', q => q.eq('userId', user._id).eq('courseId', courseId))
			.first();

		return enrollment;
	},
});

/**
 * Get all enrollments for a user with course details
 */
export const getUserEnrollments = query({
	args: { userId: v.id('users') },
	handler: async (ctx, { userId }) => {
		const enrollments = await ctx.db
			.query('enrollments')
			.withIndex('by_user', q => q.eq('userId', userId))
			.order('desc')
			.collect();

		// Populate course details for each enrollment
		return await Promise.all(
			enrollments.map(async enrollment => {
				const course = await ctx.db.get(enrollment.courseId);
				return {
					...enrollment,
					course,
				};
			}),
		);
	},
});

/**
 * Get current authenticated user's enrollments
 */
export const getMyEnrollments = query({
	args: {},
	handler: async (ctx): Promise<Array<Doc<'enrollments'> & { course: Doc<'courses'> | null }>> => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			return [];
		}

		// Look up user by externalId to get Convex ID
		const user: Doc<'users'> | null = await ctx.runQuery(api.users.getByExternalId, {
			externalId: identity.subject,
		});

		if (!user) {
			return [];
		}

		const enrollments: Array<Doc<'enrollments'>> = await ctx.db
			.query('enrollments')
			.withIndex('by_user', q => q.eq('userId', user._id))
			.order('desc')
			.collect();

		// Populate course details
		return await Promise.all(
			enrollments.map(async (enrollment: Doc<'enrollments'>) => {
				const course: Doc<'courses'> | null = await ctx.db.get(enrollment.courseId);
				return {
					...enrollment,
					course,
				};
			}),
		);
	},
});

export const getMyEnrollmentsWithProgress = query({
	args: {},
	handler: async (
		ctx,
	): Promise<
		Array<
			Doc<'enrollments'> & {
				course: Doc<'courses'> | null;
				instructor: {
					_id: Id<'users'>;
					firstName: string;
					lastName: string;
					email: string;
				} | null;
				progress: {
					total: number;
					completed: number;
					percent: number;
					completedLessonIds: Array<Id<'lessons'>>;
				} | null;
				nextLessonId: Id<'lessons'> | null;
			}
		>
	> => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			return [];
		}

		// Look up user by externalId to get Convex ID
		const user: Doc<'users'> | null = await ctx.runQuery(api.users.getByExternalId, {
			externalId: identity.subject,
		});

		if (!user) {
			return [];
		}

		const enrollments: Array<Doc<'enrollments'>> = await ctx.db
			.query('enrollments')
			.withIndex('by_user', q => q.eq('userId', user._id))
			.order('desc')
			.collect();

		// Fetch all progress records once (optimization)
		const progressRecords: Array<Doc<'lessonProgress'>> = await ctx.db
			.query('lessonProgress')
			.withIndex('by_user', q => q.eq('userId', user._id))
			.collect();

		// Populate all related data for each enrollment
		return await Promise.all(
			enrollments.map(async (enrollment: Doc<'enrollments'>) => {
				const course: Doc<'courses'> | null = await ctx.db.get(enrollment.courseId);
				if (!course) {
					return {
						...enrollment,
						course: null,
						instructor: null,
						progress: null,
						nextLessonId: null,
					};
				}

				// Load instructor
				const instructor: Doc<'users'> | null = await ctx.db.get(course.instructorId);

				// Fetch modules
				const modules = await ctx.db
					.query('courseModules')
					.withIndex('by_course', q => q.eq('courseId', enrollment.courseId))
					.collect();

				const sortedModules = modules.sort((a, b) => a.order - b.order);

				// OPTIMIZATION: Fetch lessons once per module and store together
				// Eliminates duplicate fetches and avoids Map.get() undefined branches
				const modulesWithLessons = await Promise.all(
					sortedModules.map(async courseModule => {
						const lessons = await ctx.db
							.query('lessons')
							.withIndex('by_module', q => q.eq('moduleId', courseModule._id))
							.collect();

						const sortedLessons = lessons.sort((a, b) => a.order - b.order);
						return { module: courseModule, lessons: sortedLessons };
					}),
				);

				// Calculate totals using idiomatic array operations
				const allLessonIds = modulesWithLessons.flatMap(({ lessons }) => lessons).map(l => l._id);
				const completedLessonIds = progressRecords.filter(p => allLessonIds.includes(p.lessonId)).map(p => p.lessonId);
				const totalLessons = allLessonIds.length;

				// Find next incomplete lesson
				let nextLessonId = null;

				for (const { lessons } of modulesWithLessons) {
					for (const lesson of lessons) {
						const isCompleted = progressRecords.some(p => p.lessonId === lesson._id);
						if (!isCompleted) {
							nextLessonId = lesson._id;
							break;
						}
					}
					if (nextLessonId) break;
				}

				// If all complete, return first lesson
				if (!nextLessonId && modulesWithLessons.length > 0) {
					const firstModuleLessons = modulesWithLessons[0].lessons;

					if (firstModuleLessons.length > 0) {
						nextLessonId = firstModuleLessons[0]._id;
					}
				}

				return {
					...enrollment,
					course,
					instructor: instructor
						? {
								_id: instructor._id,
								firstName: instructor.firstName,
								lastName: instructor.lastName,
								email: instructor.email,
							}
						: null,
					progress: {
						total: totalLessons,
						completed: completedLessonIds.length,
						percent: enrollment.progressPercent,
						completedLessonIds,
					},
					nextLessonId,
				};
			}),
		);
	},
});

/**
 * Get enrollment count for a course (for instructor analytics)
 */
export const getCourseEnrollmentCount = query({
	args: { courseId: v.id('courses') },
	handler: async (ctx, { courseId }) => {
		const enrollments = await ctx.db
			.query('enrollments')
			.withIndex('by_course', q => q.eq('courseId', courseId))
			.collect();

		return enrollments.length;
	},
});

/**
 * Get enrolled students for a course (instructor only)
 * Returns aggregate data, not individual student PII
 */
export const getCourseStudents = query({
	args: { courseId: v.id('courses') },
	handler: async (ctx, { courseId }) => {
		// Verify instructor authorization
		await verifyInstructorAccess(ctx, courseId);

		const enrollments = await ctx.db
			.query('enrollments')
			.withIndex('by_course', q => q.eq('courseId', courseId))
			.collect();

		// Return aggregate data only (privacy protection)
		return {
			total: enrollments.length,
			completed: enrollments.filter(e => e.completedAt).length,
			averageProgress: enrollments.reduce((sum, e) => sum + e.progressPercent, 0) / enrollments.length || 0,
		};
	},
});

/**
 * Update enrollment progress (called when lessons marked complete)
 * Certificate generation is handled automatically by the enrollment trigger.
 * @see convex/triggers.ts - handleEnrollmentCompletion()
 */
export const updateProgress = mutation({
	args: {
		enrollmentId: v.id('enrollments'),
		progressPercent: v.number(),
		completedAt: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const { enrollmentId, ...updates } = args;

		await ctx.db.patch(enrollmentId, updates);
	},
});
