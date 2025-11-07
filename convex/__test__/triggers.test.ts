import type { GenericMutationCtx } from 'convex/server';
import { convexTest } from 'convex-test';
import { beforeEach, describe, expect, it } from 'vitest';

import { api } from '../_generated/api';
import type { DataModel, Id } from '../_generated/dataModel';
import schema from '../schema';
import { handleEnrollmentChange, handleEnrollmentCompletion } from '../triggers';

type TestCtx = GenericMutationCtx<DataModel>;

describe('Enrollment Completion Trigger', () => {
	let t: any;
	let testUserId: string;
	let testInstructorId: Id<'users'>;
	let testCourseId: Id<'courses'>;
	let testLessonId: Id<'lessons'>;
	let testEnrollmentId: Id<'enrollments'>;

	beforeEach(async () => {
		const baseT = convexTest(schema);

		// Set up test data
		await baseT.run(async (ctx: TestCtx) => {
			// Create test student user
			await ctx.db.insert('users', {
				firstName: 'Test',
				lastName: 'Student',
				email: 'student@test.com',
				externalId: 'test-student-clerk-id',
				isInstructor: false,
				isAdmin: false,
			});

			// Create test instructor user
			const instructorId = await ctx.db.insert('users', {
				firstName: 'Dr.',
				lastName: 'Instructor',
				email: 'instructor@test.com',
				externalId: 'instructor-clerk-id',
				isInstructor: true,
				isAdmin: false,
			});

			// Create test course
			const courseId = await ctx.db.insert('courses', {
				title: 'Test Course',
				description: 'Test description',
				instructorId: instructorId,
				price: 29900,
				createdAt: Date.now(),
				updatedAt: Date.now(),
			});

			// Create test module
			const moduleId = await ctx.db.insert('courseModules', {
				courseId,
				title: 'Module 1',
				order: 0,
				createdAt: Date.now(),
			});

			// Create test lesson
			const lessonId = await ctx.db.insert('lessons', {
				moduleId,
				title: 'Lesson 1',
				type: 'video',
				isPreview: false,
				order: 0,
				createdAt: Date.now(),
			});

			// Create purchase
			const purchaseId = await ctx.db.insert('purchases', {
				userId: 'test-student-clerk-id',
				courseId,
				amount: 29900,
				status: 'complete',
				createdAt: Date.now(),
			});

			// Create enrollment (NOT completed)
			const enrollmentId = await ctx.db.insert('enrollments', {
				userId: 'test-student-clerk-id',
				courseId,
				purchaseId,
				enrolledAt: Date.now(),
				progressPercent: 0,
			});

			// Store IDs for tests
			testUserId = 'test-student-clerk-id';
			testInstructorId = instructorId;
			testCourseId = courseId;

			testLessonId = lessonId;
			testEnrollmentId = enrollmentId;
		});

		// Create authenticated test instance
		t = baseT.withIdentity({ subject: testUserId });
	});

	describe('Certificate generation trigger', () => {
		// NOTE: We test the trigger handler logic by calling handleEnrollmentChange()
		// and handleEnrollmentCompletion() directly since convex-test doesn't support
		// the convex-helpers trigger system

		it('does NOT execute handler when operation is not "update" (operation filter)', async () => {
			// Create a separate course and enrollment for this test to avoid state conflicts
			const { enrollmentId, studentUserId } = await t.run(async (ctx: TestCtx) => {
				// Create a new course for isolation
				const courseId = await ctx.db.insert('courses', {
					title: 'Operation Filter Test Course',
					description: 'Test',
					instructorId: testInstructorId,
					price: 100,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});

				// Create module and lesson
				const moduleId = await ctx.db.insert('courseModules', {
					courseId,
					title: 'Test Module',
					order: 0,
					createdAt: Date.now(),
				});

				await ctx.db.insert('lessons', {
					moduleId,
					title: 'Test Lesson',
					type: 'video',
					isPreview: false,
					order: 0,
					createdAt: Date.now(),
				});

				// Create a new student user
				const userId = await ctx.db.insert('users', {
					firstName: 'Filter',
					lastName: 'Test',
					email: 'filtertest@test.com',
					externalId: 'filter-test-user',
					isInstructor: false,
					isAdmin: false,
				});

				// Create purchase and enrollment
				const purchaseId = await ctx.db.insert('purchases', {
					userId: 'filter-test-user',
					courseId,
					amount: 100,
					status: 'complete',
					createdAt: Date.now(),
				});

				const enrollmentId = await ctx.db.insert('enrollments', {
					userId: 'filter-test-user',
					courseId,
					purchaseId,
					enrolledAt: Date.now(),
					progressPercent: 0,
				});

				// Mark complete to simulate 100% completion
				await ctx.db.patch(enrollmentId, {
					progressPercent: 100,
					completedAt: Date.now(),
				});

				return { enrollmentId, studentUserId: userId };
			});

			// Get the completed enrollment
			const completedEnrollment = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(enrollmentId);
			});

			// Simulate an 'insert' operation (not 'update')
			const didExecute = await t.run(async (ctx: TestCtx) => {
				return await handleEnrollmentChange(ctx, {
					operation: 'insert' as const,
					id: enrollmentId,
					oldDoc: null, // insert has null oldDoc
					newDoc: completedEnrollment!,
				});
			});

			// Handler should return false and not execute
			expect(didExecute).toBe(false);

			// Verify no certificate was generated for this student
			const certificates = await t.run(async (ctx: TestCtx) => {
				return await ctx.db
					.query('certificates')
					.withIndex('by_user', q => q.eq('userId', studentUserId))
					.collect();
			});

			expect(certificates.length).toBe(0);
		});

		it('executes handler when operation is "update"', async () => {
			// Get enrollment before completion
			const oldEnrollment = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(testEnrollmentId);
			});

			// Complete the lesson
			await t.mutation(api.lessonProgress.markComplete, {
				lessonId: testLessonId,
			});

			// Get enrollment after completion
			const newEnrollment = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(testEnrollmentId);
			});

			// Simulate an 'update' operation
			const didExecute = await t.run(async (ctx: TestCtx) => {
				return await handleEnrollmentChange(ctx, {
					operation: 'update' as const,
					id: testEnrollmentId,
					oldDoc: oldEnrollment!,
					newDoc: newEnrollment!,
				});
			});

			// Handler should return true and execute
			expect(didExecute).toBe(true);

			// Verify certificate was generated
			const studentUser = await t.run(async (ctx: TestCtx) => {
				return await ctx.db
					.query('users')
					.withIndex('by_externalId', q => q.eq('externalId', testUserId))
					.first();
			});

			const certificates = await t.run(async (ctx: TestCtx) => {
				return await ctx.db
					.query('certificates')
					.withIndex('by_user', q => q.eq('userId', studentUser!._id))
					.collect();
			});

			expect(certificates.length).toBeGreaterThan(0);
		});

		it('generates certificate when enrollment reaches 100% completion (user && instructor exist)', async () => {
			// Get enrollment before completion
			const oldEnrollment = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(testEnrollmentId);
			});

			// Complete the lesson to trigger 100% completion
			await t.mutation(api.lessonProgress.markComplete, {
				lessonId: testLessonId,
			});

			// Get enrollment after completion
			const newEnrollment = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(testEnrollmentId);
			});

			expect(newEnrollment?.progressPercent).toBe(100);
			expect(newEnrollment?.completedAt).toBeDefined();

			// Manually invoke trigger handler (simulates trigger firing)
			await t.run(async (ctx: TestCtx) => {
				await handleEnrollmentCompletion(ctx, oldEnrollment!, newEnrollment!);
			});

			// Get the student user ID (certificate is issued TO the student)
			const studentUser = await t.run(async (ctx: TestCtx) => {
				return await ctx.db
					.query('users')
					.withIndex('by_externalId', q => q.eq('externalId', testUserId))
					.first();
			});

			// Verify certificate was generated for the STUDENT
			const certificates = await t.run(async (ctx: TestCtx) => {
				return await ctx.db
					.query('certificates')
					.withIndex('by_user', q => q.eq('userId', studentUser!._id))
					.collect();
			});

			// Certificate should exist for the course
			const cert = certificates.find((c: { courseId: Id<'courses'> }) => c.courseId === testCourseId);
			expect(cert).toBeDefined();
			expect(cert?.userName).toContain('Test Student');
			expect(cert?.courseName).toBe('Test Course');
			expect(cert?.instructorName).toContain('Dr. Instructor');
		});

		it('generates certificate when oldDoc is undefined and newDoc has completedAt', async () => {
			// This tests handler behavior when oldDoc is undefined (e.g., if called on insert)
			// In production, the trigger wrapper prevents calling handler on insert operations
			// But the handler itself should work correctly if called with undefined oldDoc
			const newEnrollment = await t.run(async (ctx: TestCtx) => {
				const newPurchaseId = await ctx.db.insert('purchases', {
					userId: 'test-student-clerk-id',
					courseId: testCourseId,
					amount: 100,
					status: 'complete',
					createdAt: Date.now(),
				});

				// Create enrollment with completedAt already set
				const enrollmentId = await ctx.db.insert('enrollments', {
					userId: 'test-student-clerk-id',
					courseId: testCourseId,
					purchaseId: newPurchaseId,
					enrolledAt: Date.now(),
					progressPercent: 100,
					completedAt: Date.now(),
				});

				return await ctx.db.get(enrollmentId);
			});

			// Call handler with undefined oldDoc
			// Since !undefined?.completedAt === true, certificate should be generated
			await t.run(async (ctx: TestCtx) => {
				await handleEnrollmentCompletion(ctx, undefined, newEnrollment!);
			});

			// Verify certificate was generated
			const studentUser = await t.run(async (ctx: TestCtx) => {
				return await ctx.db
					.query('users')
					.withIndex('by_externalId', q => q.eq('externalId', 'test-student-clerk-id'))
					.first();
			});

			const certificates = await t.run(async (ctx: TestCtx) => {
				return await ctx.db
					.query('certificates')
					.withIndex('by_user', q => q.eq('userId', studentUser!._id))
					.collect();
			});

			// Handler correctly generates certificate when oldDoc is undefined
			expect(certificates.length).toBeGreaterThan(0);

			const cert = certificates.find((c: { courseId: Id<'courses'> }) => c.courseId === testCourseId);
			expect(cert).toBeDefined();
			expect(cert?.userName).toContain('Test Student');
		});

		it('does NOT trigger certificate generation when course is deleted (!course)', async () => {
			// Get enrollment before completion
			const oldEnrollment = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(testEnrollmentId);
			});

			// Delete the course
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.delete(testCourseId);
			});

			// Create new enrollment with completedAt set (simulating orphaned data)
			const newEnrollment = await t.run(async (ctx: TestCtx) => {
				await ctx.db.patch(testEnrollmentId, {
					progressPercent: 100,
					completedAt: Date.now(),
				});
				return await ctx.db.get(testEnrollmentId);
			});

			// Invoke trigger handler - should exit early when !course
			await t.run(async (ctx: TestCtx) => {
				await handleEnrollmentCompletion(ctx, oldEnrollment!, newEnrollment!);
			});

			// Verify no certificate was generated (trigger returned early when !course)
			const certificates = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.query('certificates').collect();
			});

			// No certificates should exist (trigger exited when course not found)
			expect(certificates.length).toBe(0);
		});

		it('does NOT trigger certificate generation when student user is missing (!user)', async () => {
			// Get enrollment before completion
			const oldEnrollment = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(testEnrollmentId);
			});

			// Delete the student user
			const studentUser = await t.run(async (ctx: TestCtx) => {
				return await ctx.db
					.query('users')
					.withIndex('by_externalId', q => q.eq('externalId', testUserId))
					.first();
			});

			await t.run(async (ctx: TestCtx) => {
				if (studentUser) {
					await ctx.db.delete(studentUser._id);
				}
			});

			// Patch enrollment to 100% complete
			const newEnrollment = await t.run(async (ctx: TestCtx) => {
				await ctx.db.patch(testEnrollmentId, {
					progressPercent: 100,
					completedAt: Date.now(),
				});
				return await ctx.db.get(testEnrollmentId);
			});

			// Invoke trigger handler - should exit early when !user
			await t.run(async (ctx: TestCtx) => {
				await handleEnrollmentCompletion(ctx, oldEnrollment!, newEnrollment!);
			});

			// Verify no certificate was generated (trigger exited when user not found)
			const certificates = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.query('certificates').collect();
			});

			expect(certificates.length).toBe(0);
		});

		it('does NOT trigger certificate generation when instructor is missing (!instructor)', async () => {
			// Get enrollment before completion
			const oldEnrollment = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(testEnrollmentId);
			});

			// Delete the instructor user
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.delete(testInstructorId);
			});

			// Patch enrollment to 100% complete
			const newEnrollment = await t.run(async (ctx: TestCtx) => {
				await ctx.db.patch(testEnrollmentId, {
					progressPercent: 100,
					completedAt: Date.now(),
				});
				return await ctx.db.get(testEnrollmentId);
			});

			// Invoke trigger handler - should exit early when !instructor
			await t.run(async (ctx: TestCtx) => {
				await handleEnrollmentCompletion(ctx, oldEnrollment!, newEnrollment!);
			});

			// Verify no certificate was generated (trigger exited when instructor not found)
			const certificates = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.query('certificates').collect();
			});

			expect(certificates.length).toBe(0);
		});

		it('does NOT trigger certificate on progress update without completedAt', async () => {
			// Get enrollment before update
			const oldEnrollment = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(testEnrollmentId);
			});

			// Update enrollment progress but NOT to 100%
			const newEnrollment = await t.run(async (ctx: TestCtx) => {
				await ctx.db.patch(testEnrollmentId, {
					progressPercent: 50,
				});
				return await ctx.db.get(testEnrollmentId);
			});

			// Invoke trigger handler - should exit early (no completedAt)
			await t.run(async (ctx: TestCtx) => {
				await handleEnrollmentCompletion(ctx, oldEnrollment!, newEnrollment!);
			});

			// Verify no certificate was generated
			const certificates = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.query('certificates').collect();
			});

			expect(certificates.length).toBe(0);
		});

		it('does NOT trigger certificate when completedAt was already set (idempotency)', async () => {
			// Complete the lesson first time
			await t.mutation(api.lessonProgress.markComplete, {
				lessonId: testLessonId,
			});

			// Get enrollment after first completion
			const oldEnrollment = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(testEnrollmentId);
			});

			// Invoke trigger handler first time
			await t.run(async (ctx: TestCtx) => {
				await handleEnrollmentCompletion(ctx, undefined, oldEnrollment!);
			});

			// Get certificate count
			const firstCertCount = await t.run(async (ctx: TestCtx) => {
				return (await ctx.db.query('certificates').collect()).length;
			});

			expect(firstCertCount).toBe(1);

			// Update enrollment again with completedAt already set
			const newEnrollment = await t.run(async (ctx: TestCtx) => {
				await ctx.db.patch(testEnrollmentId, {
					progressPercent: 100,
					completedAt: Date.now(), // Already had completedAt
				});
				return await ctx.db.get(testEnrollmentId);
			});

			// Invoke trigger handler again - should exit (oldDoc had completedAt)
			await t.run(async (ctx: TestCtx) => {
				await handleEnrollmentCompletion(ctx, oldEnrollment!, newEnrollment!);
			});

			// Verify no duplicate certificate was generated
			const secondCertCount = await t.run(async (ctx: TestCtx) => {
				return (await ctx.db.query('certificates').collect()).length;
			});

			// Should still be 1 certificate (trigger checks !oldDoc?.completedAt)
			expect(secondCertCount).toBe(1);
		});
	});
});
