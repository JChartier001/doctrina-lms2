import type { GenericMutationCtx } from 'convex/server';
import { convexTest } from 'convex-test';
import { beforeEach, describe, expect, it } from 'vitest';

import { api } from '../_generated/api';
import type { DataModel, Id } from '../_generated/dataModel';
import schema from '../schema';

type TestCtx = GenericMutationCtx<DataModel>;

describe('Course Modules', () => {
	let t: any;
	let baseT: any;
	let testInstructorId: Id<'users'>;
	let testInstructorExternalId: string;
	let testCourseId: Id<'courses'>;
	let testModuleId: Id<'courseModules'>;

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

			// Create test course with Convex instructorId
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

			testInstructorId = instructorId;
			testInstructorExternalId = 'test-instructor-id';
			testCourseId = courseId;
			testModuleId = moduleId;
		});

		t = baseT.withIdentity({ subject: testInstructorExternalId });
	});

	describe('create()', () => {
		it('creates module with required fields', async () => {
			const moduleId = await t.mutation(api.courseModules.create, {
				courseId: testCourseId,
				title: 'New Module',
				order: 1,
			});

			expect(moduleId).toBeDefined();

			const courseModule = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(moduleId);
			});

			expect(courseModule).toBeDefined();
			expect(courseModule?.title).toBe('New Module');
			expect(courseModule?.courseId).toBe(testCourseId);
			expect(courseModule?.order).toBe(1);
			expect(courseModule?.createdAt).toBeGreaterThan(Date.now() - 1000);
		});

		it('creates module with optional description', async () => {
			const moduleId = await t.mutation(api.courseModules.create, {
				courseId: testCourseId,
				title: 'Module with Description',
				description: 'This is a description',
				order: 1,
			});

			const courseModule = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(moduleId);
			});

			expect(courseModule?.description).toBe('This is a description');
		});

		it('throws error when not authenticated', async () => {
			await expect(
				baseT.mutation(api.courseModules.create, {
					courseId: testCourseId,
					title: 'Module',
					order: 1,
				}),
			).rejects.toThrow('Not authenticated');
		});

		it('throws error when course not found', async () => {
			const nonExistentCourseId = await t.run(async (ctx: TestCtx) => {
				const tempId = await ctx.db.insert('courses', {
					title: 'Temp',
					description: 'Temp',
					instructorId: testInstructorId,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});
				await ctx.db.delete(tempId);
				return tempId;
			});

			await expect(
				t.mutation(api.courseModules.create, {
					courseId: nonExistentCourseId,
					title: 'Module',
					order: 0,
				}),
			).rejects.toThrow('Course not found');
		});

		it('throws error when user is not an instructor', async () => {
			// Create non-instructor user
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
				regularUserT.mutation(api.courseModules.create, {
					courseId: testCourseId,
					title: 'Module',
					order: 0,
				}),
			).rejects.toThrow('Not authorized');
		});

		it('throws error when instructor does not own course', async () => {
			// Create another instructor
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
				otherInstructorT.mutation(api.courseModules.create, {
					courseId: testCourseId,
					title: 'Module',
					order: 0,
				}),
			).rejects.toThrow('Not authorized');
		});
	});

	describe('list()', () => {
		it('lists modules for a course', async () => {
			// Create additional modules
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.insert('courseModules', {
					courseId: testCourseId,
					title: 'Module 2',
					order: 1,
					createdAt: Date.now(),
				});

				await ctx.db.insert('courseModules', {
					courseId: testCourseId,
					title: 'Module 3',
					order: 2,
					createdAt: Date.now(),
				});
			});

			const modules = await t.query(api.courseModules.list, {
				courseId: testCourseId,
			});

			expect(modules).toHaveLength(3);
		});

		it('returns modules sorted by order', async () => {
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.insert('courseModules', {
					courseId: testCourseId,
					title: 'Module 3',
					order: 2,
					createdAt: Date.now(),
				});

				await ctx.db.insert('courseModules', {
					courseId: testCourseId,
					title: 'Module 2',
					order: 1,
					createdAt: Date.now(),
				});
			});

			const modules = await t.query(api.courseModules.list, {
				courseId: testCourseId,
			});

			expect(modules[0].order).toBe(0);
			expect(modules[1].order).toBe(1);
			expect(modules[2].order).toBe(2);
			expect(modules[0].title).toBe('Test Module');
			expect(modules[1].title).toBe('Module 2');
			expect(modules[2].title).toBe('Module 3');
		});

		it('returns empty array when course has no modules', async () => {
			const emptyCourseId = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('courses', {
					title: 'Empty Course',
					description: 'No modules',
					instructorId: testInstructorId,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});
			});

			const modules = await t.query(api.courseModules.list, {
				courseId: emptyCourseId,
			});

			expect(modules).toHaveLength(0);
		});
	});

	describe('get()', () => {
		it('returns module by ID', async () => {
			const courseModule = await t.query(api.courseModules.get, {
				moduleId: testModuleId,
			});

			expect(courseModule).toBeDefined();
			expect(courseModule?._id).toBe(testModuleId);
			expect(courseModule?.title).toBe('Test Module');
		});

		it('returns null for non-existent module', async () => {
			const nonExistentId = await t.run(async (ctx: TestCtx) => {
				const tempId = await ctx.db.insert('courseModules', {
					courseId: testCourseId,
					title: 'Temp',
					order: 99,
					createdAt: Date.now(),
				});
				await ctx.db.delete(tempId);
				return tempId;
			});

			const courseModule = await t.query(api.courseModules.get, {
				moduleId: nonExistentId,
			});

			expect(courseModule).toBeNull();
		});
	});

	describe('update()', () => {
		it('updates module title', async () => {
			await t.mutation(api.courseModules.update, {
				moduleId: testModuleId,
				title: 'Updated Title',
			});

			const courseModule = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(testModuleId);
			});

			expect(courseModule?.title).toBe('Updated Title');
		});

		it('updates module description', async () => {
			await t.mutation(api.courseModules.update, {
				moduleId: testModuleId,
				description: 'Updated description',
			});

			const courseModule = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(testModuleId);
			});

			expect(courseModule?.description).toBe('Updated description');
		});

		it('updates module order', async () => {
			await t.mutation(api.courseModules.update, {
				moduleId: testModuleId,
				order: 5,
			});

			const courseModule = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(testModuleId);
			});

			expect(courseModule?.order).toBe(5);
		});

		it('throws error when not authenticated', async () => {
			await expect(
				baseT.mutation(api.courseModules.update, {
					moduleId: testModuleId,
					title: 'Updated',
				}),
			).rejects.toThrow('Not authenticated');
		});

		it('throws error when module not found', async () => {
			const nonExistentId = await t.run(async (ctx: TestCtx) => {
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
				t.mutation(api.courseModules.update, {
					moduleId: nonExistentId,
					title: 'Updated',
				}),
			).rejects.toThrow('Module not found');
		});

		it('throws error when course not found', async () => {
			// Create module with non-existent course
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
				t.mutation(api.courseModules.update, {
					moduleId: orphanedModuleId,
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
				otherInstructorT.mutation(api.courseModules.update, {
					moduleId: testModuleId,
					title: 'Updated',
				}),
			).rejects.toThrow('Not authorized');
		});
	});

	describe('remove()', () => {
		it('deletes module', async () => {
			await t.mutation(api.courseModules.remove, {
				moduleId: testModuleId,
			});

			const courseModule = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(testModuleId);
			});

			expect(courseModule).toBeNull();
		});

		it('deletes all lessons in module (cascade)', async () => {
			// Create lessons
			const lessonIds = await t.run(async (ctx: TestCtx) => {
				const l1 = await ctx.db.insert('lessons', {
					moduleId: testModuleId,
					title: 'Lesson 1',
					type: 'video',
					isPreview: false,
					order: 0,
					createdAt: Date.now(),
				});

				const l2 = await ctx.db.insert('lessons', {
					moduleId: testModuleId,
					title: 'Lesson 2',
					type: 'video',
					isPreview: false,
					order: 1,
					createdAt: Date.now(),
				});

				return [l1, l2];
			});

			await t.mutation(api.courseModules.remove, {
				moduleId: testModuleId,
			});

			// Verify lessons deleted
			const lessons = await t.run(async (ctx: TestCtx) => {
				const l1 = await ctx.db.get(lessonIds[0]);
				const l2 = await ctx.db.get(lessonIds[1]);
				return [l1, l2];
			});

			expect(lessons[0]).toBeNull();
			expect(lessons[1]).toBeNull();
		});

		it('deletes lesson progress records (cascade)', async () => {
			// Create lesson and progress
			const progressId = await t.run(async (ctx: TestCtx) => {
				const studentId = await ctx.db.insert('users', {
					firstName: 'Test',
					lastName: 'Student',
					email: 'student@test.com',
					externalId: 'student-id',
					isInstructor: false,
					isAdmin: false,
				});

				const lessonId = await ctx.db.insert('lessons', {
					moduleId: testModuleId,
					title: 'Lesson',
					type: 'video',
					isPreview: false,
					order: 0,
					createdAt: Date.now(),
				});

				return await ctx.db.insert('lessonProgress', {
					userId: studentId,
					lessonId,
					completedAt: Date.now(),
				});
			});

			await t.mutation(api.courseModules.remove, {
				moduleId: testModuleId,
			});

			// Verify progress deleted
			const progress = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(progressId);
			});

			expect(progress).toBeNull();
		});

		it('throws error when not authenticated', async () => {
			await expect(
				baseT.mutation(api.courseModules.remove, {
					moduleId: testModuleId,
				}),
			).rejects.toThrow('Not authenticated');
		});

		it('throws error when module not found', async () => {
			const nonExistentId = await t.run(async (ctx: TestCtx) => {
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
				t.mutation(api.courseModules.remove, {
					moduleId: nonExistentId,
				}),
			).rejects.toThrow('Module not found');
		});

		it('throws error when course not found (orphaned module)', async () => {
			const orphanedModuleId = await t.run(async (ctx: TestCtx) => {
				const tempCourseId = await ctx.db.insert('courses', {
					title: 'Temp Course',
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

				// Delete course, leaving module orphaned
				await ctx.db.delete(tempCourseId);
				return moduleId;
			});

			await expect(
				t.mutation(api.courseModules.remove, {
					moduleId: orphanedModuleId,
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
				otherInstructorT.mutation(api.courseModules.remove, {
					moduleId: testModuleId,
				}),
			).rejects.toThrow('Not authorized');
		});
	});

	describe('reorder()', () => {
		it('reorders modules', async () => {
			// Create additional modules
			const module2Id = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('courseModules', {
					courseId: testCourseId,
					title: 'Module 2',
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

			// Reorder: [module3, module1, module2]
			await t.mutation(api.courseModules.reorder, {
				courseId: testCourseId,
				moduleIds: [module3Id, testModuleId, module2Id],
			});

			// Verify order updated
			const modules = await t.run(async (ctx: TestCtx) => {
				const m1 = await ctx.db.get(testModuleId);
				const m2 = await ctx.db.get(module2Id);
				const m3 = await ctx.db.get(module3Id);
				return [m1, m2, m3];
			});

			expect(modules[0]?.order).toBe(1); // testModule now at position 1
			expect(modules[1]?.order).toBe(2); // module2 now at position 2
			expect(modules[2]?.order).toBe(0); // module3 now at position 0
		});

		it('throws error when not authenticated', async () => {
			await expect(
				baseT.mutation(api.courseModules.reorder, {
					courseId: testCourseId,
					moduleIds: [testModuleId],
				}),
			).rejects.toThrow('Not authenticated');
		});

		it('throws error when course not found', async () => {
			const nonExistentCourseId = await t.run(async (ctx: TestCtx) => {
				const tempId = await ctx.db.insert('courses', {
					title: 'Temp',
					description: 'Temp',
					instructorId: testInstructorId,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});
				await ctx.db.delete(tempId);
				return tempId;
			});

			await expect(
				t.mutation(api.courseModules.reorder, {
					courseId: nonExistentCourseId,
					moduleIds: [testModuleId],
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
				otherInstructorT.mutation(api.courseModules.reorder, {
					courseId: testCourseId,
					moduleIds: [testModuleId],
				}),
			).rejects.toThrow('Not authorized');
		});
	});
});
