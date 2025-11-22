# Story 102.2: Quiz Submission & Grading Backend

**Status:** Draft
**Epic:** EPIC-102 - Quiz Submission & Grading System
**Type:** Backend Feature
**Priority:** P0 - Critical
**Effort:** 6 story points
**Risk:** Medium

---

## Story

As a **student**,
I want to **submit quiz answers and receive immediate grading with detailed feedback**,
so that **I can assess my understanding and track my progress toward course completion**.

---

## Context

Story 102.1 implemented quiz creation (instructors can create quizzes and add questions). This story completes the quiz system by enabling students to submit answers, receive automated grading, and view their quiz history.

**Current State:**

- ✅ Quiz creation system implemented (Story 102.1)
- ✅ `quizAttempts` table defined in schema with indexes (by_user, by_quiz, by_user_quiz)
- ✅ `quizQuestions` table includes `explanation` field for each question
- ❌ No submission endpoint for students
- ❌ No grading logic to compare answers against correctAnswer
- ❌ No query to retrieve quiz attempts or best scores
- ❌ No maxAttempts enforcement

**Dependencies:**

- ✅ Story 102.1 (Quiz Creation) completed
- ✅ Enrollments system implemented (required to verify student enrollment)
- ✅ Quiz schema with correctAnswer field in quizQuestions
- ⏳ Story 102.3 (Quiz Management with maxAttempts field) - can implement after

**Related:** EPIC-102 Quiz Submission & Grading System (25 pts)

---

## Acceptance Criteria

1. **AC1:** Student can submit quiz answers ✅
   - `quizzes.submit()` mutation implemented
   - Accepts quizId and answers array (array of selected option indices)
   - Verifies user is enrolled in course before allowing submission
   - Returns complete grading results immediately

2. **AC2:** System enforces maxAttempts limit ✅
   - Query existing attempts for user + quiz combination
   - Check if count >= quiz.maxAttempts
   - Throw error if limit reached: "Maximum attempts (X) reached for this quiz"
   - Allow unlimited attempts if maxAttempts is null/undefined
   - Note: maxAttempts field added in Story 102.3, but logic implemented here

3. **AC3:** System grades quiz automatically ✅
   - Load quiz questions with correct answers
   - Compare student answers to correctAnswer for each question
   - Calculate score as percentage (correct/total \* 100)
   - Determine pass/fail based on quiz.passingScore
   - Return detailed results array with per-question feedback

4. **AC4:** Quiz results include explanations for ALL questions ✅
   - Results array includes explanation field for every question
   - Show explanation regardless of correct/incorrect answer
   - Use quizQuestions.explanation field (can be null if not provided)
   - Explanations help students learn from both successes and mistakes

5. **AC5:** Quiz attempt is recorded in database ✅
   - Save to quizAttempts table with userId, quizId, answers, score, passed, submittedAt
   - Return attemptId in response
   - Attempts persisted for historical tracking and analytics

6. **AC6:** Student can retrieve their best attempt ✅
   - `quizzes.getBestAttempt()` query implemented
   - Query quizAttempts by userId + quizId
   - Return attempt with highest score
   - Works even if quiz is soft-deleted (deleted flag)
   - Used for progress calculation and certificate eligibility

7. **AC7:** Student can retrieve specific attempt results ✅
   - `quizzes.getAttemptResults()` query implemented
   - Accept attemptId parameter
   - Return full attempt details with graded results
   - Include score, passed status, and per-question breakdown
   - Works with soft-deleted quizzes for historical viewing

8. **AC8:** All tests pass ✅
   - Unit tests for submit() mutation
   - Authorization tests (enrollment verification)
   - maxAttempts enforcement tests (0, 1, 3, unlimited scenarios)
   - Grading accuracy tests (100%, 50%, 0% scenarios)
   - Best attempt selection tests
   - Soft-deleted quiz handling tests
   - 100% test coverage target (Priority 1: Critical functionality)

9. **AC9:** TypeScript types and code quality ✅
   - Proper Convex types used
   - No TypeScript errors
   - Code follows project patterns from Story 102.1
   - Lint passes

---

## Tasks / Subtasks

### Task 1: Implement submit() Mutation (AC1, AC2, AC3, AC4, AC5)

- [ ] **1.1** Authentication and enrollment verification
  - Validate user authentication via ctx.auth.getUserIdentity()
  - Get user via api.users.getByExternalId
  - Load quiz and get courseId
  - Query enrollments table to verify user is enrolled in course
  - Throw error if not enrolled: "Must be enrolled to take this quiz"

- [ ] **1.2** Implement maxAttempts enforcement
  - Query existing attempts: quizAttempts by userId + quizId
  - Count existing attempts
  - Load quiz.maxAttempts field
  - If maxAttempts defined and count >= maxAttempts: throw error
  - Error message: "Maximum attempts (X) reached for this quiz"
  - Allow submission if maxAttempts is null/undefined (unlimited)

- [ ] **1.3** Load quiz questions and grade answers
  - Query quizQuestions by quizId using by_quiz index
  - Sort questions by order field
  - Compare answers array to correctAnswer for each question
  - Build results array with per-question feedback:
    - questionId, question text, selectedAnswer, correctAnswer, isCorrect, explanation
  - Count correct answers

- [ ] **1.4** Calculate score and pass/fail status
  - score = Math.round((correctCount / totalQuestions) \* 100)
  - passed = score >= quiz.passingScore
  - Handle edge case: 0 questions (should not happen, but fail gracefully)

- [ ] **1.5** Save attempt to database
  - Insert into quizAttempts table: userId, quizId, answers, score, passed, submittedAt
  - Return attemptId in response

- [ ] **1.6** Return complete results
  - Return object: { attemptId, score, passed, results, passingScore }
  - results array includes all question feedback with explanations
  - Client uses this to display quiz results screen

- [ ] **1.7** Add comprehensive JSDoc comments
  - Document mutation purpose
  - Describe grading algorithm
  - Note maxAttempts enforcement behavior
  - Include example usage

### Task 2: Implement getBestAttempt() Query (AC6)

- [ ] **2.1** Query user's attempts for quiz
  - Verify authentication
  - Query quizAttempts by userId + quizId using by_user_quiz index
  - Return null if no attempts found

- [ ] **2.2** Find highest scoring attempt
  - Use Array.reduce() to find attempt with maximum score
  - Return complete attempt object
  - Include all fields: attemptId, score, passed, submittedAt

- [ ] **2.3** Handle soft-deleted quizzes
  - Do NOT filter by quiz.deleted flag
  - Students can view their best attempt even if quiz was deleted
  - Used for progress tracking and historical data

- [ ] **2.4** Add JSDoc comments
  - Document query purpose
  - Note soft-delete handling
  - Include example usage

### Task 3: Implement getAttemptResults() Query (AC7)

- [ ] **3.1** Query specific attempt by ID
  - Accept attemptId parameter
  - Load attempt from quizAttempts table
  - Verify ownership: attempt.userId matches current user
  - Throw error if not found or not authorized

- [ ] **3.2** Reconstruct graded results
  - Load quiz and questions
  - Load attempt.answers array
  - Rebuild results array matching submit() format
  - Include: questionId, question, selectedAnswer, correctAnswer, isCorrect, explanation

- [ ] **3.3** Return complete attempt details
  - Return: { attemptId, score, passed, submittedAt, results, passingScore }
  - Used for "View Past Attempt" feature in UI

- [ ] **3.4** Handle soft-deleted quizzes
  - Allow viewing attempts for soft-deleted quizzes
  - Students can review their historical quiz attempts
  - Do NOT filter by quiz.deleted flag

- [ ] **3.5** Add JSDoc comments
  - Document query purpose
  - Describe result reconstruction process
  - Note soft-delete handling

### Task 4: Testing (AC8, AC9)

- [ ] **4.1** Unit tests for submit() mutation
  - Test enrolled student can submit quiz
  - Test non-enrolled user cannot submit
  - Test grading accuracy: 100%, 75%, 50%, 0% scores
  - Test pass/fail determination based on passingScore
  - Test results include explanations for all questions
  - Test attempt is saved to database
  - Test requires authentication

- [ ] **4.2** maxAttempts enforcement tests
  - Test submit succeeds when under limit (1 of 3)
  - Test submit succeeds at limit (3 of 3)
  - Test submit fails when over limit (4 of 3)
  - Test unlimited attempts (maxAttempts = null)
  - Test unlimited attempts (maxAttempts = undefined)
  - Test error message includes attempt count

- [ ] **4.3** Unit tests for getBestAttempt() query
  - Test returns highest scoring attempt
  - Test returns null when no attempts exist
  - Test works with soft-deleted quizzes
  - Test requires authentication

- [ ] **4.4** Unit tests for getAttemptResults() query
  - Test owner can view own attempt
  - Test non-owner cannot view attempt
  - Test results array matches submit() format
  - Test explanations included for all questions
  - Test works with soft-deleted quizzes

- [ ] **4.5** Integration tests
  - Full flow: enroll → take quiz → view results → retake → view best attempt
  - Full flow: reach maxAttempts limit → verify blocked from retaking
  - Full flow: view past attempt after quiz is soft-deleted

- [ ] **4.6** Edge case tests
  - Quiz with 0 questions (should fail gracefully)
  - Answers array length mismatch (too few/too many answers)
  - Quiz not found
  - User not enrolled
  - Concurrent submissions (race condition handling)

- [ ] **4.7** Code quality checks
  - Run TypeScript compilation
  - Run lint
  - Verify 100% test coverage target met
  - Code review against Story 102.1 patterns

---

## Dev Notes

### Architecture Patterns

**Convex Mutation Pattern for Quiz Submission**

```typescript
import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { api } from './_generated/api';
import type { Doc } from './_generated/dataModel';

export const submit = mutation({
	args: {
		quizId: v.id('quizzes'),
		answers: v.array(v.number()), // Array of selected option indices (0-3)
	},
	handler: async (ctx, { quizId, answers }) => {
		// 1. Authentication
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error('Not authenticated');
		}

		// 2. Get user
		const user: Doc<'users'> | null = await ctx.runQuery(api.users.getByExternalId, {
			externalId: identity.subject,
		});

		if (!user) {
			throw new Error('User not found');
		}

		// 3. Load quiz
		const quiz = await ctx.db.get(quizId);
		if (!quiz) {
			throw new Error('Quiz not found');
		}

		// 4. Verify enrollment
		const enrollment = await ctx.db
			.query('enrollments')
			.withIndex('by_user_course', q => q.eq('userId', user._id).eq('courseId', quiz.courseId))
			.first();

		if (!enrollment) {
			throw new Error('Must be enrolled to take this quiz');
		}

		// 5. Check maxAttempts limit
		const existingAttempts = await ctx.db
			.query('quizAttempts')
			.withIndex('by_user_quiz', q => q.eq('userId', user._id).eq('quizId', quizId))
			.collect();

		if (quiz.maxAttempts && existingAttempts.length >= quiz.maxAttempts) {
			throw new Error(`Maximum attempts (${quiz.maxAttempts}) reached for this quiz`);
		}

		// 6. Load questions and grade
		const questions = await ctx.db
			.query('quizQuestions')
			.withIndex('by_quiz', q => q.eq('quizId', quizId))
			.collect();

		const sortedQuestions = questions.sort((a, b) => a.order - b.order);

		let correctCount = 0;
		const results = sortedQuestions.map((q, i) => {
			const isCorrect = q.correctAnswer === answers[i];
			if (isCorrect) correctCount++;

			return {
				questionId: q._id,
				question: q.question,
				selectedAnswer: answers[i],
				correctAnswer: q.correctAnswer,
				isCorrect,
				explanation: q.explanation || null,
			};
		});

		// 7. Calculate score and pass/fail
		const score = Math.round((correctCount / sortedQuestions.length) * 100);
		const passed = score >= quiz.passingScore;

		// 8. Save attempt
		const attemptId = await ctx.db.insert('quizAttempts', {
			userId: user._id,
			quizId,
			answers,
			score,
			passed,
			submittedAt: Date.now(),
		});

		// 9. Return results
		return {
			attemptId,
			score,
			passed,
			results,
			passingScore: quiz.passingScore,
		};
	},
});
```

**Query Pattern for Best Attempt**

```typescript
export const getBestAttempt = query({
	args: { quizId: v.id('quizzes') },
	handler: async (ctx, { quizId }) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			return null;
		}

		const user: Doc<'users'> | null = await ctx.runQuery(api.users.getByExternalId, {
			externalId: identity.subject,
		});

		if (!user) {
			return null;
		}

		const attempts = await ctx.db
			.query('quizAttempts')
			.withIndex('by_user_quiz', q => q.eq('userId', user._id).eq('quizId', quizId))
			.collect();

		if (attempts.length === 0) {
			return null;
		}

		// Return attempt with highest score
		return attempts.reduce((best, current) => (current.score > best.score ? current : best));
	},
});
```

**Query Pattern for Attempt Results**

```typescript
export const getAttemptResults = query({
	args: { attemptId: v.id('quizAttempts') },
	handler: async (ctx, { attemptId }) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error('Not authenticated');
		}

		const user: Doc<'users'> | null = await ctx.runQuery(api.users.getByExternalId, {
			externalId: identity.subject,
		});

		if (!user) {
			throw new Error('User not found');
		}

		// Load attempt
		const attempt = await ctx.db.get(attemptId);
		if (!attempt) {
			throw new Error('Attempt not found');
		}

		// Verify ownership
		if (attempt.userId !== user._id) {
			throw new Error('Not authorized');
		}

		// Load quiz and questions
		const quiz = await ctx.db.get(attempt.quizId);
		if (!quiz) {
			throw new Error('Quiz not found');
		}

		const questions = await ctx.db
			.query('quizQuestions')
			.withIndex('by_quiz', q => q.eq('quizId', attempt.quizId))
			.collect();

		const sortedQuestions = questions.sort((a, b) => a.order - b.order);

		// Reconstruct results
		const results = sortedQuestions.map((q, i) => {
			const selectedAnswer = attempt.answers[i];
			const isCorrect = q.correctAnswer === selectedAnswer;

			return {
				questionId: q._id,
				question: q.question,
				selectedAnswer,
				correctAnswer: q.correctAnswer,
				isCorrect,
				explanation: q.explanation || null,
			};
		});

		return {
			attemptId: attempt._id,
			score: attempt.score,
			passed: attempt.passed,
			submittedAt: attempt.submittedAt,
			results,
			passingScore: quiz.passingScore,
		};
	},
});
```

### Project Structure Notes

**Files to Modify:**

- `convex/quizzes.ts` - Add submit(), getBestAttempt(), getAttemptResults() functions

**Schema Reference:**

- `convex/schema.ts` - Lines 177-184 (quizAttempts schema)
- Indexes: by_user, by_quiz, by_user_quiz

**Testing Files:**

- `convex/__test__/quizzes.test.ts` - Add tests for new mutations/queries

**Existing Patterns to Follow:**

- `convex/quizzes.ts` (Story 102.1) - Authorization pattern, query patterns
- `convex/lessonProgress.ts` - Progress tracking pattern
- `convex/enrollments.ts` - Enrollment verification pattern
- `convex/authHelpers.ts` - Shared authorization helpers (if applicable)

### Dependencies

**Existing Dependencies (no new installs needed):**

- `convex@^1.28.2` - Backend mutations and queries
- `typescript@^5.9.3` - Type safety
- `vitest@4.0.8` - Testing framework
- `convex-test@^0.0.38` - Convex testing utilities

### Testing Strategy

**Unit Tests (Vitest + convex-test):**

- Test each mutation/query in isolation
- Mock Convex context
- Test authorization edge cases (enrollment verification, ownership)
- Test grading accuracy across multiple scenarios
- Test maxAttempts enforcement thoroughly
- Test soft-deleted quiz handling

**Test Coverage Target:**

- 100% coverage (Priority 1: Critical functionality per TESTING-STRATEGY.md)
- Cover all acceptance criteria
- Focus on edge cases: concurrent submissions, race conditions, data integrity

**Manual Testing Checklist:**

- [ ] Enroll in course, take quiz, verify results shown correctly
- [ ] Try to take quiz without enrollment (should fail)
- [ ] Take quiz multiple times, verify best attempt is highest score
- [ ] Reach maxAttempts limit, verify cannot retake
- [ ] View past attempt results, verify matches original submission
- [ ] Soft-delete quiz (Story 102.3), verify can still view past attempts
- [ ] Verify explanations shown for ALL questions (correct and incorrect)

### References

- **Epic:** docs/epics.md - Lines 692-700 (Story 102.2 specifications)
- **Epic Context:** docs/epics.md - Lines 485-741 (EPIC-102: Complete quiz system)
- **PRD:** docs/PRD.md - Lines 278-286, 388-391 (Quiz user journeys)
- **Schema:** convex/schema.ts - Lines 177-184, 245-248 (quizAttempts table and indexes)
- **Testing:** docs/TESTING-STRATEGY.md - Lines 57-221 (Priority 1: 100% coverage)
- **Story 102.1:** docs/stories/story-102.1.md - Quiz creation implementation reference
- **Auth Pattern:** convex/authHelpers.ts - Shared verifyInstructorAccess helper
- **Enrollment Pattern:** convex/enrollments.ts - Enrollment verification queries

---

## Dev Agent Record

### Context Reference

- [Story Context XML](./story-context-102.2.xml) - To be generated

### Agent Model Used

{{agent_model_name_version}}

### Completion Notes List

- [ ] convex/quizzes.ts updated with submit(), getBestAttempt(), getAttemptResults()
- [ ] Enrollment verification implemented
- [ ] maxAttempts enforcement implemented
- [ ] Grading algorithm working correctly
- [ ] Explanations included for ALL questions in results
- [ ] Soft-deleted quiz handling verified
- [ ] All tests passing (unit + integration)
- [ ] TypeScript compilation successful
- [ ] 100% test coverage target achieved

### File List

**Modified:**

- `convex/quizzes.ts` - Added quiz submission and grading functions
- `convex/__test__/quizzes.test.ts` - Added tests for new functionality

---

## Change Log

| Date       | Author             | Changes                |
| ---------- | ------------------ | ---------------------- |
| 2025-11-11 | Bob (Scrum Master) | Initial story creation |
