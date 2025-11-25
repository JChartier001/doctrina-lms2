# React Component Standards - React 19 + Next.js 16

## Overview

React 19 with Next.js 16 introduces powerful Server Components alongside enhanced Client Components. This standard covers best practices for both.

## Core Principles

### 1. **Server Components by Default**
Start with Server Components, add 'use client' only when needed

### 2. **Single Responsibility**
Each component should have one clear purpose and do it well

### 3. **Reusability & Composability**
Build complex UIs by combining smaller, simpler components

### 4. **Type Safety**
Use TypeScript with explicit types for all props

### 5. **Named Exports**
Always use named exports (not default exports)

## ✅ DO

### Server Components (Default)

**✅ DO**: Use Server Components for static content and data fetching
```typescript
// app/courses/page.tsx
import { fetchApi } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';

export default async function CoursesPage() {
  // Data fetching in Server Component (no loading state needed!)
  const courses = await fetchApi(api.courses.list);
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Courses</h1>
      <div className="grid grid-cols-3 gap-6">
        {courses.map(course => (
          <CourseCard key={course._id} course={course} />
        ))}
      </div>
    </div>
  );
}
```

**✅ DO**: Use async/await in Server Components
```typescript
// components/course-details.tsx
import { fetchApi } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

interface CourseDetailsProps {
  courseId: Id<'courses'>;
}

export async function CourseDetails({ courseId }: CourseDetailsProps) {
  const course = await fetchApi(api.courses.get, { id: courseId });
  
  if (!course) {
    return <div>Course not found</div>;
  }
  
  return (
    <div>
      <h2>{course.title}</h2>
      <p>{course.description}</p>
    </div>
  );
}
```

### Client Components ('use client')

**✅ DO**: Add 'use client' for interactivity, hooks, or browser APIs
```typescript
'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';

interface EnrollButtonProps {
  courseId: Id<'courses'>;
}

export function EnrollButton({ courseId }: EnrollButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const enroll = useMutation(api.enrollments.create);
  
  const handleClick = async () => {
    setIsLoading(true);
    try {
      await enroll({ courseId });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button onClick={handleClick} disabled={isLoading}>
      {isLoading ? 'Enrolling...' : 'Enroll Now'}
    </Button>
  );
}
```

**✅ DO**: Use named exports for all components
```typescript
// ✅ Good - named export
export function ResourceCard({ resource }: ResourceCardProps) {
  return <Card>...</Card>;
}

// ❌ Bad - default export
export default function ResourceCard() {
  return <Card>...</Card>;
}
```

**✅ DO**: Define explicit prop interfaces
```typescript
import { Id } from '@/convex/_generated/dataModel';

interface CourseCardProps {
  course: {
    _id: Id<'courses'>;
    title: string;
    description: string;
    instructorId: Id<'users'>;
    thumbnailUrl?: string;
    price?: number;
  };
  onEnroll?: (courseId: Id<'courses'>) => void;
  variant?: 'default' | 'compact';
}

export function CourseCard({ 
  course, 
  onEnroll, 
  variant = 'default' 
}: CourseCardProps) {
  // Implementation
}
```

**✅ DO**: Use Convex hooks for real-time data
```typescript
'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function NotificationBell() {
  // Real-time, automatically updates when data changes
  const notifications = useQuery(api.notifications.list);
  
  const unreadCount = notifications?.filter(n => !n.read).length ?? 0;
  
  return (
    <button className="relative">
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 text-xs">
          {unreadCount}
        </span>
      )}
    </button>
  );
}
```

### Component Composition

**✅ DO**: Compose components using children pattern
```typescript
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn('rounded-lg border bg-card p-6', className)}>
      {children}
    </div>
  );
}

// Usage
<Card>
  <CardHeader>
    <CardTitle>Course Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Course content...</p>
  </CardContent>
</Card>
```

**✅ DO**: Use render props for flexible composition
```typescript
interface DataTableProps<T> {
  data: T[];
  renderRow: (item: T) => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
}

export function DataTable<T>({ 
  data, 
  renderRow, 
  renderEmpty 
}: DataTableProps<T>) {
  if (data.length === 0) {
    return renderEmpty?.() ?? <div>No data</div>;
  }
  
  return (
    <div className="space-y-2">
      {data.map((item, index) => (
        <div key={index}>{renderRow(item)}</div>
      ))}
    </div>
  );
}
```

### Forms with React Hook Form + Controller

**✅ DO**: Use FormProvider + Controller pattern
```typescript
'use client';

import { FormProvider, Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
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
          render={({ field, fieldState: { error } }) => (
            <FormItem>
              <FormLabel>Course Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter course title" />
              </FormControl>
              {error && <FormMessage>{error.message}</FormMessage>}
            </FormItem>
          )}
        />
        
        <Controller
          control={methods.control}
          name="description"
          render={({ field, fieldState: { error } }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} rows={4} />
              </FormControl>
              {error && <FormMessage>{error.message}</FormMessage>}
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

## ❌ DON'T

**❌ DON'T**: Use 'use client' unnecessarily
```typescript
// Bad - no need for 'use client'
'use client';

export function StaticHeader() {
  return <h1>Static Title</h1>; // No interactivity!
}

// Good - Server Component
export function StaticHeader() {
  return <h1>Static Title</h1>;
}
```

**❌ DON'T**: Use default exports
```typescript
// Bad
export default function CourseCard() {
  return <div>...</div>;
}

// Good
export function CourseCard() {
  return <div>...</div>;
}
```

**❌ DON'T**: Forget to handle loading states
```typescript
// Bad - no loading state
'use client';

export function CourseList() {
  const courses = useQuery(api.courses.list);
  
  return courses.map(c => <CourseCard course={c} />); // Error if undefined!
}

// Good - handle loading
export function CourseList() {
  const courses = useQuery(api.courses.list);
  
  if (courses === undefined) return <Skeleton />;
  
  return courses.map(c => <CourseCard key={c._id} course={c} />);
}
```

**❌ DON'T**: Use any or implicit types
```typescript
// Bad
export function Button({ onClick, children }: any) {
  return <button onClick={onClick}>{children}</button>;
}

// Good
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export function Button({ onClick, children, variant = 'primary' }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>;
}
```

**❌ DON'T**: Forget keys in lists
```typescript
// Bad
{courses.map(course => (
  <CourseCard course={course} />
))}

// Good
{courses.map(course => (
  <CourseCard key={course._id} course={course} />
))}
```

## Patterns & Examples

### Pattern 1: Skeleton Loading States

**Use Case**: Show placeholder UI while data loads

**Implementation**:
```typescript
import { Skeleton } from '@/components/ui/skeleton';

export function CourseCardSkeleton() {
  return (
    <Card>
      <Skeleton className="h-48 w-full" />
      <CardContent className="space-y-2 pt-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </CardContent>
    </Card>
  );
}

// Usage
export function CoursesList() {
  const courses = useQuery(api.courses.list);
  
  if (courses === undefined) {
    return (
      <div className="grid grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <CourseCardSkeleton key={i} />
        ))}
      </div>
    );
  }
  
  return <div>...</div>;
}
```

### Pattern 2: Optimistic UI Updates

**Use Case**: Instant feedback before server confirms

**Implementation**:
```typescript
'use client';

import { useMutation } from 'convex/react';
import { useOptimistic } from 'react';

export function FavoriteButton({ resourceId, isFavorited }: Props) {
  const [optimisticFavorited, setOptimisticFavorited] = useOptimistic(isFavorited);
  const toggleFavorite = useMutation(api.favorites.toggle);
  
  const handleClick = async () => {
    // Immediately show the change
    setOptimisticFavorited(!optimisticFavorited);
    
    // Then update on server
    await toggleFavorite({ resourceId });
  };
  
  return (
    <Button onClick={handleClick} variant="ghost">
      <Heart className={optimisticFavorited ? 'fill-red-500' : ''} />
    </Button>
  );
}
```

### Pattern 3: Error Boundaries

**Use Case**: Gracefully handle component errors

**Implementation**:
```typescript
// app/error.tsx (Next.js convention)
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-muted-foreground mb-4">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
```

## Common Mistakes

1. **Using 'use client' everywhere**
   - Problem: Loses Server Component benefits (smaller bundle, SEO)
   - Solution: Start with Server Components, add 'use client' only when needed

2. **Not handling undefined from useQuery**
   - Problem: Runtime errors when data is loading
   - Solution: Always check for undefined and show loading state

3. **Prop drilling through many levels**
   - Problem: Hard to maintain, unclear data flow
   - Solution: Use composition, context, or Convex queries closer to usage

4. **Missing error boundaries**
   - Problem: One component error crashes entire app
   - Solution: Add error.tsx files at appropriate levels

## Testing Standards

### Test Client Components

```typescript
// components/enroll-button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { EnrollButton } from './enroll-button';

// Mock Convex
vi.mock('convex/react', () => ({
  useMutation: vi.fn(() => vi.fn()),
}));

describe('EnrollButton', () => {
  it('handles enrollment click', async () => {
    const mockEnroll = vi.fn();
    vi.mocked(useMutation).mockReturnValue(mockEnroll);
    
    render(<EnrollButton courseId="course_123" />);
    
    const button = screen.getByRole('button', { name: /enroll/i });
    fireEvent.click(button);
    
    expect(mockEnroll).toHaveBeenCalledWith({ courseId: 'course_123' });
  });
});
```

## Resources

- [React 19 Documentation](https://react.dev)
- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Server Components Guide](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [shadcn/ui Components](https://ui.shadcn.com)
