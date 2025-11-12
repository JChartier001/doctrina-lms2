/**
 * Seed Data Script for Doctrina LMS
 *
 * Creates comprehensive test data for manual testing and development.
 *
 * Features:
 * - Idempotent: Can be run multiple times without duplicating data
 * - Realistic: Mirrors production scenarios
 * - Complete: Covers all implemented tables
 *
 * Usage:
 * 1. Open Convex Dashboard
 * 2. Navigate to Functions → seedData
 * 3. Run seedTestData mutation
 * 4. Check console for summary of created records
 *
 * Test Data Pattern:
 * - All test users have externalId starting with "test-"
 * - Test courses use realistic medical aesthetics titles
 * - Relationships properly maintained (instructor → course → modules → lessons)
 */

import { mutation } from './_generated/server';
import type { Id } from './_generated/dataModel';

/**
 * Main seed mutation - creates all test data
 * Idempotent: clears existing test data before seeding
 */
export const seedTestData = mutation({
	args: {},
	handler: async ctx => {
		// Clear existing test data first (idempotency)
		const clearStats = await clearExistingTestData(ctx);

		// Create test users (student, instructor, admin)
		const users = await seedUsers(ctx);

		// Create course hierarchy for instructor
		const courses = await seedCourses(ctx, users.instructorId);

		// Create modules for each course
		const course1Modules = await seedModules(ctx, courses.course1Id);
		const course2Modules = await seedModules(ctx, courses.course2Id);
		const course3Modules = await seedModules(ctx, courses.course3Id); // Edge case: no enrollments

		// Create lessons for each module
		const course1Lessons: Id<'lessons'>[] = [];
		for (const moduleId of course1Modules) {
			const lessons = await seedLessons(ctx, moduleId, true); // isPreview for first lesson
			course1Lessons.push(...lessons);
		}

		const course2Lessons: Id<'lessons'>[] = [];
		for (const moduleId of course2Modules) {
			const lessons = await seedLessons(ctx, moduleId, false);
			course2Lessons.push(...lessons);
		}

		const course3Lessons: Id<'lessons'>[] = [];
		for (const moduleId of course3Modules) {
			const lessons = await seedLessons(ctx, moduleId, false);
			course3Lessons.push(...lessons);
		}

		// Create purchases (complete, open, expired)
		const purchases = await seedPurchases(ctx, users.studentId, [
			courses.course1Id, // complete
			courses.course2Id, // open
			courses.course3Id, // expired
		]);

		// Create enrollment for complete purchase
		const enrollment = await seedEnrollments(
			ctx,
			users.studentId,
			courses.course1Id,
			purchases.completePurchaseId,
		);

		// Create lesson progress (30% complete)
		const progressRecords = await seedLessonProgress(ctx, users.studentId, course1Lessons);

		// Create certificate for completed course (we'll use course2 as 100% complete)
		const certificate = await seedCertificates(
			ctx,
			users.studentId,
			courses.course2Id,
			users.instructorId,
		);

		// Create supporting data
		const notifications = await seedNotifications(ctx, users.studentId);
		const liveSessions = await seedLiveSessions(ctx, users.instructorId);
		const resources = await seedResources(ctx);
		const favorites = await seedFavorites(ctx, users.studentId, resources);

		// Return comprehensive summary
		return {
			success: true,
			message: 'Test data seeded successfully',
			cleared: clearStats,
			created: {
				users: {
					student: users.studentId,
					instructor: users.instructorId,
					admin: users.adminId,
				},
				courses: 3,
				modules: course1Modules.length + course2Modules.length + course3Modules.length,
				lessons: course1Lessons.length + course2Lessons.length + course3Lessons.length,
				purchases: 3,
				enrollments: 1,
				lessonProgress: progressRecords.length,
				certificates: 1,
				notifications: notifications.length,
				liveSessions: liveSessions.length,
				resources: resources.length,
				favorites: favorites.length,
			},
		};
	},
});

/**
 * Clear all existing test data (idempotency)
 * Identifies test records by "test-*" externalId pattern
 */
async function clearExistingTestData(ctx: any) {
	const stats = {
		users: 0,
		courses: 0,
		modules: 0,
		lessons: 0,
		purchases: 0,
		enrollments: 0,
		lessonProgress: 0,
		certificates: 0,
		notifications: 0,
		liveSessions: 0,
		resources: 0,
		favorites: 0,
	};

	// Find all test users
	const testUsers = await ctx.db
		.query('users')
		.filter((q: any) => {
			const externalId = q.field('externalId');
			return q.or(
				q.eq(externalId, 'test-student-clerk-id'),
				q.eq(externalId, 'test-instructor-clerk-id'),
				q.eq(externalId, 'test-admin-clerk-id'),
			);
		})
		.collect();

	const userIds = testUsers.map((u: any) => u._id);

	// Delete related data for test users
	if (userIds.length > 0) {
		// Delete certificates
		const certificates = await ctx.db
			.query('certificates')
			.filter((q: any) => {
				return userIds.some((uid: any) => q.eq(q.field('userId'), uid));
			})
			.collect();
		for (const cert of certificates) {
			await ctx.db.delete(cert._id);
			stats.certificates++;
		}

		// Delete lesson progress
		const progress = await ctx.db
			.query('lessonProgress')
			.filter((q: any) => {
				return userIds.some((uid: any) => q.eq(q.field('userId'), uid));
			})
			.collect();
		for (const prog of progress) {
			await ctx.db.delete(prog._id);
			stats.lessonProgress++;
		}

		// Delete enrollments
		const enrollments = await ctx.db
			.query('enrollments')
			.filter((q: any) => {
				return userIds.some((uid: any) => q.eq(q.field('userId'), uid));
			})
			.collect();
		for (const enr of enrollments) {
			await ctx.db.delete(enr._id);
			stats.enrollments++;
		}

		// Delete purchases
		const purchases = await ctx.db
			.query('purchases')
			.filter((q: any) => {
				return userIds.some((uid: any) => q.eq(q.field('userId'), uid));
			})
			.collect();
		for (const pur of purchases) {
			await ctx.db.delete(pur._id);
			stats.purchases++;
		}

		// Delete favorites
		const favorites = await ctx.db
			.query('favorites')
			.filter((q: any) => {
				return userIds.some((uid: any) => q.eq(q.field('userId'), uid));
			})
			.collect();
		for (const fav of favorites) {
			await ctx.db.delete(fav._id);
			stats.favorites++;
		}

		// Delete notifications
		const notifications = await ctx.db
			.query('notifications')
			.filter((q: any) => {
				return userIds.some((uid: any) => q.eq(q.field('userId'), uid));
			})
			.collect();
		for (const notif of notifications) {
			await ctx.db.delete(notif._id);
			stats.notifications++;
		}

		// Delete live sessions by instructor
		const liveSessions = await ctx.db
			.query('liveSessions')
			.filter((q: any) => {
				return userIds.some((uid: any) => q.eq(q.field('instructorId'), uid));
			})
			.collect();
		for (const session of liveSessions) {
			await ctx.db.delete(session._id);
			stats.liveSessions++;
		}

		// Delete courses by instructor
		const courses = await ctx.db
			.query('courses')
			.filter((q: any) => {
				return userIds.some((uid: any) => q.eq(q.field('instructorId'), uid));
			})
			.collect();

		for (const course of courses) {
			// Delete lessons (via modules)
			const modules = await ctx.db.query('courseModules').withIndex('by_course', (q: any) => q.eq('courseId', course._id)).collect();

			for (const module of modules) {
				const lessons = await ctx.db.query('lessons').withIndex('by_module', (q: any) => q.eq('moduleId', module._id)).collect();
				for (const lesson of lessons) {
					await ctx.db.delete(lesson._id);
					stats.lessons++;
				}
				await ctx.db.delete(module._id);
				stats.modules++;
			}

			await ctx.db.delete(course._id);
			stats.courses++;
		}

		// Delete resources (not user-specific, but we'll clear for clean slate)
		const resources = await ctx.db.query('resources').collect();
		for (const res of resources) {
			await ctx.db.delete(res._id);
			stats.resources++;
		}

		// Delete test users
		for (const user of testUsers) {
			await ctx.db.delete(user._id);
			stats.users++;
		}
	}

	return stats;
}

/**
 * Generate unique 16-character verification code
 * Format: XXXX-XXXX-XXXX-XXXX
 */
function generateVerificationCode(): string {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	const segments = [];

	for (let i = 0; i < 4; i++) {
		let segment = '';
		for (let j = 0; j < 4; j++) {
			segment += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		segments.push(segment);
	}

	return segments.join('-');
}

/**
 * Seed test users (AC1)
 * Creates student, instructor, and admin users
 */
async function seedUsers(ctx: any) {
	const studentId = await ctx.db.insert('users', {
		firstName: 'Sarah',
		lastName: 'Johnson',
		email: 'sarah.johnson@test.com',
		externalId: 'test-student-clerk-id',
		isInstructor: false,
		isAdmin: false,
		bio: 'Nurse practitioner interested in aesthetic medicine',
		title: 'NP, Aesthetic Medicine',
		createdAt: new Date().toISOString(),
	});

	const instructorId = await ctx.db.insert('users', {
		firstName: 'Dr. Michael',
		lastName: 'Chen',
		email: 'dr.chen@test.com',
		externalId: 'test-instructor-clerk-id',
		isInstructor: true,
		isAdmin: false,
		bio: 'Board-certified dermatologist specializing in cosmetic procedures',
		title: 'MD, Board Certified Dermatologist',
		createdAt: new Date().toISOString(),
	});

	const adminId = await ctx.db.insert('users', {
		firstName: 'Admin',
		lastName: 'User',
		email: 'admin@test.com',
		externalId: 'test-admin-clerk-id',
		isInstructor: false,
		isAdmin: true,
		createdAt: new Date().toISOString(),
	});

	return { studentId, instructorId, adminId };
}

/**
 * Seed courses (AC2)
 * Creates 3 courses: 2 with enrollments, 1 without (edge case)
 */
async function seedCourses(ctx: any, instructorId: Id<'users'>) {
	const now = Date.now();

	const course1Id = await ctx.db.insert('courses', {
		title: 'Advanced Botox Techniques',
		description: 'Master advanced injection techniques for facial rejuvenation using botulinum toxin',
		instructorId,
		level: 'advanced' as const,
		duration: '8 hours',
		price: 29900, // $299.00
		thumbnailUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
		rating: 4.8,
		reviewCount: 47,
		tags: ['Botox', 'Injectable', 'Facial Aesthetics', 'Advanced'],
		whatYouWillLearn: [
			'Advanced injection points for optimal results',
			'Managing complications and side effects',
			'Patient consultation and assessment',
		],
		requirements: ['Medical license', 'Basic Botox training'],
		createdAt: now,
		updatedAt: now,
	});

	const course2Id = await ctx.db.insert('courses', {
		title: 'Laser Fundamentals',
		description: 'Comprehensive introduction to laser safety, physics, and clinical applications',
		instructorId,
		level: 'beginner' as const,
		duration: '6 hours',
		price: 19900, // $199.00
		thumbnailUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d',
		rating: 4.9,
		reviewCount: 89,
		tags: ['Laser', 'Safety', 'Fundamentals'],
		whatYouWillLearn: ['Laser physics basics', 'Safety protocols', 'Patient selection'],
		requirements: ['Medical background'],
		createdAt: now,
		updatedAt: now,
	});

	const course3Id = await ctx.db.insert('courses', {
		title: 'Dermal Fillers Mastery',
		description: 'Comprehensive training on hyaluronic acid fillers for facial volumization',
		instructorId,
		level: 'intermediate' as const,
		duration: '10 hours',
		price: 34900, // $349.00
		thumbnailUrl: 'https://images.unsplash.com/photo-1556760544-74068565f05c',
		rating: 0, // New course, no ratings yet
		reviewCount: 0,
		tags: ['Fillers', 'Volumization', 'Facial Aesthetics'],
		whatYouWillLearn: ['Filler types and selection', 'Injection techniques', 'Complication management'],
		requirements: ['Medical license', 'Injectable experience'],
		createdAt: now,
		updatedAt: now,
	});

	return { course1Id, course2Id, course3Id };
}

/**
 * Seed modules (AC2)
 * Creates 2-3 modules per course
 */
async function seedModules(ctx: any, courseId: Id<'courses'>): Promise<Id<'courseModules'>[]> {
	const now = Date.now();
	const moduleIds: Id<'courseModules'>[] = [];

	const module1Id = await ctx.db.insert('courseModules', {
		courseId,
		title: 'Introduction and Fundamentals',
		description: 'Core concepts and foundational knowledge',
		order: 0,
		createdAt: now,
	});
	moduleIds.push(module1Id);

	const module2Id = await ctx.db.insert('courseModules', {
		courseId,
		title: 'Advanced Techniques',
		description: 'Advanced methods and best practices',
		order: 1,
		createdAt: now,
	});
	moduleIds.push(module2Id);

	const module3Id = await ctx.db.insert('courseModules', {
		courseId,
		title: 'Clinical Applications',
		description: 'Real-world clinical scenarios and case studies',
		order: 2,
		createdAt: now,
	});
	moduleIds.push(module3Id);

	return moduleIds;
}

/**
 * Seed lessons (AC2)
 * Creates 3-5 lessons per module with mixed types
 */
async function seedLessons(ctx: any, moduleId: Id<'courseModules'>, includePreview: boolean): Promise<Id<'lessons'>[]> {
	const now = Date.now();
	const lessonIds: Id<'lessons'>[] = [];

	const lesson1Id = await ctx.db.insert('lessons', {
		moduleId,
		title: 'Welcome and Overview',
		description: 'Introduction to the module content',
		type: 'video' as const,
		duration: '15:30',
		videoUrl: 'https://vimeo.com/example1',
		videoId: 'vid-001',
		isPreview: includePreview, // First lesson can be preview
		order: 0,
		createdAt: now,
	});
	lessonIds.push(lesson1Id);

	const lesson2Id = await ctx.db.insert('lessons', {
		moduleId,
		title: 'Core Concepts',
		description: 'Fundamental principles and theory',
		type: 'video' as const,
		duration: '22:45',
		videoUrl: 'https://vimeo.com/example2',
		videoId: 'vid-002',
		isPreview: false,
		order: 1,
		createdAt: now,
	});
	lessonIds.push(lesson2Id);

	const lesson3Id = await ctx.db.insert('lessons', {
		moduleId,
		title: 'Knowledge Check',
		description: 'Test your understanding of key concepts',
		type: 'quiz' as const,
		isPreview: false,
		order: 2,
		createdAt: now,
	});
	lessonIds.push(lesson3Id);

	const lesson4Id = await ctx.db.insert('lessons', {
		moduleId,
		title: 'Practical Demonstration',
		description: 'Step-by-step technique demonstration',
		type: 'video' as const,
		duration: '18:20',
		videoUrl: 'https://vimeo.com/example3',
		videoId: 'vid-003',
		isPreview: false,
		order: 3,
		createdAt: now,
	});
	lessonIds.push(lesson4Id);

	return lessonIds;
}

/**
 * Seed purchases (AC3, AC7)
 * Creates complete, open, and expired purchases
 */
async function seedPurchases(ctx: any, userId: Id<'users'>, courseIds: Id<'courses'>[]) {
	const now = Date.now();

	const completePurchaseId = await ctx.db.insert('purchases', {
		userId,
		courseId: courseIds[0],
		amount: 29900,
		status: 'complete' as const,
		currency: 'usd',
		stripeSessionId: 'cs_test_complete_123',
		createdAt: now - 7 * 24 * 60 * 60 * 1000, // 7 days ago
	});

	const openPurchaseId = await ctx.db.insert('purchases', {
		userId,
		courseId: courseIds[1],
		amount: 19900,
		status: 'open' as const,
		currency: 'usd',
		stripeSessionId: 'cs_test_open_456',
		createdAt: now - 2 * 60 * 60 * 1000, // 2 hours ago
	});

	const expiredPurchaseId = await ctx.db.insert('purchases', {
		userId,
		courseId: courseIds[2],
		amount: 34900,
		status: 'expired' as const,
		currency: 'usd',
		stripeSessionId: 'cs_test_expired_789',
		createdAt: now - 30 * 24 * 60 * 60 * 1000, // 30 days ago (expired)
	});

	return { completePurchaseId, openPurchaseId, expiredPurchaseId };
}

/**
 * Seed enrollments (AC3)
 * Creates enrollment linked to complete purchase
 */
async function seedEnrollments(ctx: any, userId: Id<'users'>, courseId: Id<'courses'>, purchaseId: Id<'purchases'>) {
	const now = Date.now();

	const enrollmentId = await ctx.db.insert('enrollments', {
		userId,
		courseId,
		purchaseId,
		enrolledAt: now - 7 * 24 * 60 * 60 * 1000, // 7 days ago
		progressPercent: 30, // 30% complete
	});

	return enrollmentId;
}

/**
 * Seed lesson progress (AC4)
 * Marks 30% of lessons as complete
 */
async function seedLessonProgress(ctx: any, userId: Id<'users'>, lessonIds: Id<'lessons'>[]) {
	const progressIds: Id<'lessonProgress'>[] = [];
	const now = Date.now();

	// Mark first 30% of lessons as complete (rounded up)
	const completeCount = Math.ceil(lessonIds.length * 0.3);

	for (let i = 0; i < completeCount; i++) {
		const progressId = await ctx.db.insert('lessonProgress', {
			userId,
			lessonId: lessonIds[i],
			completedAt: now - (completeCount - i) * 24 * 60 * 60 * 1000, // Stagger completion over days
		});
		progressIds.push(progressId);
	}

	return progressIds;
}

/**
 * Seed certificates (AC5)
 * Creates certificate for completed course
 */
async function seedCertificates(ctx: any, userId: Id<'users'>, courseId: Id<'courses'>, instructorId: Id<'users'>) {
	// Get user and course details for certificate
	const user = await ctx.db.get(userId);
	const course = await ctx.db.get(courseId);
	const instructor = await ctx.db.get(instructorId);

	const certificateId = await ctx.db.insert('certificates', {
		userId,
		userName: `${user.firstName} ${user.lastName}`,
		courseId,
		courseName: course.title,
		instructorId,
		instructorName: `${instructor.firstName} ${instructor.lastName}`,
		issueDate: new Date().toISOString(),
		verificationCode: generateVerificationCode(),
		templateId: 'default-certificate-template',
	});

	return certificateId;
}

/**
 * Seed notifications (AC6)
 * Creates 3-5 notifications per user with mixed types
 */
async function seedNotifications(ctx: any, userId: Id<'users'>) {
	const now = Date.now();
	const notificationIds: Id<'notifications'>[] = [];

	const notif1Id = await ctx.db.insert('notifications', {
		userId,
		title: 'Welcome to Doctrina LMS!',
		description: 'Start your learning journey with our medical aesthetics courses',
		type: 'announcement' as const,
		read: false,
		createdAt: now - 7 * 24 * 60 * 60 * 1000,
	});
	notificationIds.push(notif1Id);

	const notif2Id = await ctx.db.insert('notifications', {
		userId,
		title: 'Certificate Earned!',
		description: 'Congratulations! You have completed Laser Fundamentals',
		type: 'certificate' as const,
		read: true,
		createdAt: now - 3 * 24 * 60 * 60 * 1000,
	});
	notificationIds.push(notif2Id);

	const notif3Id = await ctx.db.insert('notifications', {
		userId,
		title: 'Course Update',
		description: 'New lesson added to Advanced Botox Techniques',
		type: 'course_update' as const,
		read: false,
		createdAt: now - 1 * 24 * 60 * 60 * 1000,
	});
	notificationIds.push(notif3Id);

	const notif4Id = await ctx.db.insert('notifications', {
		userId,
		title: 'Milestone Reached!',
		description: 'You have completed 30% of Advanced Botox Techniques',
		type: 'milestone' as const,
		read: false,
		createdAt: now - 12 * 60 * 60 * 1000,
	});
	notificationIds.push(notif4Id);

	return notificationIds;
}

/**
 * Seed live sessions (AC6)
 * Creates 1 scheduled and 1 completed session
 */
async function seedLiveSessions(ctx: any, instructorId: Id<'users'>) {
	const now = Date.now();
	const sessionIds: Id<'liveSessions'>[] = [];

	const session1Id = await ctx.db.insert('liveSessions', {
		title: 'Live Q&A: Botox Best Practices',
		description: 'Join Dr. Chen for a live discussion on advanced Botox techniques',
		instructorId,
		scheduledFor: now + 3 * 24 * 60 * 60 * 1000, // 3 days in future
		duration: 60, // 60 minutes
		isRecorded: true,
		maxParticipants: 50,
		status: 'scheduled' as const,
	});
	sessionIds.push(session1Id);

	const session2Id = await ctx.db.insert('liveSessions', {
		title: 'Laser Safety Fundamentals Workshop',
		description: 'Interactive workshop covering laser safety protocols',
		instructorId,
		scheduledFor: now - 14 * 24 * 60 * 60 * 1000, // 14 days ago
		duration: 90,
		isRecorded: true,
		maxParticipants: 30,
		status: 'completed' as const,
		recordingUrl: 'https://vimeo.com/recording-laser-safety',
	});
	sessionIds.push(session2Id);

	return sessionIds;
}

/**
 * Seed resources (AC6)
 * Creates 5 resources with mixed categories
 */
async function seedResources(ctx: any) {
	const resourceIds: Id<'resources'>[] = [];

	const res1Id = await ctx.db.insert('resources', {
		title: 'Botox Injection Guide PDF',
		description: 'Comprehensive guide to facial injection points',
		type: 'PDF',
		categories: ['Injectable', 'Reference'],
		tags: ['Botox', 'Injection', 'Guide'],
		url: 'https://example.com/resources/botox-guide.pdf',
		author: 'Dr. Michael Chen',
		dateAdded: new Date().toISOString(),
		featured: true,
		downloadCount: 234,
		favoriteCount: 89,
		rating: 4.7,
		reviewCount: 42,
		difficulty: 'intermediate' as const,
		fileSize: '2.5 MB',
		restricted: false,
	});
	resourceIds.push(res1Id);

	const res2Id = await ctx.db.insert('resources', {
		title: 'Laser Safety Protocols Video',
		description: 'Essential laser safety procedures demonstration',
		type: 'Video',
		categories: ['Laser', 'Safety'],
		tags: ['Laser', 'Safety', 'Training'],
		url: 'https://vimeo.com/laser-safety-video',
		author: 'Industry Expert',
		dateAdded: new Date().toISOString(),
		featured: true,
		downloadCount: 567,
		favoriteCount: 203,
		rating: 4.9,
		reviewCount: 87,
		difficulty: 'beginner' as const,
		duration: '15 minutes',
		restricted: false,
	});
	resourceIds.push(res2Id);

	const res3Id = await ctx.db.insert('resources', {
		title: 'Dermal Filler Case Studies',
		description: 'Real patient cases with before/after analysis',
		type: 'Article',
		categories: ['Fillers', 'Case Studies'],
		tags: ['Fillers', 'Case Studies', 'Clinical'],
		url: 'https://example.com/articles/filler-cases',
		author: 'Dr. Sarah Williams',
		dateAdded: new Date().toISOString(),
		featured: false,
		downloadCount: 145,
		favoriteCount: 56,
		rating: 4.5,
		reviewCount: 23,
		difficulty: 'advanced' as const,
		restricted: false,
	});
	resourceIds.push(res3Id);

	const res4Id = await ctx.db.insert('resources', {
		title: 'Aesthetic Medicine Journal',
		description: 'Latest research and clinical findings',
		type: 'PDF',
		categories: ['Research', 'Journal'],
		tags: ['Research', 'Clinical', 'Evidence'],
		url: 'https://example.com/journals/aesthetics-quarterly.pdf',
		author: 'Multiple Authors',
		dateAdded: new Date().toISOString(),
		featured: false,
		downloadCount: 89,
		favoriteCount: 34,
		rating: 4.3,
		reviewCount: 15,
		difficulty: 'advanced' as const,
		fileSize: '5.2 MB',
		restricted: true, // Requires enrollment
	});
	resourceIds.push(res4Id);

	const res5Id = await ctx.db.insert('resources', {
		title: 'Patient Consultation Checklist',
		description: 'Pre-procedure consultation template',
		type: 'PDF',
		categories: ['Practice Management', 'Forms'],
		tags: ['Consultation', 'Template', 'Practice'],
		url: 'https://example.com/forms/consultation-checklist.pdf',
		author: 'Doctrina LMS Team',
		dateAdded: new Date().toISOString(),
		featured: true,
		downloadCount: 432,
		favoriteCount: 178,
		rating: 4.8,
		reviewCount: 65,
		difficulty: 'beginner' as const,
		fileSize: '0.5 MB',
		restricted: false,
	});
	resourceIds.push(res5Id);

	return resourceIds;
}

/**
 * Seed favorites (AC6)
 * Creates 2-3 favorites for student user
 */
async function seedFavorites(ctx: any, userId: Id<'users'>, resourceIds: Id<'resources'>[]) {
	const now = Date.now();
	const favoriteIds: Id<'favorites'>[] = [];

	// Favorite first 3 resources
	for (let i = 0; i < Math.min(3, resourceIds.length); i++) {
		const favId = await ctx.db.insert('favorites', {
			userId,
			resourceId: resourceIds[i],
			createdAt: now - (3 - i) * 24 * 60 * 60 * 1000,
		});
		favoriteIds.push(favId);
	}

	return favoriteIds;
}
