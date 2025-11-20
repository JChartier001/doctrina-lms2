# Spec 006: Implement Auth Middleware with Custom Functions

**Priority:** 🟢 **MEDIUM-LOW**  
**Status:** Active  
**Created:** 2025-11-20  
**Estimated Effort:** 1 day sequential | 3-4 hours parallel (2x speedup)  
**Impact:** Code quality, DRY principle, maintainability

---

## Summary

Eliminate repetitive auth logic across 10+ Convex functions by implementing custom query/mutation wrappers using `customQuery` and `customMutation` from `convex-helpers` (already installed!).

---

## Problem Statement

**Current State:**
- ✅ Auth logic works correctly
- ❌ **Repetitive auth boilerplate** in 10+ files
- ❌ Same pattern copy-pasted everywhere
- ❌ Easy to forget auth checks in new functions
- ⚠️ Maintenance burden (change auth logic → change 10+ files)

**Issues Found:**

**Pattern Found in 10+ Files:**
```typescript
// ❌ REPEATED IN EVERY FUNCTION (10+ times)
export const myQuery = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Unauthorized');
    }
    
    const user = await ctx.runQuery(api.users.getByExternalId, {
      externalId: identity.subject,
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Actual business logic...
  },
});
```

**Files with Repetitive Auth Pattern:**
1. `convex/users.ts`
2. `convex/enrollments.ts` (5+ functions)
3. `convex/courseModules.ts`
4. `convex/lessons.ts`
5. `convex/lessonProgress.ts`
6. `convex/image.ts`
7. `convex/stripe.ts`
8. `convex/payments.ts`
9. `convex/authHelpers.ts`

**Why This Is Bad:**
- **DRY Violation:** Same code repeated 10+ times
- **Error Prone:** Easy to forget auth check
- **Maintenance:** Change auth logic → update 10+ files
- **No Compiler Help:** TypeScript can't enforce auth

---

## Architecture Diagram

\`\`\`mermaid
graph TD
    subgraph "❌ Current: Repetitive Auth"
    A[Query 1] --> B[Copy-paste auth logic]
    C[Query 2] --> D[Copy-paste auth logic]
    E[Query 3] --> F[Copy-paste auth logic]
    G[Mutation 1] --> H[Copy-paste auth logic]
    end
    
    subgraph "✅ Target: Custom Functions"
    I[customQuery builder] --> J[Auto-loads user]
    K[All queries] --> I
    L[customMutation builder] --> M[Auto-loads user]
    N[All mutations] --> L
    end
    
    style B fill:#ffcccc
    style D fill:#ffcccc
    style F fill:#ffcccc
    style H fill:#ffcccc
    style J fill:#ccffcc
    style M fill:#ccffcc
\`\`\`

---

## Requirements

### Functional Requirements

**FR1: Custom Query Wrapper**
- ✅ Auto-load current user in all queries
- ✅ Provide `ctx.user` to handler
- ✅ Handle unauthenticated gracefully (return null)

**FR2: Custom Mutation Wrapper**
- ✅ Auto-load current user in all mutations
- ✅ Provide `ctx.user` to handler
- ✅ Throw error if not authenticated

**FR3: Optional Auth Levels**
- ✅ Public queries (no auth required)
- ✅ Authenticated queries (require user)
- ✅ Role-specific (instructor, admin)

**FR4: Maintain Exact Behavior**
- ✅ All existing functions work identically
- ✅ No breaking changes
- ✅ Tests continue passing

### Non-Functional Requirements

**NFR1: Code Reduction**
- ✅ Remove 200+ lines of boilerplate
- ✅ DRY principle (define once, use everywhere)

**NFR2: Type Safety**
- ✅ TypeScript knows `ctx.user` available
- ✅ Autocomplete works

**NFR3: Maintainability**
- ✅ Change auth logic in one place
- ✅ Easy to add new auth requirements

### Acceptance Criteria

- [ ] Custom query/mutation wrappers created
- [ ] 10+ functions refactored to use wrappers
- [ ] Auth logic centralized (1 place)
- [ ] TypeScript types correct (`ctx.user` available)
- [ ] All Convex tests passing
- [ ] Documentation updated

---

## Task Breakdown

### Phase 1: Foundation (Sequential - 1 hour)

**T1.1: Create Custom Function Builders**

**File:** `convex/lib/customFunctions.ts`

```typescript
/**
 * Custom query and mutation builders with automatic auth
 * 
 * Eliminates repetitive auth boilerplate across all Convex functions.
 * 
 * @see https://github.com/get-convex/convex-helpers#custom-functions
 */

import { customQuery, customMutation } from 'convex-helpers/server/customFunctions';
import { query, mutation, QueryCtx, MutationCtx } from '../_generated/server';
import { api } from '../_generated/api';
import { Doc } from '../_generated/dataModel';

/**
 * Query with optional authenticated user
 * 
 * Adds ctx.user (User | null) to all queries.
 * Does NOT throw if unauthenticated - returns null instead.
 * 
 * @example
 * export const myQuery = queryWithUser({
 *   args: {},
 *   handler: async (ctx) => {
 *     if (!ctx.user) return null; // Optional: check if needed
 *     return ctx.user.firstName; // TypeScript knows user is User | null
 *   },
 * });
 */
export const queryWithUser = customQuery(query, {
  args: {},
  input: async (ctx) => {
    const user = await getCurrentUser(ctx);
    return {
      ctx: { ...ctx, user },
      args: {},
    };
  },
});

/**
 * Query that REQUIRES authenticated user
 * 
 * Throws error if not authenticated.
 * Adds ctx.user (User) to handler.
 * 
 * @example
 * export const myQuery = queryWithAuthUser({
 *   args: {},
 *   handler: async (ctx) => {
 *     return ctx.user.firstName; // TypeScript knows user is User (not null)
 *   },
 * });
 */
export const queryWithAuthUser = customQuery(query, {
  args: {},
  input: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error('Unauthorized - please sign in');
    }
    return {
      ctx: { ...ctx, user },
      args: {},
    };
  },
});

/**
 * Mutation with REQUIRED authenticated user
 * 
 * Throws error if not authenticated.
 * Adds ctx.user (User) to handler.
 * 
 * @example
 * export const myMutation = mutationWithUser({
 *   args: { data: v.string() },
 *   handler: async (ctx, args) => {
 *     // TypeScript knows ctx.user is User (not null)
 *     return await ctx.db.insert('items', {
 *       data: args.data,
 *       userId: ctx.user._id,
 *     });
 *   },
 * });
 */
export const mutationWithUser = customMutation(mutation, {
  args: {},
  input: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error('Unauthorized - please sign in');
    }
    return {
      ctx: { ...ctx, user },
      args: {},
    };
  },
});

/**
 * Query that requires INSTRUCTOR role
 * 
 * @example
 * export const instructorQuery = queryWithInstructor({
 *   args: {},
 *   handler: async (ctx) => {
 *     // ctx.user is guaranteed to be an instructor
 *   },
 * });
 */
export const queryWithInstructor = customQuery(query, {
  args: {},
  input: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error('Unauthorized');
    }
    if (!user.isInstructor && !user.isAdmin) {
      throw new Error('Forbidden - instructor access required');
    }
    return {
      ctx: { ...ctx, user },
      args: {},
    };
  },
});

/**
 * Query that requires ADMIN role
 */
export const queryWithAdmin = customQuery(query, {
  args: {},
  input: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error('Unauthorized');
    }
    if (!user.isAdmin) {
      throw new Error('Forbidden - admin access required');
    }
    return {
      ctx: { ...ctx, user },
      args: {},
    };
  },
});

/**
 * Helper: Get current authenticated user
 * 
 * Returns null if not authenticated or user not found.
 * Used internally by custom functions.
 */
async function getCurrentUser(
  ctx: QueryCtx | MutationCtx
): Promise<Doc<'users'> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }
  
  const user = await ctx.db
    .query('users')
    .withIndex('by_externalId', q => q.eq('externalId', identity.subject))
    .unique();
  
  return user;
}
```

**T1.2: Update Type Definitions**

**File:** `convex/lib/types.ts` (create if needed)

```typescript
import { Doc } from '../_generated/dataModel';
import { QueryCtx, MutationCtx } from '../_generated/server';

/**
 * Query context with optional user
 */
export type QueryCtxWithUser = QueryCtx & {
  user: Doc<'users'> | null;
};

/**
 * Query context with required user
 */
export type QueryCtxWithAuthUser = QueryCtx & {
  user: Doc<'users'>;
};

/**
 * Mutation context with required user
 */
export type MutationCtxWithUser = MutationCtx & {
  user: Doc<'users'>;
};
```

---

### Phase 2: Parallel Refactoring (2 streams - 2-3 hours)

#### Stream A: Queries (droidz-codegen)

**T2.1: Refactor `convex/enrollments.ts`**

**Before:**
```typescript
export const getMyEnrollments = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    
    const user = await ctx.runQuery(api.users.getByExternalId, {
      externalId: identity.subject,
    });
    
    if (!user) {
      return [];
    }
    
    const enrollments = await ctx.db
      .query('enrollments')
      .withIndex('by_user', q => q.eq('userId', user._id))
      .collect();
    
    return enrollments;
  },
});
```

**After:**
```typescript
import { queryWithUser } from './lib/customFunctions';

export const getMyEnrollments = queryWithUser({
  args: {},
  handler: async (ctx) => {
    if (!ctx.user) return []; // TypeScript knows user is User | null
    
    const enrollments = await ctx.db
      .query('enrollments')
      .withIndex('by_user', q => q.eq('userId', ctx.user._id))
      .collect();
    
    return enrollments;
  },
});
```

**Lines Saved:** 12 → 5 (58% reduction)

**T2.2: Refactor `convex/users.ts`**

**T2.3: Refactor `convex/lessonProgress.ts`**

**T2.4: Refactor `convex/courseModules.ts`**

---

#### Stream B: Mutations (droidz-codegen)

**T2.5: Refactor `convex/image.ts`**

**Before:**
```typescript
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Unauthorized');
    }
    
    // ... upload logic
  },
});
```

**After:**
```typescript
import { mutationWithUser } from './lib/customFunctions';

export const generateUploadUrl = mutationWithUser({
  args: {},
  handler: async (ctx) => {
    // ctx.user is guaranteed to be User (not null)
    // ... upload logic
  },
});
```

**T2.6: Refactor `convex/lessons.ts`**

**T2.7: Refactor `convex/payments.ts`**

**T2.8: Refactor `convex/stripe.ts`**

---

### Phase 3: Testing (Sequential - 1 hour)

**T3.1: Unit Tests for Custom Functions**

```typescript
// convex/__test__/lib/customFunctions.test.ts
import { convexTest } from 'convex-test';
import { describe, it, expect } from 'vitest';
import { queryWithUser, queryWithAuthUser, mutationWithUser } from '../../lib/customFunctions';

describe('Custom Functions', () => {
  describe('queryWithUser', () => {
    it('returns null user when not authenticated', async () => {
      const t = convexTest(schema);
      
      const testQuery = queryWithUser({
        handler: async (ctx) => ctx.user,
      });
      
      const result = await t.query(testQuery);
      expect(result).toBeNull();
    });
    
    it('returns user when authenticated', async () => {
      const t = convexTest(schema);
      
      // Setup authenticated context
      const user = await t.run(async ctx => {
        return await ctx.db.insert('users', testUser);
      });
      
      t.withIdentity({ subject: testUser.externalId });
      
      const testQuery = queryWithUser({
        handler: async (ctx) => ctx.user,
      });
      
      const result = await t.query(testQuery);
      expect(result).not.toBeNull();
      expect(result._id).toBe(user);
    });
  });
  
  describe('queryWithAuthUser', () => {
    it('throws when not authenticated', async () => {
      const t = convexTest(schema);
      
      const testQuery = queryWithAuthUser({
        handler: async (ctx) => ctx.user,
      });
      
      await expect(t.query(testQuery)).rejects.toThrow('Unauthorized');
    });
    
    it('returns user when authenticated', async () => {
      const t = convexTest(schema);
      
      await t.run(async ctx => {
        await ctx.db.insert('users', testUser);
      });
      
      t.withIdentity({ subject: testUser.externalId });
      
      const testQuery = queryWithAuthUser({
        handler: async (ctx) => ctx.user,
      });
      
      const result = await t.query(testQuery);
      expect(result).not.toBeNull();
    });
  });
  
  describe('mutationWithUser', () => {
    it('throws when not authenticated', async () => {
      const t = convexTest(schema);
      
      const testMutation = mutationWithUser({
        handler: async (ctx) => ctx.user,
      });
      
      await expect(t.mutation(testMutation)).rejects.toThrow('Unauthorized');
    });
  });
});
```

**T3.2: Integration Tests**
- [ ] Verify all refactored functions work identically
- [ ] Test auth errors thrown correctly
- [ ] Test role-based access works

**T3.3: Regression Testing**
- [ ] Run full test suite
- [ ] Verify 100% coverage maintained

---

## Success Metrics

### Code Quality Metrics

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Lines of auth boilerplate | ~200 | ~50 | **75% reduction** |
| Files with auth logic | 10+ | 1 | **Centralized** |
| Auth logic copies | 10+ | 1 | **DRY** |
| Type safety | Partial | Full | **ctx.user typed** |

### Maintainability

**Before:** Change auth logic → update 10+ files  
**After:** Change auth logic → update 1 file ✅

**Example:** Adding `lastLoginAt` tracking:
- Before: Update 10+ files
- After: Update 1 `getCurrentUser()` function

---

## Migration Pattern Reference

### Pattern 1: Optional Auth Query

**Before:**
```typescript
export const myQuery = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    
    const user = await ctx.runQuery(api.users.getByExternalId, {
      externalId: identity.subject,
    });
    
    if (!user) return null;
    
    return user.firstName;
  },
});
```

**After:**
```typescript
import { queryWithUser } from './lib/customFunctions';

export const myQuery = queryWithUser({
  args: {},
  handler: async (ctx) => {
    if (!ctx.user) return null;
    return ctx.user.firstName;
  },
});
```

---

### Pattern 2: Required Auth Query

**Before:**
```typescript
export const myQuery = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');
    
    const user = await ctx.runQuery(api.users.getByExternalId, {
      externalId: identity.subject,
    });
    
    if (!user) throw new Error('User not found');
    
    return user.firstName;
  },
});
```

**After:**
```typescript
import { queryWithAuthUser } from './lib/customFunctions';

export const myQuery = queryWithAuthUser({
  args: {},
  handler: async (ctx) => {
    return ctx.user.firstName; // TypeScript knows user is not null
  },
});
```

---

### Pattern 3: Mutation with Auth

**Before:**
```typescript
export const myMutation = mutation({
  args: { data: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');
    
    const user = await ctx.runQuery(api.users.getByExternalId, {
      externalId: identity.subject,
    });
    
    if (!user) throw new Error('User not found');
    
    return await ctx.db.insert('items', {
      data: args.data,
      userId: user._id,
    });
  },
});
```

**After:**
```typescript
import { mutationWithUser } from './lib/customFunctions';

export const myMutation = mutationWithUser({
  args: { data: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert('items', {
      data: args.data,
      userId: ctx.user._id, // TypeScript knows user exists
    });
  },
});
```

---

### Pattern 4: Instructor-Only Query

**Before:**
```typescript
export const myQuery = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');
    
    const user = await ctx.runQuery(api.users.getByExternalId, {
      externalId: identity.subject,
    });
    
    if (!user) throw new Error('User not found');
    if (!user.isInstructor) throw new Error('Forbidden');
    
    return instructorData;
  },
});
```

**After:**
```typescript
import { queryWithInstructor } from './lib/customFunctions';

export const myQuery = queryWithInstructor({
  args: {},
  handler: async (ctx) => {
    // ctx.user is guaranteed to be instructor
    return instructorData;
  },
});
```

---

## Dependencies

**Existing (Already Installed):**
- ✅ convex-helpers@0.1.104

**No New Dependencies Required!**

---

## Files to Modify

### New Files:
1. `convex/lib/customFunctions.ts` - Custom builders
2. `convex/lib/types.ts` - Type definitions
3. `convex/__test__/lib/customFunctions.test.ts` - Tests

### Files to Refactor:
1. `convex/enrollments.ts` - 5+ functions
2. `convex/users.ts` - 2+ functions
3. `convex/lessons.ts` - 2+ functions
4. `convex/lessonProgress.ts` - 2+ functions
5. `convex/courseModules.ts` - 1+ function
6. `convex/image.ts` - 1+ function
7. `convex/stripe.ts` - 1+ function
8. `convex/payments.ts` - 1+ function

---

## Rollout Plan

### Day 1: Setup & Queries (Morning)
- Create `convex/lib/customFunctions.ts`
- Create tests
- Refactor query functions (Stream A)

### Day 1: Mutations (Afternoon)
- Refactor mutation functions (Stream B)
- Run full test suite

---

## Resources

**Documentation:**
- convex-helpers Custom Functions: https://github.com/get-convex/convex-helpers#custom-functions
- Stack Post: https://stack.convex.dev/custom-functions

**Standards:**
- Update `.factory/standards/convex.md` to mandate custom functions

---

## Orchestration Notes

**Recommended Execution:** Parallel with Droidz Orchestrator

**Sequential Time:** 6-8 hours  
**Parallel Time (2 agents):** 3-4 hours  
**Speedup:** 2x faster ⚡

**Orchestrator Command:**
```bash
"Use orchestrator to implement Spec 006 in parallel"
```

---

## Post-Implementation Validation Checklist

- [ ] Custom function builders created and tested
- [ ] 10+ functions refactored
- [ ] Auth logic centralized
- [ ] TypeScript types correct
- [ ] All tests passing
- [ ] 75% code reduction achieved

---

**Dependencies:**
- Can run independently
- Complements Spec 004 (auth protection)

**Impact:** Code quality + maintainability

---

*This spec eliminates 200+ lines of repetitive auth boilerplate using custom functions from convex-helpers@0.1.104.*
