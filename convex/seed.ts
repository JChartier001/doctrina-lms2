import { mutation } from './_customFunctions';

/**
 * Seed database with test data for development
 * Creates users, courses, enrollments, and progress records
 *
 * WARNING: This will create duplicate data if run multiple times
 * Only use in development environment
 *
 * Run from Convex dashboard or CLI:
 * npx convex run seed:seedAll
 */
export const seedAll = mutation({
	args: {},
	handler: async ctx => {
		console.log('Starting seed data generation...');

		// 1. Create test users
		await ctx.db.insert('users', {
			firstName: 'Sarah',
			lastName: 'Johnson',
			email: 'sarah.test@example.com',
			externalId: 'test-student-sarah',
			isInstructor: false,
			isAdmin: false,
		});

		const instructorUser1 = await ctx.db.insert('users', {
			firstName: 'Dr. Michael',
			lastName: 'Chen',
			email: 'michael.test@example.com',
			externalId: 'test-instructor-michael',
			isInstructor: true,
			isAdmin: false,
		});

		const instructorUser2 = await ctx.db.insert('users', {
			firstName: 'Dr. Emily',
			lastName: 'Rodriguez',
			email: 'emily.test@example.com',
			externalId: 'test-instructor-emily',
			isInstructor: true,
			isAdmin: false,
		});

		console.log('✅ Created 3 users');

		// 2. Create test courses
		const course1 = await ctx.db.insert('courses', {
			title: 'Advanced Botox Techniques',
			description: 'Master advanced Botox injection techniques for facial aesthetics',
			instructorId: instructorUser1,
			price: 29900,
			createdAt: Date.now(),
			updatedAt: Date.now(),
		});

		const course2 = await ctx.db.insert('courses', {
			title: 'Facial Anatomy for Practitioners',
			description: 'Comprehensive facial anatomy course for aesthetic medicine',
			instructorId: instructorUser1,
			price: 19900,
			createdAt: Date.now(),
			updatedAt: Date.now(),
		});

		const course3 = await ctx.db.insert('courses', {
			title: 'Dermal Fillers Masterclass',
			description: 'Learn advanced dermal filler techniques',
			instructorId: instructorUser2,
			price: 39900,
			createdAt: Date.now(),
			updatedAt: Date.now(),
		});

		console.log('✅ Created 3 courses');

		// 3. Create course modules and lessons for Course 1 (Botox)
		const course1Module1 = await ctx.db.insert('courseModules', {
			courseId: course1,
			title: 'Module 1: Introduction to Botox',
			order: 0,
			createdAt: Date.now(),
		});

		const course1Module2 = await ctx.db.insert('courseModules', {
			courseId: course1,
			title: 'Module 2: Injection Techniques',
			order: 1,
			createdAt: Date.now(),
		});

		const course1Module3 = await ctx.db.insert('courseModules', {
			courseId: course1,
			title: 'Module 3: Advanced Applications',
			order: 2,
			createdAt: Date.now(),
		});

		// Module 1 Lessons (4 lessons)
		const c1m1l1 = await ctx.db.insert('lessons', {
			moduleId: course1Module1,
			title: 'Introduction to Neurotoxins',
			type: 'video',
			isPreview: false,
			order: 0,
			createdAt: Date.now(),
		});

		const c1m1l2 = await ctx.db.insert('lessons', {
			moduleId: course1Module1,
			title: 'Facial Anatomy Review',
			type: 'video',
			isPreview: false,
			order: 1,
			createdAt: Date.now(),
		});

		const c1m1l3 = await ctx.db.insert('lessons', {
			moduleId: course1Module1,
			title: 'Safety Protocols',
			type: 'video',
			isPreview: false,
			order: 2,
			createdAt: Date.now(),
		});

		const c1m1l4 = await ctx.db.insert('lessons', {
			moduleId: course1Module1,
			title: 'Module 1 Quiz',
			type: 'quiz',
			isPreview: false,
			order: 3,
			createdAt: Date.now(),
		});

		// Module 2 Lessons (3 lessons)
		const c1m2l1 = await ctx.db.insert('lessons', {
			moduleId: course1Module2,
			title: 'Injection Points and Techniques',
			type: 'video',
			isPreview: false,
			order: 0,
			createdAt: Date.now(),
		});

		const c1m2l2 = await ctx.db.insert('lessons', {
			moduleId: course1Module2,
			title: 'Dosage and Dilution',
			type: 'video',
			isPreview: false,
			order: 1,
			createdAt: Date.now(),
		});

		const c1m2l3 = await ctx.db.insert('lessons', {
			moduleId: course1Module2,
			title: 'Module 2 Quiz',
			type: 'quiz',
			isPreview: false,
			order: 2,
			createdAt: Date.now(),
		});

		// Module 3 Lessons (3 lessons)
		await ctx.db.insert('lessons', {
			moduleId: course1Module3,
			title: 'Combination Treatments',
			type: 'video',
			isPreview: false,
			order: 0,
			createdAt: Date.now(),
		});

		await ctx.db.insert('lessons', {
			moduleId: course1Module3,
			title: 'Complication Management',
			type: 'video',
			isPreview: false,
			order: 1,
			createdAt: Date.now(),
		});

		await ctx.db.insert('lessons', {
			moduleId: course1Module3,
			title: 'Final Assessment',
			type: 'quiz',
			isPreview: false,
			order: 2,
			createdAt: Date.now(),
		});

		console.log('✅ Created 10 lessons for Course 1 (75% progress target)');

		// 4. Create course modules and lessons for Course 2 (Anatomy) - smaller course
		const course2Module1 = await ctx.db.insert('courseModules', {
			courseId: course2,
			title: 'Module 1: Facial Anatomy Basics',
			order: 0,
			createdAt: Date.now(),
		});

		const course2Module2 = await ctx.db.insert('courseModules', {
			courseId: course2,
			title: 'Module 2: Advanced Structures',
			order: 1,
			createdAt: Date.now(),
		});

		// Module 1 Lessons (3 lessons)
		const c2m1l1 = await ctx.db.insert('lessons', {
			moduleId: course2Module1,
			title: 'Facial Muscles Overview',
			type: 'video',
			isPreview: false,
			order: 0,
			createdAt: Date.now(),
		});

		const c2m1l2 = await ctx.db.insert('lessons', {
			moduleId: course2Module1,
			title: 'Vascular Anatomy',
			type: 'video',
			isPreview: false,
			order: 1,
			createdAt: Date.now(),
		});

		const c2m1l3 = await ctx.db.insert('lessons', {
			moduleId: course2Module1,
			title: 'Nerve Pathways',
			type: 'video',
			isPreview: false,
			order: 2,
			createdAt: Date.now(),
		});

		// Module 2 Lessons (2 lessons)
		const c2m2l1 = await ctx.db.insert('lessons', {
			moduleId: course2Module2,
			title: 'Deep Facial Structures',
			type: 'video',
			isPreview: false,
			order: 0,
			createdAt: Date.now(),
		});

		await ctx.db.insert('lessons', {
			moduleId: course2Module2,
			title: 'Final Exam',
			type: 'quiz',
			isPreview: false,
			order: 1,
			createdAt: Date.now(),
		});

		console.log('✅ Created 5 lessons for Course 2 (90% progress target)');

		// 5. Create course for Course 3 (not enrolled - no progress)
		const course3Module1 = await ctx.db.insert('courseModules', {
			courseId: course3,
			title: 'Module 1: Filler Basics',
			order: 0,
			createdAt: Date.now(),
		});

		await ctx.db.insert('lessons', {
			moduleId: course3Module1,
			title: 'Introduction to Fillers',
			type: 'video',
			isPreview: false,
			order: 0,
			createdAt: Date.now(),
		});

		await ctx.db.insert('lessons', {
			moduleId: course3Module1,
			title: 'Filler Types',
			type: 'video',
			isPreview: false,
			order: 1,
			createdAt: Date.now(),
		});

		console.log('✅ Created 2 lessons for Course 3 (no enrollment)');

		// 6. Create purchases and enrollments
		const purchase1 = await ctx.db.insert('purchases', {
			userId: 'test-student-sarah',
			courseId: course1,
			amount: 29900,
			status: 'complete',
			createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000, // 15 days ago
		});

		const enrollment1 = await ctx.db.insert('enrollments', {
			userId: 'test-student-sarah',
			courseId: course1,
			purchaseId: purchase1,
			enrolledAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
			progressPercent: 0, // Will be updated by progress tracking
		});

		const purchase2 = await ctx.db.insert('purchases', {
			userId: 'test-student-sarah',
			courseId: course2,
			amount: 19900,
			status: 'complete',
			createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
		});

		const enrollment2 = await ctx.db.insert('enrollments', {
			userId: 'test-student-sarah',
			courseId: course2,
			purchaseId: purchase2,
			enrolledAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
			progressPercent: 0,
		});

		console.log('✅ Created 2 enrollments for test student');

		// 7. Create lesson progress records
		// Course 1: Complete 7 out of 10 lessons (70% progress)
		await ctx.db.insert('lessonProgress', {
			userId: 'test-student-sarah',
			lessonId: c1m1l1,
			completedAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
		});

		await ctx.db.insert('lessonProgress', {
			userId: 'test-student-sarah',
			lessonId: c1m1l2,
			completedAt: Date.now() - 13 * 24 * 60 * 60 * 1000,
		});

		await ctx.db.insert('lessonProgress', {
			userId: 'test-student-sarah',
			lessonId: c1m1l3,
			completedAt: Date.now() - 12 * 24 * 60 * 60 * 1000,
		});

		await ctx.db.insert('lessonProgress', {
			userId: 'test-student-sarah',
			lessonId: c1m1l4,
			completedAt: Date.now() - 11 * 24 * 60 * 60 * 1000,
		});

		await ctx.db.insert('lessonProgress', {
			userId: 'test-student-sarah',
			lessonId: c1m2l1,
			completedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
		});

		await ctx.db.insert('lessonProgress', {
			userId: 'test-student-sarah',
			lessonId: c1m2l2,
			completedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
		});

		await ctx.db.insert('lessonProgress', {
			userId: 'test-student-sarah',
			lessonId: c1m2l3,
			completedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
		});

		// Update Course 1 enrollment progress to 70%
		await ctx.db.patch(enrollment1, {
			progressPercent: 70,
		});

		console.log('✅ Created 7 lesson progress records for Course 1 (70% complete)');

		// Course 2: Complete 4 out of 5 lessons (80% progress)
		await ctx.db.insert('lessonProgress', {
			userId: 'test-student-sarah',
			lessonId: c2m1l1,
			completedAt: Date.now() - 6 * 24 * 60 * 60 * 1000,
		});

		await ctx.db.insert('lessonProgress', {
			userId: 'test-student-sarah',
			lessonId: c2m1l2,
			completedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
		});

		await ctx.db.insert('lessonProgress', {
			userId: 'test-student-sarah',
			lessonId: c2m1l3,
			completedAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
		});

		await ctx.db.insert('lessonProgress', {
			userId: 'test-student-sarah',
			lessonId: c2m2l1,
			completedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
		});

		// Update Course 2 enrollment progress to 80%
		await ctx.db.patch(enrollment2, {
			progressPercent: 80,
		});

		console.log('✅ Created 4 lesson progress records for Course 2 (80% complete)');

		// 8. Return summary
		return {
			success: true,
			summary: {
				users: 3,
				courses: 3,
				enrollments: 2,
				lessons: {
					course1: 10,
					course2: 5,
					course3: 2,
				},
				progressRecords: 11,
				message: 'Seed data created successfully! Test student: test-student-sarah',
			},
		};
	},
});

/**
 * Clear all seed data (use with caution!)
 * Removes users, courses, enrollments, and progress created by seedAll
 */
export const clearSeedData = mutation({
	args: {},
	handler: async ctx => {
		console.log('Clearing seed data...');

		// Find and delete test users
		const testUsers = await ctx.db
			.query('users')
			.filter(q => q.eq(q.field('externalId'), 'test-student-sarah'))
			.collect();

		for (const user of testUsers) {
			await ctx.db.delete(user._id);
		}

		const instructors = await ctx.db
			.query('users')
			.filter(q =>
				q.or(
					q.eq(q.field('externalId'), 'test-instructor-michael'),
					q.eq(q.field('externalId'), 'test-instructor-emily'),
				),
			)
			.collect();

		for (const instructor of instructors) {
			await ctx.db.delete(instructor._id);
		}

		console.log('✅ Cleared seed data');

		return { success: true, message: 'Seed data cleared' };
	},
});

/**
 * Seed a complete course scenario (student completes all lessons)
 * This will trigger certificate generation
 */
export const seedCompleteCourse = mutation({
	args: {},
	handler: async ctx => {
		console.log('Creating complete course scenario...');

		// Find existing test student
		const student = await ctx.db
			.query('users')
			.withIndex('by_externalId', q => q.eq('externalId', 'test-student-sarah'))
			.first();

		if (!student) {
			throw new Error('Test student not found. Run seedAll first.');
		}

		// Create a small test course
		const instructor = await ctx.db
			.query('users')
			.withIndex('by_externalId', q => q.eq('externalId', 'test-instructor-michael'))
			.first();

		if (!instructor) {
			throw new Error('Test instructor not found. Run seedAll first.');
		}

		const completeCourse = await ctx.db.insert('courses', {
			title: 'Quick Start Guide to Aesthetics',
			description: 'A quick introduction course',
			instructorId: instructor._id,
			price: 9900,
			createdAt: Date.now(),
			updatedAt: Date.now(),
		});

		const moduleId = await ctx.db.insert('courseModules', {
			courseId: completeCourse,
			title: 'Module 1: Getting Started',
			order: 0,
			createdAt: Date.now(),
		});

		const lesson1 = await ctx.db.insert('lessons', {
			moduleId: moduleId,
			title: 'Welcome to Aesthetics',
			type: 'video',
			isPreview: false,
			order: 0,
			createdAt: Date.now(),
		});

		const lesson2 = await ctx.db.insert('lessons', {
			moduleId: moduleId,
			title: 'Course Overview',
			type: 'video',
			isPreview: false,
			order: 1,
			createdAt: Date.now(),
		});

		// Create purchase and enrollment
		const purchase = await ctx.db.insert('purchases', {
			userId: 'test-student-sarah',
			courseId: completeCourse,
			amount: 9900,
			status: 'complete',
			createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
		});

		const enrollment = await ctx.db.insert('enrollments', {
			userId: 'test-student-sarah',
			courseId: completeCourse,
			purchaseId: purchase,
			enrolledAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
			progressPercent: 0,
		});

		// Complete all lessons
		await ctx.db.insert('lessonProgress', {
			userId: 'test-student-sarah',
			lessonId: lesson1,
			completedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
		});

		await ctx.db.insert('lessonProgress', {
			userId: 'test-student-sarah',
			lessonId: lesson2,
			completedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
		});

		// Update enrollment to 100% (this should trigger certificate generation)
		await ctx.db.patch(enrollment, {
			progressPercent: 100,
			completedAt: Date.now(),
		});

		console.log('✅ Created complete course - certificate should be generated!');

		return {
			success: true,
			courseId: completeCourse,
			enrollmentId: enrollment,
			message: 'Complete course created. Certificate should be generated via trigger.',
		};
	},
});
