/**
 * Quiz System - Backend Mutations and Queries
 *
 * Implements quiz creation, question management, and quiz retrieval
 * for the course learning interface.
 *
 * Security Considerations:
 * - Only course instructors can create quizzes and add questions
 * - Correct answers NEVER exposed to students via getQuiz() query
 * - All mutations require authentication and authorization
 *
 * @see convex/schema.ts - Quiz table definitions (quizzes, quizQuestions, quizAttempts)
 * @see docs/tech-spec-epic-102.md - Complete API specifications
 */

import { v } from 'convex/values';

import type { Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';
import { verifyInstructorAccess } from './authHelpers';

/**
 * Create a new quiz for a course or module
 *
 * Authorization: Only course instructor can create quizzes
 *
 * @param courseId - Course to attach quiz to
 * @param moduleId - Optional module (if quiz is module-specific)
 * @param title - Quiz title
 * @param passingScore - Percentage required to pass (0-100)
 * @returns Quiz ID
 * @throws "Not authenticated" if user not logged in
 * @throws "Not authorized" if user is not course instructor
 * @throws "Course not found" if invalid courseId
 */
export const create = mutation({
	args: {
		courseId: v.id('courses'),
		moduleId: v.optional(v.id('courseModules')),
		title: v.string(),
		passingScore: v.number(),
	},
	handler: async (ctx, args) => {
		if (args.passingScore < 0 || args.passingScore > 100) {
			throw new Error('Passing score must be between 0 and 100');
		}

		if (!args.title.trim()) {
			throw new Error('Quiz title cannot be empty');
		}

		await verifyInstructorAccess(ctx, args.courseId);

		// If moduleId provided, validate module exists and belongs to course
		if (args.moduleId) {
			const courseModule = await ctx.db.get(args.moduleId);
			if (!courseModule) {
				throw new Error('Module not found');
			}
			if (courseModule.courseId !== args.courseId) {
				throw new Error('Module does not belong to the specified course');
			}
		}

		// Create quiz record
		const quizId = await ctx.db.insert('quizzes', {
			courseId: args.courseId,
			moduleId: args.moduleId,
			title: args.title,
			passingScore: args.passingScore,
			createdAt: Date.now(),
		});

		return quizId;
	},
});

/**
 * Add questions to a quiz (bulk operation)
 *
 * Authorization: Only course instructor can add questions
 *
 * @param quizId - Quiz to add questions to
 * @param questions - Array of question objects with text, options, correct answer, and optional explanation
 * @returns Array of created question IDs
 * @throws "Not authenticated" if user not logged in
 * @throws "Not authorized" if user is not course instructor
 * @throws "Quiz not found" if invalid quizId
 */
export const addQuestions = mutation({
	args: {
		quizId: v.id('quizzes'),
		questions: v.array(
			v.object({
				question: v.string(),
				options: v.array(v.string()), // Must be exactly 4 options (validated in handler)
				correctAnswer: v.number(), // Index 0-3 of correct option (validated in handler)
				explanation: v.optional(v.string()),
			}),
		),
	},
	handler: async (ctx, args) => {
		// FAIL-FAST: Validate inputs before database operations
		// Validate at least one question provided
		if (args.questions.length === 0) {
			throw new Error('At least one question is required');
		}

		// PRE-VALIDATE ALL questions to prevent partial insertions
		for (let i = 0; i < args.questions.length; i++) {
			const questionData = args.questions[i];

			// Validate question text is not empty
			if (!questionData.question.trim()) {
				throw new Error(`Question ${i + 1}: Question text cannot be empty`);
			}

			// Validate exactly 4 options
			if (questionData.options.length !== 4) {
				throw new Error(`Question ${i + 1}: Must have exactly 4 options, got ${questionData.options.length}`);
			}

			// Validate each option is not empty
			for (let j = 0; j < questionData.options.length; j++) {
				if (!questionData.options[j].trim()) {
					throw new Error(`Question ${i + 1}, Option ${j + 1}: Option text cannot be empty`);
				}
			}

			// Validate correctAnswer is within valid range (0-3)
			if (questionData.correctAnswer < 0 || questionData.correctAnswer > 3) {
				throw new Error(
					`Question ${i + 1}: Correct answer index must be between 0 and 3, got ${questionData.correctAnswer}`,
				);
			}
		}

		// Load quiz
		const quiz = await ctx.db.get(args.quizId);
		if (!quiz) {
			throw new Error('Quiz not found');
		}

		// Verify instructor authorization
		await verifyInstructorAccess(ctx, quiz.courseId);

		// All validations passed - bulk insert questions with order preservation
		const questionIds: Id<'quizQuestions'>[] = [];

		for (let i = 0; i < args.questions.length; i++) {
			const questionData = args.questions[i];

			const questionId = await ctx.db.insert('quizQuestions', {
				quizId: args.quizId,
				question: questionData.question,
				options: questionData.options,
				correctAnswer: questionData.correctAnswer,
				explanation: questionData.explanation,
				order: i, // Preserve question order using array index
			});

			questionIds.push(questionId);
		}

		return questionIds;
	},
});

/**
 * Get quiz with questions for student view
 *
 * SECURITY CRITICAL: This query NEVER returns correctAnswer field
 * Correct answers are only revealed after quiz submission in grading results
 *
 * @param quizId - Quiz to retrieve
 * @returns Quiz with questions array (WITHOUT correct answers)
 * @returns null if quiz not found
 */
export const getQuiz = query({
	args: { quizId: v.id('quizzes') },
	handler: async (ctx, { quizId }) => {
		const quiz = await ctx.db.get(quizId);
		if (!quiz) return null;

		// Load questions via by_quiz index
		const questions = await ctx.db
			.query('quizQuestions')
			.withIndex('by_quiz', q => q.eq('quizId', quizId))
			.collect();

		// SECURITY: Map questions to exclude correctAnswer field
		// Sort by order to maintain quiz structure
		const studentSafeQuestions = questions
			.sort((a, b) => a.order - b.order)
			.map(q => ({
				_id: q._id,
				question: q.question,
				options: q.options,
				order: q.order,
				// CRITICAL: correctAnswer field explicitly excluded
				// explanation field excluded (shown after submission)
			}));

		return {
			_id: quiz._id,
			courseId: quiz.courseId,
			moduleId: quiz.moduleId,
			title: quiz.title,
			passingScore: quiz.passingScore,
			createdAt: quiz.createdAt,
			questions: studentSafeQuestions,
		};
	},
});

/**
 * Get all quizzes for a module
 *
 * Used for module-level quiz listing in learning interface
 *
 * @param moduleId - Module to get quizzes for
 * @returns Array of quiz objects (metadata only, no questions)
 */
export const getModuleQuizzes = query({
	args: { moduleId: v.id('courseModules') },
	handler: async (ctx, { moduleId }) => {
		const quizzes = await ctx.db
			.query('quizzes')
			.withIndex('by_module', q => q.eq('moduleId', moduleId))
			.collect();

		return quizzes;
	},
});

/**
 * Get all quizzes for a course (course-wide quizzes, not module-specific)
 *
 * Used for course-level quiz listing
 *
 * @param courseId - Course to get quizzes for
 * @returns Array of quiz objects where moduleId is undefined
 */
export const getCourseQuizzes = query({
	args: { courseId: v.id('courses') },
	handler: async (ctx, { courseId }) => {
		const quizzes = await ctx.db
			.query('quizzes')
			.withIndex('by_course', q => q.eq('courseId', courseId))
			.collect();

		// Filter to only course-wide quizzes (no moduleId)
		return quizzes.filter(quiz => !quiz.moduleId);
	},
});
