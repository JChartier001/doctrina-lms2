# Story 102.1: Implement Quiz Creation and Retrieval Backend

**Status:** ContextReadyDraft
**Epic:** EPIC-102 - Quiz Submission & Grading System
**Type:** Backend Feature
**Priority:** P0 - Critical
**Effort:** 13 story points
**Risk:** Medium

---

## Story

As an **instructor**,
I want to **create quizzes with multiple-choice questions for my courses**,
so that **I can assess student knowledge and provide structured learning assessments**.

---

## Context

The course wizard includes an AI quiz generator UI component and the learning interface has quiz display components, but there's no backend to save quiz data or retrieve it for students. This story implements the backend mutations and queries to support quiz creation (instructor-side) and quiz retrieval (student-side). Quiz submission and grading will be handled in a separate story (102.2).

**Current State:**
- Quiz UI components exist but are not connected to backend
- `quizzes`, `quizQuestions`, `quizAttempts` tables already in schema
- No quiz backend functions implemented

**Dependencies:**
- ✅ Schema tables already defined (quizzes, quizQuestions, quizAttempts)
- ✅ Course ownership pattern established in existing code
- ✅ Authentication via Clerk integrated

**Related:** EPIC-102 Quiz System - Creation Phase (10 pts)

---

## Acceptance Criteria

1. **AC1:** Instructor can create quiz for their course ✅
   - `quizzes.create()` mutation implemented
   - Verifies user is course instructor
   - Creates quiz record with title, passing score, course/module IDs
   - Returns quiz ID

2. **AC2:** Instructor can add questions to quiz ✅
   - `quizzes.addQuestions()` mutation implemented
   - Bulk inserts multiple questions
   - Preserves question order
   - Validates ownership (instructor owns course)

3. **AC3:** Student can retrieve quiz without correct answers ✅
   - `quizzes.getQuiz()` query implemented
   - Returns quiz with questions array
   - **Security:** Excludes `correctAnswer` field from response
   - Questions sorted by order

4. **AC4:** Get module quizzes query implemented ✅
   - `quizzes.getModuleQuizzes()` query returns all quizzes for a module
   - Used for module-level quiz listing
   - Returns array of quiz objects

5. **AC5:** Authorization enforced ✅
   - Only course instructor can create quizzes
   - Only course instructor can add questions
   - Throws "Not authorized" error for non-instructors

6. **AC6:** All tests pass ✅
   - Unit tests for create, addQuestions, getQuiz
   - Security tests verify no correct answers leaked
   - Authorization tests verify instructor-only access
   - 100% test pass rate

7. **AC7:** TypeScript types and code quality ✅
   - Proper Convex types used
   - No TypeScript errors
   - Code follows project patterns
   - Lint passes

---

## Tasks / Subtasks

### Task 1: Create convex/quizzes.ts File (AC1, AC2)

- [ ] **1.1** Implement `create()` mutation
  - Validate user authentication
  - Load course and verify instructorId matches user
  - Insert quiz record with all fields
  - Return quiz ID

- [ ] **1.2** Implement `addQuestions()` mutation
  - Validate quiz ownership (user owns course)
  - Bulk insert questions with order preservation
  - Validate question format (4 options, correctAnswer 0-3)
  - Return array of question IDs

- [ ] **1.3** Add comprehensive JSDoc comments
  - Document each function's purpose
  - Include parameter descriptions
  - Note security considerations

### Task 2: Implement Query Functions (AC3, AC4)

- [ ] **2.1** Implement `getQuiz()` query
  - Load quiz by ID
  - Load questions via by_quiz index
  - Sort questions by order field
  - **Security:** Map questions to exclude correctAnswer
  - Return student-safe quiz object

- [ ] **2.2** Implement `getModuleQuizzes()` query
  - Query quizzes by moduleId via by_module index
  - Return array of quiz objects
  - Used for module quiz listing

### Task 3: Authorization and Security (AC5)

- [ ] **3.1** Implement instructor ownership verification
  - Helper function or inline check
  - Load course, compare instructorId
  - Throw "Not authorized" if mismatch

- [ ] **3.2** Security review
  - Verify correctAnswer never exposed to students
  - Review all query responses
  - Ensure authentication checks in all functions

### Task 4: Testing (AC6, AC7)

- [ ] **4.1** Unit tests for create() mutation
  - Test valid instructor creates quiz
  - Test non-instructor throws error
  - Test missing course throws error

- [ ] **4.2** Unit tests for addQuestions() mutation
  - Test bulk question insertion
  - Test question order preservation
  - Test ownership validation

- [ ] **4.3** Unit tests for getQuiz() query
  - Test returns quiz with questions
  - **Critical:** Verify correctAnswer excluded
  - Test question sorting by order

- [ ] **4.4** Unit tests for getModuleQuizzes() query
  - Test returns all quizzes for module
  - Test empty array when no quizzes

- [ ] **4.5** Integration tests
  - Full flow: create → add questions → retrieve
  - Authorization: non-instructor attempts
  - Security: verify no answer leakage

- [ ] **4.6** Code quality checks
  - Run TypeScript compilation
  - Run lint
  - Verify 100% test pass rate

---

## Dev Notes

### Architecture Patterns

**Convex Mutation Pattern**
```typescript
import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const create = mutation({
  args: {
    courseId: v.id('courses'),
    moduleId: v.optional(v.id('courseModules')),
    title: v.string(),
    passingScore: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    // Verify ownership
    const course = await ctx.db.get(args.courseId);
    if (!course) throw new Error('Course not found');

    if (course.instructorId !== identity.subject) {
      throw new Error('Not authorized');
    }

    return await ctx.db.insert('quizzes', {
      ...args,
      createdAt: Date.now(),
    });
  },
});
```

**Security Pattern - Never Expose Correct Answers**
```typescript
export const getQuiz = query({
  args: { quizId: v.id('quizzes') },
  handler: async (ctx, { quizId }) => {
    const quiz = await ctx.db.get(quizId);
    if (!quiz) return null;

    const questions = await ctx.db
      .query('quizQuestions')
      .withIndex('by_quiz', q => q.eq('quizId', quizId))
      .collect();

    return {
      ...quiz,
      questions: questions
        .sort((a, b) => a.order - b.order)
        .map(q => ({
          id: q._id,
          question: q.question,
          options: q.options,
          // SECURITY: Do NOT include correctAnswer
        })),
    };
  },
});
```

### Project Structure Notes

**File to Create:**
- `convex/quizzes.ts` - Primary implementation file (est. 150-200 lines)

**Schema Reference:**
- `convex/schema.ts` - Lines 187-218 (quizzes, quizQuestions, quizAttempts tables)

**Testing Files:**
- `convex/__test__/quizzes.test.ts` - Comprehensive test suite

**Existing Patterns to Follow:**
- `convex/courses.ts` - Authorization pattern (instructor ownership)
- `convex/lessonProgress.ts` - Authentication pattern
- `convex/enrollments.ts` - Query patterns with indexes

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
- Test authorization edge cases
- Verify security (no answer leakage)

**Test Coverage Target:**
- 85% coverage (Priority 2: Core Features per TESTING-STRATEGY.md)
- 100% coverage on authorization logic
- 100% coverage on security-critical code (correctAnswer exclusion)

**Manual Testing Checklist:**
- [ ] Create quiz via course wizard
- [ ] Add AI-generated questions
- [ ] Add manual questions
- [ ] Load quiz as student
- [ ] Verify correct answers not visible
- [ ] Verify questions display in order

### References

- **Tech Spec:** docs/tech-spec-epic-102.md - Complete API specifications
- **PRD:** docs/PRD.md - F5: Course Learning Interface (lines 704-755)
- **Architecture:** docs/ARCHITECTURE.md - Mutation patterns (lines 203-220)
- **Testing:** docs/TESTING-STRATEGY.md - Core Features testing (85% target)
- **Schema:** convex/schema.ts - Lines 187-218 (quiz tables)

---

## Dev Agent Record

### Context Reference

- [Story Context XML](./story-context-102.1.xml) - Generated 2025-11-07

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Completion Notes List

- [ ] convex/quizzes.ts created with all mutations/queries
- [ ] Authorization implemented (instructor-only quiz creation)
- [ ] Security verified (correctAnswer never exposed to students)
- [ ] All tests passing (unit + integration)
- [ ] TypeScript compilation successful

### File List

**Created:**
- `convex/quizzes.ts` - Quiz mutations and queries
- `convex/__test__/quizzes.test.ts` - Test suite

---

## Change Log

| Date       | Author             | Changes                |
| ---------- | ------------------ | ---------------------- |
| 2025-11-07 | Bob (Scrum Master) | Initial story creation |
