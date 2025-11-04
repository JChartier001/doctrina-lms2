import { v } from 'convex/values';

import { mutation, query } from './_generated/server';

/**
 * Check who is currently authenticated and their user info
 * Run: npx convex run seedCurrentUser:whoAmI
 */
export const whoAmI = query({
	args: {},
	handler: async ctx => {
		const identity = await ctx.auth.getUserIdentity();

		if (!identity) {
			console.log('❌ No user authenticated');
			return { authenticated: false };
		}

		console.log('\n🔐 Current Authentication:');
		console.log(`Clerk User ID (identity.subject): ${identity.subject}`);
		console.log(`Email: ${identity.email}`);
		console.log(`Name: ${identity.name}`);

		// Check if user exists in Convex users table
		const convexUser = await ctx.db
			.query('users')
			.withIndex('by_externalId', q => q.eq('externalId', identity.subject))
			.first();

		if (convexUser) {
			console.log(`\n✅ User exists in Convex database`);
			console.log(`Convex User ID (_id): ${convexUser._id}`);
			console.log(`Is Instructor: ${convexUser.isInstructor}`);
		} else {
			console.log(`\n⚠️ User NOT found in Convex users table`);
			console.log(`This user needs to be synced via Clerk webhook first`);
		}

		// Check enrollments for this user
		const enrollments = await ctx.db
			.query('enrollments')
			.withIndex('by_user', q => q.eq('userId', identity.subject))
			.collect();

		console.log(`\n📚 Enrollments: ${enrollments.length} found`);
		for (const enrollment of enrollments) {
			const course = await ctx.db.get(enrollment.courseId);
			console.log(`- Course: ${course?.title || 'Unknown'} (${enrollment.progressPercent}% complete)`);
		}

		return {
			authenticated: true,
			clerkId: identity.subject,
			email: identity.email,
			convexUserId: convexUser?._id,
			enrollmentCount: enrollments.length,
		};
	},
});

/**
 * Check if current user is enrolled in a specific course
 * Run: npx convex run seedCurrentUser:checkEnrollment '{"courseId": "..."}'
 */
export const checkEnrollment = query({
	args: {
		courseId: v.id('courses'),
	},
	handler: async (ctx, { courseId }) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			console.log('❌ Not authenticated');
			return null;
		}

		console.log('\n🔍 Checking enrollment:');
		console.log(`Course ID: ${courseId}`);
		console.log(`User ID from Convex Auth (identity.subject): ${identity.subject}`);

		const enrollment = await ctx.db
			.query('enrollments')
			.withIndex('by_user_course', q => q.eq('userId', identity.subject).eq('courseId', courseId))
			.first();

		if (enrollment) {
			console.log('✅ Enrollment found!');
			console.log(`Enrollment ID: ${enrollment._id}`);
			console.log(`Progress: ${enrollment.progressPercent}%`);
			console.log(`Enrolled at: ${new Date(enrollment.enrolledAt).toLocaleString()}`);
		} else {
			console.log('❌ No enrollment found with that exact userId + courseId combo');

			// Check all enrollments for this course
			console.log('\n📋 All enrollments for this course:');
			const courseEnrollments = await ctx.db
				.query('enrollments')
				.withIndex('by_course', q => q.eq('courseId', courseId))
				.collect();
			console.log(`Total enrollments for this course: ${courseEnrollments.length}`);
			for (const e of courseEnrollments) {
				console.log(`- userId: ${e.userId} (Match: ${e.userId === identity.subject ? 'YES ✅' : 'NO ❌'})`);
			}

			// Check all enrollments for current user
			console.log('\n📋 All enrollments for current user:');
			const allEnrollments = await ctx.db
				.query('enrollments')
				.withIndex('by_user', q => q.eq('userId', identity.subject))
				.collect();
			console.log(`Total enrollments: ${allEnrollments.length}`);
			for (const e of allEnrollments) {
				const course = await ctx.db.get(e.courseId);
				console.log(`- ${course?.title} (courseId: ${e.courseId})`);
			}
		}

		return enrollment;
	},
});

/**
 * Enroll the currently authenticated user in a course for testing
 * Run from dashboard with JSON: {"courseId": "your-course-id"}
 */
export const enrollInCourse = mutation({
	args: {
		courseId: v.id('courses'),
	},
	handler: async (ctx, { courseId }) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error('Must be authenticated to enroll');
		}

		// Check if course exists
		const course = await ctx.db.get(courseId);
		if (!course) {
			throw new Error('Course not found');
		}

		// Check if already enrolled
		const existingEnrollment = await ctx.db
			.query('enrollments')
			.withIndex('by_user_course', q => q.eq('userId', identity.subject).eq('courseId', courseId))
			.first();

		if (existingEnrollment) {
			console.log('✅ Already enrolled in this course');
			return existingEnrollment._id;
		}

		// Create a purchase first
		const purchaseId = await ctx.db.insert('purchases', {
			userId: identity.subject,
			courseId: courseId,
			amount: course.price ?? 0,
			status: 'complete',
			createdAt: Date.now(),
		});

		// Create enrollment
		const enrollmentId = await ctx.db.insert('enrollments', {
			userId: identity.subject,
			courseId: courseId,
			purchaseId: purchaseId,
			enrolledAt: Date.now(),
			progressPercent: 0,
		});

		console.log(`✅ Successfully enrolled user ${identity.subject} in course "${course.title}"`);
		console.log(`Enrollment ID: ${enrollmentId}`);

		return enrollmentId;
	},
});

/**
 * Get all course IDs for easy reference
 */
export const listCourseIds = mutation({
	args: {},
	handler: async ctx => {
		const courses = await ctx.db.query('courses').collect();

		console.log('\n📚 Available Courses:');
		courses.forEach(course => {
			console.log(`- ${course.title}`);
			console.log(`  ID: ${course._id}`);
			console.log(`  Price: $${course.price ?? 0}`);
			console.log('');
		});

		return courses.map(c => ({
			id: c._id,
			title: c.title,
			price: c.price,
		}));
	},
});
