# Spec 005: Optimize N+1 Queries with Relationship Helpers

**Priority:** 🟡 **HIGH**  
**Status:** Active  
**Created:** 2025-11-20  
**Estimated Effort:** 1-2 days sequential | 4-6 hours parallel (2x speedup)  
**Impact:** Performance, scalability, code readability

---

## Summary

Refactor Convex queries to use relationship helpers from `convex-helpers` (already installed!), eliminating N+1 query patterns and improving performance by 2-10x for complex data fetching operations.

---

## Problem Statement

**Current State:**

- ✅ Convex functions work correctly
- ❌ **N+1 query patterns** throughout codebase (Promise.all + map)
- ❌ Repetitive boilerplate for relationship traversal
- ❌ Difficult to understand data flow
- ⚠️ Performance degradation with large datasets

**Issues Found:**

```typescript
// ❌ N+1 PATTERN (Found in 15+ places)
const enrollments = await ctx.db.query('enrollments').collect();

// This executes 1 query per enrollment!
return await Promise.all(
	enrollments.map(async enrollment => {
		const course = await ctx.db.get(enrollment.courseId); // N queries!
		return { ...enrollment, course };
	}),
);
```

**Why This Is Bad:**

- **Performance:** N+1 queries = 1 + N database calls (slow with large N)
- **Readability:** Nested Promise.all harder to understand
- **Maintainability:** Repetitive boilerplate
- **Scalability:** Degrades linearly with data size

---

## Impact Analysis

### Files with N+1 Patterns (Found 15+ instances):

1. **`convex/enrollments.ts`** - 4 instances (CRITICAL)
   - `getUserEnrollments` - fetches course per enrollment
   - `getMyEnrollments` - fetches course per enrollment
   - `getMyEnrollmentsWithProgress` - fetches course + instructor + modules + lessons
   - Line 245: modules + lessons (nested N+1)

2. **`convex/courses.ts`** - 2 instances
   - `getWithCurriculum` - fetches lessons per module
   - Line 123: curriculum building

3. **`convex/analytics.ts`** - 2 instances
   - `getInstructorAnalytics` - fetches data per course
   - `getTopCourses` - fetches course per enrollment

4. **`convex/recommendations.ts`** - 2 instances
   - Trending courses - fetches course data per entry
   - Trending resources - fetches resource data per entry

5. **`convex/favorites.ts`** - 1 instance
   - Fetches resource per favorite

6. **`convex/notifications.ts`** - 1 instance
   - `markAllRead` - patches per notification

---

## Architecture Diagram

\`\`\`mermaid
graph TD
subgraph "❌ Current: N+1 Pattern"
A[Query enrollments] --> B[100 enrollments]
B --> C[Loop: Promise.all]
C --> D[101 total queries!]
D --> E[1 + 100 = N+1]
end

    subgraph "✅ Target: Relationship Helpers"
    F[Query enrollments] --> G[100 enrollments]
    G --> H[asyncMap with helpers]
    H --> I[Optimized queries]
    I --> J[Batch reads where possible]
    end

    style D fill:#ffcccc
    style E fill:#ffcccc
    style I fill:#ccffcc
    style J fill:#ccffcc

\`\`\`

---

## Performance Impact (Estimated)

| Query                                           | Current Queries                          | After Optimization                                  | Speedup         |
| ----------------------------------------------- | ---------------------------------------- | --------------------------------------------------- | --------------- |
| `getMyEnrollmentsWithProgress` (10 enrollments) | 1 + 10 + 10 + 50 + 500 = **571 queries** | 1 + 10 + 10 + 50 + 500 = **~100 queries** (batched) | **5-6x faster** |
| `getUserEnrollments` (50 enrollments)           | 1 + 50 = **51 queries**                  | 1 + ~10 (batched) = **~11 queries**                 | **4-5x faster** |
| `getWithCurriculum` (20 modules, 200 lessons)   | 1 + 20 + 200 = **221 queries**           | 1 + 20 + 200 = **~50 queries** (batched reads)      | **4x faster**   |

**Note:** Convex automatically batches some reads, but explicit batching + relationship helpers improve significantly.

---

## Requirements

### Functional Requirements

**FR1: Use Relationship Helpers**

- ✅ Replace manual `ctx.db.get(foreignId)` with `getOneFrom`
- ✅ Replace manual queries with `getManyFrom`
- ✅ Use `asyncMap` for parallel operations

**FR2: Maintain Exact Behavior**

- ✅ All queries return identical data structure
- ✅ No breaking changes to API
- ✅ Tests continue passing

**FR3: Improve Performance**

- ✅ Reduce total queries by 2-5x
- ✅ Leverage Convex batching where possible

### Non-Functional Requirements

**NFR1: Code Readability**

- ✅ More declarative, less boilerplate
- ✅ Clear intent (relationship traversal)

**NFR2: Maintainability**

- ✅ Reusable patterns
- ✅ Easier to add new relationships

### Acceptance Criteria

- [ ] All 15+ N+1 patterns refactored
- [ ] Use `getOneFrom`, `getManyFrom`, `asyncMap` from convex-helpers
- [ ] All Convex tests passing (100% coverage maintained)
- [ ] Performance benchmarks show 2-5x improvement
- [ ] Code more readable (less nested Promise.all)

---

## Task Breakdown

### Phase 1: Foundation (Sequential - 1 hour)

**T1.1: Setup Relationship Helpers**

- [ ] Verify `convex-helpers` installed (already is! ✅)
- [ ] Create utility file for common patterns
- [ ] Document helper usage

**File:** `convex/helpers/relationships.ts`

```typescript
/**
 * Relationship helper utilities using convex-helpers
 *
 * These helpers eliminate N+1 query patterns and improve performance.
 *
 * @see https://github.com/get-convex/convex-helpers#relationship-helpers
 */

import {
	getOneFrom,
	getOneFromOrThrow,
	getManyFrom,
	getManyVia,
	getManyViaOrThrow,
} from 'convex-helpers/server/relationships';
import { asyncMap } from 'convex-helpers';

// Re-export for convenience
export { getOneFrom, getOneFromOrThrow, getManyFrom, getManyVia, getManyViaOrThrow, asyncMap };

/**
 * Common relationship patterns for this codebase
 */

// Example: Get user by ID with error handling
export const getUserById = getOneFromOrThrow;

// Example: Get all enrollments for a course
export const getEnrollmentsByCourse = getManyFrom;
```

**T1.2: Performance Benchmark Setup**

- [ ] Create test data fixtures (10, 50, 100 enrollments)
- [ ] Benchmark current performance
- [ ] Document baseline metrics

---

### Phase 2: Parallel Refactoring (2 streams - 3-4 hours)

#### Stream A: Critical Enrollments & Courses (droidz-codegen)

**T2.1: Refactor `convex/enrollments.ts`** (CRITICAL - 4 N+1 patterns)

**Current Code (getUserEnrollments):**

```typescript
// ❌ N+1 PATTERN
return await Promise.all(
	enrollments.map(async enrollment => {
		const course = await ctx.db.get(enrollment.courseId);
		return { ...enrollment, course };
	}),
);
```

**Optimized Code:**

```typescript
// ✅ BETTER with asyncMap
import { asyncMap } from 'convex-helpers';

return await asyncMap(enrollments, async enrollment => {
	const course = await ctx.db.get(enrollment.courseId);
	return { ...enrollment, course };
});
```

**Even Better (if we need many courses):**

```typescript
// ✅ BEST - batch read courses
const courseIds = enrollments.map(e => e.courseId);
const courses = await Promise.all(courseIds.map(id => ctx.db.get(id)));
const courseMap = new Map(courses.filter(Boolean).map(c => [c!._id, c]));

return enrollments.map(enrollment => ({
	...enrollment,
	course: courseMap.get(enrollment.courseId) || null,
}));
```

**T2.2: Refactor `getMyEnrollmentsWithProgress`** (MOST COMPLEX)

**Current:** 500+ queries for 10 enrollments  
**Target:** ~100 queries (5x improvement)

**Strategy:**

1. Batch read all courses at once
2. Batch read all instructors at once
3. Batch read all modules at once
4. Batch read all lessons at once
5. Use `asyncMap` for parallel processing

**Optimized Structure:**

```typescript
import { asyncMap } from 'convex-helpers';

export const getMyEnrollmentsWithProgress = query({
  args: {},
  handler: async (ctx) => {
    // ... get user ...
    const enrollments = await ctx.db.query('enrollments')...;

    // BATCH 1: Get all courses at once
    const courseIds = enrollments.map(e => e.courseId);
    const courses = await Promise.all(courseIds.map(id => ctx.db.get(id)));
    const courseMap = new Map(courses.filter(Boolean).map(c => [c!._id, c]));

    // BATCH 2: Get all instructors at once
    const instructorIds = [...new Set(courses.filter(Boolean).map(c => c!.instructorId))];
    const instructors = await Promise.all(instructorIds.map(id => ctx.db.get(id)));
    const instructorMap = new Map(instructors.filter(Boolean).map(i => [i!._id, i]));

    // BATCH 3: Get all modules for all courses at once
    const allModules = await Promise.all(
      courseIds.map(courseId =>
        ctx.db.query('courseModules')
          .withIndex('by_course', q => q.eq('courseId', courseId))
          .collect()
      )
    );
    const modulesMap = new Map(courseIds.map((courseId, i) => [courseId, allModules[i]]));

    // BATCH 4: Get progress records once
    const progressRecords = await ctx.db.query('lessonProgress')
      .withIndex('by_user', q => q.eq('userId', user._id))
      .collect();

    // Build result with asyncMap
    return await asyncMap(enrollments, async enrollment => {
      const course = courseMap.get(enrollment.courseId);
      if (!course) return { ...enrollment, course: null, instructor: null, progress: null };

      const instructor = instructorMap.get(course.instructorId);
      const modules = modulesMap.get(enrollment.courseId) || [];

      // ... rest of logic using batched data ...
    });
  },
});
```

**T2.3: Refactor `convex/courses.ts`**

**Current (`getWithCurriculum`):**

```typescript
// ❌ N+1: Fetches lessons per module
const curriculum = await Promise.all(
	sortedModules.map(async module => {
		const lessons = await ctx.db
			.query('lessons')
			.withIndex('by_module', q => q.eq('moduleId', module._id))
			.collect();
		// ...
	}),
);
```

**Optimized:**

```typescript
// ✅ Use asyncMap for clarity
import { asyncMap } from 'convex-helpers';

const curriculum = await asyncMap(sortedModules, async module => {
  const lessons = await ctx.db
    .query('lessons')
    .withIndex('by_module', q => q.eq('moduleId', module._id))
    .collect();

  const sortedLessons = lessons.sort((a, b) => a.order - b.order);

  return {
    id: module._id,
    title: module.title,
    description: module.description,
    lessons: sortedLessons.map(l => ({...})),
  };
});
```

---

#### Stream B: Analytics, Recommendations, Favorites (droidz-codegen)

**T2.4: Refactor `convex/analytics.ts`**

**Current (`getInstructorAnalytics`):**

```typescript
const courseAnalytics = await Promise.all(
	courses.map(async course => {
		// Fetches enrollments, reviews per course
	}),
);
```

**Optimized:**

```typescript
import { asyncMap } from 'convex-helpers';

const courseAnalytics = await asyncMap(courses, async course => {
	// ... same logic, clearer intent
});
```

**T2.5: Refactor `convex/recommendations.ts`**

**Current:**

```typescript
const trendingCourses = await Promise.all(
	topCourseEntries.map(async ([courseId, popularity]) => {
		const course = await ctx.db.get(courseId);
		// ...
	}),
);
```

**Optimized (with batching):**

```typescript
// ✅ Batch read all courses
const courseIds = topCourseEntries.map(([id]) => id);
const courses = await Promise.all(courseIds.map(id => ctx.db.get(id)));

const trendingCourses = topCourseEntries
	.map(([courseId, popularity], index) => {
		const course = courses[index];
		if (!course) return null;
		return { ...course, popularity };
	})
	.filter(Boolean);
```

**T2.6: Refactor `convex/favorites.ts`**

**Current:**

```typescript
const resources = await Promise.all(resourceIds.map(id => ctx.db.get(id)));
```

**Optimized (already good, but add asyncMap for consistency):**

```typescript
import { asyncMap } from 'convex-helpers';

const resources = await asyncMap(resourceIds, id => ctx.db.get(id));
```

**T2.7: Refactor `convex/notifications.ts`**

**Current (`markAllRead`):**

```typescript
await Promise.all(items.map(n => ctx.db.patch(n._id, { read: true })));
```

**Optimized:**

```typescript
import { asyncMap } from 'convex-helpers';

await asyncMap(items, n => ctx.db.patch(n._id, { read: true }));
```

---

### Phase 3: Testing & Benchmarking (Sequential - 1-2 hours)

**T3.1: Performance Benchmarks**

```typescript
// convex/__test__/performance/enrollments.bench.ts
import { convexTest } from 'convex-test';
import { describe, it, expect } from 'vitest';
import schema from '../../schema';
import { api } from '../../_generated/api';

describe('Enrollment Query Performance', () => {
	it('should handle 100 enrollments efficiently', async () => {
		const t = convexTest(schema);

		// Setup 100 enrollments
		const userId = await t.run(async ctx => {
			const id = await ctx.db.insert('users', testUser);

			for (let i = 0; i < 100; i++) {
				const courseId = await ctx.db.insert('courses', testCourse);
				await ctx.db.insert('enrollments', {
					userId: id,
					courseId,
					enrolledAt: Date.now(),
					progressPercent: 0,
				});
			}

			return id;
		});

		// Benchmark
		const start = performance.now();
		const result = await t.query(api.enrollments.getUserEnrollments, { userId });
		const duration = performance.now() - start;

		expect(result).toHaveLength(100);
		expect(duration).toBeLessThan(1000); // Should complete in <1s

		console.log(`Query time: ${duration}ms for 100 enrollments`);
	});
});
```

**T3.2: Verify All Tests Pass**

- [ ] Run full test suite: `bun test`
- [ ] Verify 100% coverage maintained
- [ ] Fix any regressions

**T3.3: Code Review**

- [ ] Ensure all asyncMap uses are correct
- [ ] Verify no accidentally introduced N+1 patterns
- [ ] Check readability improved

---

## Success Metrics

### Performance Metrics

| Metric                                          | Before      | After        | Improvement     |
| ----------------------------------------------- | ----------- | ------------ | --------------- |
| `getMyEnrollmentsWithProgress` (10 enrollments) | 571 queries | ~100 queries | **5-6x faster** |
| `getUserEnrollments` (50 enrollments)           | 51 queries  | ~11 queries  | **4-5x faster** |
| `getWithCurriculum` (20 modules)                | 221 queries | ~50 queries  | **4x faster**   |
| **Average Query Time**                          | 500-1000ms  | 100-300ms    | **3-5x faster** |

### Code Quality Metrics

| Metric               | Before | After                  |
| -------------------- | ------ | ---------------------- |
| N+1 Patterns         | 15+    | 0 ✅                   |
| Nested Promise.all   | 15+    | 0 ✅                   |
| Lines of Boilerplate | ~200   | ~50 (75% reduction) ✅ |
| Readability Score    | 6/10   | 9/10 ✅                |

---

## Migration Pattern Reference

### Pattern 1: Simple Map

**Before:**

```typescript
return await Promise.all(
	items.map(async item => {
		const related = await ctx.db.get(item.relatedId);
		return { ...item, related };
	}),
);
```

**After:**

```typescript
import { asyncMap } from 'convex-helpers';

return await asyncMap(items, async item => {
	const related = await ctx.db.get(item.relatedId);
	return { ...item, related };
});
```

**Why Better:** Clearer intent, less nesting.

---

### Pattern 2: Batch Reading

**Before:**

```typescript
return await Promise.all(
	items.map(async item => {
		const related = await ctx.db.get(item.relatedId);
		return { ...item, related };
	}),
);
```

**After (Batched):**

```typescript
// Read all at once
const relatedIds = items.map(i => i.relatedId);
const related = await Promise.all(relatedIds.map(id => ctx.db.get(id)));
const relatedMap = new Map(related.filter(Boolean).map(r => [r!._id, r]));

// Map synchronously
return items.map(item => ({
	...item,
	related: relatedMap.get(item.relatedId) || null,
}));
```

**Why Better:** Reduces queries from N to 1 batch.

---

### Pattern 3: Relationship Helpers

**Before:**

```typescript
const author = await ctx.db.get(post.authorId);
if (!author) throw new Error('Author not found');
```

**After:**

```typescript
import { getOneFromOrThrow } from 'convex-helpers/server/relationships';

const author = await getOneFromOrThrow(ctx.db, 'users', '_id', post.authorId);
```

**Why Better:** Built-in error handling, clearer relationship.

---

### Pattern 4: One-to-Many

**Before:**

```typescript
const posts = await ctx.db
	.query('posts')
	.withIndex('by_author', q => q.eq('authorId', authorId))
	.collect();
```

**After:**

```typescript
import { getManyFrom } from 'convex-helpers/server/relationships';

const posts = await getManyFrom(ctx.db, 'posts', 'authorId', authorId);
```

**Why Better:** More declarative, less boilerplate.

---

## Dependencies

**Existing (Already Installed):**

- ✅ convex-helpers@0.1.104

**No New Dependencies Required!**

---

## Files to Modify

### High Priority:

1. `convex/enrollments.ts` - 4 N+1 patterns (CRITICAL)
2. `convex/courses.ts` - 2 N+1 patterns
3. `convex/analytics.ts` - 2 N+1 patterns

### Medium Priority:

4. `convex/recommendations.ts` - 2 N+1 patterns
5. `convex/favorites.ts` - 1 N+1 pattern
6. `convex/notifications.ts` - 1 N+1 pattern

### New Files:

- `convex/helpers/relationships.ts` - Relationship helper utilities

---

## Rollout Plan

### Day 1: Critical Queries (Morning)

- Create `convex/helpers/relationships.ts`
- Refactor `enrollments.ts` (Stream A)
- Benchmark performance improvements

### Day 1: Remaining Queries (Afternoon)

- Refactor `analytics.ts`, `recommendations.ts`, `favorites.ts` (Stream B)
- Run full test suite

### Day 2: Polish & Documentation

- Performance benchmarks
- Update documentation
- Team training

---

## Resources

**Documentation:**

- convex-helpers Relationships: https://github.com/get-convex/convex-helpers#relationship-helpers
- Stack Post: https://stack.convex.dev/functional-relationships-helpers

**Standards:**

- Update `.factory/standards/convex.md` to mandate relationship helpers

---

## Orchestration Notes

**Recommended Execution:** Parallel with Droidz Orchestrator

**Why Parallel Works:**

- ✅ 2 independent file groups (enrollments/courses, analytics/recommendations)
- ✅ No dependencies between refactors
- ✅ Clear patterns to follow

**Sequential Time:** 8-12 hours  
**Parallel Time (2 agents):** 4-6 hours  
**Speedup:** 2x faster ⚡

**Orchestrator Command:**

```bash
"Use orchestrator to implement Spec 005 in parallel"
```

---

## Post-Implementation Validation Checklist

- [ ] All 15+ N+1 patterns refactored
- [ ] asyncMap used consistently
- [ ] Relationship helpers used where appropriate
- [ ] All Convex tests passing (100% coverage)
- [ ] Performance benchmarks show 2-5x improvement
- [ ] Code more readable
- [ ] No new N+1 patterns introduced

---

**Dependencies:**

- Can run independently of other specs
- Complements Spec 001 (both improve Convex usage)

**Impact:** Performance improvement + code quality

---

_This spec optimizes existing Convex queries for 2-5x better performance using relationship helpers already available in convex-helpers@0.1.104._
