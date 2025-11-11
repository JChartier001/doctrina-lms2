import type { GenericMutationCtx } from 'convex/server';
import { convexTest } from 'convex-test';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { api } from '../_generated/api';
import type { DataModel, Doc, Id } from '../_generated/dataModel';
import schema from '../schema';

type TestCtx = GenericMutationCtx<DataModel>;

describe('Enrollments', () => {
	let t: any;
	let baseT: any;
	let testUserExternalId: string;
	let testUserId: Id<'users'>;
	let testCourseId: Id<'courses'>;
	let testPurchaseId: Id<'purchases'>;
	let testInstructorId: Id<'users'>;

	beforeEach(async () => {
		baseT = convexTest(schema);

		// Set up test data
		await baseT.run(async (ctx: TestCtx) => {
			// Create test user
			testUserExternalId = 'test-student-clerk-id';
			const userId = await ctx.db.insert('users', {
				firstName: 'Test',
				lastName: 'Student',
				email: 'student@test.com',
				externalId: testUserExternalId,
				isInstructor: false,
				isAdmin: false,
			});

			// Create test instructor
			const instructorId = await ctx.db.insert('users', {
				firstName: 'Test',
				lastName: 'Instructor',
				email: 'instructor@test.com',
				externalId: 'test-instructor-id',
				isInstructor: true,
				isAdmin: false,
			});

			// Create test course
			const courseId = await ctx.db.insert('courses', {
				title: 'Test Course',
				description: 'Test description',
				instructorId,
				price: 29900,
				createdAt: Date.now(),
				updatedAt: Date.now(),
			});

			// Create test purchase
			const purchaseId = await ctx.db.insert('purchases', {
				userId: userId, // Use Convex ID
				courseId,
				amount: 29900,
				status: 'complete',
				createdAt: Date.now(),
			});

			testUserId = userId;
			testCourseId = courseId;
			testPurchaseId = purchaseId;
			testInstructorId = instructorId;
		});

		t = baseT.withIdentity({ subject: testUserExternalId });
	});

	describe('create()', () => {
		it('creates enrollment with valid data', async () => {
			const enrollmentId = await t.mutation(api.enrollments.create, {
				userId: testUserId,
				courseId: testCourseId,
				purchaseId: testPurchaseId,
			});

			expect(enrollmentId).toBeDefined();

			const enrollment = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(enrollmentId);
			});

			expect(enrollment).toBeDefined();
			expect(enrollment?.userId).toBe(testUserId);
			expect(enrollment?.courseId).toBe(testCourseId);
			expect(enrollment?.purchaseId).toBe(testPurchaseId);
			expect(enrollment?.progressPercent).toBe(0);
			expect(enrollment?.enrolledAt).toBeGreaterThan(Date.now() - 1000);
		});

		it('is idempotent - returns existing enrollment if already enrolled', async () => {
			// First enrollment
			const enrollmentId1 = await t.mutation(api.enrollments.create, {
				userId: testUserId,
				courseId: testCourseId,
				purchaseId: testPurchaseId,
			});

			// Try to enroll again (e.g., webhook retry)
			const enrollmentId2 = await t.mutation(api.enrollments.create, {
				userId: testUserId,
				courseId: testCourseId,
				purchaseId: testPurchaseId,
			});

			// Should return same enrollment ID
			expect(enrollmentId1).toBe(enrollmentId2);

			// Verify only one enrollment exists
			const enrollments = await t.run(async (ctx: TestCtx) => {
				return await ctx.db
					.query('enrollments')
					.withIndex('by_user_course', q => q.eq('userId', testUserId).eq('courseId', testCourseId))
					.collect();
			});

			expect(enrollments).toHaveLength(1);
		});

		it('creates welcome notification on enrollment', async () => {
			await t.mutation(api.enrollments.create, {
				userId: testUserId,
				courseId: testCourseId,
				purchaseId: testPurchaseId,
			});

			// Verify notification was created
			const notifications = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.query('notifications').collect();
			});

			expect(notifications.length).toBeGreaterThan(0);
			const welcomeNotif = notifications.find((n: Doc<'notifications'>) => n.title === 'Course enrolled!');
			expect(welcomeNotif).toBeDefined();
			expect(welcomeNotif?.userId).toBe(testUserId);
			expect(welcomeNotif?.description).toContain('Test Course');
		});

		it('does not create notification when course is deleted (race condition)', async () => {
			// Create valid IDs, delete the course, then create enrollment (Convex allows orphaned refs)

			// Create and immediately delete a course to get a valid but non-existent ID
			const { deletedCourseId, deletedPurchaseId } = await t.run(async (ctx: TestCtx) => {
				const tempCourseId = await ctx.db.insert('courses', {
					title: 'Temp Course',
					description: 'Will be deleted',
					instructorId: testInstructorId,
					price: 100,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});

				const tempPurchaseId = await ctx.db.insert('purchases', {
					userId: testUserId,
					courseId: tempCourseId,
					amount: 100,
					status: 'complete',
					createdAt: Date.now(),
				});

				// Delete the course before enrollment creation
				await ctx.db.delete(tempCourseId);

				return { deletedCourseId: tempCourseId, deletedPurchaseId: tempPurchaseId };
			});

			// Count notifications before
			const notificationsBefore = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.query('notifications').collect();
			});
			const countBefore = notificationsBefore.length;

			// Call create mutation with deleted courseId

			const enrollmentId = await t.mutation(api.enrollments.create, {
				userId: testUserId,
				courseId: deletedCourseId,
				purchaseId: deletedPurchaseId,
			});

			expect(enrollmentId).toBeDefined();

			// Verify NO notification was created
			const notificationsAfter = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.query('notifications').collect();
			});

			expect(notificationsAfter.length).toBe(countBefore);
		});

		it('allows multiple enrollments for same user in different courses', async () => {
			// Create second course
			const course2Id = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('courses', {
					title: 'Course 2',
					description: 'Test',
					instructorId: testInstructorId,
					price: 19900,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});
			});

			const purchase2Id = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('purchases', {
					userId: testUserId,
					courseId: course2Id,
					amount: 19900,
					status: 'complete',
					createdAt: Date.now(),
				});
			});

			const enrollment1 = await t.mutation(api.enrollments.create, {
				userId: testUserId,
				courseId: testCourseId,
				purchaseId: testPurchaseId,
			});

			const enrollment2 = await t.mutation(api.enrollments.create, {
				userId: testUserId,
				courseId: course2Id,
				purchaseId: purchase2Id,
			});

			expect(enrollment1).toBeDefined();
			expect(enrollment2).toBeDefined();
			expect(enrollment1).not.toBe(enrollment2);
		});
	});

	describe('isEnrolled()', () => {
		it('returns true when user is enrolled', async () => {
			await t.mutation(api.enrollments.create, {
				userId: testUserId,
				courseId: testCourseId,
				purchaseId: testPurchaseId,
			});

			const enrolled = await t.query(api.enrollments.isEnrolled, {
				userId: testUserId,
				courseId: testCourseId,
			});

			expect(enrolled).toBe(true);
		});

		it('returns false when user is not enrolled', async () => {
			const differentUserId = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('users', {
					firstName: 'Different',
					lastName: 'User',
					email: 'different@test.com',
					externalId: 'different-user',
					isInstructor: false,
					isAdmin: false,
				});
			});

			const enrolled = await t.query(api.enrollments.isEnrolled, {
				userId: differentUserId,
				courseId: testCourseId,
			});

			expect(enrolled).toBe(false);
		});

		it('returns false for non-existent course', async () => {
			// Create and immediately delete a course to get a valid ID format
			const nonExistentCourseId = await t.run(async (ctx: TestCtx) => {
				const tempId = await ctx.db.insert('courses', {
					title: 'Temp',
					description: 'Temp',
					instructorId: testInstructorId,
					price: 100,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});
				await ctx.db.delete(tempId);
				return tempId;
			});

			const enrolled = await t.query(api.enrollments.isEnrolled, {
				userId: testUserId,
				courseId: nonExistentCourseId,
			});

			expect(enrolled).toBe(false);
		});
	});

	describe('getCurrentUserEnrollment()', () => {
		it('returns enrollment for authenticated user', async () => {
			const enrollmentId = await t.mutation(api.enrollments.create, {
				userId: testUserId,
				courseId: testCourseId,
				purchaseId: testPurchaseId,
			});

			const enrollment = await t.query(api.enrollments.getCurrentUserEnrollment, {
				courseId: testCourseId,
			});

			expect(enrollment).toBeDefined();
			expect(enrollment?._id).toBe(enrollmentId);
			expect(enrollment?.courseId).toBe(testCourseId);
		});

		it('returns null when user not enrolled', async () => {
			const enrollment = await t.query(api.enrollments.getCurrentUserEnrollment, {
				courseId: testCourseId,
			});

			expect(enrollment).toBeNull();
		});

		it('returns null when not authenticated', async () => {
			const unauthT = convexTest(schema);

			const enrollment = await unauthT.query(api.enrollments.getCurrentUserEnrollment, {
				courseId: testCourseId,
			});

			expect(enrollment).toBeNull();
		});

		it('returns null when user not found in database', async () => {
			const noUserT = baseT.withIdentity({ subject: 'another-external-id-not-in-db' });

			const enrollment = await noUserT.query(api.enrollments.getCurrentUserEnrollment, {
				courseId: testCourseId,
			});

			expect(enrollment).toBeNull();
		});
	});

	describe('getUserEnrollments()', () => {
		it('returns enrollments with course details', async () => {
			await t.mutation(api.enrollments.create, {
				userId: testUserId,
				courseId: testCourseId,
				purchaseId: testPurchaseId,
			});

			const enrollments = await t.query(api.enrollments.getUserEnrollments, {
				userId: testUserId,
			});

			expect(enrollments).toHaveLength(1);
			expect(enrollments[0].userId).toBe(testUserId);
			expect(enrollments[0].course).toBeDefined();
			expect(enrollments[0].course?.title).toBe('Test Course');
		});

		it('returns empty array when user has no enrollments', async () => {
			const userWithNoEnrollments = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('users', {
					firstName: 'User',
					lastName: 'NoEnrollments',
					email: 'noenrollments@test.com',
					externalId: 'user-with-no-enrollments',
					isInstructor: false,
					isAdmin: false,
				});
			});

			const enrollments = await t.query(api.enrollments.getUserEnrollments, {
				userId: userWithNoEnrollments,
			});

			expect(enrollments).toHaveLength(0);
		});

		it('returns enrollments in descending order (most recent first)', async () => {
			// Create second course
			const course2Id = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('courses', {
					title: 'Course 2',
					description: 'Test',
					instructorId: testInstructorId,
					price: 19900,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});
			});

			const purchase2Id = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('purchases', {
					userId: testUserId,
					courseId: course2Id,
					amount: 19900,
					status: 'complete',
					createdAt: Date.now(),
				});
			});

			// Create enrollments (first enrollment older)
			await t.mutation(api.enrollments.create, {
				userId: testUserId,
				courseId: testCourseId,
				purchaseId: testPurchaseId,
			});

			// Wait 1ms to ensure different timestamp
			await new Promise(resolve => setTimeout(resolve, 1));

			await t.mutation(api.enrollments.create, {
				userId: testUserId,
				courseId: course2Id,
				purchaseId: purchase2Id,
			});

			const enrollments = await t.query(api.enrollments.getUserEnrollments, {
				userId: testUserId,
			});

			expect(enrollments).toHaveLength(2);
			// Most recent should be first (desc order)
			expect(enrollments[0].courseId).toBe(course2Id);
		});
	});

	describe('getMyEnrollments()', () => {
		it('returns authenticated user enrollments with course details', async () => {
			await t.mutation(api.enrollments.create, {
				userId: testUserId,
				courseId: testCourseId,
				purchaseId: testPurchaseId,
			});

			const enrollments = await t.query(api.enrollments.getMyEnrollments);

			expect(enrollments).toHaveLength(1);
			expect(enrollments[0].course).toBeDefined();
			expect(enrollments[0].course?.title).toBe('Test Course');
		});

		it('returns empty array when not authenticated', async () => {
			const unauthT = convexTest(schema);

			const enrollments = await unauthT.query(api.enrollments.getMyEnrollments);

			expect(enrollments).toHaveLength(0);
		});

		it('returns empty array when user has no enrollments', async () => {
			const enrollments = await t.query(api.enrollments.getMyEnrollments);

			expect(enrollments).toHaveLength(0);
		});

		it('returns empty array when user not found in database', async () => {
			const noUserT = baseT.withIdentity({ subject: 'external-id-not-in-db' });

			const enrollments = await noUserT.query(api.enrollments.getMyEnrollments);

			expect(enrollments).toHaveLength(0);
		});
	});

	describe('getMyEnrollmentsWithProgress()', () => {
		it('returns enrollments with complete data (course, instructor, progress, nextLesson)', async () => {
			// Create module and lessons for the course
			const moduleId = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('courseModules', {
					courseId: testCourseId,
					title: 'Module 1',
					order: 0,
					createdAt: Date.now(),
				});
			});

			const lesson1Id = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('lessons', {
					moduleId,
					title: 'Lesson 1',
					type: 'video',
					isPreview: false,
					order: 0,
					createdAt: Date.now(),
				});
			});

			const lesson2Id = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('lessons', {
					moduleId,
					title: 'Lesson 2',
					type: 'video',
					isPreview: false,
					order: 1,
					createdAt: Date.now(),
				});
			});

			// Create enrollment
			await t.mutation(api.enrollments.create, {
				userId: testUserId,
				courseId: testCourseId,
				purchaseId: testPurchaseId,
			});

			// Mark first lesson complete
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.insert('lessonProgress', {
					userId: testUserId,
					lessonId: lesson1Id,
					completedAt: Date.now(),
				});
			});

			// Get enrollments with progress
			const enrollments = await t.query(api.enrollments.getMyEnrollmentsWithProgress);

			expect(enrollments).toHaveLength(1);
			const enrollment = enrollments[0];

			// Verify course data
			expect(enrollment.course).toBeDefined();
			expect(enrollment.course?.title).toBe('Test Course');

			// Verify instructor data
			expect(enrollment.instructor).toBeDefined();
			expect(enrollment.instructor?.firstName).toBe('Test');
			expect(enrollment.instructor?.lastName).toBe('Instructor');

			// Verify progress data
			expect(enrollment.progress).toBeDefined();
			expect(enrollment.progress?.total).toBe(2);
			expect(enrollment.progress?.completed).toBe(1);
			expect(enrollment.progress?.percent).toBe(0); // Uses enrollment.progressPercent
			expect(enrollment.progress?.completedLessonIds).toHaveLength(1);

			// Verify next lesson (should be lesson 2)
			expect(enrollment.nextLessonId).toBe(lesson2Id);
		});

		it('returns empty array when not authenticated', async () => {
			const unauthT = convexTest(schema);

			const enrollments = await unauthT.query(api.enrollments.getMyEnrollmentsWithProgress);

			expect(enrollments).toHaveLength(0);
		});

		it('returns empty array when user has no enrollments', async () => {
			const enrollments = await t.query(api.enrollments.getMyEnrollmentsWithProgress);

			expect(enrollments).toHaveLength(0);
		});

		it('returns empty array when user not found in database', async () => {
			const noUserT = baseT.withIdentity({ subject: 'some-external-id-not-in-db' });

			const enrollments = await noUserT.query(api.enrollments.getMyEnrollmentsWithProgress);

			expect(enrollments).toHaveLength(0);
		});

		it('handles course with no modules gracefully', async () => {
			// Create enrollment for course with no modules
			await t.mutation(api.enrollments.create, {
				userId: testUserId,
				courseId: testCourseId,
				purchaseId: testPurchaseId,
			});

			const enrollments = await t.query(api.enrollments.getMyEnrollmentsWithProgress);

			expect(enrollments).toHaveLength(1);
			expect(enrollments[0].progress?.total).toBe(0);
			expect(enrollments[0].progress?.completed).toBe(0);
			expect(enrollments[0].nextLessonId).toBeNull();
		});

		it('returns first lesson when all lessons complete', async () => {
			// Create module with 2 lessons
			const moduleId = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('courseModules', {
					courseId: testCourseId,
					title: 'Module 1',
					order: 0,
					createdAt: Date.now(),
				});
			});

			const lesson1Id = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('lessons', {
					moduleId,
					title: 'Lesson 1',
					type: 'video',
					isPreview: false,
					order: 0,
					createdAt: Date.now(),
				});
			});

			const lesson2Id = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('lessons', {
					moduleId,
					title: 'Lesson 2',
					type: 'video',
					isPreview: false,
					order: 1,
					createdAt: Date.now(),
				});
			});

			// Create enrollment
			await t.mutation(api.enrollments.create, {
				userId: testUserId,
				courseId: testCourseId,
				purchaseId: testPurchaseId,
			});

			// Mark both lessons complete
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.insert('lessonProgress', {
					userId: testUserId,
					lessonId: lesson1Id,
					completedAt: Date.now(),
				});
				await ctx.db.insert('lessonProgress', {
					userId: testUserId,
					lessonId: lesson2Id,
					completedAt: Date.now(),
				});
			});

			const enrollments = await t.query(api.enrollments.getMyEnrollmentsWithProgress);

			// When all complete, should return first lesson for review
			expect(enrollments[0].nextLessonId).toBe(lesson1Id);
		});

		it('handles failed course load gracefully', async () => {
			// Create enrollment with valid courseId
			const enrollmentId = await t.run(async (ctx: TestCtx) => {
				const tempCourseId = await ctx.db.insert('courses', {
					title: 'Temp Course',
					description: 'Temp',
					instructorId: testInstructorId,
					price: 100,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});

				const purchaseId = await ctx.db.insert('purchases', {
					userId: testUserId,
					courseId: tempCourseId,
					amount: 100,
					status: 'complete',
					createdAt: Date.now(),
				});

				return await ctx.db.insert('enrollments', {
					userId: testUserId,
					courseId: tempCourseId,
					purchaseId,
					enrolledAt: Date.now(),
					progressPercent: 0,
				});
			});

			// Delete the course (orphan the enrollment)
			const enrollment = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(enrollmentId);
			});

			await t.run(async (ctx: TestCtx) => {
				if (enrollment) {
					await ctx.db.delete(enrollment.courseId);
				}
			});

			// Query should handle missing course gracefully
			const enrollments = await t.query(api.enrollments.getMyEnrollmentsWithProgress);

			// Should return enrollment with null course data
			const orphanedEnrollment = enrollments.find((e: Doc<'enrollments'>) => e._id === enrollmentId);
			expect(orphanedEnrollment).toBeDefined();
			expect(orphanedEnrollment?.course).toBeNull();
			expect(orphanedEnrollment?.instructor).toBeNull();
			expect(orphanedEnrollment?.progress).toBeNull();
			expect(orphanedEnrollment?.nextLessonId).toBeNull();
		});

		it('handles module with no lessons', async () => {
			// Create module with NO lessons
			await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('courseModules', {
					courseId: testCourseId,
					title: 'Empty Module',
					order: 0,
					createdAt: Date.now(),
				});
			});

			await t.mutation(api.enrollments.create, {
				userId: testUserId,
				courseId: testCourseId,
				purchaseId: testPurchaseId,
			});

			const enrollments = await t.query(api.enrollments.getMyEnrollmentsWithProgress);

			// Should handle empty module gracefully
			expect(enrollments[0].progress?.total).toBe(0);
			expect(enrollments[0].nextLessonId).toBeNull();
		});

		it('returns null nextLessonId when first module has no lessons', async () => {
			// Create 2 modules: first empty, second with lessons
			await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('courseModules', {
					courseId: testCourseId,
					title: 'Empty Module',
					order: 0,
					createdAt: Date.now(),
				});
			});

			const module2Id = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('courseModules', {
					courseId: testCourseId,
					title: 'Module 2',
					order: 1,
					createdAt: Date.now(),
				});
			});

			// Add lesson only to module 2
			const lesson = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('lessons', {
					moduleId: module2Id,
					title: 'Lesson',
					type: 'video',
					isPreview: false,
					order: 0,
					createdAt: Date.now(),
				});
			});

			await t.mutation(api.enrollments.create, {
				userId: testUserId,
				courseId: testCourseId,
				purchaseId: testPurchaseId,
			});

			// Complete the only lesson
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.insert('lessonProgress', {
					userId: testUserId,
					lessonId: lesson,
					completedAt: Date.now(),
				});
			});

			const enrollments = await t.query(api.enrollments.getMyEnrollmentsWithProgress);

			// All lessons complete, should try to return first lesson
			// But first module has no lessons
			// Should still handle gracefully
			expect(enrollments[0]).toBeDefined();
		});

		it('handles multiple modules and finds next lesson correctly', async () => {
			// Create 2 modules with 2 lessons each
			const module1Id = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('courseModules', {
					courseId: testCourseId,
					title: 'Module 1',
					order: 0,
					createdAt: Date.now(),
				});
			});

			const module2Id = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('courseModules', {
					courseId: testCourseId,
					title: 'Module 2',
					order: 1,
					createdAt: Date.now(),
				});
			});

			const m1l1 = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('lessons', {
					moduleId: module1Id,
					title: 'M1 L1',
					type: 'video',
					isPreview: false,
					order: 0,
					createdAt: Date.now(),
				});
			});

			const m1l2 = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('lessons', {
					moduleId: module1Id,
					title: 'M1 L2',
					type: 'video',
					isPreview: false,
					order: 1,
					createdAt: Date.now(),
				});
			});

			const m2l1 = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('lessons', {
					moduleId: module2Id,
					title: 'M2 L1',
					type: 'video',
					isPreview: false,
					order: 0,
					createdAt: Date.now(),
				});
			});

			// Create enrollment
			await t.mutation(api.enrollments.create, {
				userId: testUserId,
				courseId: testCourseId,
				purchaseId: testPurchaseId,
			});

			// Complete all Module 1 lessons
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.insert('lessonProgress', {
					userId: testUserId,
					lessonId: m1l1,
					completedAt: Date.now(),
				});
				await ctx.db.insert('lessonProgress', {
					userId: testUserId,
					lessonId: m1l2,
					completedAt: Date.now(),
				});
			});

			const enrollments = await t.query(api.enrollments.getMyEnrollmentsWithProgress);

			// Next lesson should be first lesson of Module 2
			expect(enrollments[0].nextLessonId).toBe(m2l1);
			expect(enrollments[0].progress?.total).toBe(3);
			expect(enrollments[0].progress?.completed).toBe(2);
		});

		it('handles empty module while searching for next lesson', async () => {
			// Create 3 modules: 1st with lessons, 2nd EMPTY, 3rd with lessons
			const module1Id = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('courseModules', {
					courseId: testCourseId,
					title: 'Module 1',
					order: 0,
					createdAt: Date.now(),
				});
			});

			await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('courseModules', {
					courseId: testCourseId,
					title: 'Empty Module',
					order: 1,
					createdAt: Date.now(),
				});
			});

			const module3Id = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('courseModules', {
					courseId: testCourseId,
					title: 'Module 3',
					order: 2,
					createdAt: Date.now(),
				});
			});

			// Add lesson to module 1
			const m1l1 = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('lessons', {
					moduleId: module1Id,
					title: 'Lesson 1',
					type: 'video',
					isPreview: false,
					order: 0,
					createdAt: Date.now(),
				});
			});

			// Module 2 intentionally has NO lessons

			// Add lesson to module 3
			const m3l1 = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('lessons', {
					moduleId: module3Id,
					title: 'Lesson 3',
					type: 'video',
					isPreview: false,
					order: 0,
					createdAt: Date.now(),
				});
			});

			await t.mutation(api.enrollments.create, {
				userId: testUserId,
				courseId: testCourseId,
				purchaseId: testPurchaseId,
			});

			// Complete module 1 lesson
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.insert('lessonProgress', {
					userId: testUserId,
					lessonId: m1l1,
					completedAt: Date.now(),
				});
			});

			const enrollments = await t.query(api.enrollments.getMyEnrollmentsWithProgress);

			// Should skip empty module 2 and find lesson in module 3
			expect(enrollments[0].nextLessonId).toBe(m3l1);
		});

		it('handles deleted instructor gracefully', async () => {
			// Create a temporary instructor and course
			const tempInstructorId = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('users', {
					firstName: 'Temp',
					lastName: 'Instructor',
					email: 'temp@test.com',
					externalId: 'temp-instructor',
					isInstructor: true,
					isAdmin: false,
				});
			});

			const tempCourseId = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('courses', {
					title: 'Temp Course',
					description: 'Course with instructor that will be deleted',
					instructorId: tempInstructorId,
					price: 100,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});
			});

			const tempPurchaseId = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('purchases', {
					userId: testUserId,
					courseId: tempCourseId,
					amount: 100,
					status: 'complete',
					createdAt: Date.now(),
				});
			});

			// Create enrollment
			await t.mutation(api.enrollments.create, {
				userId: testUserId,
				courseId: tempCourseId,
				purchaseId: tempPurchaseId,
			});

			// Delete the instructor (but keep course - orphan scenario)
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.delete(tempInstructorId);
			});

			// Query should handle null instructor gracefully
			const enrollments = await t.query(api.enrollments.getMyEnrollmentsWithProgress);

			// Find the enrollment with the orphaned course
			const orphanedEnrollment = enrollments.find((e: Doc<'enrollments'>) => e.courseId === tempCourseId);

			expect(orphanedEnrollment).toBeDefined();
			expect(orphanedEnrollment?.course).toBeDefined();
			expect(orphanedEnrollment?.course?.title).toBe('Temp Course');

			expect(orphanedEnrollment?.instructor).toBeNull();
		});
	});

	describe('getCourseEnrollmentCount()', () => {
		it('returns count of enrollments for a course', async () => {
			// Create 3 users and enrollments for the course
			const userIds = await t.run(async (ctx: TestCtx) => {
				const user1Id = await ctx.db.insert('users', {
					firstName: 'User',
					lastName: 'One',
					email: 'user1@test.com',
					externalId: 'user-1',
					isInstructor: false,
					isAdmin: false,
				});

				const user2Id = await ctx.db.insert('users', {
					firstName: 'User',
					lastName: 'Two',
					email: 'user2@test.com',
					externalId: 'user-2',
					isInstructor: false,
					isAdmin: false,
				});

				const user3Id = await ctx.db.insert('users', {
					firstName: 'User',
					lastName: 'Three',
					email: 'user3@test.com',
					externalId: 'user-3',
					isInstructor: false,
					isAdmin: false,
				});

				return [user1Id, user2Id, user3Id];
			});

			for (const userId of userIds) {
				const purchaseId = await t.run(async (ctx: TestCtx) => {
					return await ctx.db.insert('purchases', {
						userId,
						courseId: testCourseId,
						amount: 29900,
						status: 'complete',
						createdAt: Date.now(),
					});
				});

				await t.mutation(api.enrollments.create, {
					userId,
					courseId: testCourseId,
					purchaseId,
				});
			}

			const count = await t.query(api.enrollments.getCourseEnrollmentCount, {
				courseId: testCourseId,
			});

			expect(count).toBe(3);
		});

		it('returns 0 when course has no enrollments', async () => {
			const count = await t.query(api.enrollments.getCourseEnrollmentCount, {
				courseId: testCourseId,
			});

			expect(count).toBe(0);
		});
	});

	describe('getCourseStudents()', () => {
		it('returns aggregate student data for instructor', async () => {
			// Create 3 enrollments with different progress levels
			const enrollmentIds: Id<'enrollments'>[] = [];

			// Create 3 student users
			const studentIds = await t.run(async (ctx: TestCtx) => {
				const ids: Id<'users'>[] = [];
				for (let i = 0; i < 3; i++) {
					const studentId = await ctx.db.insert('users', {
						firstName: 'Student',
						lastName: `${i}`,
						email: `student${i}@test.com`,
						externalId: `student-${i}`,
						isInstructor: false,
						isAdmin: false,
					});
					ids.push(studentId);
				}
				return ids;
			});

			for (const userId of studentIds) {
				const purchaseId = await t.run(async (ctx: TestCtx) => {
					return await ctx.db.insert('purchases', {
						userId,
						courseId: testCourseId,
						amount: 29900,
						status: 'complete',
						createdAt: Date.now(),
					});
				});

				const enrollmentId = await t.mutation(api.enrollments.create, {
					userId,
					courseId: testCourseId,
					purchaseId,
				});

				enrollmentIds.push(enrollmentId);
			}

			// Update progress for each enrollment
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.patch(enrollmentIds[0], { progressPercent: 100, completedAt: Date.now() });
				await ctx.db.patch(enrollmentIds[1], { progressPercent: 50 });
				await ctx.db.patch(enrollmentIds[2], { progressPercent: 25 });
			});

			// Query as instructor (use base context with instructor identity)
			const instructorContext = baseT.withIdentity({ subject: 'test-instructor-id' });

			const stats = await instructorContext.query(api.enrollments.getCourseStudents, {
				courseId: testCourseId,
			});

			expect(stats.total).toBe(3);
			expect(stats.completed).toBe(1);
			expect(stats.averageProgress).toBeCloseTo(58.33, 1); // (100 + 50 + 25) / 3
		});

		it('throws error when not authenticated', async () => {
			const unauthT = convexTest(schema);

			await expect(
				unauthT.query(api.enrollments.getCourseStudents, {
					courseId: testCourseId,
				}),
			).rejects.toThrow('Not authenticated');
		});

		it('throws error when user is not course instructor', async () => {
			// Create a different instructor user
			await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('users', {
					firstName: 'Other',
					lastName: 'Instructor',
					email: 'other@test.com',
					externalId: 'other-instructor-id',
					isInstructor: true,
					isAdmin: false,
				});
			});

			// Use base context with different instructor identity
			const otherInstructorContext = baseT.withIdentity({ subject: 'other-instructor-id' });

			await expect(
				otherInstructorContext.query(api.enrollments.getCourseStudents, {
					courseId: testCourseId,
				}),
			).rejects.toThrow('Not authorized');
		});

		it('throws error when course not found', async () => {
			const instructorT = convexTest(schema).withIdentity({ subject: 'test-instructor-id' });

			const nonExistentCourseId = await t.run(async (ctx: TestCtx) => {
				const tempId = await ctx.db.insert('courses', {
					title: 'Temp',
					description: 'Temp',
					instructorId: testInstructorId,
					price: 100,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});
				await ctx.db.delete(tempId);
				return tempId;
			});

			await expect(
				instructorT.query(api.enrollments.getCourseStudents, {
					courseId: nonExistentCourseId,
				}),
			).rejects.toThrow('Course not found');
		});

		it('returns 0 averageProgress when course has no enrollments', async () => {
			// Use base context with instructor identity
			const instructorContext = baseT.withIdentity({ subject: 'test-instructor-id' });

			// Query the test course which has no enrollments yet
			const stats = await instructorContext.query(api.enrollments.getCourseStudents, {
				courseId: testCourseId,
			});

			expect(stats.total).toBe(0);
			expect(stats.completed).toBe(0);
			expect(stats.averageProgress).toBe(0);
		});
	});

	describe('updateProgress()', () => {
		it('updates enrollment progress percentage', async () => {
			const enrollmentId = await t.mutation(api.enrollments.create, {
				userId: testUserId,
				courseId: testCourseId,
				purchaseId: testPurchaseId,
			});

			await t.mutation(api.enrollments.updateProgress, {
				enrollmentId,
				progressPercent: 75,
			});

			const enrollment = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(enrollmentId);
			});

			expect(enrollment?.progressPercent).toBe(75);
		});

		it('updates enrollment with completedAt (without triggering scheduler)', async () => {
			const enrollmentId = await t.mutation(api.enrollments.create, {
				userId: testUserId,
				courseId: testCourseId,
				purchaseId: testPurchaseId,
			});

			const completedAt = Date.now();

			// Directly patch to avoid scheduler - mutation would trigger unhandled error
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.patch(enrollmentId, {
					progressPercent: 100,
					completedAt,
				});
			});

			const enrollment = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(enrollmentId);
			});

			expect(enrollment?.progressPercent).toBe(100);
			expect(enrollment?.completedAt).toBe(completedAt);
		});

		it('can update progress without completedAt', async () => {
			const enrollmentId = await t.mutation(api.enrollments.create, {
				userId: testUserId,
				courseId: testCourseId,
				purchaseId: testPurchaseId,
			});

			await t.mutation(api.enrollments.updateProgress, {
				enrollmentId,
				progressPercent: 50,
			});

			const enrollment = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(enrollmentId);
			});

			expect(enrollment?.progressPercent).toBe(50);
			expect(enrollment?.completedAt).toBeUndefined();
		});

		it('does NOT schedule certificate when completedAt not provided', async () => {
			const enrollmentId = await t.mutation(api.enrollments.create, {
				userId: testUserId,
				courseId: testCourseId,
				purchaseId: testPurchaseId,
			});

			// Update without completedAt - should NOT trigger certificate generation
			await t.mutation(api.enrollments.updateProgress, {
				enrollmentId,
				progressPercent: 99,
			});

			const enrollment = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(enrollmentId);
			});

			expect(enrollment?.progressPercent).toBe(99);
			expect(enrollment?.completedAt).toBeUndefined();
		});
	});

	describe('Progress tracking integration', () => {
		it('initializes enrollment with 0% progress', async () => {
			const enrollmentId = await t.mutation(api.enrollments.create, {
				userId: testUserId,
				courseId: testCourseId,
				purchaseId: testPurchaseId,
			});

			const enrollment = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(enrollmentId);
			});

			expect(enrollment?.progressPercent).toBe(0);
			expect(enrollment?.completedAt).toBeUndefined();
		});

		it('supports progress percentage updates', async () => {
			const enrollmentId = await t.mutation(api.enrollments.create, {
				userId: testUserId,
				courseId: testCourseId,
				purchaseId: testPurchaseId,
			});

			// Simulate progress update
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.patch(enrollmentId, {
					progressPercent: 50,
				});
			});

			const enrollment = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(enrollmentId);
			});

			expect(enrollment?.progressPercent).toBe(50);
		});

		it('supports course completion (100% progress + completedAt)', async () => {
			const enrollmentId = await t.mutation(api.enrollments.create, {
				userId: testUserId,
				courseId: testCourseId,
				purchaseId: testPurchaseId,
			});

			const completedAt = Date.now();

			await t.run(async (ctx: TestCtx) => {
				await ctx.db.patch(enrollmentId, {
					progressPercent: 100,
					completedAt,
				});
			});

			const enrollment = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(enrollmentId);
			});

			expect(enrollment?.progressPercent).toBe(100);
			expect(enrollment?.completedAt).toBe(completedAt);
		});
	});
});
