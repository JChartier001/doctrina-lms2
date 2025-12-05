# Project Standards - Doctrina LMS

**Last Updated**: 2025-11-25  
**Tech Stack**: Next.js 16 + React 19 + Convex + TypeScript

## Purpose

These standards ensure:

- **Consistency**: All code follows the same patterns
- **Quality**: Best practices enforced across the codebase
- **Maintainability**: Code is easy to understand and modify
- **Type Safety**: TypeScript strict mode with zero `any` types
- **Real-Time First**: Convex reactive queries for live updates
- **Server-First**: Server Components by default, Client Components when needed

## Quick Reference

### Key Standards

1. **[Tech Stack](global/tech-stack.md)** - Complete technology choices and versions
2. **[Convex Queries & Mutations](backend/queries.md)** - Backend data patterns
3. **[React Components](frontend/components.md)** - Server & Client Components
4. **[Error Handling](global/error-handling.md)** - Error patterns and recovery
5. **[Validation](global/validation.md)** - Zod schemas and runtime validation

### Development Principles

- ✅ **Server Components by default** - Add `'use client'` only when needed
- ✅ **Named exports only** - No default exports
- ✅ **TypeScript strict mode** - Explicit types for everything
- ✅ **Real-time with Convex** - `useQuery`/`useMutation` for reactive data
- ✅ **FormProvider + Controller** - React Hook Form pattern for all forms
- ✅ **Zero warnings policy** - `yarn lint --max-warnings 0`
- ✅ **100% test coverage target** - Vitest + Testing Library

## Standards Categories

### Global Standards

Apply to all code in this project:

- **[tech-stack.md](global/tech-stack.md)** - Complete tech stack with versions
- **[coding-style.md](global/coding-style.md)** - General coding conventions
- **[error-handling.md](global/error-handling.md)** - Error handling patterns
- **[validation.md](global/validation.md)** - Zod validation patterns
- **[conventions.md](global/conventions.md)** - Naming and file conventions
- **[commenting.md](global/commenting.md)** - Code documentation standards

### Frontend Standards

React 19 + Next.js 16 App Router:

- **[components.md](frontend/components.md)** - Server & Client Component patterns
- **[css.md](frontend/css.md)** - Tailwind CSS 4 utilities and conventions
- **[responsive.md](frontend/responsive.md)** - Mobile-first responsive design
- **[accessibility.md](frontend/accessibility.md)** - WCAG compliance and a11y

### Backend Standards

Convex serverless backend:

- **[queries.md](backend/queries.md)** - Convex query/mutation/action patterns
- **[models.md](backend/models.md)** - Database schema and data modeling
- **[api.md](backend/api.md)** - API design and endpoint patterns
- **[migrations.md](backend/migrations.md)** - Schema migration strategies

### Testing Standards

Vitest + Testing Library + convex-test:

- **[test-writing.md](testing/test-writing.md)** - Test structure and patterns

## Tech Stack Overview

### Frontend

- **Framework**: Next.js 16.0.1 (App Router, Turbopack)
- **UI Library**: React 19.2.0
- **Styling**: Tailwind CSS 4.1.17
- **Components**: shadcn/ui (Radix UI primitives)
- **Forms**: React Hook Form 7.66.0 + Zod 4.1.12
- **Animation**: Framer Motion 12.23.24

### Backend & Database

- **Backend**: Convex 1.28.2 (serverless, real-time)
- **Database**: Convex (reactive, WebSocket-based)
- **Auth**: Clerk 6.34.5
- **Payments**: Stripe 19.3.0

### Testing & Quality

- **Test Framework**: Vitest 4.0.8
- **Testing Library**: @testing-library/react 16.3.0
- **Convex Testing**: convex-test 0.0.38
- **Linting**: ESLint 9.39.1 + Prettier 3.6.2
- **Type Checking**: TypeScript 5.9.3 (strict mode)

### Development Tools

- **Package Manager**: Bun 1.2.0 / Yarn 4.10.3
- **Node Version**: 24.10.0 (Volta)

## How to Use

### For Developers

**Before starting work:**

1. Read relevant standard for your task area
2. Reference specific patterns during implementation
3. Follow coding examples exactly

**During development:**

- Use standards as checklist for code review
- Update standards when discovering new patterns
- Ask questions if standards are unclear

**Quality checks:**

```bash
# Run before committing
yarn verify  # Format + Lint + Type Check + Test with coverage
```

### For AI Assistants

Standards are automatically:

- Loaded during task planning
- Referenced during code generation
- Enforced during implementation
- Checked during verification

**Key patterns to follow:**

1. Always use named exports (not default)
2. Server Components by default, `'use client'` when needed
3. `useQuery`/`useMutation` for Convex data (never REST)
4. FormProvider + Controller for forms
5. TypeScript strict mode (no `any`)

### For Code Review

Use this checklist:

```markdown
- [ ] Named exports used (no default exports)
- [ ] TypeScript types explicit (no `any`)
- [ ] Server Component unless 'use client' needed
- [ ] Convex queries use indexes where appropriate
- [ ] Authentication checked in protected functions
- [ ] Forms use FormProvider + Controller pattern
- [ ] Loading states handled (useQuery undefined check)
- [ ] Error boundaries in place
- [ ] Tests written with 100% coverage
- [ ] Zero ESLint warnings
- [ ] Prettier formatted
```

## Common Patterns

### Pattern 1: Real-Time Data Fetching

**Server Component (static data):**

```typescript
// app/courses/page.tsx
import { fetchApi } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';

export default async function CoursesPage() {
  const courses = await fetchApi(api.courses.list);
  return <CourseGrid courses={courses} />;
}
```

**Client Component (real-time updates):**

```typescript
'use client';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function LiveNotifications() {
  const notifications = useQuery(api.notifications.list);
  if (notifications === undefined) return <Skeleton />;
  return <NotificationList items={notifications} />;
}
```

### Pattern 2: Form with Validation

```typescript
'use client';
import { FormProvider, Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  title: z.string().min(1, 'Required'),
  description: z.string().min(10, 'Too short'),
});

type FormData = z.infer<typeof schema>;

export function CourseForm() {
  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <Controller
          control={methods.control}
          name="title"
          render={({ field, fieldState: { error } }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              {error && <FormMessage>{error.message}</FormMessage>}
            </FormItem>
          )}
        />
      </form>
    </FormProvider>
  );
}
```

### Pattern 3: Convex Query with Index

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

### Pattern 4: Authenticated Mutation

```typescript
// convex/courses.ts
import { mutation } from './_generated/server';
import { v } from 'convex/values';

export const create = mutation({
	args: {
		title: v.string(),
		description: v.string(),
	},
	handler: async (ctx, args) => {
		// Always check auth in mutations
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new Error('Not authenticated');

		return await ctx.db.insert('courses', {
			...args,
			instructorId: identity.subject,
			createdAt: Date.now(),
		});
	},
});
```

## Standards Updates

### Recent Updates (2025-11-25)

**✅ Updated Standards:**

1. **global/tech-stack.md**
   - Added complete dependency versions
   - Documented all Radix UI components
   - Added development tools section
   - Included quality standards (zero warnings policy)

2. **backend/queries.md**
   - Complete rewrite for Convex patterns
   - Added real-time query examples from codebase
   - Included authentication patterns with Clerk
   - Added useQueryWithStatus pattern
   - Documented search filters, upsert, and pagination

3. **frontend/components.md**
   - Complete rewrite for React 19 + Next.js 16
   - Server Components vs Client Components
   - Real examples from resource-card.tsx
   - FormProvider + Controller pattern
   - Skeleton loading states
   - Optimistic UI updates with useOptimistic

**🎯 All Examples Now Project-Specific:**

- Real code from your codebase
- Actual Convex queries (users.ts, resources.ts, notifications.ts)
- Actual components (ResourceCard, NotificationBell)
- Your tech stack versions (Next.js 16, React 19, Convex 1.28)

## Maintenance

**Standards should be updated when:**

- New patterns emerge in codebase
- Framework best practices change
- Team learns better approaches
- New team members have questions
- Major version upgrades occur

**How to update:**

1. Identify the pattern or convention
2. Update relevant standard file
3. Add DO/DON'T examples
4. Include real code from the project
5. Update this README if needed

## Resources

### Official Documentation

- [Next.js 16 Docs](https://nextjs.org/docs)
- [React 19 Docs](https://react.dev)
- [Convex Docs](https://docs.convex.dev)
- [Clerk Docs](https://clerk.com/docs)
- [Tailwind CSS 4 Docs](https://tailwindcss.com/docs)
- [Vitest Docs](https://vitest.dev)

### Libraries

- [shadcn/ui Components](https://ui.shadcn.com)
- [React Hook Form](https://react-hook-form.com)
- [Zod Validation](https://zod.dev)
- [Convex Helpers](https://github.com/get-convex/convex-helpers)

### Project Files

- [CLAUDE.md](/CLAUDE.md) - Development guide
- [package.json](/package.json) - Dependencies

---

**Remember**: These standards are living documents. Update them as the project evolves!
