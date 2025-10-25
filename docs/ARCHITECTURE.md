# Doctrina LMS - Technical Architecture

## Overview

Doctrina LMS is built as a modern, serverless web application using Next.js for the frontend and Convex for the backend. The architecture prioritizes developer experience, real-time capabilities, and scalability while minimizing operational complexity.

### Design Philosophy

1. **Serverless-First** - Minimize infrastructure management
2. **Real-Time by Default** - Live data updates without polling
3. **Type-Safe End-to-End** - TypeScript from database to UI
4. **Progressive Enhancement** - Works with mocked services, scales to production
5. **Separation of Concerns** - Clear boundaries between presentation, business logic, and data

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │   Browser    │  │    Mobile    │  │   PWA/Tablet    │  │
│  │   (React)    │  │   (React)    │  │    (React)      │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS / WebSocket
┌────────────────────────┴────────────────────────────────────┐
│                    Next.js Layer (Frontend)                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  App Router (RSC + Client Components)                │  │
│  │  • Server Components (Data Fetching)                 │  │
│  │  • Client Components (Interactivity)                 │  │
│  │  • API Routes (Webhooks, Server Actions)             │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Service Layer (lib/*-service.ts)                    │  │
│  │  • Course Service • Resource Service                 │  │
│  │  • User Service   • Notification Service             │  │
│  │  • Payment Service • AI Service                      │  │
│  └───────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ Convex Client SDK / Auth Tokens
┌────────────────────────┴────────────────────────────────────┐
│                   Backend Services Layer                     │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │    Convex    │  │    Clerk     │  │     Stripe      │  │
│  │   Database   │  │     Auth     │  │   Payments      │  │
│  │  + Functions │  │              │  │                 │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack Deep Dive

### Frontend Layer

#### Next.js 15 (App Router)

**Why Next.js?**

- Server-Side Rendering (SSR) for SEO and performance
- App Router provides modern React patterns (Server Components, Streaming)
- Built-in API routes for webhooks and server actions
- Excellent developer experience with hot reload
- Large ecosystem and community support

**Key Features Used:**

- **App Router** - File-based routing with layout composition
- **Server Components** - Reduce client bundle, fetch data closer to source
- **Client Components** - Interactive UI with "use client" directive
- **Server Actions** - Form submissions and mutations without API routes
- **Streaming** - Progressive page rendering with Suspense

**Directory Structure:**

```
app/
├── layout.tsx          # Root layout (providers, global styles)
├── page.tsx            # Home page
├── courses/
│   ├── page.tsx        # Course listing
│   └── [id]/
│       ├── page.tsx    # Course detail
│       └── learn/
│           └── page.tsx # Learning interface
└── api/
    └── webhooks/
        └── stripe/
            └── route.ts # Stripe webhook handler
```

#### React 19

**New Features Leveraged:**

- Enhanced Server Components
- Improved hydration
- Better error boundaries
- Concurrent rendering

#### TypeScript

**Configuration:**

- Strict mode enabled
- Path aliases (`@/` → root)
- Convex type generation integration

**Type Safety:**

```typescript
// End-to-end type safety example
// Database schema → Generated types → Component props

import { api } from '@/convex/_generated/api';
import { Doc } from '@/convex/_generated/dataModel';

// Automatically typed from Convex schema
type Course = Doc<'courses'>;

function CourseCard({ course }: { course: Course }) {
  // TypeScript knows all properties and types
  return <div>{course.title}</div>;
}
```

#### Styling Stack

**Tailwind CSS + shadcn/ui**

- **Utility-first CSS** - Rapid development without context switching
- **shadcn/ui** - Unstyled, accessible component primitives
- **Custom theme** - Configured in `tailwind.config.ts`
- **Dark mode** - Built-in theme switching

**Component Architecture:**

```
components/
├── ui/                 # Base components (Button, Input, etc.)
│   ├── button.tsx
│   ├── input.tsx
│   └── ...
├── course-card.tsx     # Feature components
├── course-wizard/      # Complex feature modules
│   ├── basic-info-step.tsx
│   ├── content-step.tsx
│   └── pricing-step.tsx
└── analytics/          # Domain-specific components
    └── enrollment-chart.tsx
```

---

### Backend Layer

#### Convex

**Why Convex?**

- Real-time reactivity without manual WebSocket management
- Automatic API generation from TypeScript functions
- ACID transactions with optimistic updates
- Built-in authentication integration
- Serverless scaling with no infrastructure management

**Architecture:**

```
convex/
├── schema.ts           # Database schema (type-safe)
├── users.ts            # User queries & mutations
├── courses.ts          # Course data functions
├── resources.ts        # Resource library functions
├── notifications.ts    # Notification system
├── purchases.ts        # Purchase tracking
└── _generated/         # Auto-generated types
    ├── api.d.ts
    └── dataModel.d.ts
```

**Function Types:**

**Queries** - Read data, automatically reactive

```typescript
// convex/courses.ts
export const list = query({
	args: {},
	handler: async ctx => {
		return await ctx.db.query('courses').collect();
	},
});

// Component auto-updates when data changes
const courses = useQuery(api.courses.list);
```

**Mutations** - Write data, transactional

```typescript
// convex/courses.ts
export const enroll = mutation({
	args: { courseId: v.id('courses') },
	handler: async (ctx, { courseId }) => {
		const user = await ctx.auth.getUserIdentity();
		if (!user) throw new Error('Unauthorized');

		await ctx.db.insert('enrollments', {
			userId: user.subject,
			courseId,
			enrolledAt: Date.now(),
		});
	},
});
```

**Actions** - Call external APIs

```typescript
// convex/ai.ts
export const generateQuiz = action({
	args: { courseContent: v.string() },
	handler: async (ctx, { courseContent }) => {
		// Call OpenAI, send emails, etc.
		const response = await fetch('https://api.openai.com/...');
		return response.json();
	},
});
```

#### Clerk Authentication

**Integration Flow:**

```
1. User signs in via Clerk → Clerk issues JWT
2. JWT includes custom claims for Convex
3. Convex validates JWT and extracts user identity
4. Functions access user via ctx.auth.getUserIdentity()
```

**User Syncing:**

```typescript
// convex/users.ts
export const ensureCurrentUser = mutation({
	handler: async ctx => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) return null;

		const existing = await ctx.db
			.query('users')
			.withIndex('by_externalId', q => q.eq('externalId', identity.subject))
			.first();

		if (existing) return existing;

		// Create user on first login
		return await ctx.db.insert('users', {
			externalId: identity.subject,
			email: identity.email,
			firstName: identity.firstName,
			lastName: identity.lastName,
			role: 'student',
			createdAt: new Date().toISOString(),
		});
	},
});
```

#### Stripe Payments

**Payment Flow:**

```
1. User clicks "Enroll" → Frontend creates checkout session
2. Stripe Checkout modal opens
3. User completes payment
4. Stripe webhook notifies our API route
5. API route creates purchase record in Convex
6. User gets access to course
```

**Webhook Handler:**

```typescript
// app/api/webhooks/stripe/route.ts
export async function POST(req: Request) {
	const signature = req.headers.get('stripe-signature');
	const event = stripe.webhooks.constructEvent(body, signature, secret);

	if (event.type === 'checkout.session.completed') {
		const session = event.data.object;
		// Record purchase in Convex
		await convex.mutation(api.purchases.create, {
			userId: session.metadata.userId,
			courseId: session.metadata.courseId,
			amount: session.amount_total,
		});
	}

	return Response.json({ received: true });
}
```

---

## Data Flow Patterns

### Pattern 1: Real-Time Data Display

```typescript
// Component subscribes to live data
function CourseList() {
  const courses = useQuery(api.courses.list);

  // When database changes, component re-renders automatically
  if (courses === undefined) return <Loading />;

  return courses.map(course => <CourseCard course={course} />);
}
```

### Pattern 2: Optimistic Updates

```typescript
function FavoriteButton({ resourceId }) {
  const toggleFavorite = useMutation(api.favorites.toggle);

  const handleClick = () => {
    // UI updates immediately (optimistic)
    // If mutation fails, reverts automatically
    toggleFavorite({ resourceId });
  };

  return <Button onClick={handleClick}>Favorite</Button>;
}
```

### Pattern 3: Server-Side Data Fetching

```typescript
// Server Component - runs on server, no client JS
async function CoursePage({ params }: { params: { id: string } }) {
  const course = await fetchQuery(api.courses.get, { id: params.id });

  return <CourseDetail course={course} />;
}
```

### Pattern 4: Server Actions (Form Submission)

```typescript
// Server Action
async function createCourse(formData: FormData) {
  'use server';

  const title = formData.get('title');
  const description = formData.get('description');

  await convex.mutation(api.courses.create, {
    title,
    description,
  });

  redirect('/instructor/courses');
}

// Form Component
function CreateCourseForm() {
  return (
    <form action={createCourse}>
      <input name="title" />
      <textarea name="description" />
      <button type="submit">Create</button>
    </form>
  );
}
```

---

## Service Layer Architecture

### Current State: Dual-Mode Services

Services support both **mocked** (development) and **real** (production) modes:

```typescript
// lib/course-service.ts
export function useCourses() {
	// Feature flag determines mock vs real
	if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
		return useMockCourses();
	}
	return useQuery(api.courses.list);
}
```

### Service Categories

**Data Services** (Read-heavy)

- Course browsing
- Resource library
- User profiles
- Notification feed

**Action Services** (Write-heavy)

- Course enrollment
- Purchase processing
- Certificate generation
- Favorite management

**External Services**

- AI quiz generation (OpenAI)
- Email notifications (Resend/SendGrid)
- File uploads (Convex storage / S3)
- Analytics (PostHog / Mixpanel)

---

## Performance Optimization

### Server Components for Initial Load

```typescript
// Fast initial page load - no client JS needed
async function HomePage() {
  const featuredCourses = await fetchQuery(api.courses.featured);

  return (
    <div>
      <Hero />
      <FeaturedCourses courses={featuredCourses} />
    </div>
  );
}
```

### Code Splitting

```typescript
// Lazy load heavy components
const AdminDashboard = dynamic(() => import('@/components/admin-dashboard'), {
  loading: () => <Loading />,
});
```

### Image Optimization

```typescript
import Image from 'next/image';

<Image
  src="/course-thumbnail.jpg"
  width={800}
  height={600}
  alt="Course"
  priority={false} // Lazy load by default
/>
```

### Convex Query Caching

Convex automatically caches queries - components sharing the same query share data:

```typescript
// Both components share the same cached result
function ComponentA() {
	const courses = useQuery(api.courses.list);
}

function ComponentB() {
	const courses = useQuery(api.courses.list); // No duplicate fetch
}
```

---

## Security Architecture

### Authentication Flow

```
1. User → Clerk Sign In
2. Clerk → Issues JWT with Convex claims
3. Frontend → Sends JWT with Convex requests
4. Convex → Validates JWT, extracts user identity
5. Functions → Access user via ctx.auth.getUserIdentity()
```

### Authorization Patterns

**Row-Level Security:**

```typescript
// Only return courses user has purchased
export const myCourses = query({
	handler: async ctx => {
		const user = await ctx.auth.getUserIdentity();
		if (!user) return [];

		const purchases = await ctx.db
			.query('purchases')
			.withIndex('by_user', q => q.eq('userId', user.subject))
			.collect();

		const courseIds = purchases.map(p => p.courseId);
		return await Promise.all(courseIds.map(id => ctx.db.get(id)));
	},
});
```

**Role-Based Access:**

```typescript
// Only instructors can create courses
export const createCourse = mutation({
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new Error('Unauthorized');

		const user = await ctx.db
			.query('users')
			.withIndex('by_externalId', q => q.eq('externalId', identity.subject))
			.first();

		if (user?.role !== 'instructor') {
			throw new Error('Forbidden: Instructor role required');
		}

		return await ctx.db.insert('courses', args);
	},
});
```

### Environment Variables

**Public vs Private:**

- `NEXT_PUBLIC_*` - Exposed to browser
- No prefix - Server-only (secrets)

**Never expose:**

- Database credentials
- API secret keys
- Webhook secrets
- Private encryption keys

---

## Scalability Considerations

### Database Scaling

**Convex Advantages:**

- Auto-scales with usage
- No connection pool management
- Global edge distribution
- Built-in caching

**Index Strategy:**

```typescript
// Define indexes for common queries
schema
	.table('courses', {
		// ... fields
	})
	.index('by_instructor', ['instructorId'])
	.index('by_category', ['category'])
	.index('by_published', ['published', 'createdAt']);
```

### CDN & Edge Distribution

- Static assets → Vercel Edge Network
- API routes → Serverless functions (auto-scale)
- Convex → Global distribution

### Monitoring & Observability

**Recommended Stack:**

- **Errors:** Sentry
- **Analytics:** PostHog or Mixpanel
- **Logs:** Convex dashboard + DataDog
- **Performance:** Vercel Analytics + Web Vitals

---

## Future Architecture Evolution

### Phase 1: Current (MVP)

- Monolithic Next.js app
- Convex backend
- Mocked services for rapid development

### Phase 2: Real-Time Features

- Live classroom (WebRTC)
- Real-time collaboration
- Chat and messaging
- Notification subscriptions

### Phase 3: Advanced Services

- AI-powered recommendations
- Video transcoding pipeline
- Advanced analytics
- Multi-tenant architecture

### Phase 4: Microservices (If Needed)

- Separate video processing service
- Dedicated AI service
- Analytics data warehouse
- Administrative tooling service

---

## Development Workflow

### Local Development

```bash
# Terminal 1: Convex backend
npx convex dev

# Terminal 2: Next.js frontend
yarn dev
```

### Testing Strategy

**Unit Tests** - Service logic

```typescript
// lib/__tests__/course-service.test.ts
import { calculateProgress } from '@/lib/course-service';

test('calculates progress correctly', () => {
	expect(calculateProgress(5, 10)).toBe(50);
});
```

**Integration Tests** - Convex functions

```typescript
// convex/courses.test.ts
import { ConvexTestingHelper } from 'convex/testing';

test('creates course successfully', async () => {
	const t = new ConvexTestingHelper();
	const courseId = await t.mutation(api.courses.create, {
		title: 'Test Course',
	});
	expect(courseId).toBeDefined();
});
```

**E2E Tests** - Playwright

```typescript
// tests/e2e/enrollment.spec.ts
test('user can enroll in course', async ({ page }) => {
	await page.goto('/courses/123');
	await page.click('button:has-text("Enroll")');
	await expect(page).toHaveURL('/courses/123/learn');
});
```

---

## Conclusion

This architecture balances:

- **Developer Experience** - Fast iteration, type safety
- **Performance** - SSR, edge distribution, real-time updates
- **Scalability** - Serverless auto-scaling
- **Maintainability** - Clear separation of concerns
- **Cost Efficiency** - Pay for what you use

As the platform grows, we can evolve incrementally without major rewrites.

---

**Last Updated:** 2025-01-XX
**Version:** 1.0
