# Doctrina LMS - Development Guide

**Project**: Learning Management System  
**Tech Stack**: Next.js 16 + React 19 + Convex + TypeScript  
**Last Updated**: 2025-11-15

## Quick Reference

### Tech Stack Overview
- **Frontend**: Next.js 16.0.1 (App Router)
- **UI Library**: React 19.2.0
- **Backend/Database**: Convex 1.28.2
- **Authentication**: Clerk 6.34.5
- **Styling**: Tailwind CSS 4.1.17
- **Components**: Radix UI (shadcn/ui pattern)
- **Forms**: React Hook Form 7.66.0 + Zod 4.1.12
- **Animation**: Framer Motion 12.23.24
- **Charts**: Recharts 3.3.0
- **Payments**: Stripe 19.3.0
- **Language**: TypeScript 5.9.3
- **Testing**: Vitest 4.0.8
- **Package Manager**: Yarn 4.10.3
- **Node Version**: 24.10.0 (Volta)

### Development Commands

```bash
# Development
yarn dev                  # Start Next.js frontend + Convex backend
yarn dev:frontend         # Start Next.js only
yarn dev:backend          # Start Convex only

# Build & Deploy
yarn build               # Build for production
yarn start               # Start production server
yarn convex:deploy       # Deploy Convex backend

# Code Quality
yarn lint                # Run ESLint (max 0 warnings)
yarn lint:fix            # Fix ESLint issues
yarn formatting          # Check Prettier formatting
yarn formatting:fix      # Fix formatting
yarn typescript          # Type check

# Testing
yarn test                # Run all tests
yarn test:watch          # Run tests in watch mode
yarn test:ui             # Run tests with UI
yarn test:coverage       # Run tests with coverage report

# All-in-one verification
yarn verify              # Format + Lint + TypeCheck + Test with coverage
```

## Project Structure

```
doctrina-lms/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group
│   ├── (dashboard)/              # Dashboard route group
│   ├── api/                      # API routes
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   └── ...                       # Feature components
├── convex/                       # Convex backend
│   ├── schema.ts                 # Database schema
│   ├── _generated/               # Generated types
│   └── *.ts                      # Queries, mutations, actions
├── lib/                          # Utility functions
│   ├── utils.ts                  # General utilities
│   └── ...                       # Feature-specific utils
├── hooks/                        # Custom React hooks
├── types/                        # TypeScript type definitions
├── tests/                        # Test files
├── public/                       # Static assets
├── .claude/                      # Claude Code configuration
│   ├── standards/                # Coding standards
│   ├── memory/                   # Project memory
│   └── specs/                    # Specifications
└── docs/                         # Documentation

```

## Coding Standards

### Core Standards (Read these first!)
1. [Next.js Standards](.claude/standards/nextjs.md) - App Router, Server Components, routing
2. [React + Convex Standards](.claude/standards/react-convex.md) - useState-less pattern, real-time data
3. [React Standards](.claude/standards/react.md) - Components, hooks, patterns
4. [TypeScript Standards](.claude/standards/typescript.md) - Types, interfaces, generics
5. [Testing Standards](.claude/standards/testing.md) - Vitest, convex-test, 100% coverage
6. [Security Standards](.claude/standards/security.md) - Auth, validation, XSS prevention

### UI & Styling Standards
7. [shadcn/ui Standards](.claude/standards/shadcn-ui.md) - Component library, theming
8. [Tailwind CSS Standards](.claude/standards/tailwind.md) - Utility-first CSS, theme variables
9. [Form Patterns](.claude/standards/forms.md) - React Hook Form + Zod + Controller pattern

### Key Principles

**Architecture**
- Server Components by default (use 'use client' only when needed)
- Convex for all backend operations (no REST APIs)
- Clerk for authentication/authorization
- Type-safe with TypeScript strict mode
- Test-driven development (TDD)

**Code Style**
- Functional components with hooks (no class components)
- Named exports (not default exports)
- Explicit types for all function parameters and returns
- Zod schemas for runtime validation
- ESLint + Prettier (zero warnings policy)

**File Organization**
- Collocate related files (components, hooks, tests)
- Use route groups in app/ directory
- Keep components small and focused
- Extract reusable logic to custom hooks
- One component per file

## Development Workflow

### 1. Start Development Environment
```bash
yarn dev
```
This starts:
- Next.js on `http://localhost:3000`
- Convex on configured URL

### 2. Create a Feature

**Frontend (React Component)**
```typescript
// components/courses/CourseCard.tsx
'use client';

import { Card } from '@/components/ui/card';

interface CourseCardProps {
  title: string;
  description: string;
}

export function CourseCard({ title, description }: CourseCardProps) {
  return (
    <Card>
      <h3>{title}</h3>
      <p>{description}</p>
    </Card>
  );
}
```

**Backend (Convex)**
```typescript
// convex/courses.ts
import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query('courses').collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    // Check auth
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');
    
    return await ctx.db.insert('courses', args);
  },
});
```

**Using in Page**
```typescript
// app/courses/page.tsx
'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { CourseCard } from '@/components/courses/CourseCard';

export default function CoursesPage() {
  const courses = useQuery(api.courses.list);
  const createCourse = useMutation(api.courses.create);
  
  if (courses === undefined) return <div>Loading...</div>;
  
  return (
    <div>
      {courses.map((course) => (
        <CourseCard key={course._id} {...course} />
      ))}
    </div>
  );
}
```

### 3. Write Tests
```typescript
// components/courses/CourseCard.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CourseCard } from './CourseCard';

describe('CourseCard', () => {
  it('renders course information', () => {
    render(
      <CourseCard 
        title="Test Course" 
        description="Test Description" 
      />
    );
    
    expect(screen.getByText('Test Course')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });
});
```

### 4. Verify Code Quality
```bash
yarn verify
```

### 5. Commit Changes
```bash
git add .
git commit -m "feat: add course card component"
```

## Authentication & Authorization

### Protect Server Components
```typescript
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  
  return <div>Protected content</div>;
}
```

### Protect Convex Functions
```typescript
export const protectedMutation = mutation({
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');
    
    // Check role
    const user = await getUserByClerkId(ctx, identity.subject);
    if (user?.role !== 'instructor') {
      throw new Error('Forbidden');
    }
    
    // Proceed
  },
});
```

## Environment Variables

### Required Variables
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Convex Backend
NEXT_PUBLIC_CONVEX_URL=https://...
CONVEX_DEPLOYMENT=...

# Stripe Payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Common Patterns

### Form with Validation (FormProvider + Controller)
```typescript
'use client';

import { FormProvider, Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const schema = z.object({
  title: z.string().min(1, 'Required'),
  description: z.string().min(10, 'Too short'),
});

type FormData = z.infer<typeof schema>;

export function CourseForm() {
  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', description: '' },
  });

  const onSubmit = async (data: FormData) => {
    // Handle submission
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
        <Controller
          control={methods.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={methods.formState.isSubmitting}>
          {methods.formState.isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </form>
    </FormProvider>
  );
}
```

### Data Fetching with Loading State
```typescript
'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function DataComponent() {
  const data = useQuery(api.myQuery);
  
  if (data === undefined) {
    return <LoadingSkeleton />;
  }
  
  if (data.length === 0) {
    return <EmptyState />;
  }
  
  return <DataDisplay data={data} />;
}
```

## Troubleshooting

### Common Issues

**TypeScript Errors**
```bash
yarn typescript
# Fix errors, don't use @ts-ignore
```

**ESLint Warnings**
```bash
yarn lint:fix
# Zero warnings policy
```

**Test Failures**
```bash
yarn test:ui
# Debug with UI mode
```

**Convex Connection Issues**
```bash
# Check .env.local has NEXT_PUBLIC_CONVEX_URL
# Restart dev server
yarn dev
```

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/course-management

# Make changes
# ... code ...

# Verify quality
yarn verify

# Commit
git add .
git commit -m "feat: add course management"

# Push and create PR
git push origin feature/course-management
```

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Convex Docs](https://docs.convex.dev)
- [Clerk Docs](https://clerk.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vitest Docs](https://vitest.dev)

## Getting Help

1. Check relevant standard in `.claude/standards/`
2. Search existing issues/docs
3. Ask in team chat
4. Create issue with reproduction

---

**Remember**: Write tests first, keep components small, use TypeScript strictly, and follow the zero-warnings policy!
