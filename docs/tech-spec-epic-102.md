# Technical Specification: Quiz Submission & Grading System

Date: 2025-11-07
Author: Jen
Epic ID: EPIC-102
Status: Draft

---

## Overview

The Quiz Submission & Grading System enables instructors to create quizzes for their courses and provides students with an interactive assessment experience including instant grading, feedback, and unlimited retake capabilities. This epic implements the backend functionality to support the existing quiz UI components, including the AI quiz generator in the course wizard and the quiz interface in the learning page. The system will track quiz attempts, calculate scores, provide detailed feedback with explanations, and maintain best attempt records for progress tracking.

## Objectives and Scope

**In Scope:**

- Implement `quizzes.create()` mutation for instructors to create quizzes
- Implement `quizzes.addQuestions()` mutation for bulk question insertion
- Implement `quizzes.getQuiz()` query to retrieve quiz with questions (security: no correct answers for students)
- Implement `quizzes.submit()` mutation to grade quiz and return detailed results
- Implement `quizzes.getBestAttempt()` query for progress tracking
- Implement `quizzes.getModuleQuizzes()` query for module-level quiz retrieval
- Quiz grading logic with instant feedback and explanations
- Unlimited retake support with best score tracking
- Authorization: Only instructors can create quizzes for their courses
- Authorization: Only enrolled students can take quizzes

**Out of Scope:**

- AI quiz generation logic (already exists in UI component, uses external API)
- Question randomization or question banks (post-MVP enhancement)
- Timed quizzes or time limits (post-MVP)
- Essay or short-answer questions (only multiple choice for MVP)
- Quiz analytics and reporting (covered in EPIC-107)
- Prerequisite quizzes or conditional content unlocking (post-MVP)

## System Architecture Alignment

**Architecture Components Referenced:**

- **Backend:** Convex serverless functions (mutations and queries)
- **Database:** Convex real-time database with `quizzes`, `quizQuestions`, and `quizAttempts` tables (already in schema)
- **Authentication:** Clerk JWT tokens via Convex `ctx.auth.getUserIdentity()`
- **Frontend:** Next.js 15 App Router with existing quiz UI components
- **State Management:** Convex `useQuery` and `useMutation` hooks

**Architectural Constraints:**

- Must use Convex's row-level security pattern (filter by `userId` from authenticated context)
- Must maintain real-time reactivity for quiz results
- Must follow existing patterns in `convex/courses.ts` and `convex/lessonProgress.ts`
- Security: Never return correct answers to students before submission
- All timestamps stored as Unix epoch milliseconds (`Date.now()`)

**Data Flow:**

1. **Instructor creates quiz** → `quizzes.create()` → Returns quiz ID
2. **Instructor adds questions** → `quizzes.addQuestions()` → Bulk insert questions
3. **Student loads quiz** → `quizzes.getQuiz()` → Returns quiz without correct answers
4. **Student submits answers** → `quizzes.submit()` → Grades, saves attempt, returns results with feedback
5. **Student views best score** → `quizzes.getBestAttempt()` → Returns highest scoring attempt

---

## Detailed Design

### Services and Modules

| Module/Service               | Responsibility                          | Inputs                                     | Outputs                                         | Owner            |
| ---------------------------- | --------------------------------------- | ------------------------------------------ | ----------------------------------------------- | ---------------- |
| **convex/quizzes.ts**        | Core quiz management logic              | Quiz metadata, questions, student answers  | Quiz records, grading results, best attempts    | Backend          |
| **quizzes.create**           | Create new quiz for course/module       | `courseId, moduleId?, title, passingScore` | `quizId: Id<"quizzes">`                         | Backend Mutation |
| **quizzes.addQuestions**     | Bulk add questions to quiz              | `quizId, questions[]`                      | `questionIds: Id<"quizQuestions">[]`            | Backend Mutation |
| **quizzes.getQuiz**          | Get quiz with questions (student-safe)  | `quizId: Id<"quizzes">`                    | Quiz object with questions (no correct answers) | Backend Query    |
| **quizzes.submit**           | Grade quiz and save attempt             | `quizId, answers: number[]`                | `{ attemptId, score, passed, results[] }`       | Backend Mutation |
| **quizzes.getBestAttempt**   | Get highest scoring attempt for student | `quizId: Id<"quizzes">`                    | Best attempt object or null                     | Backend Query    |
| **quizzes.getModuleQuizzes** | Get all quizzes for a module            | `moduleId: Id<"courseModules">`            | Array of quiz objects                           | Backend Query    |
| **course-wizard**            | Instructor quiz creation UI             | AI-generated or manual questions           | Quiz created in database                        | Frontend         |
| **learning-interface**       | Student quiz taking experience          | Quiz ID from lesson                        | Interactive quiz with instant grading           | Frontend         |

---

### Data Models and Contracts

**Existing Schema (no changes required):**

```typescript
// convex/schema.ts
quizzes: defineTable({
  courseId: v.id('courses'),
  moduleId: v.optional(v.id('courseModules')),  // Optional - can be course-wide quiz
  title: v.string(),
  passingScore: v.number(),  // 0-100 percentage
  createdAt: v.number(),
})
  .index('by_course', ['courseId'])
  .index('by_module', ['moduleId']),

quizQuestions: defineTable({
  quizId: v.id('quizzes'),
  question: v.string(),
  options: v.array(v.string()),  // Always 4 options for MVP
  correctAnswer: v.number(),     // 0-3 (index of correct option)
  explanation: v.optional(v.string()),
  order: v.number(),              // Question order in quiz
})
  .index('by_quiz', ['quizId'])
  .index('by_quiz_order', ['quizId', 'order']),

quizAttempts: defineTable({
  userId: v.string(),
  quizId: v.id('quizzes'),
  answers: v.array(v.number()),  // Student's selected answer indices
  score: v.number(),              // 0-100
  passed: v.boolean(),
  submittedAt: v.number(),
})
  .index('by_user', ['userId'])
  .index('by_quiz', ['quizId'])
  .index('by_user_quiz', ['userId', 'quizId']),
```

**Data Integrity Rules:**

- Each quiz must belong to a course (required courseId)
- Quiz can optionally belong to a module (for module-level quizzes)
- Questions must have exactly 4 options (enforced at application level)
- `correctAnswer` must be 0-3 (array index)
- `passingScore` default is 80 (configurable per quiz)
- Student can have unlimited attempts per quiz
- Best attempt is highest score

---

### APIs and Interfaces

**Mutation: quizzes.create**

```typescript
// Request
{
  courseId: Id<"courses">,
  moduleId?: Id<"courseModules">,  // Optional
  title: string,
  passingScore: number  // Default 80
}

// Response
Id<"quizzes">  // ID of created quiz

// Errors
- "Not authenticated" (401) - User not logged in
- "Not authorized" (403) - User is not the course instructor
- "Course not found" (404) - Invalid courseId
```

**Mutation: quizzes.addQuestions**

```typescript
// Request
{
  quizId: Id<"quizzes">,
  questions: Array<{
    question: string,
    options: string[],         // Must be length 4
    correctAnswer: number,     // 0-3
    explanation?: string
  }>
}

// Response
Id<"quizQuestions">[]  // Array of created question IDs

// Errors
- "Not authenticated" (401)
- "Not authorized" (403) - User doesn't own the course
- "Quiz not found" (404)
```

**Query: quizzes.getQuiz**

```typescript
// Request
{
  quizId: Id<"quizzes">
}

// Response
{
  _id: Id<"quizzes">,
  courseId: Id<"courses">,
  moduleId?: Id<"courseModules">,
  title: string,
  passingScore: number,
  questions: Array<{
    id: Id<"quizQuestions">,
    question: string,
    options: string[],
    // NOTE: correctAnswer NOT included for students (security)
  }>
} | null

// Security
- Questions sorted by order field
- correctAnswer field excluded from response (prevents cheating)
```

**Mutation: quizzes.submit**

```typescript
// Request
{
  quizId: Id<"quizzes">,
  answers: number[]  // Array of selected option indices (0-3)
}

// Response
{
  attemptId: Id<"quizAttempts">,
  score: number,           // 0-100
  passed: boolean,
  results: Array<{
    questionId: Id<"quizQuestions">,
    question: string,
    selectedAnswer: number,
    correctAnswer: number,
    isCorrect: boolean,
    explanation?: string
  }>,
  passingScore: number
}

// Side Effects
- Creates quiz attempt record
- Updates user's quiz history
```

**Query: quizzes.getBestAttempt**

```typescript
// Request
{
  quizId: Id<"quizzes">
}

// Response
{
  _id: Id<"quizAttempts">,
  userId: string,
  quizId: Id<"quizzes">,
  score: number,
  passed: boolean,
  submittedAt: number
} | null  // null if no attempts

// Algorithm
- Query all attempts by (userId, quizId)
- Return attempt with highest score
```

---

### Workflows and Sequencing

**Instructor Creates Quiz Flow:**

```
1. Instructor in course wizard OR course edit page
   └─> Clicks "Add Quiz" for a module

2. Frontend: Quiz creation form
   ├─> Title input
   ├─> Passing score slider (default 80%)
   ├─> Choose: AI generate OR manual entry
   └─> If AI: Call OpenAI, get questions → Preview → Edit

3. Backend: quizzes.create
   ├─> Verify user authenticated (ctx.auth.getUserIdentity())
   ├─> Load course → Verify instructorId matches user
   │   └─> If not instructor: throw "Not authorized"
   ├─> Insert quiz: { courseId, moduleId, title, passingScore, createdAt }
   └─> Return quizId

4. Backend: quizzes.addQuestions (bulk)
   ├─> Verify ownership (user owns course)
   ├─> For each question in questions array:
   │   └─> Insert: { quizId, question, options, correctAnswer, explanation, order: index }
   └─> Return array of question IDs

5. Frontend: Success confirmation
   └─> Navigate back to course wizard
   └─> Quiz appears in module curriculum
```

**Student Takes Quiz Flow:**

```
1. Student in learning interface
   └─> Clicks on quiz lesson

2. Frontend: Load quiz
   └─> Call: useQuery(api.quizzes.getQuiz, { quizId })

3. Backend: quizzes.getQuiz
   ├─> Load quiz by ID
   ├─> Load all questions via by_quiz index, sorted by order
   ├─> Map questions to student-safe format (exclude correctAnswer)
   └─> Return quiz object with questions array

4. Frontend: Display quiz interface
   ├─> Render each question with 4 radio button options
   ├─> "Submit Quiz" button (enabled when all questions answered)
   └─> Track selected answers in state: answers[questionIndex] = selectedOption

5. Student clicks "Submit Quiz"
   └─> Call: useMutation(api.quizzes.submit, { quizId, answers })

6. Backend: quizzes.submit
   ├─> Verify user authenticated
   ├─> Load quiz and questions (sorted by order)
   ├─> Grade each question:
   │   ├─> Compare answers[i] === question[i].correctAnswer
   │   └─> Build results array with isCorrect flag
   ├─> Calculate score: (correctCount / totalQuestions) * 100
   ├─> Determine passed: score >= quiz.passingScore
   ├─> Insert quiz attempt: { userId, quizId, answers, score, passed, submittedAt }
   └─> Return: { attemptId, score, passed, results, passingScore }

7. Frontend: Display results
   ├─> Show score and pass/fail status
   ├─> For each question:
   │   ├─> Show student's answer (highlight green if correct, red if wrong)
   │   ├─> Show correct answer
   │   └─> Show explanation (if available)
   └─> Show "Retake Quiz" button (if failed) or "Continue" button (if passed)
```

**Get Best Attempt Flow:**

```
1. Frontend needs to show quiz status
   └─> Call: useQuery(api.quizzes.getBestAttempt, { quizId })

2. Backend: quizzes.getBestAttempt
   ├─> Verify user authenticated
   ├─> Query attempts via by_user_quiz index
   ├─> If no attempts: return null
   ├─> Find attempt with highest score
   └─> Return best attempt object

3. Frontend: Display badge
   └─> "Best Score: 85%" or "Not Attempted"
```

---

## Non-Functional Requirements

### Performance

- **Quiz Loading Time:** < 300ms (p95) from clicking quiz lesson to questions displayed
  - Quiz metadata fetch: < 100ms
  - Questions fetch (10-50 questions): < 200ms
- **Grading Time:** < 500ms (p95) from submission to results displayed
  - Grading logic (10-50 questions): < 300ms
  - Attempt record insertion: < 100ms
  - Results rendering: < 100ms
- **Concurrent Quiz Submissions:** System must handle 100+ students submitting simultaneously
- **Optimistic UI:** Show "Submitting..." state immediately, results appear when ready

**Performance Optimizations:**

- Use indexed queries (`by_quiz`, `by_user_quiz`) to avoid table scans
- Load questions in single query (not one-by-one)
- Batch question inserts in `addQuestions` mutation

### Security

- **Authentication:** All mutations and queries MUST verify `ctx.auth.getUserIdentity()` is non-null
- **Authorization:**
  - **Quiz Creation:** Only course instructor can create quizzes for their course
  - **Quiz Taking:** Only enrolled students can submit quiz attempts
  - **Data Access:** Students can only view their own attempts (filter by `userId`)
- **Data Protection:**
  - **Critical:** `correctAnswer` field MUST NOT be returned to students in `getQuiz` query
  - Correct answers only revealed AFTER submission in grading results
  - Prevent answer tampering: Validate answers array length matches question count
- **Anti-Cheating Measures:**
  - Don't cache correct answers in frontend
  - Grading happens server-side only
  - Question order can be randomized (future enhancement)

### Reliability/Availability

- **Convex Uptime SLA:** 99.9% availability (per Convex platform)
- **Transactional Consistency:** All quiz submissions must be ACID-compliant (guaranteed by Convex)
- **Error Recovery:**
  - If grading fails mid-process, no attempt record is created (transaction rollback)
  - If network fails during submission, student can retry (idempotency: check for duplicate attempts)
- **Data Durability:** All quiz attempts persisted to Convex durable storage with automatic replication

### Observability

- **Logging Requirements:**
  - Log all quiz attempts: `{ userId, quizId, score, passed, timestamp }`
  - Log quiz creations: `{ instructorId, courseId, quizId, questionCount, timestamp }`
  - Log failed submissions: `{ userId, quizId, error, timestamp }`
- **Metrics to Track:**
  - Average quiz score per quiz (instructor analytics)
  - Pass rate (% of attempts that pass)
  - Retake rate (% of students who retake)
  - Average time to complete quiz (for timed quizzes future feature)
- **Error Monitoring:**
  - Track "Not authorized" errors (may indicate access control bugs)
  - Track grading failures (should be rare)
  - Alert on quiz data corruption (missing questions, invalid answers)

---

## Dependencies and Integrations

**Core Dependencies (from package.json):**

- **convex:** ^1.28.2 - Real-time database and serverless functions
- **next:** 16.0.1 - Frontend framework
- **react:** ^19.2.0 - UI library
- **@clerk/nextjs:** ^6.34.5 - Authentication integration
- **convex-helpers:** ^0.1.104 - Helper utilities (useQueryWithStatus pattern)

**Convex Schema Dependencies:**

- `quizzes` table - Quiz metadata (already in schema)
- `quizQuestions` table - Quiz questions (already in schema)
- `quizAttempts` table - Student submissions (already in schema)
- `courses` table - Course ownership verification
- `enrollments` table - Student enrollment verification

**Integration Points:**

1. **Progress Tracking Integration (EPIC-101):**
   - Quiz completion (passing quiz) may count toward course progress
   - Optional: Require quiz pass before marking module complete
   - Future: Link quiz results to certificate eligibility

2. **AI Quiz Generation (External API):**
   - UI component calls OpenAI to generate questions
   - Generated questions passed to `addQuestions` mutation
   - No backend AI logic required (handled in course wizard UI)

3. **Analytics Integration (Future - EPIC-107):**
   - Quiz performance data feeds instructor analytics
   - Average scores, pass rates, common wrong answers

**External Service Dependencies:**

- None (all operations contained within Convex backend)
- AI quiz generation uses OpenAI but handled in frontend (not this epic)

---

## Acceptance Criteria (Authoritative)

1. **AC-102.1:** Instructor can create quiz for their course
   - **Given:** Instructor is editing a course they own
   - **When:** Instructor creates a quiz with title and passing score
   - **Then:** Quiz is created in database AND appears in course curriculum

2. **AC-102.2:** Instructor can add multiple-choice questions to quiz
   - **Given:** Instructor has created a quiz
   - **When:** Instructor adds questions with 4 options and marks correct answer
   - **Then:** Questions are saved in database in specified order

3. **AC-102.3:** Student can load quiz without seeing correct answers
   - **Given:** Student is enrolled in course with quizzes
   - **When:** Student clicks on quiz lesson
   - **Then:** Quiz displays with questions and options BUT correct answers are hidden

4. **AC-102.4:** Student can submit quiz and receive instant grading
   - **Given:** Student has answered all quiz questions
   - **When:** Student clicks "Submit Quiz"
   - **Then:** Quiz is graded instantly AND results show score, pass/fail, and correct answers with explanations

5. **AC-102.5:** Quiz grading is accurate
   - **Given:** Quiz has 10 questions and student answers 8 correctly
   - **When:** Quiz is submitted
   - **Then:** Score is calculated as 80% AND passed status matches passing score threshold

6. **AC-102.6:** Student can retake quiz unlimited times
   - **Given:** Student has failed a quiz (score < passing score)
   - **When:** Student clicks "Retake Quiz"
   - **Then:** Student can take quiz again AND new attempt is recorded

7. **AC-102.7:** Best quiz score is tracked
   - **Given:** Student has taken quiz 3 times with scores: 60%, 75%, 90%
   - **When:** System retrieves best attempt
   - **Then:** Best attempt shows 90% score

8. **AC-102.8:** Only course instructor can create quizzes
   - **Given:** User is logged in but not the course instructor
   - **When:** User attempts to create quiz for course
   - **Then:** Error is returned: "Not authorized"

9. **AC-102.9:** Only enrolled students can take quizzes
   - **Given:** Student is not enrolled in course
   - **When:** Student attempts to submit quiz
   - **Then:** Error is returned: "Not enrolled in this course"

10. **AC-102.10:** Quiz results include detailed feedback
    - **Given:** Student submits quiz
    - **When:** Results are displayed
    - **Then:** Each question shows: student's answer, correct answer, whether correct, and explanation (if available)

---

## Traceability Mapping

| Acceptance Criteria | Spec Section                    | Component/API               | Test Idea                                                    |
| ------------------- | ------------------------------- | --------------------------- | ------------------------------------------------------------ |
| AC-102.1            | APIs - create                   | `quizzes.create()`          | Unit test: Instructor creates quiz, verify record created    |
| AC-102.2            | APIs - addQuestions             | `quizzes.addQuestions()`    | Unit test: Add 10 questions, verify order preserved          |
| AC-102.3            | APIs - getQuiz, Security        | `quizzes.getQuiz()`         | Unit test: Verify correctAnswer field excluded from response |
| AC-102.4            | Workflows - Submit Quiz         | `quizzes.submit()`          | Integration test: Submit quiz, verify results returned       |
| AC-102.5            | APIs - submit, Grading Logic    | Grading algorithm           | Unit test: 8/10 correct = 80%, verify calculation            |
| AC-102.6            | Data Models - Unlimited Retakes | `quizAttempts` table        | Integration test: Submit 3 times, verify 3 attempt records   |
| AC-102.7            | APIs - getBestAttempt           | `quizzes.getBestAttempt()`  | Unit test: 3 attempts (60%, 75%, 90%), verify returns 90%    |
| AC-102.8            | Security - Authorization        | `create()` ownership check  | Unit test: Non-instructor tries to create, verify error      |
| AC-102.9            | Security - Enrollment           | `submit()` enrollment check | Unit test: Non-enrolled student submits, verify error        |
| AC-102.10           | Workflows - Results Display     | `submit()` results format   | Integration test: Verify results include all required fields |

---

## Risks, Assumptions, Open Questions

**Risks:**

1. **Risk:** Students could inspect network traffic to see correct answers
   - **Likelihood:** Medium
   - **Impact:** High (cheating, invalidates assessment)
   - **Mitigation:** Never send correct answers to frontend before submission; grading server-side only; consider randomizing question order (future)

2. **Risk:** Large quizzes (50+ questions) may cause slow grading
   - **Likelihood:** Low
   - **Impact:** Medium (poor UX, timeout errors)
   - **Mitigation:** Test with 50-question quiz; optimize grading logic; consider async grading for very large quizzes

3. **Risk:** Student loses answers if browser crashes during quiz
   - **Likelihood:** Low
   - **Impact:** Medium (student frustration)
   - **Mitigation:** Implement auto-save to localStorage (future enhancement); show "Save Draft" button

**Assumptions:**

1. **Assumption:** All questions are multiple choice with exactly 4 options
   - **Validation:** Confirmed in schema design
   - **Impact if wrong:** Would require different question types and grading logic

2. **Assumption:** Students can retake quizzes unlimited times with no penalty
   - **Validation:** Confirm with Product team
   - **Impact if wrong:** Would require attempt limits or time delays

3. **Assumption:** Best score is used for progress/completion (not latest score)
   - **Validation:** Confirm with Product team
   - **Impact if wrong:** Would change `getBestAttempt` to return latest instead

**Open Questions:**

1. **Question:** Should quiz pass be required to mark lesson complete?
   - **Decision needed from:** Product Manager
   - **Impact:** Changes integration between EPIC-101 and EPIC-102

2. **Question:** Should quizzes have time limits?
   - **Decision needed from:** Product Manager
   - **Impact:** Would require timer logic and timeout handling

3. **Question:** How many retakes should be allowed?
   - **Decision needed from:** Product Manager
   - **Impact:** May require attempt limit enforcement and cooldown periods

---

## Test Strategy Summary

**Unit Tests (Convex Functions):**

- Test `create()` with valid instructor → verify quiz record created
- Test `create()` with non-instructor → verify error thrown
- Test `addQuestions()` with valid questions → verify questions inserted in order
- Test `getQuiz()` returns quiz without correct answers
- Test `submit()` with all correct answers → verify 100% score and passed=true
- Test `submit()` with mixed answers → verify accurate percentage calculation
- Test `submit()` with all wrong answers → verify 0% score and passed=false
- Test `getBestAttempt()` with multiple attempts → verify highest score returned
- Test `getBestAttempt()` with no attempts → verify returns null

**Integration Tests:**

- Test full flow: create quiz → add questions → student loads → student submits → verify results
- Test retake flow: submit quiz (fail) → retake → verify new attempt recorded
- Test security: student tries to load quiz for course they're not enrolled in
- Test authorization: non-instructor tries to create quiz

**End-to-End Tests (Playwright):**

- Test instructor quiz creation in course wizard
- Test student quiz taking experience: load → answer questions → submit → view results
- Test retake functionality: fail quiz → retake → pass → verify best score shown

**Performance Tests:**

- Benchmark grading with 10, 25, 50 questions
- Load test: 100 concurrent students submitting quizzes
- Verify quiz loading < 300ms

**Manual Testing Checklist:**

- [ ] Instructor creates quiz with AI-generated questions
- [ ] Instructor creates quiz with manual questions
- [ ] Student loads quiz → verify questions display
- [ ] Student submits all correct → verify 100% and passed
- [ ] Student submits all wrong → verify 0% and failed
- [ ] Student retakes quiz → verify both attempts recorded
- [ ] Verify best score displays correctly
- [ ] Verify correct answers NOT visible before submission

---

**Status:** Ready for Story Breakdown
**Next Steps:** Run `*create-story` workflow to generate implementation stories from this tech spec
