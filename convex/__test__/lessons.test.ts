import type { GenericMutationCtx } from 'convex/server';
import { convexTest } from 'convex-test';
import { beforeEach, describe, expect, it } from 'vitest';

import { api } from '../_generated/api';
import type { DataModel, Id } from '../_generated/dataModel';
import schema from '../schema';

type TestCtx = GenericMutationCtx<DataModel>;

describe('Lessons', () => {
	let t: any;
	let baseT: any;
	let testInstructorId: Id<'users'>;
	let testInstructorExternalId: string;
	let testCourseId: Id<'courses'>;
	let testModuleId: Id<'courseModules'>;
	let testLessonId: Id<'lessons'>;

	beforeEach(async () => {
		baseT = convexTest(schema);

		// Set up test data
		await baseT.run(async (ctx: TestCtx) => {
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
				instructorId, // Using Convex ID as per schema
				price: 29900,
				createdAt: Date.now(),
				updatedAt: Date.now(),
			});

			// Create test module
			const moduleId = await ctx.db.insert('courseModules', {
				courseId,
				title: 'Test Module',
				order: 0,
				createdAt: Date.now(),
			});

			// Create test lesson
			const lessonId = await ctx.db.insert('lessons', {
				moduleId,
				title: 'Test Lesson',
				type: 'video',
				isPreview: false,
				order: 0,
				createdAt: Date.now(),
			});

			testInstructorId = instructorId;
			testInstructorExternalId = 'test-instructor-id';
			testCourseId = courseId;
			testModuleId = moduleId;
			testLessonId = lessonId;
		});

		t = baseT.withIdentity({ subject: testInstructorExternalId });
	});

	describe('create()', () => {
		it('creates video lesson with required fields', async () => {
			const lessonId = await t.mutation(api.lessons.create, {
				moduleId: testModuleId,
				title: 'New Video Lesson',
				type: 'video',
				order: 1,
			});

			expect(lessonId).toBeDefined();

			const lesson = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(lessonId);
			});

			expect(lesson).toBeDefined();
			expect(lesson?.title).toBe('New Video Lesson');
			expect(lesson?.type).toBe('video');
			expect(lesson?.moduleId).toBe(testModuleId);
			expect(lesson?.order).toBe(1);
			expect(lesson?.isPreview).toBe(false); // Default value
		});

		it('creates quiz lesson', async () => {
			const lessonId = await t.mutation(api.lessons.create, {
				moduleId: testModuleId,
				title: 'Quiz Lesson',
				type: 'quiz',
				order: 1,
			});

			const lesson = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(lessonId);
			});

			expect(lesson?.type).toBe('quiz');
		});

		it('creates assignment lesson', async () => {
			const lessonId = await t.mutation(api.lessons.create, {
				moduleId: testModuleId,
				title: 'Assignment',
				type: 'assignment',
				order: 1,
			});

			const lesson = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(lessonId);
			});

			expect(lesson?.type).toBe('assignment');
		});

		it('creates lesson with optional fields', async () => {
			const lessonId = await t.mutation(api.lessons.create, {
				moduleId: testModuleId,
				title: 'Complete Lesson',
				description: 'Lesson description',
				type: 'video',
				duration: '15:30',
				videoUrl: 'https://example.com/video.mp4',
				videoId: 'video-123',
				content: 'Lesson content',
				isPreview: true,
				order: 1,
			});

			const lesson = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(lessonId);
			});

			expect(lesson?.description).toBe('Lesson description');
			expect(lesson?.duration).toBe('15:30');
			expect(lesson?.videoUrl).toBe('https://example.com/video.mp4');
			expect(lesson?.videoId).toBe('video-123');
			expect(lesson?.content).toBe('Lesson content');
			expect(lesson?.isPreview).toBe(true);
		});

		it('defaults isPreview to false when not specified', async () => {
			const lessonId = await t.mutation(api.lessons.create, {
				moduleId: testModuleId,
				title: 'Lesson',
				type: 'video',
				order: 1,
			});

			const lesson = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(lessonId);
			});

			expect(lesson?.isPreview).toBe(false);
		});

		it('throws error when not authenticated', async () => {
			await expect(
				baseT.mutation(api.lessons.create, {
					moduleId: testModuleId,
					title: 'Lesson',
					type: 'video',
					order: 1,
				}),
			).rejects.toThrow('Not authenticated');
		});

		it('throws error when module not found', async () => {
			const nonExistentModuleId = await t.run(async (ctx: TestCtx) => {
				const tempId = await ctx.db.insert('courseModules', {
					courseId: testCourseId,
					title: 'Temp',
					order: 99,
					createdAt: Date.now(),
				});
				await ctx.db.delete(tempId);
				return tempId;
			});

			await expect(
				t.mutation(api.lessons.create, {
					moduleId: nonExistentModuleId,
					title: 'Lesson',
					type: 'video',
					order: 0,
				}),
			).rejects.toThrow('Module not found');
		});

		it('throws error when course not found', async () => {
			// Create orphaned module
			const orphanedModuleId = await t.run(async (ctx: TestCtx) => {
				const tempCourseId = await ctx.db.insert('courses', {
					title: 'Temp',
					description: 'Temp',
					instructorId: testInstructorId,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});

				const moduleId = await ctx.db.insert('courseModules', {
					courseId: tempCourseId,
					title: 'Orphaned Module',
					order: 0,
					createdAt: Date.now(),
				});

				await ctx.db.delete(tempCourseId);
				return moduleId;
			});

			await expect(
				t.mutation(api.lessons.create, {
					moduleId: orphanedModuleId,
					title: 'Lesson',
					type: 'video',
					order: 0,
				}),
			).rejects.toThrow('Course not found');
		});

		it('throws error when user is not an instructor', async () => {
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.insert('users', {
					firstName: 'Regular',
					lastName: 'User',
					email: 'user@test.com',
					externalId: 'regular-user-id',
					isInstructor: false,
					isAdmin: false,
				});
			});

			const regularUserT = baseT.withIdentity({ subject: 'regular-user-id' });

			await expect(
				regularUserT.mutation(api.lessons.create, {
					moduleId: testModuleId,
					title: 'Lesson',
					type: 'video',
					order: 1,
				}),
			).rejects.toThrow('User is not an instructor');
		});

		it('throws error when instructor does not own course', async () => {
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.insert('users', {
					firstName: 'Other',
					lastName: 'Instructor',
					email: 'other@test.com',
					externalId: 'other-instructor-id',
					isInstructor: true,
					isAdmin: false,
				});
			});

			const otherInstructorT = baseT.withIdentity({ subject: 'other-instructor-id' });

			await expect(
				otherInstructorT.mutation(api.lessons.create, {
					moduleId: testModuleId,
					title: 'Lesson',
					type: 'video',
					order: 1,
				}),
			).rejects.toThrow('Not authorized to modify this course');
		});
	});

	describe('list()', () => {
		it('lists lessons for a module', async () => {
			// Create additional lessons
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.insert('lessons', {
					moduleId: testModuleId,
					title: 'Lesson 2',
					type: 'video',
					isPreview: false,
					order: 1,
					createdAt: Date.now(),
				});

				await ctx.db.insert('lessons', {
					moduleId: testModuleId,
					title: 'Lesson 3',
					type: 'quiz',
					isPreview: false,
					order: 2,
					createdAt: Date.now(),
				});
			});

			const lessons = await t.query(api.lessons.list, {
				moduleId: testModuleId,
			});

			expect(lessons).toHaveLength(3);
		});

		it('returns lessons sorted by order', async () => {
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.insert('lessons', {
					moduleId: testModuleId,
					title: 'Lesson 3',
					type: 'video',
					isPreview: false,
					order: 2,
					createdAt: Date.now(),
				});

				await ctx.db.insert('lessons', {
					moduleId: testModuleId,
					title: 'Lesson 2',
					type: 'video',
					isPreview: false,
					order: 1,
					createdAt: Date.now(),
				});
			});

			const lessons = await t.query(api.lessons.list, {
				moduleId: testModuleId,
			});

			expect(lessons[0].order).toBe(0);
			expect(lessons[1].order).toBe(1);
			expect(lessons[2].order).toBe(2);
		});

		it('returns empty array when module has no lessons', async () => {
			const emptyModuleId = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('courseModules', {
					courseId: testCourseId,
					title: 'Empty Module',
					order: 1,
					createdAt: Date.now(),
				});
			});

			const lessons = await t.query(api.lessons.list, {
				moduleId: emptyModuleId,
			});

			expect(lessons).toHaveLength(0);
		});
	});

	describe('get() - Access Control', () => {
		it('returns preview lesson for unauthenticated user', async () => {
			// Create preview lesson
			const previewLessonId = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('lessons', {
					moduleId: testModuleId,
					title: 'Preview Lesson',
					type: 'video',
					isPreview: true,
					order: 1,
					createdAt: Date.now(),
				});
			});

			// Use baseT which has no identity but shares the same database
			const lesson = await baseT.query(api.lessons.get, {
				lessonId: previewLessonId,
			});

			expect(lesson).toBeDefined();
			expect(lesson?.title).toBe('Preview Lesson');
		});

		it('throws error for non-preview lesson when not authenticated', async () => {
			// Use baseT which has no identity but shares the same database
			await expect(
				baseT.query(api.lessons.get, {
					lessonId: testLessonId,
				}),
			).rejects.toThrow('Must be authenticated to access this lesson');
		});

		it('returns lesson for course instructor', async () => {
			const lesson = await t.query(api.lessons.get, {
				lessonId: testLessonId,
			});

			expect(lesson).toBeDefined();
			expect(lesson?._id).toBe(testLessonId);
		});

		it('throws error when user not found in database', async () => {
			const noUserT = baseT.withIdentity({ subject: 'user-not-in-db-external-id' });

			await expect(
				noUserT.query(api.lessons.get, {
					lessonId: testLessonId,
				}),
			).rejects.toThrow('User not found');
		});

		it('returns lesson for enrolled student', async () => {
			// Create student and enrollment
			await t.run(async (ctx: TestCtx) => {
				const studentUserId = await ctx.db.insert('users', {
					firstName: 'Student',
					lastName: 'User',
					email: 'student@test.com',
					externalId: 'student-id',
					isInstructor: false,
					isAdmin: false,
				});

				const purchaseId = await ctx.db.insert('purchases', {
					userId: studentUserId,
					courseId: testCourseId,
					amount: 29900,
					status: 'complete',
					createdAt: Date.now(),
				});

				await ctx.db.insert('enrollments', {
					userId: studentUserId,
					courseId: testCourseId,
					purchaseId,
					enrolledAt: Date.now(),
					progressPercent: 0,
				});
			});

			const studentT = baseT.withIdentity({ subject: 'student-id' });

			const lesson = await studentT.query(api.lessons.get, {
				lessonId: testLessonId,
			});

			expect(lesson).toBeDefined();
			expect(lesson?._id).toBe(testLessonId);
		});

		it('throws error for non-enrolled student', async () => {
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.insert('users', {
					firstName: 'Unenrolled',
					lastName: 'Student',
					email: 'unenrolled@test.com',
					externalId: 'unenrolled-id',
					isInstructor: false,
					isAdmin: false,
				});
			});

			const unenrolledT = baseT.withIdentity({ subject: 'unenrolled-id' });

			await expect(
				unenrolledT.query(api.lessons.get, {
					lessonId: testLessonId,
				}),
			).rejects.toThrow('Not enrolled in this course');
		});

		it('returns null when lesson not found', async () => {
			const nonExistentId = await t.run(async (ctx: TestCtx) => {
				const tempId = await ctx.db.insert('lessons', {
					moduleId: testModuleId,
					title: 'Temp',
					type: 'video',
					isPreview: false,
					order: 99,
					createdAt: Date.now(),
				});
				await ctx.db.delete(tempId);
				return tempId;
			});

			const lesson = await t.query(api.lessons.get, {
				lessonId: nonExistentId,
			});

			expect(lesson).toBeNull();
		});

		it('throws error when module not found (orphaned lesson)', async () => {
			const orphanedLessonId = await t.run(async (ctx: TestCtx) => {
				const tempModuleId = await ctx.db.insert('courseModules', {
					courseId: testCourseId,
					title: 'Temp Module',
					order: 99,
					createdAt: Date.now(),
				});

				const lessonId = await ctx.db.insert('lessons', {
					moduleId: tempModuleId,
					title: 'Orphaned Lesson',
					type: 'video',
					isPreview: false,
					order: 0,
					createdAt: Date.now(),
				});

				await ctx.db.delete(tempModuleId);
				return lessonId;
			});

			await expect(
				t.query(api.lessons.get, {
					lessonId: orphanedLessonId,
				}),
			).rejects.toThrow('Module not found');
		});

		it('throws error when course not found', async () => {
			const orphanedLessonId = await t.run(async (ctx: TestCtx) => {
				const tempCourseId = await ctx.db.insert('courses', {
					title: 'Temp',
					description: 'Temp',
					instructorId: testInstructorId,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});

				const moduleId = await ctx.db.insert('courseModules', {
					courseId: tempCourseId,
					title: 'Module',
					order: 0,
					createdAt: Date.now(),
				});

				const lessonId = await ctx.db.insert('lessons', {
					moduleId,
					title: 'Lesson',
					type: 'video',
					isPreview: false,
					order: 0,
					createdAt: Date.now(),
				});

				await ctx.db.delete(tempCourseId);
				return lessonId;
			});

			await expect(
				t.query(api.lessons.get, {
					lessonId: orphanedLessonId,
				}),
			).rejects.toThrow('Course not found');
		});
	});

	describe('update()', () => {
		it('updates lesson title', async () => {
			await t.mutation(api.lessons.update, {
				lessonId: testLessonId,
				title: 'Updated Title',
			});

			const lesson = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(testLessonId);
			});

			expect(lesson?.title).toBe('Updated Title');
		});

		it('updates lesson description', async () => {
			await t.mutation(api.lessons.update, {
				lessonId: testLessonId,
				description: 'Updated description',
			});

			const lesson = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(testLessonId);
			});

			expect(lesson?.description).toBe('Updated description');
		});

		it('updates lesson isPreview status', async () => {
			await t.mutation(api.lessons.update, {
				lessonId: testLessonId,
				isPreview: true,
			});

			const lesson = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(testLessonId);
			});

			expect(lesson?.isPreview).toBe(true);
		});

		it('updates lesson order', async () => {
			await t.mutation(api.lessons.update, {
				lessonId: testLessonId,
				order: 5,
			});

			const lesson = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(testLessonId);
			});

			expect(lesson?.order).toBe(5);
		});

		it('throws error when not authenticated', async () => {
			await expect(
				baseT.mutation(api.lessons.update, {
					lessonId: testLessonId,
					title: 'Updated',
				}),
			).rejects.toThrow('Not authenticated');
		});

		it('throws error when lesson not found', async () => {
			const nonExistentId = await t.run(async (ctx: TestCtx) => {
				const tempId = await ctx.db.insert('lessons', {
					moduleId: testModuleId,
					title: 'Temp',
					type: 'video',
					isPreview: false,
					order: 99,
					createdAt: Date.now(),
				});
				await ctx.db.delete(tempId);
				return tempId;
			});

			await expect(
				t.mutation(api.lessons.update, {
					lessonId: nonExistentId,
					title: 'Updated',
				}),
			).rejects.toThrow('Lesson not found');
		});

		it('throws error when module not found (orphaned lesson)', async () => {
			const orphanedLessonId = await t.run(async (ctx: TestCtx) => {
				const tempModuleId = await ctx.db.insert('courseModules', {
					courseId: testCourseId,
					title: 'Temp Module',
					order: 99,
					createdAt: Date.now(),
				});

				const lessonId = await ctx.db.insert('lessons', {
					moduleId: tempModuleId,
					title: 'Orphaned Lesson',
					type: 'video',
					isPreview: false,
					order: 0,
					createdAt: Date.now(),
				});

				await ctx.db.delete(tempModuleId);
				return lessonId;
			});

			await expect(
				t.mutation(api.lessons.update, {
					lessonId: orphanedLessonId,
					title: 'Updated',
				}),
			).rejects.toThrow('Module not found');
		});

		it('throws error when course not found', async () => {
			const orphanedLessonId = await t.run(async (ctx: TestCtx) => {
				const tempCourseId = await ctx.db.insert('courses', {
					title: 'Temp',
					description: 'Temp',
					instructorId: testInstructorId,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});

				const moduleId = await ctx.db.insert('courseModules', {
					courseId: tempCourseId,
					title: 'Module',
					order: 0,
					createdAt: Date.now(),
				});

				const lessonId = await ctx.db.insert('lessons', {
					moduleId,
					title: 'Lesson',
					type: 'video',
					isPreview: false,
					order: 0,
					createdAt: Date.now(),
				});

				await ctx.db.delete(tempCourseId);
				return lessonId;
			});

			await expect(
				t.mutation(api.lessons.update, {
					lessonId: orphanedLessonId,
					title: 'Updated',
				}),
			).rejects.toThrow('Course not found');
		});

		it('throws error when not authorized', async () => {
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.insert('users', {
					firstName: 'Other',
					lastName: 'Instructor',
					email: 'other@test.com',
					externalId: 'other-instructor-id',
					isInstructor: true,
					isAdmin: false,
				});
			});

			const otherInstructorT = baseT.withIdentity({ subject: 'other-instructor-id' });

			await expect(
				otherInstructorT.mutation(api.lessons.update, {
					lessonId: testLessonId,
					title: 'Updated',
				}),
			).rejects.toThrow('Not authorized');
		});
	});

	describe('remove()', () => {
		it('deletes lesson', async () => {
			await t.mutation(api.lessons.remove, {
				lessonId: testLessonId,
			});

			const lesson = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(testLessonId);
			});

			expect(lesson).toBeNull();
		});

		it('deletes lesson progress records (cascade)', async () => {
			// Create student user and progress record
			const progressId = await t.run(async (ctx: TestCtx) => {
				const studentUserId = await ctx.db.insert('users', {
					firstName: 'Test',
					lastName: 'Student',
					email: 'teststudent@test.com',
					externalId: 'test-student-progress',
					isInstructor: false,
					isAdmin: false,
				});

				return await ctx.db.insert('lessonProgress', {
					userId: studentUserId,
					lessonId: testLessonId,
					completedAt: Date.now(),
				});
			});

			await t.mutation(api.lessons.remove, {
				lessonId: testLessonId,
			});

			// Verify progress deleted
			const progress = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(progressId);
			});

			expect(progress).toBeNull();
		});

		it('throws error when not authenticated', async () => {
			await expect(
				baseT.mutation(api.lessons.remove, {
					lessonId: testLessonId,
				}),
			).rejects.toThrow('Not authenticated');
		});

		it('throws error when lesson not found', async () => {
			const nonExistentId = await t.run(async (ctx: TestCtx) => {
				const tempId = await ctx.db.insert('lessons', {
					moduleId: testModuleId,
					title: 'Temp',
					type: 'video',
					isPreview: false,
					order: 99,
					createdAt: Date.now(),
				});
				await ctx.db.delete(tempId);
				return tempId;
			});

			await expect(
				t.mutation(api.lessons.remove, {
					lessonId: nonExistentId,
				}),
			).rejects.toThrow('Lesson not found');
		});

		it('throws error when module not found (orphaned lesson)', async () => {
			const orphanedLessonId = await t.run(async (ctx: TestCtx) => {
				const tempModuleId = await ctx.db.insert('courseModules', {
					courseId: testCourseId,
					title: 'Temp Module',
					order: 99,
					createdAt: Date.now(),
				});

				const lessonId = await ctx.db.insert('lessons', {
					moduleId: tempModuleId,
					title: 'Orphaned Lesson',
					type: 'video',
					isPreview: false,
					order: 0,
					createdAt: Date.now(),
				});

				await ctx.db.delete(tempModuleId);
				return lessonId;
			});

			await expect(
				t.mutation(api.lessons.remove, {
					lessonId: orphanedLessonId,
				}),
			).rejects.toThrow('Module not found');
		});

		it('throws error when course not found', async () => {
			const orphanedLessonId = await t.run(async (ctx: TestCtx) => {
				const tempCourseId = await ctx.db.insert('courses', {
					title: 'Temp',
					description: 'Temp',
					instructorId: testInstructorId,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});

				const moduleId = await ctx.db.insert('courseModules', {
					courseId: tempCourseId,
					title: 'Module',
					order: 0,
					createdAt: Date.now(),
				});

				const lessonId = await ctx.db.insert('lessons', {
					moduleId,
					title: 'Lesson',
					type: 'video',
					isPreview: false,
					order: 0,
					createdAt: Date.now(),
				});

				await ctx.db.delete(tempCourseId);
				return lessonId;
			});

			await expect(
				t.mutation(api.lessons.remove, {
					lessonId: orphanedLessonId,
				}),
			).rejects.toThrow('Course not found');
		});

		it('throws error when not authorized', async () => {
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.insert('users', {
					firstName: 'Other',
					lastName: 'Instructor',
					email: 'other@test.com',
					externalId: 'other-instructor-id',
					isInstructor: true,
					isAdmin: false,
				});
			});

			const otherInstructorT = baseT.withIdentity({ subject: 'other-instructor-id' });

			await expect(
				otherInstructorT.mutation(api.lessons.remove, {
					lessonId: testLessonId,
				}),
			).rejects.toThrow('Not authorized');
		});
	});

	describe('reorder()', () => {
		it('reorders lessons within module', async () => {
			// Create additional lessons
			const lesson2Id = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('lessons', {
					moduleId: testModuleId,
					title: 'Lesson 2',
					type: 'video',
					isPreview: false,
					order: 1,
					createdAt: Date.now(),
				});
			});

			const lesson3Id = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('lessons', {
					moduleId: testModuleId,
					title: 'Lesson 3',
					type: 'video',
					isPreview: false,
					order: 2,
					createdAt: Date.now(),
				});
			});

			// Reorder: [lesson3, lesson1, lesson2]
			await t.mutation(api.lessons.reorder, {
				moduleId: testModuleId,
				lessonIds: [lesson3Id, testLessonId, lesson2Id],
			});

			// Verify order updated
			const lessons = await t.run(async (ctx: TestCtx) => {
				const l1 = await ctx.db.get(testLessonId);
				const l2 = await ctx.db.get(lesson2Id);
				const l3 = await ctx.db.get(lesson3Id);
				return [l1, l2, l3];
			});

			expect(lessons[0]?.order).toBe(1); // testLesson now at position 1
			expect(lessons[1]?.order).toBe(2); // lesson2 now at position 2
			expect(lessons[2]?.order).toBe(0); // lesson3 now at position 0
		});

		it('throws error when not authenticated', async () => {
			await expect(
				baseT.mutation(api.lessons.reorder, {
					moduleId: testModuleId,
					lessonIds: [testLessonId],
				}),
			).rejects.toThrow('Not authenticated');
		});

		it('throws error when module not found', async () => {
			const nonExistentModuleId = await t.run(async (ctx: TestCtx) => {
				const tempId = await ctx.db.insert('courseModules', {
					courseId: testCourseId,
					title: 'Temp',
					order: 99,
					createdAt: Date.now(),
				});
				await ctx.db.delete(tempId);
				return tempId;
			});

			await expect(
				t.mutation(api.lessons.reorder, {
					moduleId: nonExistentModuleId,
					lessonIds: [testLessonId],
				}),
			).rejects.toThrow('Module not found');
		});

		it('throws error when course not found (orphaned module)', async () => {
			const orphanedModuleId = await t.run(async (ctx: TestCtx) => {
				const tempCourseId = await ctx.db.insert('courses', {
					title: 'Temp',
					description: 'Temp',
					instructorId: testInstructorId,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});

				const moduleId = await ctx.db.insert('courseModules', {
					courseId: tempCourseId,
					title: 'Orphaned Module',
					order: 0,
					createdAt: Date.now(),
				});

				await ctx.db.delete(tempCourseId);
				return moduleId;
			});

			await expect(
				t.mutation(api.lessons.reorder, {
					moduleId: orphanedModuleId,
					lessonIds: [testLessonId],
				}),
			).rejects.toThrow('Course not found');
		});

		it('throws error when not authorized', async () => {
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.insert('users', {
					firstName: 'Other',
					lastName: 'Instructor',
					email: 'other@test.com',
					externalId: 'other-instructor-id',
					isInstructor: true,
					isAdmin: false,
				});
			});

			const otherInstructorT = baseT.withIdentity({ subject: 'other-instructor-id' });

			await expect(
				otherInstructorT.mutation(api.lessons.reorder, {
					moduleId: testModuleId,
					lessonIds: [testLessonId],
				}),
			).rejects.toThrow('Not authorized');
		});
	});
});
