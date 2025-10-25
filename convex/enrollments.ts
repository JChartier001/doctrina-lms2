import { v } from 'convex/values';

import { api } from './_generated/api';
import { mutation, query } from './_generated/server';

/**
 * Create a course enrollment (called after successful payment)
 * Idempotent - won't create duplicate enrollments
 */
export const create = mutation({
	args: {
		userId: v.string(), // Clerk external ID
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
		const user = await ctx.db
			.query('users')
			.withIndex('by_externalId', q => q.eq('externalId', args.userId))
			.first();

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
		userId: v.string(),
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
	handler: async (ctx, { courseId }) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			return null;
		}

		const enrollment = await ctx.db
			.query('enrollments')
			.withIndex('by_user_course', q => q.eq('userId', identity.subject).eq('courseId', courseId))
			.first();

		return enrollment;
	},
});

/**
 * Get all enrollments for a user with course details
 */
export const getUserEnrollments = query({
	args: { userId: v.string() },
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
	handler: async ctx => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			return [];
		}

		const enrollments = await ctx.db
			.query('enrollments')
			.withIndex('by_user', q => q.eq('userId', identity.subject))
			.order('desc')
			.collect();

		// Populate course details
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
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error('Not authenticated');
		}

		// Verify instructor owns course
		const course = await ctx.db.get(courseId);
		if (!course) {
			throw new Error('Course not found');
		}

		if (course.instructorId !== identity.subject) {
			throw new Error('Not authorized');
		}

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

		// If course completed, generate certificate
		if (updates.completedAt) {
			const enrollment = await ctx.db.get(enrollmentId);
			if (enrollment) {
				// Get user, course, and instructor for certificate generation
				const user = await ctx.db
					.query('users')
					.withIndex('by_externalId', q => q.eq('externalId', enrollment.userId))
					.first();

				const course = await ctx.db.get(enrollment.courseId);
				const instructor = course
					? await ctx.db
							.query('users')
							.withIndex('by_externalId', q => q.eq('externalId', course.instructorId))
							.first()
					: null;

				if (user && course && instructor) {
					await ctx.scheduler.runAfter(0, api.certificates.generate, {
						userId: user._id,
						userName: `${user.firstName} ${user.lastName}`,
						courseId: course._id,
						courseName: course.title,
						instructorId: instructor._id,
						instructorName: `${instructor.firstName} ${instructor.lastName}`,
						templateId: 'default',
					});
				}
			}
		}
	},
});
