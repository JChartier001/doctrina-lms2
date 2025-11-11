import type { GenericMutationCtx } from 'convex/server';
import { convexTest } from 'convex-test';
import { beforeEach, describe, expect, it } from 'vitest';

import { api } from '../_generated/api';
import type { DataModel, Id } from '../_generated/dataModel';
import schema from '../schema';

type TestCtx = GenericMutationCtx<DataModel>;

describe('Courses', () => {
	let t: any;
	let testInstructorId: Id<'users'>;
	let testCourseId: Id<'courses'>;

	beforeEach(async () => {
		const baseT = convexTest(schema);

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
				instructorId,
				price: 29900,
				createdAt: Date.now(),
				updatedAt: Date.now(),
			});

			testInstructorId = instructorId;
			testCourseId = courseId;
		});

		t = baseT;
	});

	describe('create()', () => {
		it('creates course with required fields', async () => {
			const courseId = await t.mutation(api.courses.create, {
				title: 'New Course',
				description: 'Course description',
				instructorId: testInstructorId,
			});

			expect(courseId).toBeDefined();

			const course = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(courseId);
			});

			expect(course).toBeDefined();
			expect(course?.title).toBe('New Course');
			expect(course?.description).toBe('Course description');
			expect(course?.instructorId).toBe(testInstructorId);
			expect(course?.rating).toBe(0);
			expect(course?.reviewCount).toBe(0);
			expect(course?.createdAt).toBeGreaterThan(Date.now() - 1000);
			expect(course?.updatedAt).toBeGreaterThan(Date.now() - 1000);
		});

		it('creates course with optional fields', async () => {
			const courseId = await t.mutation(api.courses.create, {
				title: 'Advanced Course',
				description: 'Advanced course description',
				instructorId: testInstructorId,
				level: 'advanced',
				duration: '10 hours',
				price: 49900,
				thumbnailUrl: 'https://example.com/thumbnail.jpg',
			});

			const course = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(courseId);
			});

			expect(course?.level).toBe('advanced');
			expect(course?.duration).toBe('10 hours');
			expect(course?.price).toBe(49900);
			expect(course?.thumbnailUrl).toBe('https://example.com/thumbnail.jpg');
		});

		it('creates course with beginner level', async () => {
			const courseId = await t.mutation(api.courses.create, {
				title: 'Beginner Course',
				description: 'For beginners',
				instructorId: testInstructorId,
				level: 'beginner',
			});

			const course = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(courseId);
			});

			expect(course?.level).toBe('beginner');
		});

		it('creates course with intermediate level', async () => {
			const courseId = await t.mutation(api.courses.create, {
				title: 'Intermediate Course',
				description: 'For intermediate learners',
				instructorId: testInstructorId,
				level: 'intermediate',
			});

			const course = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(courseId);
			});

			expect(course?.level).toBe('intermediate');
		});

		it('creates free course with price 0', async () => {
			const courseId = await t.mutation(api.courses.create, {
				title: 'Free Course',
				description: 'Free for everyone',
				instructorId: testInstructorId,
				price: 0,
			});

			const course = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(courseId);
			});

			expect(course?.price).toBe(0);
		});

		it('initializes rating to 0', async () => {
			const courseId = await t.mutation(api.courses.create, {
				title: 'Course',
				description: 'Description',
				instructorId: testInstructorId,
			});

			const course = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(courseId);
			});

			expect(course?.rating).toBe(0);
			expect(course?.reviewCount).toBe(0);
		});
	});

	describe('list()', () => {
		it('lists all courses when no filter provided', async () => {
			// Create additional courses
			await t.mutation(api.courses.create, {
				title: 'Course 1',
				description: 'Description 1',
				instructorId: testInstructorId,
			});

			await t.mutation(api.courses.create, {
				title: 'Course 2',
				description: 'Description 2',
				instructorId: testInstructorId,
			});

			const courses = await t.query(api.courses.list, {});

			expect(courses.length).toBeGreaterThanOrEqual(3); // Including the one from beforeEach
		});

		it('filters courses by instructor ID', async () => {
			// Create another instructor and course
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

			await t.mutation(api.courses.create, {
				title: 'Other Course',
				description: 'By other instructor',
				instructorId: otherInstructorId,
			});

			const courses = await t.query(api.courses.list, {
				instructorId: testInstructorId,
			});

			expect(courses.length).toBeGreaterThanOrEqual(1);
			courses.forEach(course => {
				expect(course.instructorId).toBe(testInstructorId);
			});
		});

		it('returns courses in descending order', async () => {
			// Wait to ensure different timestamps
			await new Promise(resolve => setTimeout(resolve, 1));

			const course1 = await t.mutation(api.courses.create, {
				title: 'Older Course',
				description: 'Created first',
				instructorId: testInstructorId,
			});

			await new Promise(resolve => setTimeout(resolve, 1));

			const course2 = await t.mutation(api.courses.create, {
				title: 'Newer Course',
				description: 'Created second',
				instructorId: testInstructorId,
			});

			const courses = await t.query(api.courses.list, {});

			const course1Index = courses.findIndex(c => c._id === course1);
			const course2Index = courses.findIndex(c => c._id === course2);

			// Newer course should come before older course (desc order)
			expect(course2Index).toBeLessThan(course1Index);
		});

		it('returns empty array when instructor has no courses', async () => {
			const emptyInstructorId = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('users', {
					firstName: 'Empty',
					lastName: 'Instructor',
					email: 'empty@test.com',
					externalId: 'empty-instructor-id',
					isInstructor: true,
					isAdmin: false,
				});
			});

			const courses = await t.query(api.courses.list, {
				instructorId: emptyInstructorId,
			});

			expect(courses).toHaveLength(0);
		});
	});

	describe('get()', () => {
		it('returns course by ID', async () => {
			const course = await t.query(api.courses.get, {
				id: testCourseId,
			});

			expect(course).toBeDefined();
			expect(course?._id).toBe(testCourseId);
			expect(course?.title).toBe('Test Course');
		});

		it('returns null for non-existent course', async () => {
			const nonExistentId = await t.run(async (ctx: TestCtx) => {
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

			const course = await t.query(api.courses.get, {
				id: nonExistentId,
			});

			expect(course).toBeNull();
		});
	});

	describe('getWithInstructor()', () => {
		it('returns course with instructor data', async () => {
			const result = await t.query(api.courses.getWithInstructor, {
				id: testCourseId,
			});

			expect(result).toBeDefined();
			expect(result?.title).toBe('Test Course');
			expect(result?.instructor).toBeDefined();
			expect(result?.instructor?.firstName).toBe('Test');
			expect(result?.instructor?.lastName).toBe('Instructor');
			expect(result?.instructor?.email).toBe('instructor@test.com');
		});

		it('returns null when course not found', async () => {
			const nonExistentId = await t.run(async (ctx: TestCtx) => {
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

			const result = await t.query(api.courses.getWithInstructor, {
				id: nonExistentId,
			});

			expect(result).toBeNull();
		});

		it('returns null instructor when instructor deleted', async () => {
			// Create temp instructor and course
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

			const courseId = await t.mutation(api.courses.create, {
				title: 'Orphaned Course',
				description: 'Instructor will be deleted',
				instructorId: tempInstructorId,
			});

			// Delete instructor
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.delete(tempInstructorId);
			});

			const result = await t.query(api.courses.getWithInstructor, {
				id: courseId,
			});

			expect(result).toBeDefined();
			expect(result?.instructor).toBeNull();
		});
	});

	describe('update()', () => {
		it('updates course title', async () => {
			await t.mutation(api.courses.update, {
				id: testCourseId,
				title: 'Updated Title',
			});

			const course = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(testCourseId);
			});

			expect(course?.title).toBe('Updated Title');
		});

		it('updates course description', async () => {
			await t.mutation(api.courses.update, {
				id: testCourseId,
				description: 'Updated description',
			});

			const course = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(testCourseId);
			});

			expect(course?.description).toBe('Updated description');
		});

		it('updates course level', async () => {
			await t.mutation(api.courses.update, {
				id: testCourseId,
				level: 'advanced',
			});

			const course = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(testCourseId);
			});

			expect(course?.level).toBe('advanced');
		});

		it('updates course price', async () => {
			await t.mutation(api.courses.update, {
				id: testCourseId,
				price: 99900,
			});

			const course = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(testCourseId);
			});

			expect(course?.price).toBe(99900);
		});

		it('updates updatedAt timestamp', async () => {
			const before = await t.run(async (ctx: TestCtx) => {
				const course = await ctx.db.get(testCourseId);
				return course?.updatedAt;
			});

			await new Promise(resolve => setTimeout(resolve, 1));

			await t.mutation(api.courses.update, {
				id: testCourseId,
				title: 'Updated',
			});

			const after = await t.run(async (ctx: TestCtx) => {
				const course = await ctx.db.get(testCourseId);
				return course?.updatedAt;
			});

			expect(after).toBeGreaterThan(before!);
		});

		it('throws error when course not found', async () => {
			const nonExistentId = await t.run(async (ctx: TestCtx) => {
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
				t.mutation(api.courses.update, {
					id: nonExistentId,
					title: 'Updated',
				}),
			).rejects.toThrow('Course not found');
		});

		it('updates multiple fields at once', async () => {
			await t.mutation(api.courses.update, {
				id: testCourseId,
				title: 'New Title',
				description: 'New Description',
				price: 19900,
				level: 'beginner',
			});

			const course = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(testCourseId);
			});

			expect(course?.title).toBe('New Title');
			expect(course?.description).toBe('New Description');
			expect(course?.price).toBe(19900);
			expect(course?.level).toBe('beginner');
		});
	});

	describe('remove()', () => {
		it('deletes course', async () => {
			await t.mutation(api.courses.remove, {
				id: testCourseId,
			});

			const course = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(testCourseId);
			});

			expect(course).toBeNull();
		});

		it('returns deleted course ID', async () => {
			const result = await t.mutation(api.courses.remove, {
				id: testCourseId,
			});

			expect(result).toBe(testCourseId);
		});
	});

	describe('getWithCurriculum()', () => {
		it('returns course with empty curriculum when no modules', async () => {
			const result = await t.query(api.courses.getWithCurriculum, {
				courseId: testCourseId,
			});

			expect(result).toBeDefined();
			expect(result?.curriculum).toHaveLength(0);
			expect(result?.lessons).toBe(0);
		});

		it('returns course with modules and lessons', async () => {
			// Create module
			const moduleId = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('courseModules', {
					courseId: testCourseId,
					title: 'Module 1',
					order: 0,
					createdAt: Date.now(),
				});
			});

			// Create lessons
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.insert('lessons', {
					moduleId,
					title: 'Lesson 1',
					type: 'video',
					isPreview: true,
					order: 0,
					createdAt: Date.now(),
				});

				await ctx.db.insert('lessons', {
					moduleId,
					title: 'Lesson 2',
					type: 'quiz',
					isPreview: false,
					order: 1,
					createdAt: Date.now(),
				});
			});

			const result = await t.query(api.courses.getWithCurriculum, {
				courseId: testCourseId,
			});

			expect(result?.curriculum).toHaveLength(1);
			expect(result?.curriculum[0].lessons).toHaveLength(2);
			expect(result?.lessons).toBe(2);
		});

		it('returns enrollment count', async () => {
			// Create enrollment
			await t.run(async (ctx: TestCtx) => {
				const user1Id = await ctx.db.insert('users', {
					firstName: 'User',
					lastName: 'One',
					email: 'user1@test.com',
					externalId: 'user-1',
					isInstructor: false,
					isAdmin: false,
				});

				const purchaseId = await ctx.db.insert('purchases', {
					userId: user1Id,
					courseId: testCourseId,
					amount: 29900,
					status: 'complete',
					createdAt: Date.now(),
				});

				await ctx.db.insert('enrollments', {
					userId: user1Id,
					courseId: testCourseId,
					purchaseId,
					enrolledAt: Date.now(),
					progressPercent: 0,
				});
			});

			const result = await t.query(api.courses.getWithCurriculum, {
				courseId: testCourseId,
			});

			expect(result?.students).toBe(1);
		});

		it('returns null when course not found', async () => {
			const nonExistentId = await t.run(async (ctx: TestCtx) => {
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

			const result = await t.query(api.courses.getWithCurriculum, {
				courseId: nonExistentId,
			});

			expect(result).toBeNull();
		});

		it('calculates average rating from reviews', async () => {
			// Create users
			const _user1Id = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('users', {
					firstName: 'User',
					lastName: '1',
					email: 'user1@test.com',
					externalId: 'user-1',
					isInstructor: false,
					isAdmin: false,
				});
			});

			// Create reviews
			await t.run(async (ctx: TestCtx) => {
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

				await ctx.db.insert('courseReviews', {
					userId: user1Id,
					courseId: testCourseId,
					rating: 5,
					content: 'Great!',
					createdAt: Date.now(),
					hidden: false,
				});

				await ctx.db.insert('courseReviews', {
					userId: user2Id,
					courseId: testCourseId,
					rating: 3,
					content: 'Good',
					createdAt: Date.now(),
					hidden: false,
				});
			});

			const result = await t.query(api.courses.getWithCurriculum, {
				courseId: testCourseId,
			});

			expect(result?.rating).toBe(4); // (5 + 3) / 2
			expect(result?.reviewCount).toBe(2);
		});

		it('excludes hidden reviews from rating calculation', async () => {
			await t.run(async (ctx: TestCtx) => {
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

				await ctx.db.insert('courseReviews', {
					userId: user1Id,
					courseId: testCourseId,
					rating: 5,
					content: 'Great!',
					createdAt: Date.now(),
					hidden: false,
				});

				await ctx.db.insert('courseReviews', {
					userId: user2Id,
					courseId: testCourseId,
					rating: 1,
					content: 'Bad',
					createdAt: Date.now(),
					hidden: true, // Hidden review
				});
			});

			const result = await t.query(api.courses.getWithCurriculum, {
				courseId: testCourseId,
			});

			expect(result?.rating).toBe(5); // Only visible review
			expect(result?.reviewCount).toBe(1);
		});

		it('returns null rating when no reviews', async () => {
			const result = await t.query(api.courses.getWithCurriculum, {
				courseId: testCourseId,
			});

			expect(result?.rating).toBeNull();
			expect(result?.reviewCount).toBe(0);
		});

		it('sorts modules by order field', async () => {
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.insert('courseModules', {
					courseId: testCourseId,
					title: 'Module 2',
					order: 1,
					createdAt: Date.now(),
				});

				await ctx.db.insert('courseModules', {
					courseId: testCourseId,
					title: 'Module 1',
					order: 0,
					createdAt: Date.now(),
				});
			});

			const result = await t.query(api.courses.getWithCurriculum, {
				courseId: testCourseId,
			});

			expect(result?.curriculum[0].title).toBe('Module 1');
			expect(result?.curriculum[1].title).toBe('Module 2');
		});

		it('returns instructor details', async () => {
			const result = await t.query(api.courses.getWithCurriculum, {
				courseId: testCourseId,
			});

			expect(result?.instructor).toBeDefined();
			expect(result?.instructor?.name).toBe('Test Instructor');
			expect(result?.instructor?.title).toBe('');
			expect(result?.instructor?.bio).toBe('');
		});

		it('returns null instructor when instructor deleted', async () => {
			// Create a course with a different instructor, then delete the instructor
			const orphanedCourseId = await t.run(async (ctx: TestCtx) => {
				const tempInstructorId = await ctx.db.insert('users', {
					firstName: 'Temp',
					lastName: 'Instructor',
					email: 'temp@test.com',
					externalId: 'temp-instructor',
					isInstructor: true,
					isAdmin: false,
				});

				const courseId = await ctx.db.insert('courses', {
					title: 'Orphaned Course',
					description: 'Course with deleted instructor',
					instructorId: tempInstructorId,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});

				// Delete the instructor
				await ctx.db.delete(tempInstructorId);
				return courseId;
			});

			const result = await t.query(api.courses.getWithCurriculum, {
				courseId: orphanedCourseId,
			});

			expect(result?.instructor).toBeNull();
		});

		it('sorts lessons by order field within modules', async () => {
			const moduleId = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('courseModules', {
					courseId: testCourseId,
					title: 'Module',
					order: 0,
					createdAt: Date.now(),
				});
			});

			await t.run(async (ctx: TestCtx) => {
				await ctx.db.insert('lessons', {
					moduleId,
					title: 'Lesson 2',
					type: 'video',
					isPreview: false,
					order: 1,
					createdAt: Date.now(),
				});

				await ctx.db.insert('lessons', {
					moduleId,
					title: 'Lesson 1',
					type: 'video',
					isPreview: false,
					order: 0,
					createdAt: Date.now(),
				});
			});

			const result = await t.query(api.courses.getWithCurriculum, {
				courseId: testCourseId,
			});

			expect(result?.curriculum[0].lessons[0].title).toBe('Lesson 1');
			expect(result?.curriculum[0].lessons[1].title).toBe('Lesson 2');
		});
	});
});
