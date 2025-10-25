# Technical Specification: Lesson Progress Tracking System

Date: 2025-10-25
Author: Jen
Epic ID: EPIC-101
Status: Draft

---

## Overview

The Lesson Progress Tracking System enables students to mark lessons as complete, tracks their overall course progress in real-time, and automatically triggers certificate generation upon 100% completion. This epic addresses the critical gap between the existing frontend learning interface (which includes "Mark as Complete" buttons and progress bars) and the backend persistence layer. Currently, the UI exists but progress tracking is non-functional, causing progress bars to remain at 0% and preventing certificate generation. This implementation will complete the core learning experience loop: enrollment → learning → progress tracking → completion → certification.

## Objectives and Scope

**In Scope:**

- Implement `lessonProgress.markComplete()` mutation for marking individual lessons as complete
- Implement `lessonProgress.recalculateProgress()` mutation to update enrollment progress percentage
- Implement `lessonProgress.getUserProgress()` query to retrieve progress data for UI display
- Implement `lessonProgress.getNextIncompleteLesson()` query for "Continue Learning" functionality
- Automatic certificate generation trigger when a student reaches 100% course completion
- Real-time progress updates using Convex reactivity for instant UI feedback
- Progress persistence across sessions with enrollment-level progress percentage caching

**Out of Scope:**

- Video watch-time tracking (progress is based on lesson completion only)
- Quiz completion requirements (handled separately in EPIC-102)
- Assignment submissions (not part of MVP)
- Progress analytics and reporting dashboards (covered in EPIC-107)
- Undo/reset progress functionality (future enhancement)
- Progress export or history tracking (post-MVP)

## System Architecture Alignment

**Architecture Components Referenced:**

- **Backend:** Convex serverless functions (mutations and queries)
- **Database:** Convex real-time database with `lessonProgress` and `enrollments` tables
- **Authentication:** Clerk JWT tokens via Convex `ctx.auth.getUserIdentity()`
- **Frontend:** Next.js 15 App Router with React 19 client components
- **State Management:** Convex `useQuery` and `useMutation` hooks with optimistic updates

**Architectural Constraints:**

- Must use Convex's row-level security pattern (filter by `userId` from authenticated context)
- Must maintain real-time reactivity (no polling or manual refresh required)
- Must follow existing patterns in `convex/enrollments.ts` and `convex/courses.ts`
- Certificate generation must use Convex scheduler for asynchronous processing
- All timestamps stored as Unix epoch milliseconds (`Date.now()`)

**Data Flow:**

1. Student clicks "Mark as Complete" → Frontend calls `lessonProgress.markComplete()`
2. Backend verifies enrollment → Creates progress record → Triggers recalculation
3. Recalculation counts completed lessons → Updates `enrollments.progressPercent`
4. If 100% complete → Schedules `certificates.generate()` action
5. UI receives real-time update via Convex subscription → Progress bar updates instantly

---

## Detailed Design

### Services and Modules

| Module/Service                             | Responsibility                    | Inputs                              | Outputs                                             | Owner              |
| ------------------------------------------ | --------------------------------- | ----------------------------------- | --------------------------------------------------- | ------------------ |
| **convex/lessonProgress.ts**               | Core progress tracking logic      | Lesson IDs, user identity from auth | Progress records, completion status                 | Backend            |
| **lessonProgress.markComplete**            | Mark a single lesson complete     | `lessonId: Id<"lessons">`           | `progressId: Id<"lessonProgress">`                  | Backend Mutation   |
| **lessonProgress.recalculateProgress**     | Recalculate course-level progress | `enrollmentId: Id<"enrollments">`   | `{ progressPercent: number, completedAt?: number }` | Backend Mutation   |
| **lessonProgress.getUserProgress**         | Get progress summary for a course | `courseId: Id<"courses">`           | Progress object with completed lesson IDs           | Backend Query      |
| **lessonProgress.getNextIncompleteLesson** | Find next lesson to watch         | `courseId: Id<"courses">`           | `lessonId: Id<"lessons"> \| null`                   | Backend Query      |
| **app/courses/[id]/learn**                 | Learning interface UI             | Course ID from route params         | Interactive lesson player with progress             | Frontend Page      |
| **components/lesson-sidebar**              | Progress visualization            | Course modules and lessons          | Collapsible sidebar with checkmarks                 | Frontend Component |

---

### Data Models and Contracts

**Existing Schema (no changes required):**

```typescript
// convex/schema.ts (Sprint 2: Progress Tracking)
lessonProgress: defineTable({
  userId: v.string(),              // Clerk external ID
  lessonId: v.id('lessons'),       // Reference to lesson
  completedAt: v.number(),         // Unix epoch timestamp
})
  .index('by_user', ['userId'])
  .index('by_lesson', ['lessonId'])
  .index('by_user_lesson', ['userId', 'lessonId']),  // Unique constraint

enrollments: defineTable({
  userId: v.string(),
  courseId: v.id('courses'),
  purchaseId: v.id('purchases'),
  enrolledAt: v.number(),
  completedAt: v.optional(v.number()),  // Set when progressPercent reaches 100
  progressPercent: v.number(),          // 0-100, calculated value
})
  .index('by_user_course', ['userId', 'courseId']),
```

**Data Integrity Rules:**

- Each `(userId, lessonId)` pair appears at most once in `lessonProgress` (enforced by index)
- `progressPercent` is always 0-100 (calculated as `completedCount / totalLessons * 100`)
- `completedAt` is set when `progressPercent` reaches 100 (immutable once set)
- Deleting a lesson progress record should trigger recalculation (future consideration)

---

### APIs and Interfaces

**Mutation: lessonProgress.markComplete**

```typescript
// Request
{
  lessonId: Id<"lessons">
}

// Response
Id<"lessonProgress">  // ID of created progress record

// Errors
- "Not authenticated" (401) - User not logged in
- "Not enrolled in this course" (403) - User doesn't have access
- "Lesson not found" (404) - Invalid lesson ID
```

**Mutation: lessonProgress.recalculateProgress**

```typescript
// Request
{
  enrollmentId: Id<"enrollments">
}

// Response
{
  progressPercent: number,      // 0-100
  completedAt: number | null    // Set if now 100% complete
}

// Side Effects
- Updates enrollment record
- Schedules certificate generation if 100% complete
```

**Query: lessonProgress.getUserProgress**

```typescript
// Request
{
  courseId: Id<"courses">
}

// Response
{
  enrollmentId: Id<"enrollments">,
  total: number,                    // Total lessons in course
  completed: number,                // Number completed
  percent: number,                  // 0-100
  completedLessonIds: Id<"lessons">[]
} | null  // null if not enrolled

// Security
- Only returns data for authenticated user
- Filters by ctx.auth.getUserIdentity()
```

**Query: lessonProgress.getNextIncompleteLesson**

```typescript
// Request
{
  courseId: Id<"courses">
}

// Response
Id<"lessons"> | null  // Next incomplete lesson, or null if all complete

// Algorithm
- Iterate modules by order
- Within each module, iterate lessons by order
- Return first lesson without progress record
- If all complete, return first lesson (for review)
```

---

### Workflows and Sequencing

**Mark Lesson Complete Flow:**

```
1. Student clicks "Mark as Complete" on lesson page
   └─> Component calls: useMutation(api.lessonProgress.markComplete, { lessonId })

2. Backend: lessonProgress.markComplete
   ├─> Verify user authenticated (ctx.auth.getUserIdentity())
   ├─> Load lesson → Get moduleId → Get courseId
   ├─> Check enrollment exists for (userId, courseId)
   │   └─> If not enrolled: throw "Not enrolled in this course"
   ├─> Check if already marked complete (by_user_lesson index)
   │   └─> If exists: return existing ID (idempotent)
   ├─> Insert progress record: { userId, lessonId, completedAt: Date.now() }
   └─> Call: ctx.runMutation(api.lessonProgress.recalculateProgress, { enrollmentId })

3. Backend: lessonProgress.recalculateProgress
   ├─> Load enrollment
   ├─> Get all modules for course (by_course index, ordered)
   ├─> Get all lessons for each module (by_module index, ordered)
   ├─> Count total lessons
   ├─> Query progress records for user (by_user index, filter by lessonIds)
   ├─> Count completed lessons
   ├─> Calculate: progressPercent = (completed / total) * 100
   ├─> Update enrollment: { progressPercent, completedAt: (percent == 100 ? now : null) }
   └─> If completedAt set:
       └─> Schedule: ctx.scheduler.runAfter(0, api.certificates.generate, { userId, courseId })

4. Frontend: Real-time update
   └─> useQuery subscriptions receive updated enrollment data
   └─> Progress bar re-renders with new percentage
   └─> Sidebar checkmark appears next to lesson
```

**Continue Learning Flow:**

```
1. Student clicks "Continue Learning" on dashboard
   └─> Component calls: useQuery(api.lessonProgress.getNextIncompleteLesson, { courseId })

2. Backend: Find next lesson
   ├─> Get modules sorted by order
   ├─> For each module (sequential):
   │   ├─> Get lessons sorted by order
   │   ├─> For each lesson:
   │   │   ├─> Check if progress exists (by_user_lesson index)
   │   │   └─> If not found: return lessonId (first incomplete)
   │   └─> Continue to next module
   └─> If all complete: return first lesson in first module

3. Frontend: Navigate
   └─> Navigate to: /courses/{courseId}/learn?lesson={lessonId}
```

---

## Non-Functional Requirements

### Performance

- **Lesson Completion Response Time:** < 500ms (p95) from button click to UI update
  - Mutation execution: < 200ms
  - Progress recalculation: < 200ms (even for courses with 100+ lessons)
  - Real-time propagation to UI: < 100ms
- **Query Response Time:** < 100ms (p95) for `getUserProgress` and `getNextIncompleteLesson`
- **Concurrent Completions:** System must handle multiple students completing lessons simultaneously (100+ concurrent users)
- **Optimistic UI Updates:** Frontend should show checkmark immediately, rollback on error

**Performance Optimizations:**

- Use indexed queries (`by_user_lesson`, `by_user_course`) to avoid table scans
- Cache module/lesson counts at course level (future optimization if needed)
- Batch progress queries using single `by_user` index lookup

### Security

- **Authentication:** All mutations and queries MUST verify `ctx.auth.getUserIdentity()` is non-null
- **Authorization (Row-Level Security):**
  - Students can only mark lessons complete for courses they are enrolled in
  - Students can only view their own progress (filter by `userId`)
  - Instructors cannot mark lessons complete for students
- **Data Validation:**
  - Verify `lessonId` exists and belongs to a valid module/course
  - Verify user has active enrollment before allowing progress updates
  - Prevent progress records for preview lessons (check `lesson.isPreview`)
- **Idempotency:** Marking the same lesson complete twice should not create duplicate records (use unique index constraint)

### Reliability/Availability

- **Convex Uptime SLA:** 99.9% availability (per Convex platform)
- **Transactional Consistency:** All progress updates must be ACID-compliant (guaranteed by Convex)
- **Error Recovery:**
  - If recalculation fails mid-process, enrollment.progressPercent may be stale → Manual recalculation script needed (post-MVP)
  - If certificate generation fails, completion is still recorded → Certificate can be regenerated via admin action
- **Data Durability:** All progress records persisted to Convex durable storage with automatic replication

### Observability

- **Logging Requirements:**
  - Log all lesson completions: `{ userId, lessonId, courseId, timestamp }`
  - Log progress recalculations: `{ enrollmentId, oldPercent, newPercent, timestamp }`
  - Log certificate generation triggers: `{ userId, courseId, timestamp }`
- **Metrics to Track:**
  - Average lesson completion time (time between enrollment and marking complete)
  - Course completion rate (% of enrolled students who reach 100%)
  - Progress recalculation duration (p50, p95, p99)
- **Error Monitoring:**
  - Track "Not enrolled" errors (may indicate access control bugs)
  - Track idempotent completion attempts (may indicate double-click issues)
  - Alert on certificate generation failures

---

## Dependencies and Integrations

**Core Dependencies (from package.json):**

- **convex:** ^1.28.0 - Real-time database and serverless functions
- **next:** 16.0.0 - Frontend framework
- **react:** ^19.2.0 - UI library
- **@clerk/nextjs:** ^6.34.0 - Authentication integration

**Convex Schema Dependencies:**

- `lessons` table - Source of lesson data
- `courseModules` table - Source of module structure and ordering
- `courses` table - Course metadata
- `enrollments` table - Enrollment records (updated by this epic)
- `certificates` table - Certificate generation (triggered by this epic)

**Integration Points:**

1. **Certificate Generation Service:**
   - Triggered via: `ctx.scheduler.runAfter(0, api.certificates.generate, { userId, courseId })`
   - Dependency: `convex/certificates.ts` must have `generate` action implemented
   - Expected behavior: Generate PDF certificate and send notification email

2. **Notifications Service:**
   - Send notification when course completed: "Congratulations! You've completed {courseName}"
   - Send notification when certificate is ready: "Your certificate is ready to download"

3. **Analytics Service (Future):**
   - Track completion events for analytics dashboard (EPIC-107)
   - Provide data for instructor course improvement insights

**External Service Dependencies:**

- None (all operations contained within Convex backend)

---

## Acceptance Criteria (Authoritative)

1. **AC-101.1:** Student can mark a lesson as complete by clicking "Mark as Complete" button
   - **Given:** Student is enrolled in a course and viewing a lesson
   - **When:** Student clicks "Mark as Complete"
   - **Then:** Lesson is marked complete in database AND UI shows checkmark next to lesson

2. **AC-101.2:** Progress percentage updates in real-time after marking lesson complete
   - **Given:** Course has 10 lessons and student has completed 4
   - **When:** Student completes lesson 5
   - **Then:** Progress bar shows 50% (calculated as 5/10 \* 100)

3. **AC-101.3:** Progress persists across sessions
   - **Given:** Student marks 5 lessons complete
   - **When:** Student logs out and logs back in
   - **Then:** Progress bar still shows 50% and checkmarks appear next to completed lessons

4. **AC-101.4:** Certificate is automatically generated when student completes all lessons
   - **Given:** Course has 10 lessons and student has completed 9
   - **When:** Student completes lesson 10
   - **Then:** `enrollments.completedAt` is set AND certificate generation is triggered

5. **AC-101.5:** "Continue Learning" navigates to next incomplete lesson
   - **Given:** Student has completed lessons 1-5 out of 10
   - **When:** Student clicks "Continue Learning" on dashboard
   - **Then:** Student is navigated to lesson 6

6. **AC-101.6:** Marking the same lesson complete twice is idempotent
   - **Given:** Student has already marked lesson 3 complete
   - **When:** Student clicks "Mark as Complete" on lesson 3 again
   - **Then:** No duplicate progress record is created AND no error is shown

7. **AC-101.7:** Only enrolled students can mark lessons complete
   - **Given:** Student is not enrolled in course
   - **When:** Student attempts to mark lesson complete
   - **Then:** Error is returned: "Not enrolled in this course"

8. **AC-101.8:** Progress recalculation is accurate for courses with multiple modules
   - **Given:** Course has 3 modules (Module 1: 3 lessons, Module 2: 5 lessons, Module 3: 2 lessons)
   - **When:** Student completes 5 lessons total
   - **Then:** Progress shows 50% (5/10 \* 100)

---

## Traceability Mapping

| Acceptance Criteria | Spec Section                    | Component/API                      | Test Idea                                                           |
| ------------------- | ------------------------------- | ---------------------------------- | ------------------------------------------------------------------- |
| AC-101.1            | APIs - markComplete             | `lessonProgress.markComplete()`    | Unit test: Call mutation, verify record created                     |
| AC-101.2            | Workflows - Mark Complete       | `recalculateProgress()`            | Integration test: Mark lesson complete, verify progress updates     |
| AC-101.3            | Data Models                     | `lessonProgress` table             | E2E test: Complete lesson, logout, login, verify checkmark persists |
| AC-101.4            | Workflows - Certificate Trigger | `recalculateProgress()`, scheduler | Integration test: Complete final lesson, verify scheduler called    |
| AC-101.5            | APIs - getNextIncompleteLesson  | `getNextIncompleteLesson()`        | Unit test: Mock progress data, verify correct lesson returned       |
| AC-101.6            | Data Models - Unique Index      | `by_user_lesson` index             | Unit test: Call markComplete twice, verify no duplicate             |
| AC-101.7            | Security - Authorization        | `markComplete()` enrollment check  | Unit test: Call mutation without enrollment, verify error           |
| AC-101.8            | Workflows - Recalculation       | Multi-module progress calculation  | Integration test: Course with 3 modules, verify accurate percentage |

---

## Risks, Assumptions, Open Questions

**Risks:**

1. **Risk:** Large courses (100+ lessons) may cause slow progress recalculation
   - **Likelihood:** Medium
   - **Impact:** High (poor UX, timeout errors)
   - **Mitigation:** Optimize query using indexed lookups; consider caching total lesson count at course level; test with 200-lesson course

2. **Risk:** Race condition if student marks two lessons complete rapidly
   - **Likelihood:** Low
   - **Impact:** Medium (progress may be slightly incorrect)
   - **Mitigation:** Convex transactions prevent this; add integration test to verify

3. **Risk:** Certificate generation failure leaves student at 100% but no certificate
   - **Likelihood:** Low
   - **Impact:** High (student frustration, support tickets)
   - **Mitigation:** Implement retry logic in certificate service; add manual re-trigger button in admin panel

**Assumptions:**

1. **Assumption:** Students will not need to "un-complete" lessons (no undo functionality)
   - **Validation:** Confirm with Product team
   - **Impact if wrong:** Would require additional mutation and UI work

2. **Assumption:** Preview lessons do not count toward progress calculation
   - **Validation:** Preview lessons have `isPreview: true` flag
   - **Impact if wrong:** Progress percentages would be incorrect

3. **Assumption:** Instructors cannot manually override student progress
   - **Validation:** Confirm with Product team
   - **Impact if wrong:** Would require admin-level mutation and permission system

**Open Questions:**

1. **Question:** Should quiz lessons be marked complete automatically when quiz is passed?
   - **Decision needed from:** Product Manager
   - **Impact:** Changes integration between EPIC-101 and EPIC-102

2. **Question:** Should progress tracking include "time spent" metrics?
   - **Decision needed from:** Product Manager
   - **Impact:** Would require video player integration and additional schema fields

3. **Question:** How should deleted lessons affect progress calculation?
   - **Decision needed from:** Product Manager
   - **Impact:** May require soft-delete pattern for lessons

---

## Test Strategy Summary

**Unit Tests (Convex Functions):**

- Test `markComplete()` with valid enrollment → verify progress record created
- Test `markComplete()` without enrollment → verify error thrown
- Test `markComplete()` idempotency → verify no duplicate records
- Test `recalculateProgress()` with various lesson counts → verify accurate percentages
- Test `getUserProgress()` returns correct completed lesson IDs
- Test `getNextIncompleteLesson()` returns correct lesson (first incomplete)

**Integration Tests:**

- Test full flow: mark lesson complete → verify progress updates → verify UI updates
- Test certificate trigger: complete all lessons → verify scheduler called
- Test multi-module course: verify progress calculated across all modules
- Test race condition: mark two lessons complete simultaneously → verify both counted

**End-to-End Tests (Playwright):**

- Test student journey: enroll → watch lessons → mark complete → verify progress bar
- Test "Continue Learning" button navigates to correct lesson
- Test completion celebration: complete final lesson → verify certificate notification

**Performance Tests:**

- Benchmark `recalculateProgress()` with courses of varying sizes (10, 50, 100, 200 lessons)
- Load test: 100 concurrent students marking lessons complete
- Verify optimistic UI updates (checkmark appears < 100ms)

**Manual Testing Checklist:**

- [ ] Mark lesson complete → verify checkmark appears immediately
- [ ] Refresh page → verify progress persists
- [ ] Complete all lessons → verify certificate generated
- [ ] Click "Continue Learning" → verify navigates to next lesson
- [ ] Try marking preview lesson complete → verify allowed or blocked (based on decision)
- [ ] Check progress on course with 3+ modules → verify accurate percentage

---

**Status:** Ready for Story Breakdown
**Next Steps:** Use `*create-story` workflow to generate implementation stories from this tech spec
