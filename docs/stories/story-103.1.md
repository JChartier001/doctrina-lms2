# Story 103.1: Create Course Reviews System

**Status:** Draft
**Epic:** EPIC-103 - Course Reviews & Ratings
**Type:** Backend Feature
**Priority:** P0 - Critical
**Effort:** 8 story points
**Risk:** Low

---

## Story

As a **student**,
I want to **submit reviews and ratings for courses I've taken**,
so that **I can share my experience and help other students make informed decisions**.

---

## Context

The course detail page (`/courses/[id]`) has a Reviews tab UI component, but it displays no data because the backend functions don't exist. Course cards show rating/review count fields but these values are hardcoded or null. The `courseReviews` table schema exists in convex/schema.ts but no mutations or queries have been implemented.

**Current State:**

- ✅ Reviews UI components exist (review submission form, star rating component, review display)
- ✅ `courseReviews` table defined in schema with indexes (by_course, by_user, by_user_course)
- ❌ No backend mutations (create, update, remove, hide)
- ❌ No backend queries (list reviews for course)
- ❌ No average rating calculation
- ❌ Course detail page shows empty reviews tab

**Dependencies:**

- ✅ Enrollments system implemented (required to verify enrollment before review)
- ✅ Authentication via Clerk integrated
- ✅ Schema defined with proper indexes

**Related:** EPIC-103 Course Reviews System (8 pts)

---

## Acceptance Criteria

1. **AC1:** Student can submit a review for an enrolled course ✅
   - `courseReviews.create()` mutation implemented
   - Verifies user is enrolled in course
   - Prevents duplicate reviews (one review per user per course)
   - Accepts rating (1-5 stars) and optional review text
   - Returns review ID

2. **AC2:** Reviews can be retrieved for a course ✅
   - `courseReviews.list()` query implemented
   - Returns reviews for a specific course
   - Excludes hidden reviews (hidden=true)
   - Sorts by most recent first
   - Includes reviewer user details (name, image)

3. **AC3:** Student can update their own review ✅
   - `courseReviews.update()` mutation implemented
   - Verifies ownership (user can only update their own review)
   - Allows updating rating and/or content
   - Preserves original createdAt timestamp

4. **AC4:** Student can delete their own review ✅
   - `courseReviews.remove()` mutation implemented
   - Verifies ownership (user can only delete their own review)
   - Hard deletes the review record

5. **AC5:** Admin can hide inappropriate reviews ✅
   - `courseReviews.hide()` mutation implemented
   - Requires admin authorization
   - Sets hidden=true flag (soft delete)
   - Hidden reviews excluded from public queries

6. **AC6:** All tests pass ✅
   - Unit tests for create, list, update, remove, hide
   - Authorization tests (enrollment verification, ownership, admin)
   - Security tests (duplicate review prevention, hidden reviews excluded)
   - 85% test coverage target (Priority 2: Core Features)

7. **AC7:** TypeScript types and code quality ✅
   - Proper Convex types used
   - No TypeScript errors
   - Code follows project patterns
   - Lint passes

---

## Tasks / Subtasks

### Task 1: Create convex/courseReviews.ts File (AC1, AC2, AC3, AC4, AC5)

- [ ] **1.1** Implement `create()` mutation
  - Validate user authentication
  - Verify user is enrolled in course (check enrollments table)
  - Check for existing review (prevent duplicates)
  - Validate rating (1-5 range)
  - Insert review record with userId, courseId, rating, content, createdAt, hidden=false
  - Return review ID

- [ ] **1.2** Implement `list()` query
  - Query courseReviews by courseId using by_course index
  - Filter out hidden reviews (hidden=false)
  - Sort by createdAt descending (most recent first)
  - Populate user details (firstName, lastName, image) from users table
  - Return array of review objects with user data

- [ ] **1.3** Implement `update()` mutation
  - Validate user authentication
  - Verify review exists
  - Verify ownership (review.userId matches current user)
  - Update rating and/or content fields
  - Preserve original createdAt timestamp
  - Return success

- [ ] **1.4** Implement `remove()` mutation
  - Validate user authentication
  - Verify review exists
  - Verify ownership (review.userId matches current user)
  - Hard delete review record from database
  - Return success

- [ ] **1.5** Implement `hide()` mutation
  - Validate user authentication
  - Verify user is admin (check users.isAdmin)
  - Verify review exists
  - Set hidden=true
  - Return success

- [ ] **1.6** Add comprehensive JSDoc comments
  - Document each function's purpose
  - Include parameter descriptions
  - Note security and authorization requirements

### Task 2: Testing (AC6, AC7)

- [ ] **2.1** Unit tests for create() mutation
  - Test enrolled student can submit review
  - Test non-enrolled user cannot submit review
  - Test prevents duplicate reviews
  - Test validates rating range (1-5)
  - Test requires authentication

- [ ] **2.2** Unit tests for list() query
  - Test returns reviews for course
  - Test excludes hidden reviews
  - Test sorts by most recent first
  - Test populates user details
  - Test empty array when no reviews

- [ ] **2.3** Unit tests for update() mutation
  - Test owner can update own review
  - Test non-owner cannot update
  - Test validates rating range
  - Test preserves createdAt

- [ ] **2.4** Unit tests for remove() mutation
  - Test owner can delete own review
  - Test non-owner cannot delete
  - Test review is actually deleted

- [ ] **2.5** Unit tests for hide() mutation
  - Test admin can hide review
  - Test non-admin cannot hide
  - Test hidden review excluded from list query

- [ ] **2.6** Integration tests
  - Full flow: enroll → submit review → update review → list reviews
  - Full flow: admin hides review → verify excluded from list
  - Security: duplicate prevention, authorization checks

- [ ] **2.7** Code quality checks
  - Run TypeScript compilation
  - Run lint
  - Verify 85% test coverage target met

---

## Dev Notes

### Architecture Patterns

**Convex Mutation Pattern for Reviews**

```typescript
import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { api } from './_generated/api';
import type { Doc } from './_generated/dataModel';

export const create = mutation({
	args: {
		courseId: v.id('courses'),
		rating: v.number(), // 1-5
		content: v.string(),
	},
	handler: async (ctx, args) => {
		// Authentication check
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error('Not authenticated');
		}

		// Get user to verify enrollment
		const user: Doc<'users'> | null = await ctx.runQuery(api.users.getByExternalId, {
			externalId: identity.subject,
		});

		if (!user) {
			throw new Error('User not found');
		}

		// Verify enrollment
		const enrollment = await ctx.db
			.query('enrollments')
			.withIndex('by_user_course', q => q.eq('userId', user._id).eq('courseId', args.courseId))
			.first();

		if (!enrollment) {
			throw new Error('Must be enrolled to review this course');
		}

		// Check for duplicate review
		const existing = await ctx.db
			.query('courseReviews')
			.withIndex('by_user_course', q => q.eq('userId', user._id).eq('courseId', args.courseId))
			.first();

		if (existing) {
			throw new Error('You have already reviewed this course');
		}

		// Validate rating
		if (args.rating < 1 || args.rating > 5) {
			throw new Error('Rating must be between 1 and 5');
		}

		// Create review
		return await ctx.db.insert('courseReviews', {
			userId: user._id,
			courseId: args.courseId,
			rating: args.rating,
			content: args.content,
			createdAt: Date.now(),
			hidden: false,
		});
	},
});
```

**Query Pattern with User Population**

```typescript
export const list = query({
	args: { courseId: v.id('courses') },
	handler: async (ctx, { courseId }) => {
		const reviews = await ctx.db
			.query('courseReviews')
			.withIndex('by_course', q => q.eq('courseId', courseId))
			.filter(q => q.eq(q.field('hidden'), false))
			.order('desc')
			.collect();

		// Populate user details for each review
		return await Promise.all(
			reviews.map(async review => {
				const user = await ctx.db.get(review.userId);

				return {
					...review,
					user: user
						? {
								_id: user._id,
								firstName: user.firstName,
								lastName: user.lastName,
								image: user.image,
							}
						: null,
				};
			}),
		);
	},
});
```

**Authorization Pattern - Update/Delete**

```typescript
export const update = mutation({
	args: {
		reviewId: v.id('courseReviews'),
		rating: v.optional(v.number()),
		content: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error('Not authenticated');
		}

		const review = await ctx.db.get(args.reviewId);
		if (!review) {
			throw new Error('Review not found');
		}

		// Get user to verify ownership
		const user: Doc<'users'> | null = await ctx.runQuery(api.users.getByExternalId, {
			externalId: identity.subject,
		});

		if (!user || review.userId !== user._id) {
			throw new Error('Not authorized');
		}

		// Validate rating if provided
		if (args.rating !== undefined && (args.rating < 1 || args.rating > 5)) {
			throw new Error('Rating must be between 1 and 5');
		}

		// Update review
		const updates: Partial<Doc<'courseReviews'>> = {};
		if (args.rating !== undefined) updates.rating = args.rating;
		if (args.content !== undefined) updates.content = args.content;

		await ctx.db.patch(args.reviewId, updates);
	},
});
```

**Admin Authorization Pattern - Hide**

```typescript
export const hide = mutation({
	args: { reviewId: v.id('courseReviews') },
	handler: async (ctx, { reviewId }) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error('Not authenticated');
		}

		// Get user to verify admin status
		const user: Doc<'users'> | null = await ctx.runQuery(api.users.getByExternalId, {
			externalId: identity.subject,
		});

		if (!user || !user.isAdmin) {
			throw new Error('Not authorized - admin access required');
		}

		const review = await ctx.db.get(reviewId);
		if (!review) {
			throw new Error('Review not found');
		}

		// Hide review (soft delete)
		await ctx.db.patch(reviewId, { hidden: true });
	},
});
```

### Project Structure Notes

**File to Create:**

- `convex/courseReviews.ts` - Primary implementation file (est. 200-250 lines)

**Schema Reference:**

- `convex/schema.ts` - Lines 186-193 (courseReviews table definition)
- Indexes available: by_course, by_user, by_user_course

**Testing Files:**

- `convex/__test__/courseReviews.test.ts` - Comprehensive test suite

**Existing Patterns to Follow:**

- `convex/quizzes.ts` - Authorization pattern (enrollment verification, instructor ownership)
- `convex/lessonProgress.ts` - Authentication pattern
- `convex/enrollments.ts` - Query patterns with indexes and user data population
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
- Test authorization edge cases (enrollment verification, ownership, admin)
- Verify duplicate prevention
- Test hidden review exclusion

**Test Coverage Target:**

- 85% coverage (Priority 2: Core Features per TESTING-STRATEGY.md)
- 100% coverage on authorization logic
- Focus on happy path + common errors, skip rare edge cases

**Manual Testing Checklist:**

- [ ] Enroll in course, submit review
- [ ] Try to submit duplicate review (should fail)
- [ ] Update own review
- [ ] Try to update another user's review (should fail)
- [ ] Delete own review
- [ ] Admin hides review, verify not visible in list
- [ ] Non-enrolled user tries to review (should fail)

### References

- **Epic:** docs/epics.md - Lines 696-857 (EPIC-103: Course Reviews & Ratings)
- **PRD:** docs/PRD.md - Lines 1077-1121 (F12: Course Reviews & Ratings)
- **Schema:** convex/schema.ts - Lines 186-193, 251-254 (courseReviews table and indexes)
- **Testing:** docs/TESTING-STRATEGY.md - Lines 473-548 (Priority 2: Core Business Logic, 85% target)
- **Auth Pattern:** convex/quizzes.ts - User lookup and authorization pattern
- **Query Pattern:** convex/enrollments.ts - Data population and Promise.all pattern

---

## Dev Agent Record

### Context Reference

- [Story Context XML](./story-context-103.1.xml) - To be generated

### Agent Model Used

{{agent_model_name_version}}

### Completion Notes List

- [ ] convex/courseReviews.ts created with all mutations/queries
- [ ] Authorization implemented (enrollment verification, ownership, admin)
- [ ] Duplicate review prevention verified
- [ ] Hidden reviews excluded from list query
- [ ] All tests passing (unit + integration)
- [ ] TypeScript compilation successful
- [ ] 85% test coverage target achieved

### File List

**Created:**

- `convex/courseReviews.ts` - Course review mutations and queries
- `convex/__test__/courseReviews.test.ts` - Test suite

---

## Change Log

| Date       | Author             | Changes                |
| ---------- | ------------------ | ---------------------- |
| 2025-11-11 | Bob (Scrum Master) | Initial story creation |
