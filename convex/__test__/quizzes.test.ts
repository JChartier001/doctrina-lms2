/**
 * Quiz System Tests
 *
 * Tests quiz creation, question management, and quiz retrieval
 * with focus on authorization and security (correctAnswer exclusion)
 *
 * Coverage target: 85% (Priority 2: Core Features)
 * Security-critical code: 100% coverage required
 */

import { convexTest } from 'convex-test';
import { beforeEach, describe, expect, it } from 'vitest';

import { api } from '../_generated/api';
import type { Id } from '../_generated/dataModel';
import schema from '../schema';

describe('Quiz System', () => {
	let instructorId: Id<'users'>;
	let studentId: Id<'users'>;
	let courseId: Id<'courses'>;
	let moduleId: Id<'courseModules'>;

	beforeEach(async () => {
		// This runs before each test to set up fresh test data
	});

	describe('create() mutation', () => {
		it('should allow instructor to create quiz for their course', async () => {
			const t = convexTest(schema);

			// Create instructor user
			instructorId = await t.run(async ctx => {
				return await ctx.db.insert('users', {
					firstName: 'Dr. Jane',
					lastName: 'Smith',
					email: 'instructor@test.com',
					externalId: 'instructor-clerk-id',
					isInstructor: true,
					isAdmin: false,
				});
			});

			// Create course owned by instructor
			courseId = await t.run(async ctx => {
				const now = Date.now();
				return await ctx.db.insert('courses', {
					title: 'Test Course',
					description: 'Test Description',
					instructorId,
					createdAt: now,
					updatedAt: now,
				});
			});

			// Create quiz as instructor
			const quizId = await t.withIdentity({ subject: 'instructor-clerk-id' }).mutation(api.quizzes.create, {
				courseId,
				title: 'Module 1 Quiz',
				passingScore: 80,
			});

			expect(quizId).toBeDefined();

			// Verify quiz was created correctly
			const quiz = await t.run(async ctx => {
				return await ctx.db.get(quizId);
			});

			expect(quiz).toBeDefined();
			expect(quiz?.title).toBe('Module 1 Quiz');
			expect(quiz?.passingScore).toBe(80);
			expect(quiz?.courseId).toBe(courseId);
		});

		it('should allow instructor to create quiz with valid moduleId', async () => {
			const t = convexTest(schema);

			// Create instructor user
			instructorId = await t.run(async ctx => {
				return await ctx.db.insert('users', {
					firstName: 'Dr. Jane',
					lastName: 'Smith',
					email: 'instructor@test.com',
					externalId: 'instructor-clerk-id',
					isInstructor: true,
					isAdmin: false,
				});
			});

			// Create course and module owned by instructor
			const { courseId, moduleId } = await t.run(async ctx => {
				const now = Date.now();
				const courseId = await ctx.db.insert('courses', {
					title: 'Test Course',
					description: 'Test Description',
					instructorId,
					createdAt: now,
					updatedAt: now,
				});

				const moduleId = await ctx.db.insert('courseModules', {
					courseId,
					title: 'Module 1',
					order: 0,
					createdAt: now,
				});

				return { courseId, moduleId };
			});

			// Create quiz as instructor WITH moduleId
			const quizId = await t.withIdentity({ subject: 'instructor-clerk-id' }).mutation(api.quizzes.create, {
				courseId,
				moduleId, // Valid moduleId that belongs to the course
				title: 'Module 1 Quiz',
				passingScore: 80,
			});

			expect(quizId).toBeDefined();

			// Verify quiz was created with moduleId
			const quiz = await t.run(async ctx => {
				return await ctx.db.get(quizId);
			});

			expect(quiz).toBeDefined();
			expect(quiz?.title).toBe('Module 1 Quiz');
			expect(quiz?.passingScore).toBe(80);
			expect(quiz?.courseId).toBe(courseId);
			expect(quiz?.moduleId).toBe(moduleId);
		});

		it('should throw error if user is not authenticated', async () => {
			const t = convexTest(schema);

			// Create course first
			courseId = await t.run(async ctx => {
				const instructorId = await ctx.db.insert('users', {
					firstName: 'Dr. Jane',
					lastName: 'Smith',
					email: 'instructor@test.com',
					externalId: 'instructor-clerk-id',
					isInstructor: true,
					isAdmin: false,
				});

				const now = Date.now();
				return await ctx.db.insert('courses', {
					title: 'Test Course',
					description: 'Test Description',
					instructorId,
					createdAt: now,
					updatedAt: now,
				});
			});

			// Try to create quiz without authentication
			await expect(
				t.mutation(api.quizzes.create, {
					courseId,
					title: 'Quiz',
					passingScore: 80,
				}),
			).rejects.toThrow('Not authenticated');
		});

		it('should throw error if user is not course instructor', async () => {
			const t = convexTest(schema);

			// Create instructor and their course
			const { courseId: instructorCourseId } = await t.run(async ctx => {
				const instructor = await ctx.db.insert('users', {
					firstName: 'Dr. Jane',
					lastName: 'Smith',
					email: 'instructor@test.com',
					externalId: 'instructor-clerk-id',
					isInstructor: true,
					isAdmin: false,
				});

				const now = Date.now();
				const courseId = await ctx.db.insert('courses', {
					title: 'Test Course',
					description: 'Test Description',
					instructorId: instructor,
					createdAt: now,
					updatedAt: now,
				});

				return { courseId };
			});

			// Create different user (student)
			await t.run(async ctx => {
				await ctx.db.insert('users', {
					firstName: 'Student',
					lastName: 'User',
					email: 'student@test.com',
					externalId: 'student-clerk-id',
					isInstructor: false,
					isAdmin: false,
				});
			});

			// Try to create quiz as student
			await expect(
				t.withIdentity({ subject: 'student-clerk-id' }).mutation(api.quizzes.create, {
					courseId: instructorCourseId,
					title: 'Quiz',
					passingScore: 80,
				}),
			).rejects.toThrow('Not authorized');
		});

		it('should throw error for invalid courseId', async () => {
			const t = convexTest(schema);

			// Create a valid course ID, then delete it to test "Course not found"
			const nonExistentCourseId = await t.run(async ctx => {
				await ctx.db.insert('users', {
					firstName: 'Dr. Jane',
					lastName: 'Smith',
					email: 'instructor@test.com',
					externalId: 'instructor-clerk-id',
					isInstructor: true,
					isAdmin: false,
				});

				const instructorId = await ctx.db.insert('users', {
					firstName: 'Other',
					lastName: 'Instructor',
					email: 'other@test.com',
					externalId: 'other-clerk-id',
					isInstructor: true,
					isAdmin: false,
				});

				const now = Date.now();
				const courseId = await ctx.db.insert('courses', {
					title: 'Temp Course',
					description: 'Will be deleted',
					instructorId,
					createdAt: now,
					updatedAt: now,
				});

				// Delete the course to create "not found" scenario
				await ctx.db.delete(courseId);

				return courseId;
			});

			await expect(
				t.withIdentity({ subject: 'instructor-clerk-id' }).mutation(api.quizzes.create, {
					courseId: nonExistentCourseId,
					title: 'Quiz',
					passingScore: 80,
				}),
			).rejects.toThrow('Course not found');
		});

		it('should throw error for invalid passingScore (below 0)', async () => {
			const t = convexTest(schema);

			const { courseId } = await t.run(async ctx => {
				const instructorId = await ctx.db.insert('users', {
					firstName: 'Dr. Jane',
					lastName: 'Smith',
					email: 'instructor@test.com',
					externalId: 'instructor-clerk-id',
					isInstructor: true,
					isAdmin: false,
				});

				const now = Date.now();
				const courseId = await ctx.db.insert('courses', {
					title: 'Test Course',
					description: 'Test Description',
					instructorId,
					createdAt: now,
					updatedAt: now,
				});

				return { courseId };
			});

			await expect(
				t.withIdentity({ subject: 'instructor-clerk-id' }).mutation(api.quizzes.create, {
					courseId,
					title: 'Quiz',
					passingScore: -10,
				}),
			).rejects.toThrow('Passing score must be between 0 and 100');
		});

		it('should throw error for invalid passingScore (above 100)', async () => {
			const t = convexTest(schema);

			const { courseId } = await t.run(async ctx => {
				const instructorId = await ctx.db.insert('users', {
					firstName: 'Dr. Jane',
					lastName: 'Smith',
					email: 'instructor@test.com',
					externalId: 'instructor-clerk-id',
					isInstructor: true,
					isAdmin: false,
				});

				const now = Date.now();
				const courseId = await ctx.db.insert('courses', {
					title: 'Test Course',
					description: 'Test Description',
					instructorId,
					createdAt: now,
					updatedAt: now,
				});

				return { courseId };
			});

			await expect(
				t.withIdentity({ subject: 'instructor-clerk-id' }).mutation(api.quizzes.create, {
					courseId,
					title: 'Quiz',
					passingScore: 150,
				}),
			).rejects.toThrow('Passing score must be between 0 and 100');
		});

		it('should throw error when moduleId does not exist', async () => {
			const t = convexTest(schema);

			const { courseId, nonExistentModuleId } = await t.run(async ctx => {
				const instructorId = await ctx.db.insert('users', {
					firstName: 'Dr. Jane',
					lastName: 'Smith',
					email: 'instructor@test.com',
					externalId: 'instructor-clerk-id',
					isInstructor: true,
					isAdmin: false,
				});

				const now = Date.now();
				const courseId = await ctx.db.insert('courses', {
					title: 'Test Course',
					description: 'Test Description',
					instructorId,
					createdAt: now,
					updatedAt: now,
				});

				// Create and delete a module to get a valid but non-existent ID
				const moduleId = await ctx.db.insert('courseModules', {
					courseId,
					title: 'Temp Module',
					order: 0,
					createdAt: now,
				});
				await ctx.db.delete(moduleId);

				return { courseId, nonExistentModuleId: moduleId };
			});

			await expect(
				t.withIdentity({ subject: 'instructor-clerk-id' }).mutation(api.quizzes.create, {
					courseId,
					moduleId: nonExistentModuleId,
					title: 'Quiz',
					passingScore: 80,
				}),
			).rejects.toThrow('Module not found');
		});

		it('should throw error when moduleId does not belong to course', async () => {
			const t = convexTest(schema);

			const { courseId, wrongModuleId } = await t.run(async ctx => {
				const instructorId = await ctx.db.insert('users', {
					firstName: 'Dr. Jane',
					lastName: 'Smith',
					email: 'instructor@test.com',
					externalId: 'instructor-clerk-id',
					isInstructor: true,
					isAdmin: false,
				});

				const now = Date.now();

				// Create first course
				const courseId = await ctx.db.insert('courses', {
					title: 'Course 1',
					description: 'Test Description',
					instructorId,
					createdAt: now,
					updatedAt: now,
				});

				// Create second course
				const otherCourseId = await ctx.db.insert('courses', {
					title: 'Course 2',
					description: 'Test Description',
					instructorId,
					createdAt: now,
					updatedAt: now,
				});

				// Create module belonging to the OTHER course
				const wrongModuleId = await ctx.db.insert('courseModules', {
					courseId: otherCourseId,
					title: 'Module from Course 2',
					order: 0,
					createdAt: now,
				});

				return { courseId, wrongModuleId };
			});

			await expect(
				t.withIdentity({ subject: 'instructor-clerk-id' }).mutation(api.quizzes.create, {
					courseId,
					moduleId: wrongModuleId,
					title: 'Quiz',
					passingScore: 80,
				}),
			).rejects.toThrow('Module does not belong to the specified course');
		});
	});

	describe('addQuestions() mutation', () => {
		it('should add multiple questions to quiz with order preservation', async () => {
			const t = convexTest(schema);

			// Set up instructor, course, and quiz
			const { quizId } = await t.run(async ctx => {
				const instructorId = await ctx.db.insert('users', {
					firstName: 'Dr. Jane',
					lastName: 'Smith',
					email: 'instructor@test.com',
					externalId: 'instructor-clerk-id',
					isInstructor: true,
					isAdmin: false,
				});

				const now = Date.now();
				const courseId = await ctx.db.insert('courses', {
					title: 'Test Course',
					description: 'Test Description',
					instructorId,
					createdAt: now,
					updatedAt: now,
				});

				const quizId = await ctx.db.insert('quizzes', {
					courseId,
					title: 'Test Quiz',
					passingScore: 80,
					createdAt: now,
				});

				return { quizId };
			});

			// Add questions as instructor
			const questions = [
				{
					question: 'Question 1?',
					options: ['A', 'B', 'C', 'D'],
					correctAnswer: 0,
					explanation: 'A is correct',
				},
				{
					question: 'Question 2?',
					options: ['A', 'B', 'C', 'D'],
					correctAnswer: 1,
				},
				{
					question: 'Question 3?',
					options: ['A', 'B', 'C', 'D'],
					correctAnswer: 2,
				},
			];

			const questionIds = await t.withIdentity({ subject: 'instructor-clerk-id' }).mutation(api.quizzes.addQuestions, {
				quizId,
				questions,
			});

			expect(questionIds).toHaveLength(3);

			// Verify questions were inserted with correct order
			const insertedQuestions = await t.run(async ctx => {
				return await ctx.db
					.query('quizQuestions')
					.withIndex('by_quiz', q => q.eq('quizId', quizId))
					.collect();
			});

			expect(insertedQuestions).toHaveLength(3);

			// Verify order is preserved (0, 1, 2)
			const sortedQuestions = insertedQuestions.sort((a, b) => a.order - b.order);
			expect(sortedQuestions[0].question).toBe('Question 1?');
			expect(sortedQuestions[0].order).toBe(0);
			expect(sortedQuestions[1].question).toBe('Question 2?');
			expect(sortedQuestions[1].order).toBe(1);
			expect(sortedQuestions[2].question).toBe('Question 3?');
			expect(sortedQuestions[2].order).toBe(2);
		});

		it('should throw error if user is not course instructor', async () => {
			const t = convexTest(schema);

			// Create instructor, course, and quiz
			const { quizId } = await t.run(async ctx => {
				const instructorId = await ctx.db.insert('users', {
					firstName: 'Dr. Jane',
					lastName: 'Smith',
					email: 'instructor@test.com',
					externalId: 'instructor-clerk-id',
					isInstructor: true,
					isAdmin: false,
				});

				const now = Date.now();
				const courseId = await ctx.db.insert('courses', {
					title: 'Test Course',
					description: 'Test Description',
					instructorId,
					createdAt: now,
					updatedAt: now,
				});

				const quizId = await ctx.db.insert('quizzes', {
					courseId,
					title: 'Test Quiz',
					passingScore: 80,
					createdAt: now,
				});

				// Create student user
				await ctx.db.insert('users', {
					firstName: 'Student',
					lastName: 'User',
					email: 'student@test.com',
					externalId: 'student-clerk-id',
					isInstructor: false,
					isAdmin: false,
				});

				return { quizId };
			});

			// Try to add questions as student
			await expect(
				t.withIdentity({ subject: 'student-clerk-id' }).mutation(api.quizzes.addQuestions, {
					quizId,
					questions: [
						{
							question: 'Hacker Question?',
							options: ['A', 'B', 'C', 'D'],
							correctAnswer: 0,
						},
					],
				}),
			).rejects.toThrow('Not authorized');
		});

		it('should throw error if user is not authenticated', async () => {
			const t = convexTest(schema);

			// Create quiz
			const { quizId } = await t.run(async ctx => {
				const instructorId = await ctx.db.insert('users', {
					firstName: 'Dr. Jane',
					lastName: 'Smith',
					email: 'instructor@test.com',
					externalId: 'instructor-clerk-id',
					isInstructor: true,
					isAdmin: false,
				});

				const now = Date.now();
				const courseId = await ctx.db.insert('courses', {
					title: 'Test Course',
					description: 'Test Description',
					instructorId,
					createdAt: now,
					updatedAt: now,
				});

				const quizId = await ctx.db.insert('quizzes', {
					courseId,
					title: 'Test Quiz',
					passingScore: 80,
					createdAt: now,
				});

				return { quizId };
			});

			// Try to add questions without authentication
			await expect(
				t.mutation(api.quizzes.addQuestions, {
					quizId,
					questions: [
						{
							question: 'Question?',
							options: ['A', 'B', 'C', 'D'],
							correctAnswer: 0,
						},
					],
				}),
			).rejects.toThrow('Not authenticated');
		});

		it('should throw error for invalid quizId', async () => {
			const t = convexTest(schema);

			// Create a valid quiz ID, then delete it
			const nonExistentQuizId = await t.run(async ctx => {
				const instructorId = await ctx.db.insert('users', {
					firstName: 'Dr. Jane',
					lastName: 'Smith',
					email: 'instructor@test.com',
					externalId: 'instructor-clerk-id',
					isInstructor: true,
					isAdmin: false,
				});

				const now = Date.now();
				const courseId = await ctx.db.insert('courses', {
					title: 'Test Course',
					description: 'Test Description',
					instructorId,
					createdAt: now,
					updatedAt: now,
				});

				const quizId = await ctx.db.insert('quizzes', {
					courseId,
					title: 'Test Quiz',
					passingScore: 80,
					createdAt: now,
				});

				await ctx.db.delete(quizId);
				return quizId;
			});

			await expect(
				t.withIdentity({ subject: 'instructor-clerk-id' }).mutation(api.quizzes.addQuestions, {
					quizId: nonExistentQuizId,
					questions: [
						{
							question: 'Question?',
							options: ['A', 'B', 'C', 'D'],
							correctAnswer: 0,
						},
					],
				}),
			).rejects.toThrow('Quiz not found');
		});

		it('should throw error if quiz course does not exist', async () => {
			const t = convexTest(schema);

			// Create quiz, then delete its course
			const { quizId } = await t.run(async ctx => {
				const instructorId = await ctx.db.insert('users', {
					firstName: 'Dr. Jane',
					lastName: 'Smith',
					email: 'instructor@test.com',
					externalId: 'instructor-clerk-id',
					isInstructor: true,
					isAdmin: false,
				});

				const now = Date.now();
				const courseId = await ctx.db.insert('courses', {
					title: 'Test Course',
					description: 'Test Description',
					instructorId,
					createdAt: now,
					updatedAt: now,
				});

				const quizId = await ctx.db.insert('quizzes', {
					courseId,
					title: 'Test Quiz',
					passingScore: 80,
					createdAt: now,
				});

				// Delete the course to create orphaned quiz scenario
				await ctx.db.delete(courseId);

				return { quizId };
			});

			await expect(
				t.withIdentity({ subject: 'instructor-clerk-id' }).mutation(api.quizzes.addQuestions, {
					quizId,
					questions: [
						{
							question: 'Question?',
							options: ['A', 'B', 'C', 'D'],
							correctAnswer: 0,
						},
					],
				}),
			).rejects.toThrow('Course not found');
		});

		it('should throw error when question has less than 4 options', async () => {
			const t = convexTest(schema);

			const { quizId } = await t.run(async ctx => {
				const instructorId = await ctx.db.insert('users', {
					firstName: 'Dr. Jane',
					lastName: 'Smith',
					email: 'instructor@test.com',
					externalId: 'instructor-clerk-id',
					isInstructor: true,
					isAdmin: false,
				});

				const now = Date.now();
				const courseId = await ctx.db.insert('courses', {
					title: 'Test Course',
					description: 'Test Description',
					instructorId,
					createdAt: now,
					updatedAt: now,
				});

				const quizId = await ctx.db.insert('quizzes', {
					courseId,
					title: 'Test Quiz',
					passingScore: 80,
					createdAt: now,
				});

				return { quizId };
			});

			await expect(
				t.withIdentity({ subject: 'instructor-clerk-id' }).mutation(api.quizzes.addQuestions, {
					quizId,
					questions: [
						{
							question: 'Question with 3 options?',
							options: ['A', 'B', 'C'], // Only 3 options
							correctAnswer: 0,
						},
					],
				}),
			).rejects.toThrow('Question 1: Must have exactly 4 options, got 3');
		});

		it('should throw error when question has more than 4 options', async () => {
			const t = convexTest(schema);

			const { quizId } = await t.run(async ctx => {
				const instructorId = await ctx.db.insert('users', {
					firstName: 'Dr. Jane',
					lastName: 'Smith',
					email: 'instructor@test.com',
					externalId: 'instructor-clerk-id',
					isInstructor: true,
					isAdmin: false,
				});

				const now = Date.now();
				const courseId = await ctx.db.insert('courses', {
					title: 'Test Course',
					description: 'Test Description',
					instructorId,
					createdAt: now,
					updatedAt: now,
				});

				const quizId = await ctx.db.insert('quizzes', {
					courseId,
					title: 'Test Quiz',
					passingScore: 80,
					createdAt: now,
				});

				return { quizId };
			});

			await expect(
				t.withIdentity({ subject: 'instructor-clerk-id' }).mutation(api.quizzes.addQuestions, {
					quizId,
					questions: [
						{
							question: 'Question with 5 options?',
							options: ['A', 'B', 'C', 'D', 'E'], // 5 options
							correctAnswer: 0,
						},
					],
				}),
			).rejects.toThrow('Question 1: Must have exactly 4 options, got 5');
		});

		it('should throw error when correctAnswer is below 0', async () => {
			const t = convexTest(schema);

			const { quizId } = await t.run(async ctx => {
				const instructorId = await ctx.db.insert('users', {
					firstName: 'Dr. Jane',
					lastName: 'Smith',
					email: 'instructor@test.com',
					externalId: 'instructor-clerk-id',
					isInstructor: true,
					isAdmin: false,
				});

				const now = Date.now();
				const courseId = await ctx.db.insert('courses', {
					title: 'Test Course',
					description: 'Test Description',
					instructorId,
					createdAt: now,
					updatedAt: now,
				});

				const quizId = await ctx.db.insert('quizzes', {
					courseId,
					title: 'Test Quiz',
					passingScore: 80,
					createdAt: now,
				});

				return { quizId };
			});

			await expect(
				t.withIdentity({ subject: 'instructor-clerk-id' }).mutation(api.quizzes.addQuestions, {
					quizId,
					questions: [
						{
							question: 'Question?',
							options: ['A', 'B', 'C', 'D'],
							correctAnswer: -1, // Invalid: below 0
						},
					],
				}),
			).rejects.toThrow('Question 1: Correct answer index must be between 0 and 3, got -1');
		});

		it('should throw error when correctAnswer is above 3', async () => {
			const t = convexTest(schema);

			const { quizId } = await t.run(async ctx => {
				const instructorId = await ctx.db.insert('users', {
					firstName: 'Dr. Jane',
					lastName: 'Smith',
					email: 'instructor@test.com',
					externalId: 'instructor-clerk-id',
					isInstructor: true,
					isAdmin: false,
				});

				const now = Date.now();
				const courseId = await ctx.db.insert('courses', {
					title: 'Test Course',
					description: 'Test Description',
					instructorId,
					createdAt: now,
					updatedAt: now,
				});

				const quizId = await ctx.db.insert('quizzes', {
					courseId,
					title: 'Test Quiz',
					passingScore: 80,
					createdAt: now,
				});

				return { quizId };
			});

			await expect(
				t.withIdentity({ subject: 'instructor-clerk-id' }).mutation(api.quizzes.addQuestions, {
					quizId,
					questions: [
						{
							question: 'Question?',
							options: ['A', 'B', 'C', 'D'],
							correctAnswer: 4, // Invalid: above 3
						},
					],
				}),
			).rejects.toThrow('Question 1: Correct answer index must be between 0 and 3, got 4');
		});
	});

	describe('getQuiz() query', () => {
		it('should return quiz with questions WITHOUT correct answers (SECURITY)', async () => {
			const t = convexTest(schema);

			// Set up quiz with questions
			const { quizId } = await t.run(async ctx => {
				const instructorId = await ctx.db.insert('users', {
					firstName: 'Dr. Jane',
					lastName: 'Smith',
					email: 'instructor@test.com',
					externalId: 'instructor-clerk-id',
					isInstructor: true,
					isAdmin: false,
				});

				const now = Date.now();
				const courseId = await ctx.db.insert('courses', {
					title: 'Test Course',
					description: 'Test Description',
					instructorId,
					createdAt: now,
					updatedAt: now,
				});

				const quizId = await ctx.db.insert('quizzes', {
					courseId,
					title: 'Security Test Quiz',
					passingScore: 80,
					createdAt: now,
				});

				// Add questions with correct answers
				await ctx.db.insert('quizQuestions', {
					quizId,
					question: 'What is 2+2?',
					options: ['3', '4', '5', '6'],
					correctAnswer: 1, // This should NEVER be exposed to students
					explanation: 'Basic math',
					order: 0,
				});

				await ctx.db.insert('quizQuestions', {
					quizId,
					question: 'What is 3+3?',
					options: ['5', '6', '7', '8'],
					correctAnswer: 1,
					explanation: 'Basic math',
					order: 1,
				});

				return { quizId };
			});

			// Get quiz as student
			const quiz = await t.query(api.quizzes.getQuiz, { quizId });

			expect(quiz).toBeDefined();
			expect(quiz?.title).toBe('Security Test Quiz');
			expect(quiz?.questions).toHaveLength(2);

			// CRITICAL SECURITY TEST: Verify correctAnswer NOT in response
			quiz?.questions.forEach(question => {
				expect(question).not.toHaveProperty('correctAnswer');
				expect(question).not.toHaveProperty('explanation');
				expect(question).toHaveProperty('_id');
				expect(question).toHaveProperty('question');
				expect(question).toHaveProperty('options');
				expect(question.options).toHaveLength(4);
			});

			// Verify questions are sorted by order
			expect(quiz?.questions[0].question).toBe('What is 2+2?');
			expect(quiz?.questions[1].question).toBe('What is 3+3?');
		});

		it('should return null for non-existent quiz', async () => {
			const t = convexTest(schema);

			// Create a valid quiz ID, then delete it to test null return
			const nonExistentQuizId = await t.run(async ctx => {
				const instructorId = await ctx.db.insert('users', {
					firstName: 'Dr. Jane',
					lastName: 'Smith',
					email: 'instructor@test.com',
					externalId: 'instructor-clerk-id',
					isInstructor: true,
					isAdmin: false,
				});

				const now = Date.now();
				const courseId = await ctx.db.insert('courses', {
					title: 'Temp Course',
					description: 'Will be deleted',
					instructorId,
					createdAt: now,
					updatedAt: now,
				});

				const quizId = await ctx.db.insert('quizzes', {
					courseId,
					title: 'Temp Quiz',
					passingScore: 80,
					createdAt: now,
				});

				// Delete the quiz to create "not found" scenario
				await ctx.db.delete(quizId);

				return quizId;
			});

			const quiz = await t.query(api.quizzes.getQuiz, { quizId: nonExistentQuizId });

			expect(quiz).toBeNull();
		});
	});

	describe('getModuleQuizzes() query', () => {
		it('should return all quizzes for a module', async () => {
			const t = convexTest(schema);

			// Set up module with multiple quizzes
			const { moduleId } = await t.run(async ctx => {
				const instructorId = await ctx.db.insert('users', {
					firstName: 'Dr. Jane',
					lastName: 'Smith',
					email: 'instructor@test.com',
					externalId: 'instructor-clerk-id',
					isInstructor: true,
					isAdmin: false,
				});

				const now = Date.now();
				const courseId = await ctx.db.insert('courses', {
					title: 'Test Course',
					description: 'Test Description',
					instructorId,
					createdAt: now,
					updatedAt: now,
				});

				const moduleId = await ctx.db.insert('courseModules', {
					courseId,
					title: 'Module 1',
					order: 0,
					createdAt: now,
				});

				// Create 3 quizzes for this module
				await ctx.db.insert('quizzes', {
					courseId,
					moduleId,
					title: 'Quiz 1',
					passingScore: 80,
					createdAt: now,
				});

				await ctx.db.insert('quizzes', {
					courseId,
					moduleId,
					title: 'Quiz 2',
					passingScore: 70,
					createdAt: now,
				});

				await ctx.db.insert('quizzes', {
					courseId,
					moduleId,
					title: 'Quiz 3',
					passingScore: 90,
					createdAt: now,
				});

				return { moduleId };
			});

			const quizzes = await t.query(api.quizzes.getModuleQuizzes, { moduleId });

			expect(quizzes).toHaveLength(3);
			expect(quizzes.map(q => q.title)).toContain('Quiz 1');
			expect(quizzes.map(q => q.title)).toContain('Quiz 2');
			expect(quizzes.map(q => q.title)).toContain('Quiz 3');
		});

		it('should return empty array for module with no quizzes', async () => {
			const t = convexTest(schema);

			const { moduleId } = await t.run(async ctx => {
				const instructorId = await ctx.db.insert('users', {
					firstName: 'Dr. Jane',
					lastName: 'Smith',
					email: 'instructor@test.com',
					externalId: 'instructor-clerk-id',
					isInstructor: true,
					isAdmin: false,
				});

				const now = Date.now();
				const courseId = await ctx.db.insert('courses', {
					title: 'Test Course',
					description: 'Test Description',
					instructorId,
					createdAt: now,
					updatedAt: now,
				});

				const moduleId = await ctx.db.insert('courseModules', {
					courseId,
					title: 'Empty Module',
					order: 0,
					createdAt: now,
				});

				return { moduleId };
			});

			const quizzes = await t.query(api.quizzes.getModuleQuizzes, { moduleId });

			expect(quizzes).toHaveLength(0);
		});
	});

	describe('getCourseQuizzes() query', () => {
		it('should return only course-wide quizzes (excluding module quizzes)', async () => {
			const t = convexTest(schema);

			// Set up course with both course-wide and module quizzes
			const { courseId } = await t.run(async ctx => {
				const instructorId = await ctx.db.insert('users', {
					firstName: 'Dr. Jane',
					lastName: 'Smith',
					email: 'instructor@test.com',
					externalId: 'instructor-clerk-id',
					isInstructor: true,
					isAdmin: false,
				});

				const now = Date.now();
				const courseId = await ctx.db.insert('courses', {
					title: 'Test Course',
					description: 'Test Description',
					instructorId,
					createdAt: now,
					updatedAt: now,
				});

				const moduleId = await ctx.db.insert('courseModules', {
					courseId,
					title: 'Module 1',
					order: 0,
					createdAt: now,
				});

				// Create 2 course-wide quizzes (no moduleId)
				await ctx.db.insert('quizzes', {
					courseId,
					title: 'Course Quiz 1',
					passingScore: 80,
					createdAt: now,
				});

				await ctx.db.insert('quizzes', {
					courseId,
					title: 'Course Quiz 2',
					passingScore: 70,
					createdAt: now,
				});

				// Create 1 module-specific quiz (should be excluded)
				await ctx.db.insert('quizzes', {
					courseId,
					moduleId,
					title: 'Module Quiz',
					passingScore: 90,
					createdAt: now,
				});

				return { courseId };
			});

			const quizzes = await t.query(api.quizzes.getCourseQuizzes, { courseId });

			// Should only return the 2 course-wide quizzes, not the module quiz
			expect(quizzes).toHaveLength(2);
			expect(quizzes.map(q => q.title)).toContain('Course Quiz 1');
			expect(quizzes.map(q => q.title)).toContain('Course Quiz 2');
			expect(quizzes.map(q => q.title)).not.toContain('Module Quiz');

			// Verify all returned quizzes have no moduleId
			quizzes.forEach(quiz => {
				expect(quiz.moduleId).toBeUndefined();
			});
		});

		it('should return empty array for course with no course-wide quizzes', async () => {
			const t = convexTest(schema);

			const { courseId } = await t.run(async ctx => {
				const instructorId = await ctx.db.insert('users', {
					firstName: 'Dr. Jane',
					lastName: 'Smith',
					email: 'instructor@test.com',
					externalId: 'instructor-clerk-id',
					isInstructor: true,
					isAdmin: false,
				});

				const now = Date.now();
				const courseId = await ctx.db.insert('courses', {
					title: 'Test Course',
					description: 'Test Description',
					instructorId,
					createdAt: now,
					updatedAt: now,
				});

				return { courseId };
			});

			const quizzes = await t.query(api.quizzes.getCourseQuizzes, { courseId });

			expect(quizzes).toHaveLength(0);
		});
	});

	describe('Integration: Full quiz creation flow', () => {
		it('should support complete instructor workflow', async () => {
			const t = convexTest(schema);

			// 1. Create instructor and course
			const { courseId } = await t.run(async ctx => {
				const instructorId = await ctx.db.insert('users', {
					firstName: 'Dr. Jane',
					lastName: 'Smith',
					email: 'instructor@test.com',
					externalId: 'instructor-clerk-id',
					isInstructor: true,
					isAdmin: false,
				});

				const now = Date.now();
				const courseId = await ctx.db.insert('courses', {
					title: 'Integration Test Course',
					description: 'Full workflow test',
					instructorId,
					createdAt: now,
					updatedAt: now,
				});

				return { courseId };
			});

			// 2. Instructor creates quiz
			const quizId = await t.withIdentity({ subject: 'instructor-clerk-id' }).mutation(api.quizzes.create, {
				courseId,
				title: 'Final Exam',
				passingScore: 85,
			});

			expect(quizId).toBeDefined();

			// 3. Instructor adds questions
			const questionIds = await t.withIdentity({ subject: 'instructor-clerk-id' }).mutation(api.quizzes.addQuestions, {
				quizId,
				questions: [
					{
						question: 'What is the capital of France?',
						options: ['London', 'Paris', 'Berlin', 'Madrid'],
						correctAnswer: 1,
					},
					{
						question: 'What is 10 * 5?',
						options: ['45', '50', '55', '60'],
						correctAnswer: 1,
					},
				],
			});

			expect(questionIds).toHaveLength(2);

			// 4. Student retrieves quiz (without authentication)
			const quiz = await t.query(api.quizzes.getQuiz, { quizId });

			expect(quiz).toBeDefined();
			expect(quiz?.title).toBe('Final Exam');
			expect(quiz?.passingScore).toBe(85);
			expect(quiz?.questions).toHaveLength(2);

			// 5. SECURITY: Verify no correct answers exposed
			quiz?.questions.forEach(q => {
				expect(q).not.toHaveProperty('correctAnswer');
			});

			// 6. Verify questions in correct order
			expect(quiz?.questions[0].question).toBe('What is the capital of France?');
			expect(quiz?.questions[1].question).toBe('What is 10 * 5?');
		});
	});
});
