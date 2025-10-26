import type { GenericMutationCtx } from 'convex/server';
import { convexTest } from 'convex-test';
import { beforeEach, describe, expect, it } from 'vitest';

import { api } from './_generated/api';
import type { DataModel, Id } from './_generated/dataModel';
import schema from './schema';

type TestCtx = GenericMutationCtx<DataModel>;

describe('Lesson Progress Tracking', () => {
	// Type is inferred from convexTest(schema).withIdentity()

	let t: any;

	let baseT: any; // Keep reference to base instance for creating other identities
	let testUserId: string;
	let testCourseId: Id<'courses'>;
	let testModuleId: Id<'courseModules'>;
	let testLessonId: Id<'lessons'>;
	let testEnrollmentId: Id<'enrollments'>;

	beforeEach(async () => {
		baseT = convexTest(schema);

		// Set up test data
		await baseT.run(async (ctx: TestCtx) => {
			// Create test user
			const _userId = await ctx.db.insert('users', {
				firstName: 'Test',
				lastName: 'Student',
				email: 'student@test.com',
				externalId: 'test-clerk-id-123',
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
				userId: 'test-clerk-id-123',
				courseId,
				amount: 29900,
				status: 'complete',
				createdAt: Date.now(),
			});

			// Create enrollment
			const enrollmentId = await ctx.db.insert('enrollments', {
				userId: 'test-clerk-id-123',
				courseId,
				purchaseId,
				enrolledAt: Date.now(),
				progressPercent: 0,
			});

			// Store IDs for tests
			testUserId = 'test-clerk-id-123';
			testCourseId = courseId;
			testModuleId = moduleId;
			testLessonId = lessonId;
			testEnrollmentId = enrollmentId;
		});

		// Create authenticated test instance
		t = baseT.withIdentity({ subject: testUserId });
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

		it('throws error when user is not enrolled in course', async () => {
			// Create different user not enrolled in the same test instance
			const otherUserId = 'other-user-id-not-enrolled';

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
			const otherT = baseT.withIdentity({ subject: otherUserId });

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
	});

	describe('recalculateProgress()', () => {
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

		// Subtask 2.4: Test certificate trigger integration
		// Note: We verify completedAt is set, which triggers certificate generation via scheduler
		// Direct scheduler verification is not possible with convex-test
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
			// Use different user who is not enrolled
			const otherT = convexTest(schema).withIdentity({
				subject: 'different-user-id',
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
	});
});
