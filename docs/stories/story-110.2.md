# Story 110.2: Add Comprehensive Test Coverage for Core Convex Functions

**Status:** Draft
**Epic:** EPIC-110 - Testing & Quality Assurance
**Type:** Technical Debt / Testing
**Priority:** P0 - Critical
**Effort:** 21 story points
**Risk:** High (production code without tests)

---

## Story

As a **developer**,
I want to **have comprehensive test coverage for all core Convex backend functions**,
so that **we can confidently deploy changes without breaking existing functionality**.

---

## Context

Currently, only 3 out of 25 Convex backend files have test coverage (lessonProgress, certificates, triggers). This leaves critical functionality untested, including course creation, enrollment, and payment processing. Before building more features (quizzes, reviews, etc.), we need to establish comprehensive test coverage for the existing foundation.

**Current Test Coverage:**

- ✅ lessonProgress.ts - 25 tests (100% coverage)
- ✅ certificates.ts - 15 tests (100% coverage)
- ✅ triggers.ts - 7 tests (100% coverage)
- **Total: 47 tests, 3 files**

**Missing Test Coverage (22 files):**

**ALL FILES - 100% coverage target:**

**Critical (Test First):**
- ❌ purchases.ts - Handles money/refunds
- ❌ payments.ts - Payment processing
- ❌ stripe.ts - Stripe webhooks
- ❌ enrollments.ts - Course access control

**Core (Test Second):**
- ❌ courses.ts - Course CRUD
- ❌ courseModules.ts - Module management
- ❌ lessons.ts - Lesson management
- ❌ users.ts - User management

**Secondary (Test Third):**
- ❌ favorites.ts, liveSessions.ts, notifications.ts, recommendations.ts, resources.ts, search.ts, analytics.ts

**Blocker for:** EPIC-102 (quizzes), EPIC-103 (reviews), all future features

---

## Acceptance Criteria

1. **AC1:** Critical financial code has 100% test coverage ✅
   - purchases.ts: create, list, refund logic
   - payments.ts: payment flows
   - stripe.ts: webhook handling
   - All edge cases covered

2. **AC2:** Course creation flow has 100% coverage ✅
   - courses.ts: CRUD operations, all functions tested
   - courseModules.ts: module management, all functions tested
   - lessons.ts: lesson management, all functions tested
   - Authorization tests for all mutations

3. **AC3:** Enrollment and access control 100% covered ✅
   - enrollments.ts: create, list, access verification
   - Authorization edge cases
   - Progress tracking integration
   - All functions tested

4. **AC4:** User management 100% covered ✅
   - users.ts: CRUD, Clerk sync, all queries tested
   - Role-based permissions
   - External ID lookups
   - All edge cases

5. **AC5:** All secondary features 100% covered ✅
   - favorites.ts, liveSessions.ts, notifications.ts
   - recommendations.ts, resources.ts, search.ts
   - analytics.ts
   - All functions tested

6. **AC6:** Coverage metrics at 100% ✅
   - All Convex files: 100% coverage
   - Overall project: 100% coverage target
   - Coverage report validates

7. **AC7:** All tests pass ✅
   - 100% pass rate
   - No flaky tests
   - ~190+ total tests
   - TypeScript compilation successful

---

## Tasks / Subtasks

### Task 1: Critical Financial Code (AC1) - Estimated 60 tests

- [ ] **1.1** Create convex/**test**/purchases.test.ts (~20 tests)
  - Test purchase creation, listing, access control
  - Test refund eligibility calculations
  - Test purchase status transitions

- [ ] **1.2** Create convex/**test**/payments.test.ts (~20 tests)
  - Test payment intent creation
  - Test payment confirmation
  - Test error handling

- [ ] **1.3** Create convex/**test**/enrollments.test.ts (~20 tests)
  - Test enrollment creation
  - Test getMyEnrollments query
  - Test access verification
  - Test progress tracking

### Task 2: Core Course Creation (AC2) - Estimated 80 tests

- [ ] **2.1** Create convex/**test**/courses.test.ts (~30 tests)
  - Test CRUD operations
  - Test authorization
  - Test instructor ownership

- [ ] **2.2** Create convex/**test**/courseModules.test.ts (~25 tests)
  - Test module CRUD
  - Test ordering
  - Test authorization

- [ ] **2.3** Create convex/**test**/lessons.test.ts (~25 tests)
  - Test lesson CRUD
  - Test lesson types
  - Test ordering

### Task 3: User Management (AC4) - Estimated 30 tests

- [ ] **3.1** Create convex/**test**/users.test.ts (~30 tests)
  - Test Clerk sync
  - Test queries (getById, getByExternalId, getByEmail)
  - Test role permissions

### Task 4: Coverage Validation (AC5, AC6)

- [ ] **4.1** Run coverage reports
  - Execute `yarn test:coverage`
  - Verify thresholds met

- [ ] **4.2** Validate all tests pass
  - Run full test suite
  - Fix failures
  - Verify TypeScript compiles

---

## Dev Notes

### Testing Priorities

**ALL CONVEX FILES: 100% COVERAGE TARGET**

**Test Order (by criticality):**

**Priority 1 - Critical (Test First):**
- Payments, purchases, enrollments
- Access control logic
- Money-handling code

**Priority 2 - Core (Test Second):**
- Courses, modules, lessons
- Core business logic
- User management

**Priority 3 - Secondary (Test Third):**
- Favorites, notifications
- Search, recommendations
- Analytics

**All must reach 100% coverage - no exceptions**

### Test Pattern

Follow `convex/__test__/lessonProgress.test.ts`:

```typescript
import { convexTest } from 'convex-test';
import { describe, beforeEach, it, expect } from 'vitest';
import { api } from '../_generated/api';
import schema from '../schema';

describe('Courses', () => {
  let t: any;

  beforeEach(async () => {
    t = convexTest(schema).withIdentity({ subject: 'test-user' });
  });

  it('creates course with valid data', async () => {
    const courseId = await t.mutation(api.courses.create, {...});
    expect(courseId).toBeDefined();
  });
});
```

### Estimated Test Count

- Critical: ~60 tests
- Core: ~80 tests
- Secondary: ~50 tests
- **Total: ~190 tests**

### References

- **Testing Strategy:** docs/TESTING-STRATEGY.md
- **Existing Tests:** convex/**test**/lessonProgress.test.ts
- **Schema:** convex/schema.ts

---

## Dev Agent Record

### Context Reference

<!-- Generated by story-context workflow -->

### Completion Notes List

- [ ] Critical financial tests (100% coverage)
- [ ] Core course tests (100% coverage)
- [ ] User management tests (100% coverage)
- [ ] Secondary features tests (100% coverage)
- [ ] ALL Convex files at 100% coverage
- [ ] Coverage thresholds met
- [ ] ~190+ tests passing

### File List

**Created:**

- convex/**test**/purchases.test.ts
- convex/**test**/payments.test.ts
- convex/**test**/enrollments.test.ts
- convex/**test**/courses.test.ts
- convex/**test**/courseModules.test.ts
- convex/**test**/lessons.test.ts
- convex/**test**/users.test.ts

---

## Change Log

| Date       | Author             | Changes                     |
| ---------- | ------------------ | --------------------------- |
| 2025-11-07 | Bob (Scrum Master) | Initial test coverage story |
