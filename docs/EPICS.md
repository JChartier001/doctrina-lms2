# Epic Planning Document

## Doctrina LMS2 - Implementation Roadmap

**Version:** 2.0
**Last Updated:** January 2025
**Owner:** Product & Engineering Teams

---

## Current State Assessment

### UI/Frontend Status: 90% Complete ✅

- All Next.js 15 App Router pages built
- All components created (course cards, wizards, dashboards, analytics)
- Routing and navigation complete
- Forms and user interactions ready
- Mobile responsive

### Backend Status: 45% Complete ⚠️

**What's Implemented:**

- ✅ User authentication sync (Clerk → Convex)
- ✅ Basic course CRUD (list, get, create, update, delete)
- ✅ **Course structure (courseModules, lessons)** - Sprint 1 complete
- ✅ **Enrollments & access control** - Sprint 1 complete
- ✅ **Stripe checkout & webhook** - Sprint 1 complete
- ✅ Purchases tracking
- ✅ Certificates (generate, verify, list)
- ✅ Live Sessions (full CRUD + join/leave)
- ✅ Notifications (CRUD + mark read)
- ✅ Favorites (add, remove, list)
- ✅ Resources (CRUD + search)
- ✅ Search (unified, advanced, suggestions)
- ✅ Analytics (instructor, platform, student - basic)
- ✅ Recommendations (courses, resources, pathways, trending)

**What's Missing:**

- ❌ Progress tracking (lesson completion marking)
- ❌ Quiz submission and grading
- ❌ Course reviews (schema exists, functions not implemented)
- ❌ Discussions/community forums
- ❌ Instructor verification workflow
- ❌ Instructor payouts (Stripe Connect)
- ❌ Course-specific analytics enhancements
- ❌ CE credit management

---

## Epic Definitions

Epics represent **backend implementation work** to support the **existing UI**. Each epic focuses on a functional area that's missing or incomplete.

### Epic Priority Levels

- **P0 (Critical):** Blocks core user flows (enroll → learn → complete)
- **P1 (High):** Needed for MVP launch but not blocking
- **P2 (Medium):** Post-MVP enhancements
- **P3 (Low):** Nice-to-have features

---

## P0 Epics (Critical for MVP)

### EPIC-109: Replace Mock Data with Real Convex Queries

**Status:** 🔴 Not Started
**Priority:** P0 - CRITICAL
**Effort:** 23 story points (UI replacement only)
**Target Sprint:** Sprint 2-3 (Weeks 3-6)

#### Problem

The UI was built with mock/hardcoded data for rapid prototyping. Even though Convex functions now exist, 8 files still use mock data instead of real queries.

#### Mock Data Locations

1. **HIGH PRIORITY:**
   - `/lib/course-migration.ts` - Course detail mock data (3 pts)
   - `/app/courses/[id]/learn/page.tsx` - Learning page mock (3 pts)
   - `/app/dashboard/progress/page.tsx` - Progress dashboard mock (8 pts)

2. **MEDIUM PRIORITY:**
   - `/app/checkout/[courseId]/page.tsx` - Checkout course mock (2 pts)
   - `/app/instructor/dashboard/page.tsx` - Fallback courses (2 pts)
   - `/app/dashboard/page.tsx` - Certificate mock (2 pts)
   - `/app/profile/page.tsx` - Profile data mock (3 pts)

3. **LOW PRIORITY (Post-MVP):**
   - `/app/community/page.tsx` - Community mock (requires EPIC-106 backend)

#### Implementation Strategy

**Phase 1: Quick Wins (Sprint 2)** - Replace where Convex queries exist:

- Use `courses.getWithCurriculum()` in course detail
- Use `courses.get()` in checkout
- Use `enrollments.getMyEnrollments()` in dashboards
- Use `certificates.listForUser()` for certificates
- **Effort:** 12 story points

**Phase 2: After Progress Implementation (Sprint 3)** - Requires new functions:

- Use `lessonProgress.getUserProgress()` in progress dashboard
- Simplify progress page (remove goals/achievements mock)
- **Effort:** 11 story points

**Phase 3: Post-MVP** - Requires discussion backend:

- Community page (EPIC-106)

#### Acceptance Criteria

- [ ] All 8 files updated to use real Convex queries
- [ ] No hardcoded course/user data remains
- [ ] Loading states added where needed
- [ ] Error states handled properly
- [ ] All pages function with real data

#### Technical Notes

- **Pattern:** Replace `const data = mockObject` with `const data = useQuery(api.xxx)`
- **Loading:** Handle `undefined` state while query loads
- **Errors:** Handle `null` state when data not found
- **Types:** Ensure TypeScript types match Convex schema

**See MOCK-DATA-REPLACEMENT.md for detailed implementation guide**

---

### EPIC-110: Testing & Quality Assurance

**Status:** 🔴 Not Started
**Priority:** P0 - CRITICAL
**Effort:** 21 story points
**Target Sprint:** Sprint 2 (Weeks 3-4)

#### Problem

Only 3 out of 25 Convex backend files have test coverage (lessonProgress, certificates, triggers). Critical functionality including course creation, enrollment, and payment processing is untested. This creates high risk for production bugs and makes refactoring dangerous.

#### What Exists (Tests)

- ✅ `convex/__test__/lessonProgress.test.ts` - 25 tests, 100% coverage
- ✅ `convex/__test__/certificates.test.ts` - 15 tests, 100% coverage
- ✅ `convex/__test__/triggers.test.ts` - 7 tests, 100% coverage
- ✅ Vitest testing framework configured
- ✅ convex-test library installed

#### What's Missing (Tests for 22 files)

**CRITICAL - Priority 1 (100% coverage required):**

- ❌ `convex/__test__/purchases.test.ts` - Money handling
- ❌ `convex/__test__/payments.test.ts` - Payment flows
- ❌ `convex/__test__/enrollments.test.ts` - Access control

**CORE - Priority 2 (85% coverage target):**

- ❌ `convex/__test__/courses.test.ts` - Course CRUD
- ❌ `convex/__test__/courseModules.test.ts` - Module management
- ❌ `convex/__test__/lessons.test.ts` - Lesson management
- ❌ `convex/__test__/users.test.ts` - User management

**SECONDARY - Priority 3 (70% coverage target):**

- ❌ favorites, liveSessions, notifications, recommendations, resources, search, analytics

#### Implementation Tasks

**Task 1: Critical Financial Tests** (8 pts)

- Test purchase creation, refunds, access control
- Test payment processing flows
- Test enrollment creation and verification
- **100% coverage required per TESTING-STRATEGY.md**

**Task 2: Core Course Creation Tests** (8 pts)

- Test course CRUD operations
- Test module and lesson management
- Test ordering and authorization
- **85% coverage target**

**Task 3: User Management Tests** (5 pts)

- Test user CRUD and Clerk sync
- Test role-based permissions
- Test query functions
- **85% coverage target**

**Estimated Test Count:** ~190 tests

#### Acceptance Criteria

- [ ] **ALL Convex backend files: 100% test coverage**
- [ ] Critical financial code: 100% (purchases, payments, enrollments)
- [ ] Core features: 100% (courses, modules, lessons, users)
- [ ] Secondary features: 100% (favorites, notifications, resources, etc.)
- [ ] All tests pass (100% pass rate)
- [ ] Coverage report validates 100% across all files
- [ ] TypeScript compilation successful

#### Technical Notes

**Testing Framework:**

- Vitest for test execution
- convex-test for Convex mocking
- Follow patterns from lessonProgress.test.ts

**Coverage Target:**

- **ALL Convex backend files: 100% coverage**
- No exceptions - comprehensive coverage for all functions
- Test every mutation, query, and edge case

**Blocker for:** Safe implementation of quizzes, reviews, and all future features

**Stories:**

- **Story 110.1:** Fix TypeScript Errors Across Codebase (existing)
- **Story 110.2:** Add Comprehensive Test Coverage for Core Convex Functions (21 pts)
- **Story 110.3:** Create Updated Seed Data for Manual Testing (5 pts)

---

### EPIC-101: Lesson Progress Tracking System

**Status:** 🔴 Not Started
**Priority:** P0 - CRITICAL
**Effort:** 13 story points
**Target Sprint:** Sprint 2 (Weeks 3-4)

#### Problem

The `/courses/[id]/learn` page has "Mark as Complete" buttons but no backend to persist completion. The `/dashboard` shows progress bars but they're stuck at 0%. Certificates can't be generated because completion detection doesn't work.

#### What Exists (UI)

- ✅ Learning interface with lessons and modules
- ✅ "Mark as Complete" button on each lesson
- ✅ Progress bar showing completion percentage
- ✅ "Continue Learning" functionality
- ✅ Dashboard showing enrolled courses

#### What Exists (Backend)

- ✅ `lessonProgress` table defined in schema
- ✅ `enrollments.updateProgress()` function ready to update progress
- ✅ Schema supports tracking

#### What's Missing (Backend)

- ❌ `lessonProgress.markComplete()` mutation
- ❌ `lessonProgress.unmarkComplete()` mutation (if user wants to undo)
- ❌ `lessonProgress.getUserProgress()` query
- ❌ `lessonProgress.getNextIncompleteLesson()` query (for "Continue Learning")
- ❌ Progress calculation logic
- ❌ Certificate trigger at 100% completion

#### Implementation Tasks

**Task 1: Create lessonProgress.ts** (8 pts)

```typescript
// convex/lessonProgress.ts

export const markComplete = mutation({
	args: {
		lessonId: v.id('lessons'),
	},
	handler: async (ctx, { lessonId }) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new Error('Not authenticated');

		// Check if already marked
		const existing = await ctx.db
			.query('lessonProgress')
			.withIndex('by_user_lesson', q => q.eq('userId', identity.subject).eq('lessonId', lessonId))
			.first();

		if (existing) return existing._id; // Already complete

		// Verify user is enrolled in course
		const lesson = await ctx.db.get(lessonId);
		const module = await ctx.db.get(lesson.moduleId);

		const enrollment = await ctx.db
			.query('enrollments')
			.withIndex('by_user_course', q => q.eq('userId', identity.subject).eq('courseId', module.courseId))
			.first();

		if (!enrollment) {
			throw new Error('Not enrolled in this course');
		}

		// Mark lesson complete
		const progressId = await ctx.db.insert('lessonProgress', {
			userId: identity.subject,
			lessonId,
			completedAt: Date.now(),
		});

		// Recalculate course progress
		await ctx.runMutation(api.lessonProgress.recalculateProgress, {
			enrollmentId: enrollment._id,
		});

		return progressId;
	},
});

export const recalculateProgress = mutation({
	args: { enrollmentId: v.id('enrollments') },
	handler: async (ctx, { enrollmentId }) => {
		const enrollment = await ctx.db.get(enrollmentId);

		// Get all lessons for this course
		const modules = await ctx.db
			.query('courseModules')
			.withIndex('by_course', q => q.eq('courseId', enrollment.courseId))
			.collect();

		let totalLessons = 0;
		for (const module of modules) {
			const lessons = await ctx.db
				.query('lessons')
				.withIndex('by_module', q => q.eq('moduleId', module._id))
				.collect();
			totalLessons += lessons.length;
		}

		// Get completed lessons
		const allLessons = []; // Collect all lesson IDs
		for (const module of modules) {
			const lessons = await ctx.db
				.query('lessons')
				.withIndex('by_module', q => q.eq('moduleId', module._id))
				.collect();
			allLessons.push(...lessons.map(l => l._id));
		}

		// Count completed
		let completedCount = 0;
		for (const lessonId of allLessons) {
			const progress = await ctx.db
				.query('lessonProgress')
				.withIndex('by_user_lesson', q => q.eq('userId', enrollment.userId).eq('lessonId', lessonId))
				.first();
			if (progress) completedCount++;
		}

		const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

		const completedAt = progressPercent === 100 ? Date.now() : null;

		// Update enrollment
		await ctx.db.patch(enrollmentId, {
			progressPercent,
			completedAt,
		});

		// Trigger certificate if complete
		if (completedAt) {
			await ctx.scheduler.runAfter(0, api.certificates.generate, {
				userId: enrollment.userId,
				courseId: enrollment.courseId,
			});
		}

		return { progressPercent, completedAt };
	},
});

export const getUserProgress = query({
	args: { courseId: v.id('courses') },
	handler: async (ctx, { courseId }) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) return null;

		// Get enrollment
		const enrollment = await ctx.db
			.query('enrollments')
			.withIndex('by_user_course', q => q.eq('userId', identity.subject).eq('courseId', courseId))
			.first();

		if (!enrollment) return null;

		// Get all lessons for course
		const modules = await ctx.db
			.query('courseModules')
			.withIndex('by_course', q => q.eq('courseId', courseId))
			.collect();

		const allLessons = [];
		for (const module of modules) {
			const lessons = await ctx.db
				.query('lessons')
				.withIndex('by_module', q => q.eq('moduleId', module._id))
				.collect();
			allLessons.push(...lessons);
		}

		// Get completed lesson IDs
		const progressRecords = await ctx.db
			.query('lessonProgress')
			.withIndex('by_user', q => q.eq('userId', identity.subject))
			.collect();

		const completedLessonIds = new Set(progressRecords.map(p => p.lessonId));

		return {
			enrollmentId: enrollment._id,
			total: allLessons.length,
			completed: completedLessonIds.size,
			percent: enrollment.progressPercent,
			completedLessonIds: Array.from(completedLessonIds),
		};
	},
});

export const getNextIncompleteLesson = query({
	args: { courseId: v.id('courses') },
	handler: async (ctx, { courseId }) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) return null;

		// Get all modules and lessons in order
		const modules = await ctx.db
			.query('courseModules')
			.withIndex('by_course', q => q.eq('courseId', courseId))
			.collect();

		const sortedModules = modules.sort((a, b) => a.order - b.order);

		for (const module of sortedModules) {
			const lessons = await ctx.db
				.query('lessons')
				.withIndex('by_module', q => q.eq('moduleId', module._id))
				.collect();

			const sortedLessons = lessons.sort((a, b) => a.order - b.order);

			for (const lesson of sortedLessons) {
				// Check if complete
				const progress = await ctx.db
					.query('lessonProgress')
					.withIndex('by_user_lesson', q => q.eq('userId', identity.subject).eq('lessonId', lesson._id))
					.first();

				if (!progress) {
					return lesson._id; // First incomplete lesson
				}
			}
		}

		// All lessons complete, return first lesson
		return sortedModules[0]?.lessons?.[0]?._id || null;
	},
});
```

**Acceptance Criteria:**

- [ ] Student can mark lesson as complete
- [ ] Progress updates in real-time (optimistic UI)
- [ ] Progress percentage calculated correctly
- [ ] Certificate generated at 100% completion
- [ ] "Continue Learning" navigates to next incomplete lesson
- [ ] Progress persists across sessions

**UI Pages Affected:**

- `/courses/[id]/learn` - Mark complete button works
- `/dashboard` - Progress bars show actual progress
- `/dashboard/progress` - Detailed progress view works
- `/profile/certificates` - Certificates appear after completion

---

### EPIC-102: Quiz Submission & Grading System

**Status:** 🔴 Not Started
**Priority:** P0 - CRITICAL
**Effort:** 21 story points
**Target Sprint:** Sprint 2-3 (Weeks 3-6)

#### Problem

The course wizard has an AI quiz generator component (`course-wizard/ai-quiz-generator.tsx`) and the learning interface expects quizzes, but there's no backend to save quiz questions or grade submissions.

#### What Exists (UI)

- ✅ AI quiz generator component (creates questions via AI)
- ✅ Quiz interface components (multiple choice display)
- ✅ Quiz results display
- ✅ Analytics components for quiz performance

#### What Exists (Backend)

- ✅ `quizzes`, `quizQuestions`, `quizAttempts` tables in schema

#### What's Missing (Backend)

- ❌ `quizzes.create()` mutation
- ❌ `quizzes.addQuestion()` mutation (or bulk add)
- ❌ `quizzes.getQuiz()` query (returns quiz with questions)
- ❌ `quizzes.submit()` mutation (grade and return results)
- ❌ `quizzes.getBestAttempt()` query
- ❌ `quizzes.getModuleQuizzes()` query

#### Implementation Tasks

**Task 1: Create quizzes.ts** (13 pts)

```typescript
// convex/quizzes.ts

export const create = mutation({
	args: {
		courseId: v.id('courses'),
		moduleId: v.optional(v.id('courseModules')),
		title: v.string(),
		passingScore: v.number(), // Default 80
	},
	handler: async (ctx, args) => {
		// Verify instructor owns course
		const identity = await ctx.auth.getUserIdentity();
		const course = await ctx.db.get(args.courseId);

		if (course.instructorId !== identity?.subject) {
			throw new Error('Not authorized');
		}

		return await ctx.db.insert('quizzes', {
			...args,
			createdAt: Date.now(),
		});
	},
});

export const addQuestions = mutation({
	args: {
		quizId: v.id('quizzes'),
		questions: v.array(
			v.object({
				question: v.string(),
				options: v.array(v.string()),
				correctAnswer: v.number(),
				explanation: v.optional(v.string()),
			}),
		),
	},
	handler: async (ctx, { quizId, questions }) => {
		// Verify ownership
		const quiz = await ctx.db.get(quizId);
		const course = await ctx.db.get(quiz.courseId);
		const identity = await ctx.auth.getUserIdentity();

		if (course.instructorId !== identity?.subject) {
			throw new Error('Not authorized');
		}

		// Add all questions
		const questionIds = [];
		for (let i = 0; i < questions.length; i++) {
			const id = await ctx.db.insert('quizQuestions', {
				quizId,
				...questions[i],
				order: i,
			});
			questionIds.push(id);
		}

		return questionIds;
	},
});

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
					// Don't return correctAnswer to students (security)
				})),
		};
	},
});

export const submit = mutation({
	args: {
		quizId: v.id('quizzes'),
		answers: v.array(v.number()), // Array of selected option indices
	},
	handler: async (ctx, { quizId, answers }) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new Error('Not authenticated');

		const quiz = await ctx.db.get(quizId);
		const questions = await ctx.db
			.query('quizQuestions')
			.withIndex('by_quiz', q => q.eq('quizId', quizId))
			.collect();

		const sortedQuestions = questions.sort((a, b) => a.order - b.order);

		// Grade quiz
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
				explanation: q.explanation,
			};
		});

		const score = Math.round((correctCount / questions.length) * 100);
		const passed = score >= quiz.passingScore;

		// Save attempt
		const attemptId = await ctx.db.insert('quizAttempts', {
			userId: identity.subject,
			quizId,
			answers,
			score,
			passed,
			submittedAt: Date.now(),
		});

		return {
			attemptId,
			score,
			passed,
			results,
			passingScore: quiz.passingScore,
		};
	},
});

export const getBestAttempt = query({
	args: { quizId: v.id('quizzes') },
	handler: async (ctx, { quizId }) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) return null;

		const attempts = await ctx.db
			.query('quizAttempts')
			.withIndex('by_user_quiz', q => q.eq('userId', identity.subject).eq('quizId', quizId))
			.collect();

		if (attempts.length === 0) return null;

		// Return best score
		return attempts.reduce((best, current) => (current.score > best.score ? current : best));
	},
});
```

**Story Breakdown:**

**Story 102.1: Create Quiz System** (10 pts) - ✅ **COMPLETED**

- Instructor can create quiz (title, passingScore, courseId, moduleId)
- Instructor can add questions with options and correct answers
- Students/instructors can retrieve quiz (security: no correctAnswer exposed to students)
- Queries: getQuiz(), getModuleQuizzes(), getCourseQuizzes()
- Files: convex/quizzes.ts (create, addQuestions mutations)

**Story 102.2: Quiz Submission & Grading Backend** (6 pts) - ⏳ **BACKLOG**

- Students submit quiz answers with maxAttempts enforcement (default: 3)
- System grades quiz automatically and records attempt with score
- Students view results with explanations for ALL questions (correct and incorrect)
- Students retrieve best attempt (works with soft-deleted quizzes)
- Students retrieve specific attempt results
- Mutations: submit()
- Queries: getBestAttempt(), getAttemptResults()
- Test Coverage: 100%

**Story 102.3: Quiz Management Backend** (4 pts) - ⏳ **BACKLOG**

- Schema migration: Add maxAttempts (default: 3), deleted, deletedAt fields to quizzes table
- Instructors update quiz details (title, passingScore, moduleId, maxAttempts)
- Instructors soft-delete quiz (sets deleted=true, preserves data for student attempts)
- Instructors restore soft-deleted quiz (sets deleted=false)
- Queries filter out deleted quizzes by default (with option to include)
- Mutations: update(), remove() [soft delete], restore()
- Test Coverage: 100%

**Story 102.4a: Quiz Creation UI Enhancements** (2 pts) - ⏳ **BACKLOG**

- Add explanation textarea field to AI Quiz Generator component
- Add quiz settings form in course wizard (passingScore slider 0-100%, maxAttempts input)
- Update QuizQuestion interface to include explanation?: string field
- Display explanation in generated question preview
- Files: components/course-wizard/ai-quiz-generator.tsx
- Test Coverage: 85%

**Story 102.4b: Quiz Taking/Results UI** (3 pts) - ⏳ **BACKLOG**

- Build quiz taking interface in learning page (display questions, radio buttons, submit)
- Build results display component (score, pass/fail, correct/incorrect per question, explanations for ALL)
- Show attempt tracking ("Attempt X of Y" or "Unlimited attempts")
- Show "Retake Quiz" button if attempts remaining, disable if maxAttempts reached
- Show "View Best Attempt" link and best score badge if multiple attempts exist
- Integrate with quizzes.submit(), quizzes.getAttemptResults() backend APIs
- Handle soft-deleted quizzes gracefully
- Test Coverage: 85%

**Total EPIC-102:** 25 story points (revised from 21)

**Implementation Order:** Backend first (102.2, 102.3), then UI (102.4a, 102.4b)

**Acceptance Criteria:**

- [ ] Instructor can create quiz from wizard
- [ ] Instructor can add questions (AI-generated or manual)
- [ ] Student can load quiz and see questions
- [ ] Student can submit answers
- [ ] Quiz graded instantly with feedback
- [ ] Can retake quiz unlimited times
- [ ] Best score tracked
- [ ] Passed quiz unlocks next content (if required)

---

### EPIC-103: Course Reviews & Ratings

**Status:** 🔴 Not Started
**Priority:** P0 - CRITICAL
**Effort:** 8 story points
**Target Sprint:** Sprint 3 (Weeks 5-6)

#### Problem

The `/courses/[id]` page has a Reviews tab but shows no data. Course cards show rating/review count but values are hardcoded or null.

#### What Exists (UI)

- ✅ Reviews tab on course detail page
- ✅ Review submission form
- ✅ Star rating component
- ✅ Review display component

#### What Exists (Backend)

- ✅ `courseReviews` table in schema

#### What's Missing (Backend)

- ❌ `courseReviews.create()` mutation
- ❌ `courseReviews.list()` query
- ❌ `courseReviews.update()` mutation (edit review)
- ❌ `courseReviews.remove()` mutation
- ❌ `courseReviews.hide()` mutation (admin moderation)
- ❌ Average rating calculation in `courses.list()` query

#### Implementation Tasks

**Task 1: Create courseReviews.ts** (5 pts)

```typescript
// convex/courseReviews.ts

export const create = mutation({
	args: {
		courseId: v.id('courses'),
		rating: v.number(), // 1-5
		content: v.string(),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new Error('Not authenticated');

		// Verify user is enrolled
		const enrollment = await ctx.db
			.query('enrollments')
			.withIndex('by_user_course', q => q.eq('userId', identity.subject).eq('courseId', args.courseId))
			.first();

		if (!enrollment) {
			throw new Error('Must be enrolled to review');
		}

		// Check if already reviewed
		const existing = await ctx.db
			.query('courseReviews')
			.withIndex('by_user_course', q => q.eq('userId', identity.subject).eq('courseId', args.courseId))
			.first();

		if (existing) {
			throw new Error('Already reviewed this course');
		}

		// Create review
		return await ctx.db.insert('courseReviews', {
			userId: identity.subject,
			courseId: args.courseId,
			rating: args.rating,
			content: args.content,
			createdAt: Date.now(),
			hidden: false,
		});
	},
});

export const list = query({
	args: { courseId: v.id('courses') },
	handler: async (ctx, { courseId }) => {
		const reviews = await ctx.db
			.query('courseReviews')
			.withIndex('by_course', q => q.eq('courseId', courseId))
			.filter(q => q.eq(q.field('hidden'), false))
			.order('desc')
			.collect();

		// Populate user details
		return await Promise.all(
			reviews.map(async review => {
				const user = await ctx.db
					.query('users')
					.withIndex('by_externalId', q => q.eq('externalId', review.userId))
					.first();

				return {
					...review,
					user: {
						name: user ? `${user.firstName} ${user.lastName}` : 'Anonymous',
						image: user?.profilePhotoUrl || user?.image,
					},
				};
			}),
		);
	},
});

export const hide = mutation({
	args: { reviewId: v.id('courseReviews') },
	handler: async (ctx, { reviewId }) => {
		// Verify admin
		const identity = await ctx.auth.getUserIdentity();
		const user = await ctx.db
			.query('users')
			.withIndex('by_externalId', q => q.eq('externalId', identity?.subject || ''))
			.first();

		if (!user?.isAdmin) {
			throw new Error('Admin access required');
		}

		await ctx.db.patch(reviewId, { hidden: true });
	},
});
```

**Task 2: Update courses.list() to include real ratings** (3 pts)

- Aggregate courseReviews to calculate average rating
- Update course card display logic

**Acceptance Criteria:**

- [ ] Student can submit review after enrollment
- [ ] Review appears on course page immediately
- [ ] Can only review once per course
- [ ] Average rating calculated correctly
- [ ] Review count accurate
- [ ] Admin can hide inappropriate reviews

---

## P1 Epics (High Priority for MVP)

### EPIC-104: Instructor Verification Workflow

**Status:** 🔴 Not Started
**Priority:** P1 - HIGH
**Effort:** 21 story points
**Target Sprint:** Sprint 3 (Weeks 5-6)

#### Problem

The `/instructor/verification` page exists but has no backend. There's no admin workflow to approve/reject instructors.

#### What Exists (UI)

- ✅ `/instructor/verification` - Application form
- ✅ Document upload components
- ✅ (Assumed) Admin review interface

#### What's Missing (Backend)

- ❌ `instructorApplications` table in schema
- ❌ `instructorApplications.submit()` mutation
- ❌ `instructorApplications.list()` query (admin)
- ❌ `instructorApplications.approve()` mutation (admin)
- ❌ `instructorApplications.reject()` mutation (admin)
- ❌ Update `users.isInstructor` on approval

#### Schema Needed

```typescript
instructorApplications: defineTable({
  userId: v.string(),
  status: v.union(
    v.literal('pending'),
    v.literal('documents_requested'),
    v.literal('under_review'),
    v.literal('approved'),
    v.literal('rejected'),
    v.literal('expired')
  ),

  // License info
  licenseType: v.string(),
  licenseNumber: v.string(),
  licenseState: v.string(),
  licenseExpiry: v.string(),
  licenseFileId: v.optional(v.id('_storage')),
  licenseVerified: v.boolean(),

  // Insurance info
  insuranceProvider: v.string(),
  insuranceFileId: v.optional(v.id('_storage')),
  insuranceVerified: v.boolean(),

  // Other documents
  resumeFileId: v.optional(v.id('_storage')),
  headshotFileId: v.optional(v.id('_storage')),

  // Experience
  yearsExperience: v.number(),
  specialties: v.array(v.string()),
  bio: v.string(),

  // Application lifecycle
  submittedAt: v.number(),
  reviewedAt: v.optional(v.number()),
  approvedAt: v.optional(v.number()),
  rejectionReason: v.optional(v.string()),
  reviewerNotes: v.optional(v.string()),
})
  .index('by_user', ['userId'])
  .index('by_status', ['status']),
```

**Acceptance Criteria:**

- [ ] Prospective instructor can submit application
- [ ] Documents upload to Convex storage
- [ ] Admin can view pending applications
- [ ] Admin can verify license (manual check)
- [ ] Admin can approve/reject
- [ ] Approval sets `users.isInstructor = true`
- [ ] Email notifications sent (via Resend)

---

### EPIC-105: Instructor Payouts (Stripe Connect)

**Status:** 🔴 Not Started
**Priority:** P1 - HIGH
**Effort:** 21 story points
**Target Sprint:** Sprint 4 (Weeks 7-8)

#### Problem

The `/instructor/dashboard` earnings tab exists but instructors can't connect bank accounts or request payouts.

#### What Exists (UI)

- ✅ Earnings dashboard with revenue charts
- ✅ Payout request button
- ✅ Payout history table

#### What's Missing (Backend)

- ❌ `payouts` table in schema
- ❌ `payouts.connectStripe()` action (Stripe Connect onboarding)
- ❌ `payouts.requestPayout()` mutation
- ❌ `payouts.processPayout()` action (Stripe transfer)
- ❌ `payouts.list()` query
- ❌ Earnings calculation logic

#### Schema Needed

```typescript
payouts: defineTable({
  instructorId: v.string(),
  amount: v.number(),
  stripeTransferId: v.optional(v.string()),
  status: v.union(
    v.literal('pending'),
    v.literal('approved'),
    v.literal('processing'),
    v.literal('completed'),
    v.literal('failed'),
    v.literal('rejected')
  ),
  requestedAt: v.number(),
  processedAt: v.optional(v.number()),
  completedAt: v.optional(v.number()),
  notes: v.optional(v.string()),
})
  .index('by_instructor', ['instructorId'])
  .index('by_status', ['status']),
```

**Acceptance Criteria:**

- [ ] Instructor can connect Stripe Express account
- [ ] Earnings calculated correctly (revenue - commission - fees)
- [ ] Instructor can request payout (min $50)
- [ ] Admin can approve/deny payout
- [ ] Payout transfers via Stripe Connect
- [ ] Payout history shows all transactions

---

## P2 Epics (Medium Priority - Post-MVP)

### EPIC-106: Discussion Forums & Community

**Status:** 🔴 Not Started
**Priority:** P2 - MEDIUM
**Effort:** 21 story points
**Target Sprint:** Sprint 5 (Weeks 9-10)

#### Problem

The `/community` and `/community/topic/[id]` pages exist but use mock data.

#### What's Missing

- ❌ `discussions` table
- ❌ `discussionReplies` table
- ❌ Complete discussion CRUD
- ❌ Reply threading
- ❌ Upvote/downvote system

**Deferred to post-MVP**

---

### EPIC-107: Enhanced Instructor Analytics

**Status:** 🔴 Not Started
**Priority:** P2 - MEDIUM
**Effort:** 13 story points
**Target Sprint:** Sprint 5 (Weeks 9-10)

#### Problem

The `/instructor/courses/[id]/analytics` page exists but some metrics may be missing or need enhancement.

#### What Exists

- ✅ `analytics.getInstructorAnalytics()` - Basic metrics

#### What May Need Enhancement

- Course-specific engagement metrics
- Drop-off point analysis
- Student cohort analysis
- Revenue trend calculations

**Deferred to post-MVP** - Basic analytics already implemented

---

### EPIC-108: CE Credit Management

**Status:** 🔴 Not Started
**Priority:** P2 - MEDIUM
**Effort:** 13 story points
**Target Sprint:** Sprint 6 (Weeks 11-12)

#### Problem

Instructors can't submit CE accreditation information. CE badges don't display on courses.

#### What's Missing

- ❌ CE accreditation fields in `courses` table
- ❌ `courses.submitCEAccreditation()` mutation
- ❌ Admin verification workflow
- ❌ CE certificate template enhancement

**Deferred to post-MVP**

---

## Implementation Roadmap

### Sprint 2 (Weeks 3-4) - P0 Epics

**Goal:** Complete learning experience with progress and quizzes

**Tasks:**

- EPIC-101: Lesson Progress Tracking (13 pts)
- EPIC-102: Quiz System (partial - creation) (10 pts)

**Total:** 23 points

**Deliverable:** Students can complete lessons, track progress, take quizzes

---

### Sprint 3 (Weeks 5-6) - P0 Epics

**Goal:** Reviews, instructor verification, quiz grading

**Tasks:**

- EPIC-102: Quiz System (complete - submission/grading) (11 pts)
- EPIC-103: Course Reviews (8 pts)
- EPIC-104: Instructor Verification (partial) (13 pts)

**Total:** 32 points

**Deliverable:** Students can submit reviews, instructors can get verified, quiz system complete

---

### Sprint 4 (Weeks 7-8) - P1 Epics

**Goal:** Instructor payouts, verification complete

**Tasks:**

- EPIC-104: Instructor Verification (complete) (8 pts)
- EPIC-105: Instructor Payouts (21 pts)

**Total:** 29 points

**Deliverable:** Instructors can receive payments, full verification workflow

---

### MVP Launch: End of Sprint 4 (Week 8)

**What's Complete:**

- ✅ Course creation with curriculum
- ✅ Student enrollment and payment
- ✅ Course learning with progress tracking
- ✅ Quizzes and assessments
- ✅ Certificates
- ✅ Course reviews
- ✅ Instructor verification
- ✅ Instructor payouts

**What's Deferred:**

- Discussions/community (P2)
- Enhanced analytics (P2)
- CE credit management (P2)
- Live sessions (already implemented but not priority)

---

## Epic Dependency Map

```
SPRINT 1 (Already Complete):
- Course Structure ✅
- Enrollments ✅
- Stripe Checkout ✅

SPRINT 2:
EPIC-101 (Progress Tracking) ← depends on enrollments
EPIC-102 (Quizzes - creation) ← depends on course structure

SPRINT 3:
EPIC-102 (Quizzes - grading) ← depends on quiz creation
EPIC-103 (Reviews) ← depends on enrollments
EPIC-104 (Instructor Verification) ← independent

SPRINT 4:
EPIC-105 (Payouts) ← depends on purchases, instructor verification
```

---

## Files to Create/Modify

### Sprint 2:

- **Create:** `convex/lessonProgress.ts`
- **Create:** `convex/quizzes.ts`

### Sprint 3:

- **Create:** `convex/courseReviews.ts`
- **Create:** `convex/instructorApplications.ts`
- **Modify:** `convex/users.ts` (add approval function)
- **Modify:** `convex/schema.ts` (add instructorApplications table)

### Sprint 4:

- **Create:** `convex/payouts.ts`
- **Modify:** `convex/schema.ts` (add payouts table)

---

**Document Status:** ✅ Complete - Reflects Current State
**Next Steps:** Begin Sprint 2 - Implement Progress Tracking & Quiz System
