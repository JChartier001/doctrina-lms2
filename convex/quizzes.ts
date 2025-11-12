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
		// Authentication check
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error('Not authenticated');
		}

		// Load course and verify ownership
		const course = await ctx.db.get(args.courseId);
		if (!course) {
			throw new Error('Course not found');
		}

		// Authorization: verify user is course instructor
		const user = await ctx.db
			.query('users')
			.withIndex('by_externalId', q => q.eq('externalId', identity.subject))
			.first();

		if (!user || course.instructorId !== user._id) {
			throw new Error('Not authorized');
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
				options: v.array(v.string()), // Must be exactly 4 options (validated at app level)
				correctAnswer: v.number(), // Index 0-3 of correct option
				explanation: v.optional(v.string()),
			}),
		),
	},
	handler: async (ctx, args) => {
		// Authentication check
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error('Not authenticated');
		}

		// Load quiz and course to verify ownership
		const quiz = await ctx.db.get(args.quizId);
		if (!quiz) {
			throw new Error('Quiz not found');
		}

		const course = await ctx.db.get(quiz.courseId);
		if (!course) {
			throw new Error('Course not found');
		}

		// Authorization: verify user is course instructor
		const user = await ctx.db
			.query('users')
			.withIndex('by_externalId', q => q.eq('externalId', identity.subject))
			.first();

		if (!user || course.instructorId !== user._id) {
			throw new Error('Not authorized');
		}

		// Bulk insert questions with order preservation
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
