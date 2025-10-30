import { mutation } from './_generated/server';

/**
 * Seed script to populate database with test data
 * Run this from the Convex dashboard or via CLI: npx convex run seedData:seed
 */
export const seed = mutation({
	args: {},
	handler: async ctx => {
		console.log('🌱 Starting database seeding...');

		const now = Date.now();

		// 1. Create test users
		console.log('Creating users...');
		const instructorId = await ctx.db.insert('users', {
			firstName: 'Dr. Sarah',
			lastName: 'Johnson',
			email: 'sarah.johnson@example.com',
			externalId: 'instructor_test_001',
			isInstructor: true,
			isAdmin: false,
			title: 'MD, Board Certified Dermatologist',
			bio: 'With over 15 years of experience in medical aesthetics, Dr. Johnson specializes in advanced injection techniques.',
			profilePhotoUrl: '/placeholder.svg?height=100&width=100',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		});

		const studentExternalId = 'student_test_001';
		const studentId = await ctx.db.insert('users', {
			firstName: 'Jennifer',
			lastName: 'Chen',
			email: 'jennifer.chen@example.com',
			externalId: studentExternalId,
			isInstructor: false,
			isAdmin: false,
			bio: 'Practicing nurse interested in medical aesthetics',
			profilePhotoUrl: '/placeholder.svg?height=100&width=100',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		});

		// 2. Create courses
		console.log('Creating courses...');
		const course1Id = await ctx.db.insert('courses', {
			title: 'Advanced Botox Techniques',
			description:
				'Master the art of Botox injections with advanced techniques for facial aesthetics. Learn proper injection sites, dosing, and patient assessment.',
			instructorId,
			level: 'intermediate' as const,
			duration: '8 hours',
			price: 299.99,
			thumbnailUrl: '/placeholder.svg?height=200&width=400',
			rating: 4.8,
			reviewCount: 156,
			tags: ['Botox', 'Aesthetics', 'Injections'],
			whatYouWillLearn: [
				'Advanced Botox injection techniques',
				'Facial anatomy for aesthetic procedures',
				'Patient consultation and assessment',
				'Managing complications',
			],
			requirements: ['Basic understanding of facial anatomy', 'Medical license or nursing certification'],
			createdAt: Date.now(),
			updatedAt: Date.now(),
		});

		const course2Id = await ctx.db.insert('courses', {
			title: 'Dermal Fillers Masterclass',
			description:
				'Comprehensive training on dermal fillers for facial rejuvenation and contouring. Learn about different filler types and advanced placement techniques.',
			instructorId,
			level: 'advanced' as const,
			duration: '12 hours',
			price: 499.99,
			thumbnailUrl: '/placeholder.svg?height=200&width=400',
			rating: 4.9,
			reviewCount: 203,
			tags: ['Dermal Fillers', 'Facial Contouring', 'Aesthetics'],
			whatYouWillLearn: [
				'Different types of dermal fillers',
				'Advanced placement techniques',
				'Treating various facial areas',
				'Complication management',
			],
			requirements: ['Completed Botox certification', 'Active medical license'],
			createdAt: Date.now(),
			updatedAt: Date.now(),
		});

		const course3Id = await ctx.db.insert('courses', {
			title: 'Introduction to Medical Aesthetics',
			description:
				'Perfect for beginners entering the field of medical aesthetics. Learn the fundamentals of cosmetic procedures and patient care.',
			instructorId,
			level: 'beginner' as const,
			duration: '6 hours',
			price: 199.99,
			thumbnailUrl: '/placeholder.svg?height=200&width=400',
			rating: 4.6,
			reviewCount: 89,
			tags: ['Beginner', 'Medical Aesthetics', 'Fundamentals'],
			whatYouWillLearn: [
				'Overview of aesthetic procedures',
				'Patient safety and consent',
				'Basic facial anatomy',
				'Setting up an aesthetics practice',
			],
			requirements: ['No prior experience needed', 'Healthcare background preferred'],
			createdAt: Date.now(),
			updatedAt: Date.now(),
		});

		// 3. Create course modules and lessons
		console.log('Creating course curriculum...');

		// Course 1: Advanced Botox - Module 1
		const module1_1 = await ctx.db.insert('courseModules', {
			courseId: course1Id,
			title: 'Introduction to Advanced Botox',
			description: 'Overview of advanced techniques and safety protocols',
			order: 1,
			createdAt: now,
		});

		await ctx.db.insert('lessons', {
			moduleId: module1_1,
			title: 'Welcome and Course Overview',
			type: 'video',
			duration: '15:00',
			order: 1,
			isPreview: true,
			createdAt: now,
		});

		await ctx.db.insert('lessons', {
			moduleId: module1_1,
			title: 'Safety Protocols and Patient Selection',
			type: 'video',
			duration: '25:00',
			order: 2,
			isPreview: false,
			createdAt: now,
		});

		await ctx.db.insert('lessons', {
			moduleId: module1_1,
			title: 'Module 1 Quiz',
			type: 'quiz',
			duration: '10:00',
			order: 3,
			isPreview: false,
			createdAt: now,
		});

		// Course 1: Advanced Botox - Module 2
		const module1_2 = await ctx.db.insert('courseModules', {
			courseId: course1Id,
			title: 'Facial Anatomy Review',
			description: 'Detailed anatomy relevant to Botox procedures',
			order: 2,
			createdAt: now,
		});

		await ctx.db.insert('lessons', {
			moduleId: module1_2,
			title: 'Upper Face Anatomy',
			type: 'video',
			duration: '30:00',
			order: 1,
			isPreview: false,
			createdAt: now,
		});

		await ctx.db.insert('lessons', {
			moduleId: module1_2,
			title: 'Lower Face Anatomy',
			type: 'video',
			duration: '30:00',
			order: 2,
			isPreview: false,
			createdAt: now,
		});

		// Course 1: Advanced Botox - Module 3
		const module1_3 = await ctx.db.insert('courseModules', {
			courseId: course1Id,
			title: 'Injection Techniques',
			description: 'Advanced injection methods for optimal results',
			order: 3,
			createdAt: now,
		});

		const lesson1_3_1 = await ctx.db.insert('lessons', {
			moduleId: module1_3,
			title: 'Forehead and Glabella',
			type: 'video',
			duration: '40:00',
			order: 1,
			isPreview: false,
			createdAt: now,
		});

		const lesson1_3_2 = await ctx.db.insert('lessons', {
			moduleId: module1_3,
			title: "Crow's Feet and Periorbital Area",
			type: 'video',
			duration: '35:00',
			order: 2,
			isPreview: false,
			createdAt: now,
		});

		const lesson1_3_3 = await ctx.db.insert('lessons', {
			moduleId: module1_3,
			title: 'Practical Application Exercise',
			type: 'assignment',
			duration: '60:00',
			order: 3,
			isPreview: false,
			createdAt: now,
		});

		// Course 1: Advanced Botox - Module 4
		const module1_4 = await ctx.db.insert('courseModules', {
			courseId: course1Id,
			title: 'Final Assessment',
			description: 'Comprehensive exam and certification',
			order: 4,
			createdAt: now,
		});

		const lesson1_4_1 = await ctx.db.insert('lessons', {
			moduleId: module1_4,
			title: 'Final Exam',
			type: 'quiz',
			duration: '45:00',
			order: 1,
			isPreview: false,
			createdAt: now,
		});

		// Course 2: Dermal Fillers - Create similar structure
		const module2_1 = await ctx.db.insert('courseModules', {
			courseId: course2Id,
			title: 'Introduction to Dermal Fillers',
			description: 'Overview of filler types and applications',
			order: 1,
			createdAt: now,
		});

		await ctx.db.insert('lessons', {
			moduleId: module2_1,
			title: 'Types of Dermal Fillers',
			type: 'video',
			duration: '20:00',
			order: 1,
			isPreview: true,
			createdAt: now,
		});

		await ctx.db.insert('lessons', {
			moduleId: module2_1,
			title: 'Hyaluronic Acid Fillers',
			type: 'video',
			duration: '30:00',
			order: 2,
			isPreview: false,
			createdAt: now,
		});

		// 4. Create purchases first
		console.log('Creating purchases...');
		const purchase1 = await ctx.db.insert('purchases', {
			userId: studentExternalId,
			courseId: course1Id,
			amount: 299.99,
			status: 'complete',
			createdAt: now - 7 * 24 * 60 * 60 * 1000, // 7 days ago
		});

		const purchase2 = await ctx.db.insert('purchases', {
			userId: studentExternalId,
			courseId: course2Id,
			amount: 499.99,
			status: 'complete',
			createdAt: now - 14 * 24 * 60 * 60 * 1000, // 14 days ago
		});

		const purchase3 = await ctx.db.insert('purchases', {
			userId: studentExternalId,
			courseId: course3Id,
			amount: 199.99,
			status: 'complete',
			createdAt: now - 30 * 24 * 60 * 60 * 1000, // 30 days ago
		});

		// 5. Create enrollments
		console.log('Creating enrollments...');
		const enrollment1 = await ctx.db.insert('enrollments', {
			userId: studentExternalId,
			courseId: course1Id,
			purchaseId: purchase1,
			enrolledAt: now - 7 * 24 * 60 * 60 * 1000, // 7 days ago
			progressPercent: 45.5,
		});

		const enrollment2 = await ctx.db.insert('enrollments', {
			userId: studentExternalId,
			courseId: course2Id,
			purchaseId: purchase2,
			enrolledAt: now - 14 * 24 * 60 * 60 * 1000, // 14 days ago
			progressPercent: 15.0,
		});

		await ctx.db.insert('enrollments', {
			userId: studentExternalId,
			courseId: course3Id,
			purchaseId: purchase3,
			enrolledAt: now - 30 * 24 * 60 * 60 * 1000, // 30 days ago
			completedAt: now - 1 * 24 * 60 * 60 * 1000, // Completed 1 day ago
			progressPercent: 100,
		});

		// 6. Create lesson progress for enrolled student
		console.log('Creating lesson progress...');
		await ctx.db.insert('lessonProgress', {
			userId: studentExternalId,
			lessonId: lesson1_3_1,
			completedAt: now - 2 * 24 * 60 * 60 * 1000, // 2 days ago
		});

		await ctx.db.insert('lessonProgress', {
			userId: studentExternalId,
			lessonId: lesson1_3_2,
			completedAt: now - 1 * 24 * 60 * 60 * 1000, // 1 day ago
		});

		await ctx.db.insert('lessonProgress', {
			userId: studentExternalId,
			lessonId: lesson1_3_3,
			completedAt: now - 12 * 60 * 60 * 1000, // 12 hours ago
		});

		// 7. Create a certificate for completed course
		console.log('Creating certificates...');
		await ctx.db.insert('certificates', {
			userId: studentId,
			courseId: course3Id, // Intro course - completed
			userName: 'Jennifer Chen',
			courseName: 'Introduction to Medical Aesthetics',
			instructorId,
			instructorName: 'Dr. Sarah Johnson',
			issueDate: new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
			verificationCode: 'CERT-' + Math.random().toString(36).substring(2, 11).toUpperCase(),
			templateId: 'default',
		});

		console.log('✅ Database seeding completed successfully!');
		console.log('\n📊 Summary:');
		console.log('- 2 users created (1 instructor, 1 student)');
		console.log('- 3 courses created');
		console.log('- 5 modules with 9 lessons');
		console.log('- 3 purchases completed');
		console.log('- 3 enrollments (1 completed, 2 in-progress)');
		console.log('- 3 lesson progress records');
		console.log('- 1 certificate issued');
		console.log('\n🔑 Test accounts:');
		console.log('Instructor: sarah.johnson@example.com (externalId: instructor_test_001)');
		console.log('Student: jennifer.chen@example.com (externalId: student_test_001)');
		console.log('\n📚 Course IDs for testing:');
		console.log(`- Course 1 (Advanced Botox): ${course1Id}`);
		console.log(`- Course 2 (Dermal Fillers): ${course2Id}`);
		console.log(`- Course 3 (Introduction): ${course3Id}`);

		return {
			success: true,
			users: { instructorId, studentId },
			courses: { course1Id, course2Id, course3Id },
		};
	},
});

// Optional: Function to clear all data
export const clearData = mutation({
	args: {},
	handler: async ctx => {
		console.log('🗑️  Clearing all data...');

		// Delete in reverse dependency order
		const lessonProgress = await ctx.db.query('lessonProgress').collect();
		for (const record of lessonProgress) {
			await ctx.db.delete(record._id);
		}

		const enrollments = await ctx.db.query('enrollments').collect();
		for (const record of enrollments) {
			await ctx.db.delete(record._id);
		}

		const certificates = await ctx.db.query('certificates').collect();
		for (const record of certificates) {
			await ctx.db.delete(record._id);
		}

		const lessons = await ctx.db.query('lessons').collect();
		for (const record of lessons) {
			await ctx.db.delete(record._id);
		}

		const modules = await ctx.db.query('courseModules').collect();
		for (const record of modules) {
			await ctx.db.delete(record._id);
		}

		const courses = await ctx.db.query('courses').collect();
		for (const record of courses) {
			await ctx.db.delete(record._id);
		}

		const users = await ctx.db.query('users').collect();
		for (const record of users) {
			await ctx.db.delete(record._id);
		}

		console.log('✅ All data cleared');
	},
});
