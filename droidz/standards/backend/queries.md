# Convex Query & Mutation Standards

## Overview

Convex provides type-safe queries, mutations, and actions for backend operations. This standard covers best practices for writing efficient, maintainable Convex functions.

## Core Principles

### 1. **Type-Safe Arguments**

Always define explicit args using Convex validators (`v.*`)

### 2. **Real-Time First**

Design queries to be reactive - they automatically re-run when data changes

### 3. **Authentication Checks**

Always verify authentication before accessing sensitive data

### 4. **Indexed Queries**

Use database indexes for fast lookups by common fields

### 5. **Single Responsibility**

Each query/mutation should do one thing well

## ✅ DO

### Query Definition

**✅ DO**: Define explicit args with Convex validators

```typescript
// convex/users.ts
import { query } from './_generated/server';
import { v } from 'convex/values';

export const getByEmail = query({
	args: { email: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query('users')
			.withIndex('by_email', q => q.eq('email', args.email))
			.first();
	},
});
```

**✅ DO**: Use database indexes for common queries

```typescript
export const getByExternalId = query({
	args: { externalId: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query('users')
			.withIndex('by_externalId', q => q.eq('externalId', args.externalId))
			.first();
	},
});
```

**✅ DO**: Check authentication in protected queries

```typescript
export const getCurrentUser = query({
	args: {},
	handler: async ctx => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new Error('Not authenticated');

		return await ctx.db
			.query('users')
			.withIndex('by_externalId', q => q.eq('externalId', identity.subject))
			.first();
	},
});
```

### Mutation Definition

**✅ DO**: Use mutations for all data modifications

```typescript
export const create = mutation({
	args: {
		title: v.string(),
		description: v.string(),
		instructorId: v.id('users'),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new Error('Not authenticated');

		return await ctx.db.insert('courses', {
			...args,
			createdAt: Date.now(),
			updatedAt: Date.now(),
		});
	},
});
```

**✅ DO**: Validate existence before updates

```typescript
export const update = mutation({
	args: {
		id: v.id('courses'),
		title: v.optional(v.string()),
		description: v.optional(v.string()),
	},
	handler: async (ctx, { id, ...updates }) => {
		const course = await ctx.db.get(id);
		if (!course) throw new Error('Course not found');

		await ctx.db.patch(id, {
			...updates,
			updatedAt: Date.now(),
		});

		return id;
	},
});
```

**✅ DO**: Use schema validators for complex objects

```typescript
// convex/schema.ts
export const userSchema = {
	firstName: v.string(),
	lastName: v.string(),
	email: v.string(),
	isInstructor: v.boolean(),
	isAdmin: v.boolean(),
};

// convex/users.ts
import { userSchema } from './schema';

export const create = mutation({
	args: userSchema,
	handler: async (ctx, args) => {
		return await ctx.db.insert('users', args);
	},
});
```

### Frontend Usage

**✅ DO**: Use useQuery for reactive data fetching

```typescript
'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function CoursesList() {
  const courses = useQuery(api.courses.list);

  // undefined = loading, null = no data, array = data
  if (courses === undefined) return <Skeleton />;
  if (!courses.length) return <EmptyState />;

  return <CourseGrid courses={courses} />;
}
```

**✅ DO**: Use useQueryWithStatus for better state handling

```typescript
import { useQueryWithStatus } from '@/lib/convex';
import { api } from '@/convex/_generated/api';

export function NotificationsPage() {
  const { isPending, isError, error, data } = useQueryWithStatus(
    api.notifications.list
  );

  if (isPending) return <Skeleton />;
  if (isError) return <ErrorMessage error={error} />;

  return <NotificationList notifications={data} />;
}
```

**✅ DO**: Use useMutation with proper error handling

```typescript
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function EnrollButton({ courseId }: { courseId: Id<'courses'> }) {
  const enroll = useMutation(api.enrollments.create);
  const [isLoading, setIsLoading] = useState(false);

  const handleEnroll = async () => {
    setIsLoading(true);
    try {
      await enroll({ courseId });
      toast.success('Enrolled successfully!');
    } catch (error) {
      toast.error('Failed to enroll');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleEnroll} disabled={isLoading}>
      {isLoading ? 'Enrolling...' : 'Enroll Now'}
    </Button>
  );
}
```

## ❌ DON'T

**❌ DON'T**: Skip argument validation

```typescript
// Bad - no args validation
export const getBad = query({
	handler: async (ctx, args: any) => {
		return await ctx.db.get(args.id); // Unsafe!
	},
});
```

**Why**: Type safety lost, runtime errors likely

**❌ DON'T**: Forget authentication checks

```typescript
// Bad - no auth check
export const deleteUser = mutation({
	args: { id: v.id('users') },
	handler: async (ctx, args) => {
		await ctx.db.delete(args.id); // Anyone can delete!
	},
});
```

**Why**: Security vulnerability, unauthorized access

**❌ DON'T**: Use queries without indexes for common lookups

```typescript
// Bad - full table scan
export const findByEmail = query({
	args: { email: v.string() },
	handler: async (ctx, args) => {
		const users = await ctx.db.query('users').collect();
		return users.find(u => u.email === args.email); // Slow!
	},
});
```

**Why**: Poor performance, doesn't scale

**❌ DON'T**: Modify data in queries

```typescript
// Bad - mutation in query
export const getAndUpdate = query({
	args: { id: v.id('users') },
	handler: async (ctx, args) => {
		const user = await ctx.db.get(args.id);
		await ctx.db.patch(args.id, { lastSeen: Date.now() }); // Wrong!
		return user;
	},
});
```

**Why**: Queries should be read-only, use mutations for writes

**❌ DON'T**: Catch and swallow errors silently

```typescript
// Bad - silent failure
export const create = mutation({
	args: { title: v.string() },
	handler: async (ctx, args) => {
		try {
			return await ctx.db.insert('courses', args);
		} catch (error) {
			return null; // Error hidden from user!
		}
	},
});
```

**Why**: Errors should propagate to the frontend for proper handling

## Patterns & Examples

### Pattern 1: Search with Filters

**Use Case**: Searching resources with multiple filter criteria

**Implementation**:

```typescript
// convex/resources.ts
export const search = query({
	args: {
		searchTerm: v.optional(v.string()),
		category: v.optional(v.string()),
		type: v.optional(v.string()),
		difficulty: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		let query = ctx.db.query('resources');

		// Apply filters
		if (args.category) {
			query = query.filter(q => q.field('categories').includes(args.category!));
		}

		if (args.type) {
			query = query.filter(q => q.eq(q.field('type'), args.type!));
		}

		if (args.difficulty) {
			query = query.filter(q => q.eq(q.field('difficulty'), args.difficulty!));
		}

		const results = await query.collect();

		// Text search in memory (Convex doesn't have full-text search)
		if (args.searchTerm) {
			const term = args.searchTerm.toLowerCase();
			return results.filter(r => r.title.toLowerCase().includes(term) || r.description.toLowerCase().includes(term));
		}

		return results;
	},
});
```

### Pattern 2: Ensure User Exists (Upsert Pattern)

**Use Case**: Create user if doesn't exist, return existing otherwise

**Implementation**:

```typescript
export const ensureCurrentUser = mutation({
	args: {},
	handler: async ctx => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new Error('Not authenticated');

		// Check by external ID first
		const existingByExternal = await ctx.db
			.query('users')
			.withIndex('by_externalId', q => q.eq('externalId', identity.subject))
			.first();
		if (existingByExternal) return existingByExternal._id;

		// Check by email
		const existingByEmail = identity.email
			? await ctx.db
					.query('users')
					.withIndex('by_email', q => q.eq('email', identity.email!))
					.first()
			: null;
		if (existingByEmail) {
			await ctx.db.patch(existingByEmail._id, { externalId: identity.subject });
			return existingByEmail._id;
		}

		// Create new user
		return await ctx.db.insert('users', {
			firstName: identity.name ?? 'User',
			lastName: '',
			email: identity.email ?? `${identity.subject}@example.com`,
			isInstructor: false,
			isAdmin: false,
			externalId: identity.subject,
			createdAt: Date.now(),
		});
	},
});
```

### Pattern 3: Paginated Queries

**Use Case**: Load large datasets in chunks

**Implementation**:

```typescript
export const listPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('courses')
      .order('desc')
      .paginate(args.paginationOpts);
  },
});

// Frontend usage
import { usePaginatedQuery } from 'convex/react';

export function CoursesList() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.courses.listPaginated,
    {},
    { initialNumItems: 10 }
  );

  return (
    <>
      <CourseGrid courses={results} />
      {status === 'CanLoadMore' && (
        <Button onClick={() => loadMore(10)}>Load More</Button>
      )}
    </>
  );
}
```

## Common Mistakes

1. **Using queries for data modification**
   - Problem: Queries are cached and should be pure functions
   - Solution: Always use mutations for writes

2. **Not checking authentication**
   - Problem: Unauthorized users can access/modify data
   - Solution: Check `ctx.auth.getUserIdentity()` in protected functions

3. **Forgetting indexes**
   - Problem: Queries scan entire table (slow at scale)
   - Solution: Define indexes in schema.ts and use `.withIndex()`

4. **Catching errors without re-throwing**
   - Problem: Frontend doesn't know about errors
   - Solution: Let errors propagate or throw custom errors

## Testing Standards

### Test Queries and Mutations

```typescript
// convex/users.test.ts
import { convexTest } from 'convex-test';
import { expect, test } from 'vitest';
import schema from './schema';
import { getByEmail, create } from './users';

test('create user', async () => {
	const t = convexTest(schema);

	const userId = await t.mutation(create, {
		firstName: 'John',
		lastName: 'Doe',
		email: 'john@example.com',
		externalId: 'clerk_123',
		isInstructor: false,
		isAdmin: false,
	});

	expect(userId).toBeDefined();

	const user = await t.query(getByEmail, { email: 'john@example.com' });
	expect(user?.firstName).toBe('John');
});
```

## Resources

- [Convex Documentation](https://docs.convex.dev)
- [Convex Helpers](https://github.com/get-convex/convex-helpers)
- [convex-test Library](https://www.npmjs.com/package/convex-test)
