import type { GenericMutationCtx } from 'convex/server';
import { convexTest } from 'convex-test';
import { beforeEach, describe, expect, it } from 'vitest';

import { api } from '../_generated/api';
import type { DataModel, Id } from '../_generated/dataModel';
import schema from '../schema';

type TestCtx = GenericMutationCtx<DataModel>;

describe('Lesson Progress Tracking', () => {
	// Type is inferred from convexTest(schema).withIdentity()

	let t: any;

	let baseT: any; // Keep reference to base instance for creating other identities
	let testUserExternalId: string;
	let testUserId: Id<'users'>;
	let testCourseId: Id<'courses'>;
	let testModuleId: Id<'courseModules'>;
	let testLessonId: Id<'lessons'>;
	let testEnrollmentId: Id<'enrollments'>;

	beforeEach(async () => {
		baseT = convexTest(schema);

		// Set up test data
		await baseT.run(async (ctx: TestCtx) => {
			// Create test user
			testUserExternalId = 'test-clerk-id-123';
			const userId = await ctx.db.insert('users', {
				firstName: 'Test',
				lastName: 'Student',
				email: 'student@test.com',
				externalId: testUserExternalId,
				isInstructor: false,
				isAdmin: false,
			});

			// Create test instructor
			const instructorUserId = await ctx.db.insert('users', {
				firstName: 'Dr.',
				lastName: 'Instructor',
				email: 'instructor@test.com',
				externalId: 'instructor-clerk-id-456',
				isInstructor: true,
				isAdmin: false,
			});

			// Create test course (use instructor's userId, not externalId)
			const courseId = await ctx.db.insert('courses', {
				title: 'Test Course',
				description: 'Test description',
				instructorId: instructorUserId,
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
				userId: userId, // Use Convex ID
				courseId,
				amount: 29900,
				status: 'complete',
				createdAt: Date.now(),
			});

			// Create enrollment
			const enrollmentId = await ctx.db.insert('enrollments', {
				userId: userId, // Use Convex ID
				courseId,
				purchaseId,
				enrolledAt: Date.now(),
				progressPercent: 0,
			});

			// Store IDs for tests
			testUserId = userId;
			testCourseId = courseId;
			testModuleId = moduleId;
			testLessonId = lessonId;
			testEnrollmentId = enrollmentId;
		});

		// Create authenticated test instance
		t = baseT.withIdentity({ subject: testUserExternalId });
	});

	describe('markComplete()', () => {
		// Subtask 2.1: Test markComplete() success cases
		it('marks lesson complete for enrolled user and creates progress record', async () => {
			const progressId = await t.mutation(api.lessonProgress.markComplete, {
				lessonId: testLessonId,
			});

			expect(progressId).toBeDefined();

			// Verify progress record created with correct fields (AC-101.1)
			const progress = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(progressId);
			});

			expect(progress).toBeDefined();
			expect(progress?.userId).toBe(testUserId);
			expect(progress?.lessonId).toBe(testLessonId);
			expect(progress?.completedAt).toBeGreaterThan(Date.now() - 1000); // Within last second
		});

		it('is idempotent - returns existing ID when marking same lesson twice', async () => {
			// Mark complete first time (AC-101.5)
			const firstId = await t.mutation(api.lessonProgress.markComplete, {
				lessonId: testLessonId,
			});

			// Mark complete second time
			const secondId = await t.mutation(api.lessonProgress.markComplete, {
				lessonId: testLessonId,
			});

			// Should return same ID, no duplicate
			expect(firstId).toBe(secondId);

			// Verify only one progress record exists
			const allProgress = await t.run(async (ctx: TestCtx) => {
				const all = await ctx.db.query('lessonProgress').collect();
				return all.filter(p => p.userId === testUserId && p.lessonId === testLessonId);
			});

			expect(allProgress).toHaveLength(1);
		});

		// Subtask 2.2: Test markComplete() authorization/error cases
		it('throws error when user is not authenticated', async () => {
			// Create new test instance without identity
			const unauthT = convexTest(schema);

			await expect(
				unauthT.mutation(api.lessonProgress.markComplete, {
					lessonId: testLessonId,
				}),
			).rejects.toThrow('Not authenticated');
		});

		it('throws error when user not found in database', async () => {
			const noUserT = baseT.withIdentity({ subject: 'user-that-does-not-exist' });

			await expect(
				noUserT.mutation(api.lessonProgress.markComplete, {
					lessonId: testLessonId,
				}),
			).rejects.toThrow('User not found');
		});

		it('throws error when user is not enrolled in course', async () => {
			// Create different user not enrolled in the same test instance
			const otherUserExternalId = 'other-user-id-not-enrolled';

			// Create the other user first
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.insert('users', {
					firstName: 'Other',
					lastName: 'User',
					email: 'otheruser@test.com',
					externalId: otherUserExternalId,
					isInstructor: false,
					isAdmin: false,
				});
			});

			// Create a new lesson in a different course that the other user can attempt to access
			const otherInstructorId = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('users', {
					firstName: 'Other',
					lastName: 'Instructor',
					email: 'other@test.com',
					externalId: 'other-instructor-id',
					isInstructor: true,
					isAdmin: false,
				});
			});

			const otherCourseId = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('courses', {
					title: 'Other Course',
					description: 'Test',
					instructorId: otherInstructorId,
					price: 100,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});
			});

			const otherModuleId = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('courseModules', {
					courseId: otherCourseId,
					title: 'Other Module',
					order: 0,
					createdAt: Date.now(),
				});
			});

			const otherLessonId = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('lessons', {
					moduleId: otherModuleId,
					title: 'Other Lesson',
					type: 'video',
					isPreview: false,
					order: 0,
					createdAt: Date.now(),
				});
			});

			// Use different identity from base test instance
			const otherT = baseT.withIdentity({ subject: otherUserExternalId });

			await expect(
				otherT.mutation(api.lessonProgress.markComplete, {
					lessonId: otherLessonId,
				}),
			).rejects.toThrow('Not enrolled in this course');
		});

		it('throws error for invalid lesson ID', async () => {
			const invalidLessonId = 'invalid_lesson_id_xyz' as Id<'lessons'>;

			await expect(
				t.mutation(api.lessonProgress.markComplete, {
					lessonId: invalidLessonId,
				}),
			).rejects.toThrow();
		});

		it('throws "Lesson not found" when lesson does not exist', async () => {
			// Create a valid-looking ID that doesn't exist in the database
			const nonExistentLessonId = await t.run(async (ctx: TestCtx) => {
				// Create and immediately delete a lesson to get a valid ID format
				const tempId = await ctx.db.insert('lessons', {
					moduleId: testModuleId,
					title: 'Temp Lesson',
					type: 'video',
					isPreview: false,
					order: 99,
					createdAt: Date.now(),
				});
				await ctx.db.delete(tempId);
				return tempId;
			});

			await expect(
				t.mutation(api.lessonProgress.markComplete, {
					lessonId: nonExistentLessonId,
				}),
			).rejects.toThrow('Lesson not found');
		});

		it('throws "Module not found" when lesson exists but module does not', async () => {
			// Create a module ID that we'll delete
			const tempModuleId = await t.run(async (ctx: TestCtx) => {
				const moduleId = await ctx.db.insert('courseModules', {
					courseId: testCourseId,
					title: 'Temp Module',
					order: 99,
					createdAt: Date.now(),
				});
				return moduleId;
			});

			// Create a lesson with this module
			const orphanLessonId = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('lessons', {
					moduleId: tempModuleId,
					title: 'Orphan Lesson',
					type: 'video',
					isPreview: false,
					order: 0,
					createdAt: Date.now(),
				});
			});

			// Delete the module, leaving the lesson orphaned
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.delete(tempModuleId);
			});

			await expect(
				t.mutation(api.lessonProgress.markComplete, {
					lessonId: orphanLessonId,
				}),
			).rejects.toThrow('Module not found');
		});
	});

	describe('recalculateProgress()', () => {
		it('throws "Enrollment not found" when enrollment does not exist', async () => {
			// Create a valid-looking enrollment ID that doesn't exist
			const nonExistentEnrollmentId = await t.run(async (ctx: TestCtx) => {
				// Create a temporary user
				const tempUserId = await ctx.db.insert('users', {
					firstName: 'Temp',
					lastName: 'User',
					email: 'temp@test.com',
					externalId: 'temp-user-external',
					isInstructor: false,
					isAdmin: false,
				});

				// Create a temporary purchase first
				const tempPurchaseId = await ctx.db.insert('purchases', {
					userId: tempUserId,
					courseId: testCourseId,
					amount: 100,
					status: 'complete',
					createdAt: Date.now(),
				});

				// Create and immediately delete an enrollment to get a valid ID format
				const tempId = await ctx.db.insert('enrollments', {
					userId: tempUserId,
					courseId: testCourseId,
					purchaseId: tempPurchaseId,
					enrolledAt: Date.now(),
					progressPercent: 0,
				});
				await ctx.db.delete(tempId);
				await ctx.db.delete(tempPurchaseId);
				await ctx.db.delete(tempUserId);
				return tempId;
			});

			await expect(
				t.mutation(api.lessonProgress.recalculateProgress, {
					enrollmentId: nonExistentEnrollmentId,
				}),
			).rejects.toThrow('Enrollment not found');
		});

		// Subtask 2.3: Test recalculateProgress() calculation accuracy
		it('calculates 50% progress for course with 10 lessons, 5 complete', async () => {
			// Delete the initial lesson from beforeEach to have clean count
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.delete(testLessonId);
			});

			// Create exactly 10 lessons
			const lessonIds: Id<'lessons'>[] = [];
			for (let i = 0; i < 10; i++) {
				const lessonId = await t.run(async (ctx: TestCtx) => {
					return await ctx.db.insert('lessons', {
						moduleId: testModuleId,
						title: `Lesson ${i + 1}`,
						type: 'video',
						isPreview: false,
						order: i,
						createdAt: Date.now(),
					});
				});
				lessonIds.push(lessonId);
			}

			// Mark first 5 complete
			for (let i = 0; i < 5; i++) {
				await t.run(async (ctx: TestCtx) => {
					await ctx.db.insert('lessonProgress', {
						userId: testUserId,
						lessonId: lessonIds[i],
						completedAt: Date.now(),
					});
				});
			}

			// Recalculate progress (AC-101.2)
			const result = await t.mutation(api.lessonProgress.recalculateProgress, {
				enrollmentId: testEnrollmentId,
			});

			expect(result.progressPercent).toBe(50); // 5/10 * 100
			expect(result.completedAt).toBeNull(); // Not 100% yet
		});

		it('calculates accurate percentage for multi-module course', async () => {
			// Delete initial module and lesson from beforeEach
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.delete(testLessonId);
				await ctx.db.delete(testModuleId);
			});

			// Create 3 modules with different lesson counts (3, 5, 2 = 10 total) (AC-101.8)
			const modules: Id<'courseModules'>[] = [];
			const lessonCounts = [3, 5, 2];

			for (let m = 0; m < 3; m++) {
				const moduleId = await t.run(async (ctx: TestCtx) => {
					return await ctx.db.insert('courseModules', {
						courseId: testCourseId,
						title: `Module ${m + 1}`,
						order: m,
						createdAt: Date.now(),
					});
				});
				modules.push(moduleId);

				// Create lessons for this module
				for (let l = 0; l < lessonCounts[m]; l++) {
					await t.run(async (ctx: TestCtx) => {
						await ctx.db.insert('lessons', {
							moduleId,
							title: `Module ${m + 1} Lesson ${l + 1}`,
							type: 'video',
							isPreview: false,
							order: l,
							createdAt: Date.now(),
						});
					});
				}
			}

			// Mark 5 lessons complete (across modules)
			const allLessons = await t.run(async (ctx: TestCtx) => {
				const allDbLessons = await ctx.db.query('lessons').collect();
				const lessons = [];
				for (const moduleId of modules) {
					const moduleLessons = allDbLessons.filter(l => l.moduleId === moduleId);
					lessons.push(...moduleLessons);
				}
				return lessons.sort((a, b) => a.order - b.order);
			});

			for (let i = 0; i < 5; i++) {
				await t.run(async (ctx: TestCtx) => {
					await ctx.db.insert('lessonProgress', {
						userId: testUserId,
						lessonId: allLessons[i]._id,
						completedAt: Date.now(),
					});
				});
			}

			// Recalculate
			const result = await t.mutation(api.lessonProgress.recalculateProgress, {
				enrollmentId: testEnrollmentId,
			});

			expect(result.progressPercent).toBe(50); // 5/10 * 100
		});

		it('sets completedAt timestamp when progress reaches 100%', async () => {
			// Delete initial lesson for clean count
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.delete(testLessonId);
			});

			// Create 5 lessons
			const lessonIds: Id<'lessons'>[] = [];
			for (let i = 0; i < 5; i++) {
				const lessonId = await t.run(async (ctx: TestCtx) => {
					return await ctx.db.insert('lessons', {
						moduleId: testModuleId,
						title: `Lesson ${i + 1}`,
						type: 'video',
						isPreview: false,
						order: i,
						createdAt: Date.now(),
					});
				});
				lessonIds.push(lessonId);
			}

			// Mark all 5 complete
			for (const lessonId of lessonIds) {
				await t.run(async (ctx: TestCtx) => {
					await ctx.db.insert('lessonProgress', {
						userId: testUserId,
						lessonId,
						completedAt: Date.now(),
					});
				});
			}

			// Recalculate (AC-101.4)
			const result = await t.mutation(api.lessonProgress.recalculateProgress, {
				enrollmentId: testEnrollmentId,
			});

			expect(result.progressPercent).toBe(100);
			expect(result.completedAt).toBeDefined();
			expect(result.completedAt).toBeGreaterThan(Date.now() - 1000);
		});

		it('keeps completedAt null when progress is 99%', async () => {
			// Delete initial lesson for clean count
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.delete(testLessonId);
			});

			// Create 10 lessons
			const lessonIds: Id<'lessons'>[] = [];
			for (let i = 0; i < 10; i++) {
				const lessonId = await t.run(async (ctx: TestCtx) => {
					return await ctx.db.insert('lessons', {
						moduleId: testModuleId,
						title: `Lesson ${i + 1}`,
						type: 'video',
						isPreview: false,
						order: i,
						createdAt: Date.now(),
					});
				});
				lessonIds.push(lessonId);
			}

			// Mark 9 of 10 complete (90%)
			for (let i = 0; i < 9; i++) {
				await t.run(async (ctx: TestCtx) => {
					await ctx.db.insert('lessonProgress', {
						userId: testUserId,
						lessonId: lessonIds[i],
						completedAt: Date.now(),
					});
				});
			}

			// Recalculate (AC-101.4)
			const result = await t.mutation(api.lessonProgress.recalculateProgress, {
				enrollmentId: testEnrollmentId,
			});

			expect(result.progressPercent).toBe(90);
			expect(result.completedAt).toBeNull();
		});

		it('returns 0% progress when course has no lessons (totalLessons === 0)', async () => {
			// Delete initial lesson and module for clean test
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.delete(testLessonId);
				await ctx.db.delete(testModuleId);
			});

			// Create a module with NO lessons
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.insert('courseModules', {
					courseId: testCourseId,
					title: 'Empty Module',
					order: 0,
					createdAt: Date.now(),
				});
			});

			// Recalculate progress (should handle division by zero)
			const result = await t.mutation(api.lessonProgress.recalculateProgress, {
				enrollmentId: testEnrollmentId,
			});

			// Edge case: totalLessons = 0, should return 0% not NaN or error
			expect(result.progressPercent).toBe(0);
			expect(result.completedAt).toBeNull();
		});
	});

	describe('getUserProgress()', () => {
		// Subtask 2.5: Test getUserProgress() data accuracy
		it('returns correct completed/total counts and completedLessonIds', async () => {
			// Delete initial lesson for clean count
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.delete(testLessonId);
			});

			// Create 10 lessons
			const lessonIds: Id<'lessons'>[] = [];
			for (let i = 0; i < 10; i++) {
				const lessonId = await t.run(async (ctx: TestCtx) => {
					return await ctx.db.insert('lessons', {
						moduleId: testModuleId,
						title: `Lesson ${i + 1}`,
						type: 'video',
						isPreview: false,
						order: i,
						createdAt: Date.now(),
					});
				});
				lessonIds.push(lessonId);
			}

			// Mark 5 complete
			for (let i = 0; i < 5; i++) {
				await t.run(async (ctx: TestCtx) => {
					await ctx.db.insert('lessonProgress', {
						userId: testUserId,
						lessonId: lessonIds[i],
						completedAt: Date.now(),
					});
				});
			}

			// Update enrollment progress
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.patch(testEnrollmentId, { progressPercent: 50 });
			});

			// Get progress (AC-101.3)
			const progress = await t.query(api.lessonProgress.getUserProgress, {
				courseId: testCourseId,
			});

			expect(progress).toBeDefined();
			expect(progress?.total).toBe(10);
			expect(progress?.completed).toBe(5);
			expect(progress?.percent).toBe(50);
			expect(progress?.completedLessonIds).toHaveLength(5);
			expect(progress?.enrollmentId).toBe(testEnrollmentId);
		});

		it('returns null for unenrolled user', async () => {
			// Create a different user who is NOT enrolled in testCourseId
			const unenrolledExternalId = 'unenrolled-user-external-id';
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.insert('users', {
					firstName: 'Unenrolled',
					lastName: 'User',
					email: 'unenrolled@test.com',
					externalId: unenrolledExternalId,
					isInstructor: false,
					isAdmin: false,
				});
			});

			// Query with this user (who exists but is not enrolled)
			const otherT = baseT.withIdentity({
				subject: unenrolledExternalId,
			});

			const progress = await otherT.query(api.lessonProgress.getUserProgress, {
				courseId: testCourseId,
			});

			expect(progress).toBeNull();
		});

		it('returns null when user is not authenticated', async () => {
			const unauthT = convexTest(schema);

			const progress = await unauthT.query(api.lessonProgress.getUserProgress, {
				courseId: testCourseId,
			});

			expect(progress).toBeNull();
		});

		it('returns null when user not found in database', async () => {
			const noUserT = baseT.withIdentity({ subject: 'nonexistent-user-external-id' });

			const progress = await noUserT.query(api.lessonProgress.getUserProgress, {
				courseId: testCourseId,
			});

			expect(progress).toBeNull();
		});
	});

	describe('getNextIncompleteLesson()', () => {
		// Subtask 2.6: Test getNextIncompleteLesson() logic
		it('returns lesson 6 when lessons 1-5 are complete', async () => {
			// Delete initial lesson for clean count
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.delete(testLessonId);
			});

			// Create 10 lessons
			const lessonIds: Id<'lessons'>[] = [];
			for (let i = 0; i < 10; i++) {
				const lessonId = await t.run(async (ctx: TestCtx) => {
					return await ctx.db.insert('lessons', {
						moduleId: testModuleId,
						title: `Lesson ${i + 1}`,
						type: 'video',
						isPreview: false,
						order: i,
						createdAt: Date.now(),
					});
				});
				lessonIds.push(lessonId);
			}

			// Mark lessons 0-4 complete (lessons 1-5)
			for (let i = 0; i < 5; i++) {
				await t.run(async (ctx: TestCtx) => {
					await ctx.db.insert('lessonProgress', {
						userId: testUserId,
						lessonId: lessonIds[i],
						completedAt: Date.now(),
					});
				});
			}

			// Get next incomplete (AC-101.7)
			const nextLessonId = await t.query(api.lessonProgress.getNextIncompleteLesson, {
				courseId: testCourseId,
			});

			expect(nextLessonId).toBe(lessonIds[5]); // Lesson 6 (index 5)
		});

		it('returns first lesson when all lessons are complete', async () => {
			// Delete initial lesson for clean count
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.delete(testLessonId);
			});

			// Create 5 lessons
			const lessonIds: Id<'lessons'>[] = [];
			for (let i = 0; i < 5; i++) {
				const lessonId = await t.run(async (ctx: TestCtx) => {
					return await ctx.db.insert('lessons', {
						moduleId: testModuleId,
						title: `Lesson ${i + 1}`,
						type: 'video',
						isPreview: false,
						order: i,
						createdAt: Date.now(),
					});
				});
				lessonIds.push(lessonId);
			}

			// Mark all complete
			for (const lessonId of lessonIds) {
				await t.run(async (ctx: TestCtx) => {
					await ctx.db.insert('lessonProgress', {
						userId: testUserId,
						lessonId,
						completedAt: Date.now(),
					});
				});
			}

			// Get next (should return first for review) (AC-101.7)
			const nextLessonId = await t.query(api.lessonProgress.getNextIncompleteLesson, {
				courseId: testCourseId,
			});

			expect(nextLessonId).toBe(lessonIds[0]); // First lesson
		});

		it('respects module and lesson order correctly', async () => {
			// Delete initial module and lesson for clean test
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.delete(testLessonId);
				await ctx.db.delete(testModuleId);
			});

			// Create 2 modules
			const module1 = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('courseModules', {
					courseId: testCourseId,
					title: 'Module 1',
					order: 0,
					createdAt: Date.now(),
				});
			});

			const module2 = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('courseModules', {
					courseId: testCourseId,
					title: 'Module 2',
					order: 1,
					createdAt: Date.now(),
				});
			});

			// Module 1: 3 lessons
			const module1Lessons: Id<'lessons'>[] = [];
			for (let i = 0; i < 3; i++) {
				const lessonId = await t.run(async (ctx: TestCtx) => {
					return await ctx.db.insert('lessons', {
						moduleId: module1,
						title: `M1 Lesson ${i + 1}`,
						type: 'video',
						isPreview: false,
						order: i,
						createdAt: Date.now(),
					});
				});
				module1Lessons.push(lessonId);
			}

			// Module 2: 3 lessons
			const module2Lessons: Id<'lessons'>[] = [];
			for (let i = 0; i < 3; i++) {
				const lessonId = await t.run(async (ctx: TestCtx) => {
					return await ctx.db.insert('lessons', {
						moduleId: module2,
						title: `M2 Lesson ${i + 1}`,
						type: 'video',
						isPreview: false,
						order: i,
						createdAt: Date.now(),
					});
				});
				module2Lessons.push(lessonId);
			}

			// Complete all of Module 1
			for (const lessonId of module1Lessons) {
				await t.run(async (ctx: TestCtx) => {
					await ctx.db.insert('lessonProgress', {
						userId: testUserId,
						lessonId,
						completedAt: Date.now(),
					});
				});
			}

			// Get next (should be first lesson of Module 2) (AC-101.7)
			const nextLessonId = await t.query(api.lessonProgress.getNextIncompleteLesson, {
				courseId: testCourseId,
			});

			expect(nextLessonId).toBe(module2Lessons[0]);
		});

		it('returns null when user is not authenticated', async () => {
			const unauthT = convexTest(schema);

			// Set up test course data for unauthenticated test
			await unauthT.run(async (ctx: TestCtx) => {
				await ctx.db.insert('courseModules', {
					courseId: testCourseId,
					title: 'Test Module',
					order: 0,
					createdAt: Date.now(),
				});
			});

			const nextLessonId = await unauthT.query(api.lessonProgress.getNextIncompleteLesson, {
				courseId: testCourseId,
			});

			expect(nextLessonId).toBeNull();
		});

		it('returns null when user not found in database', async () => {
			const noUserT = baseT.withIdentity({ subject: 'user-does-not-exist-external' });

			const nextLessonId = await noUserT.query(api.lessonProgress.getNextIncompleteLesson, {
				courseId: testCourseId,
			});

			expect(nextLessonId).toBeNull();
		});

		it('returns null when course has modules but no lessons', async () => {
			// Create a course with modules but no lessons
			const emptyCourseId = await t.run(async (ctx: TestCtx) => {
				// Create instructor
				const emptyInstructorId = await ctx.db.insert('users', {
					firstName: 'Empty',
					lastName: 'Instructor',
					email: 'empty@test.com',
					externalId: 'empty-instructor-id',
					isInstructor: true,
					isAdmin: false,
				});

				// Create course
				const courseId = await ctx.db.insert('courses', {
					title: 'Empty Course',
					description: 'Course with no lessons',
					instructorId: emptyInstructorId,
					price: 100,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});

				// Create module but NO lessons
				await ctx.db.insert('courseModules', {
					courseId,
					title: 'Empty Module',
					order: 0,
					createdAt: Date.now(),
				});

				return courseId;
			});

			const nextLessonId = await t.query(api.lessonProgress.getNextIncompleteLesson, {
				courseId: emptyCourseId,
			});

			expect(nextLessonId).toBeNull();
		});

		it('returns null when course has no modules (sortedModules.length === 0)', async () => {
			// Create a course with NO modules at all
			const emptyModulesCourseId = await t.run(async (ctx: TestCtx) => {
				// Create instructor
				const instructorId = await ctx.db.insert('users', {
					firstName: 'No',
					lastName: 'Modules',
					email: 'nomodules@test.com',
					externalId: 'no-modules-instructor-id',
					isInstructor: true,
					isAdmin: false,
				});

				// Create course with NO modules
				return await ctx.db.insert('courses', {
					title: 'Course Without Modules',
					description: 'Course with no modules',
					instructorId,
					price: 100,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});
			});

			const nextLessonId = await t.query(api.lessonProgress.getNextIncompleteLesson, {
				courseId: emptyModulesCourseId,
			});

			// Edge case: sortedModules.length === 0, should return null
			expect(nextLessonId).toBeNull();
		});
	});
});
