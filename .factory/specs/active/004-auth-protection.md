# Spec 004: Audit and Implement Auth Protection

**Priority:** 🟡 **MEDIUM (4th)**  
**Status:** Active  
**Created:** 2025-11-20  
**Estimated Effort:** 1 day sequential | 4-5 hours parallel (2x speedup)  
**Impact:** Security, access control, data protection

---

## Summary

Audit all protected routes and ensure proper authentication/authorization checks using Clerk's `auth()` function in Server Components and middleware, preventing unauthorized access to sensitive pages and data.

---

## Problem Statement

**Current State:**

- ❓ Unknown auth protection coverage (no `auth()` calls found in app/ pages)
- ✅ Convex functions have auth via `ctx.auth` (backend protected)
- ⚠️ Frontend routes may be accessible without auth checks
- No centralized auth middleware for route groups

**Issues:**

- **Security Risk:** Unauthenticated users might access protected pages
- **Data Exposure:** Sensitive data might be visible before auth check
- **Poor UX:** No redirect to sign-in for unauthorized users

**Violates Standard:** "Protect routes with auth checks (Clerk)"

---

## Architecture Diagram

\`\`\`mermaid
graph TD
subgraph "🎯 Target: Multi-Layer Auth Protection"
A[User Request] --> B{Middleware Check}
B -->|Authenticated| C[Server Component]
B -->|Unauthenticated| D[Redirect to /sign-in]

    C --> E{auth Check in Page}
    E -->|Authorized| F[Load Data from Convex]
    E -->|Unauthorized| G[403 Forbidden]

    F --> H{Convex Auth Check}
    H -->|Valid User| I[Return Data]
    H -->|Invalid| J[Throw Error]
    end

    style B fill:#ccffcc
    style E fill:#ccffcc
    style H fill:#ccffcc
    style D fill:#ffcccc
    style G fill:#ffcccc
    style J fill:#ffcccc

\`\`\`

---

## Defense in Depth Strategy

\`\`\`mermaid
graph LR
A[Layer 1: Middleware] -->|Global Protection| B[Layer 2: Server Component]
B -->|Page-Level Check| C[Layer 3: Convex Function]
C -->|Data-Level Check| D[Protected Data]

    style A fill:#ccffcc
    style B fill:#ccffcc
    style C fill:#ccffcc
    style D fill:#ccffcc

\`\`\`

---

## Requirements

### Functional Requirements

**FR1: Server Component Auth Checks**

- ✅ All protected pages use `auth()` from `@clerk/nextjs/server`
- ✅ Redirect to `/sign-in` if not authenticated
- ✅ Check user roles for role-specific pages

**FR2: Middleware Protection**

- ✅ Use `clerkMiddleware()` to protect route groups
- ✅ Public routes explicitly defined
- ✅ API routes protected

**FR3: Role-Based Access**

- ✅ Instructor-only routes check `isInstructor`
- ✅ Admin-only routes check `isAdmin`
- ✅ Student routes accessible to all authenticated users

**FR4: Consistent Redirects**

- ✅ Unauthenticated: redirect to `/sign-in`
- ✅ Unauthorized (wrong role): redirect to `/403` or show error

### Non-Functional Requirements

**NFR1: Performance**

- ✅ Auth checks don't slow page loads
- ✅ Middleware runs efficiently (< 50ms)

**NFR2: Security**

- ✅ No auth bypass possible
- ✅ Token validation on every request
- ✅ Defense-in-depth (middleware + page + Convex)

**NFR3: UX**

- ✅ Clear error messages
- ✅ Redirect preserves intended destination (`returnUrl`)

### Acceptance Criteria

- [ ] All protected routes identified and audited
- [ ] Auth checks added to all protected Server Components
- [ ] Middleware configured for route group protection
- [ ] Role-based access implemented
- [ ] Tests verify auth protection
- [ ] No unauthorized access possible

---

## Task Breakdown

### Phase 1: Audit (Sequential - 2 hours)

**T1.1: Identify Protected Routes**

- [ ] List all routes in `app/` directory
- [ ] Categorize: Public vs Protected
- [ ] Categorize protected: Student, Instructor, Admin

**Route Classification:**

**Public Routes (No Auth Required):**

- `/` - Landing page
- `/sign-in` - Clerk sign-in
- `/sign-up` - Clerk sign-up
- `/courses` - Course listing (browse)
- `/courses/[id]` - Course detail (read-only)
- `/resources` - Resource library (browse)
- `/certificates/verify` - Certificate verification

**Authenticated Routes (Any Logged-In User):**

- `/dashboard` - Student dashboard
- `/dashboard/progress` - Progress tracking
- `/profile` - User profile
- `/profile/certificates` - User certificates
- `/profile/purchases` - Purchase history
- `/settings` - User settings
- `/notifications` - Notifications
- `/courses/[id]/learn` - Course learning (enrolled users)
- `/checkout/[courseId]` - Checkout page
- `/checkout/success` - Purchase success
- `/search` - Search
- `/recommendations` - Recommendations
- `/programs` - Programs
- `/programs/[id]` - Program detail
- `/live` - Live sessions list
- `/live/[id]` - Live session room
- `/community` - Community forum
- `/community/topic/[id]` - Topic detail

**Instructor-Only Routes:**

- `/instructor/dashboard` - Instructor dashboard
- `/instructor/courses/new` - Create course
- `/instructor/courses/wizard` - Course wizard
- `/instructor/courses/[id]/analytics` - Course analytics
- `/instructor/verification` - Instructor verification
- `/instructor/live-sessions` - Manage live sessions

**Admin-Only Routes:**

- `/admin/dashboard` - Admin dashboard
- `/admin/certificates` - Certificate management

**T1.2: Check Existing Auth Implementation**

```bash
# Search for auth() usage in app/ pages
grep -r "auth()" app/
grep -r "currentUser()" app/
grep -r "clerkMiddleware" middleware.ts
```

**T1.3: Document Findings**

- [ ] Create audit report
- [ ] Identify gaps
- [ ] Prioritize fixes

---

### Phase 2: Parallel Implementation (2 streams - 3-4 hours)

#### Stream A: Server Component Protection (droidz-infra)

**T2.1: Implement Auth Checks in Protected Pages**

**Pattern for Authenticated Pages:**

```tsx
// app/dashboard/page.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
	const { userId } = await auth();

	if (!userId) {
		redirect('/sign-in');
	}

	// Page content
	return <div>Dashboard</div>;
}
```

**Pattern for Role-Based Pages:**

```tsx
// app/instructor/dashboard/page.tsx
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { api } from '@/convex/_generated/api';
import { fetchQuery } from 'convex/nextjs';

export default async function InstructorDashboardPage() {
	const { userId } = await auth();

	if (!userId) {
		redirect('/sign-in');
	}

	// Check if user is instructor
	const user = await fetchQuery(api.users.getByExternalId, {
		externalId: userId,
	});

	if (!user?.isInstructor) {
		redirect('/403'); // Or return <Forbidden />
	}

	// Instructor-only content
	return <div>Instructor Dashboard</div>;
}
```

**Pages to Protect (Priority Order):**

1. `/instructor/*` - All instructor routes (isInstructor check)
2. `/admin/*` - All admin routes (isAdmin check)
3. `/dashboard` - Student dashboard (auth check)
4. `/profile/*` - Profile pages (auth check)
5. `/settings` - Settings (auth check)
6. `/courses/[id]/learn` - Learning page (auth + enrollment check)
7. `/checkout/*` - Checkout pages (auth check)
8. `/live/[id]` - Live session room (auth check)
9. `/community/*` - Community (auth check)

**T2.2: Create Reusable Auth Utilities**

```typescript
// lib/auth-utils.ts
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { api } from '@/convex/_generated/api';
import { fetchQuery } from 'convex/nextjs';

export async function requireAuth() {
	const { userId } = await auth();
	if (!userId) {
		redirect('/sign-in');
	}
	return userId;
}

export async function requireInstructor() {
	const userId = await requireAuth();

	const user = await fetchQuery(api.users.getByExternalId, {
		externalId: userId,
	});

	if (!user?.isInstructor) {
		redirect('/403');
	}

	return { userId, user };
}

export async function requireAdmin() {
	const userId = await requireAuth();

	const user = await fetchQuery(api.users.getByExternalId, {
		externalId: userId,
	});

	if (!user?.isAdmin) {
		redirect('/403');
	}

	return { userId, user };
}

export async function requireEnrollment(courseId: string) {
	const userId = await requireAuth();

	const enrollment = await fetchQuery(api.enrollments.getByUserAndCourse, {
		userId: userId as Id<'users'>,
		courseId: courseId as Id<'courses'>,
	});

	if (!enrollment) {
		redirect(`/courses/${courseId}?error=not-enrolled`);
	}

	return { userId, enrollment };
}
```

**T2.3: Apply Auth Utils to Pages**

```tsx
// app/instructor/dashboard/page.tsx (Simplified)
import { requireInstructor } from '@/lib/auth-utils';

export default async function InstructorDashboardPage() {
	await requireInstructor();

	return <div>Instructor Dashboard</div>;
}

// app/courses/[id]/learn/page.tsx
import { requireEnrollment } from '@/lib/auth-utils';

export default async function LearnPage({ params }: { params: { id: string } }) {
	await requireEnrollment(params.id);

	return <div>Learning Content</div>;
}
```

---

#### Stream B: Middleware Protection (droidz-infra)

**T2.4: Configure Clerk Middleware**

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes (accessible without auth)
const isPublicRoute = createRouteMatcher([
	'/',
	'/sign-in(.*)',
	'/sign-up(.*)',
	'/courses(.*)', // Browse courses
	'/resources(.*)', // Browse resources (filtered by auth)
	'/certificates/verify(.*)',
	'/api/webhooks(.*)', // Webhooks are authenticated differently
]);

// Define instructor routes
const isInstructorRoute = createRouteMatcher(['/instructor(.*)']);

// Define admin routes
const isAdminRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
	const { userId } = await auth();

	// Public routes: allow everyone
	if (isPublicRoute(req)) {
		return;
	}

	// Protected routes: require auth
	if (!userId) {
		return auth().redirectToSignIn({ returnBackUrl: req.url });
	}

	// Role-based protection happens in Server Components
	// Middleware only ensures authentication, not authorization
});

export const config = {
	matcher: [
		// Skip Next.js internals and static files
		'/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
		// Always run for API routes
		'/(api|trpc)(.*)',
	],
};
```

**T2.5: Create 403 Forbidden Page**

```tsx
// app/403/page.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ForbiddenPage() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center">
			<h1 className="text-4xl font-bold">403 - Forbidden</h1>
			<p className="mt-4 text-muted-foreground">You don't have permission to access this page.</p>
			<Button asChild className="mt-8">
				<Link href="/dashboard">Go to Dashboard</Link>
			</Button>
		</div>
	);
}
```

---

### Phase 3: Testing (Sequential - 1 hour)

**T3.1: Unit Tests for Auth Utils**

```typescript
// lib/__tests__/auth-utils.test.ts
import { describe, it, expect, vi } from 'vitest';
import { requireAuth, requireInstructor, requireAdmin } from '../auth-utils';

vi.mock('@clerk/nextjs/server');
vi.mock('next/navigation');
vi.mock('convex/nextjs');

describe('Auth Utils', () => {
	describe('requireAuth', () => {
		it('returns userId when authenticated', async () => {
			vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });

			const userId = await requireAuth();

			expect(userId).toBe('user-123');
		});

		it('redirects to sign-in when not authenticated', async () => {
			vi.mocked(auth).mockResolvedValue({ userId: null });

			await requireAuth();

			expect(redirect).toHaveBeenCalledWith('/sign-in');
		});
	});

	describe('requireInstructor', () => {
		it('allows instructor users', async () => {
			vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });
			vi.mocked(fetchQuery).mockResolvedValue({
				isInstructor: true,
				isAdmin: false,
			});

			const result = await requireInstructor();

			expect(result.userId).toBe('user-123');
		});

		it('redirects non-instructor to 403', async () => {
			vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });
			vi.mocked(fetchQuery).mockResolvedValue({
				isInstructor: false,
			});

			await requireInstructor();

			expect(redirect).toHaveBeenCalledWith('/403');
		});
	});
});
```

**T3.2: Integration Tests for Protected Routes**

```typescript
// tests/integration/auth-protection.test.tsx
import { render } from '@testing-library/react';
import { redirect } from 'next/navigation';
import DashboardPage from '@/app/dashboard/page';

vi.mock('next/navigation');
vi.mock('@clerk/nextjs/server');

describe('Protected Routes', () => {
	it('redirects to sign-in when not authenticated', async () => {
		vi.mocked(auth).mockResolvedValue({ userId: null });

		await DashboardPage();

		expect(redirect).toHaveBeenCalledWith('/sign-in');
	});

	it('renders page when authenticated', async () => {
		vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });

		const result = await DashboardPage();

		expect(result).toBeTruthy();
	});
});
```

**T3.3: Manual Testing Checklist**

- [ ] Visit `/dashboard` while logged out → redirects to `/sign-in`
- [ ] Visit `/instructor/dashboard` as student → shows 403
- [ ] Visit `/admin/dashboard` as non-admin → shows 403
- [ ] Visit `/courses/[id]/learn` without enrollment → redirects with error
- [ ] Sign in and access dashboard → works
- [ ] Sign in as instructor and access instructor routes → works

---

## Security Considerations

### OWASP Checklist

✅ **A01: Broken Access Control**

- Multi-layer auth (middleware + page + Convex)
- Role-based access control
- Enrollment checks for course content

✅ **A02: Cryptographic Failures**

- Clerk handles token encryption
- No sensitive data in frontend

✅ **A04: Insecure Design**

- Defense-in-depth approach
- Fail-safe defaults (deny by default)

✅ **A05: Security Misconfiguration**

- Middleware protects all non-public routes
- No auth bypass possible

✅ **A07: Identification and Authentication Failures**

- Clerk handles authentication
- JWT tokens validated on every request

---

## Edge Cases & Error Handling

### Edge Case 1: Expired Session

```tsx
// Clerk automatically handles expired sessions
// User redirected to sign-in with returnUrl
```

### Edge Case 2: Role Change During Session

```tsx
// User promoted to instructor:
// - Middleware allows access (authenticated)
// - Server Component checks latest role from Convex
// - If role changed, user sees new content on refresh
```

### Edge Case 3: Deleted User

```tsx
// If user deleted from Convex but Clerk session valid:
const user = await fetchQuery(api.users.getByExternalId, { externalId: userId });

if (!user) {
	// User account deleted, sign out
	redirect('/sign-in?error=account-deleted');
}
```

### Edge Case 4: Concurrent Sessions

```tsx
// Clerk handles multiple sessions
// Each request validated independently
// No special handling needed
```

### Edge Case 5: Enrollment Revoked

```tsx
// User's enrollment deleted while learning:
export default async function LearnPage({ params }: { params: { id: string } }) {
	const { enrollment } = await requireEnrollment(params.id);

	// Check enrollment is still active
	if (enrollment.cancelledAt) {
		redirect(`/courses/${params.id}?error=enrollment-cancelled`);
	}

	return <LearningContent />;
}
```

### Edge Case 6: API Routes Protection

```tsx
// app/api/admin/route.ts
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
	const { userId } = await auth();

	if (!userId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const user = await fetchQuery(api.users.getByExternalId, { externalId: userId });

	if (!user?.isAdmin) {
		return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
	}

	// Admin API logic
	return NextResponse.json({ data: 'admin data' });
}
```

---

## Testing Strategy

### Manual Testing Checklist

**Public Routes (Should Always Work):**

- [ ] `/` - Landing page (logged out)
- [ ] `/courses` - Course listing (logged out)
- [ ] `/certificates/verify` - Certificate verification (logged out)

**Protected Routes (Should Redirect When Logged Out):**

- [ ] `/dashboard` → redirects to `/sign-in`
- [ ] `/profile` → redirects to `/sign-in`
- [ ] `/settings` → redirects to `/sign-in`

**Role-Based Routes (Should Show 403 for Wrong Role):**

- [ ] `/instructor/dashboard` as student → 403
- [ ] `/admin/dashboard` as student → 403
- [ ] `/admin/dashboard` as instructor → 403

**Enrollment-Based Routes:**

- [ ] `/courses/[id]/learn` without enrollment → redirect with error
- [ ] `/courses/[id]/learn` with enrollment → works

### Automated Tests

See T3.1, T3.2 above for unit and integration tests.

---

## Success Metrics

### Security Metrics

**Before Audit:**

- Protected routes with auth checks: Unknown
- Routes with role checks: 0
- Routes with enrollment checks: 0

**After Implementation:**

- Protected routes with auth checks: 100% ✅
- Routes with role checks: All instructor/admin routes ✅
- Routes with enrollment checks: Course learning routes ✅

### Compliance Metrics

- **Auth Bypass Attempts:** 0 successful
- **Unauthorized Access:** 0 incidents
- **Security Audit:** Passed

---

## Dependencies

**Existing (Already Installed):**

- ✅ @clerk/nextjs@6.34.5
- ✅ Clerk configured

**No New Dependencies Required**

---

## Files to Modify/Create

### New Files:

- `lib/auth-utils.ts` - Reusable auth utilities
- `app/403/page.tsx` - Forbidden error page
- `lib/__tests__/auth-utils.test.ts` - Auth util tests
- `tests/integration/auth-protection.test.tsx` - Integration tests

### Modified Files:

- `middleware.ts` - Add Clerk middleware configuration
- `app/dashboard/page.tsx` - Add auth check
- `app/profile/page.tsx` - Add auth check
- `app/settings/page.tsx` - Add auth check
- `app/instructor/dashboard/page.tsx` - Add isInstructor check
- `app/instructor/courses/*/page.tsx` - Add isInstructor check (multiple files)
- `app/admin/dashboard/page.tsx` - Add isAdmin check
- `app/admin/certificates/page.tsx` - Add isAdmin check
- `app/courses/[id]/learn/page.tsx` - Add enrollment check
- ...and all other protected routes

---

## Rollout Plan

### Day 1: Audit & Setup (Morning)

- Audit all routes
- Create auth-utils.ts
- Configure middleware

### Day 1: Implementation (Afternoon)

- Stream A: Add auth checks to 15+ pages
- Stream B: Test middleware, create 403 page

### Day 2: Testing & Verification

- Run automated tests
- Manual testing all routes
- Fix any issues

---

## Resources

**Documentation:**

- Clerk Next.js: https://clerk.com/docs/nextjs
- Clerk Middleware: https://clerk.com/docs/reference/nextjs/clerk-middleware
- Clerk Auth: https://clerk.com/docs/guides/development/rendering-modes

**Standards:**

- `.factory/standards/security.md` - Security patterns

---

## Orchestration Notes

**Recommended Execution:** Parallel with Droidz Orchestrator

**Why Parallel Works:**

- ✅ 2 independent streams (page auth checks, middleware)
- ✅ Pages can be updated independently
- ✅ Clear auth utility interface

**Sequential Time:** 6-8 hours  
**Parallel Time (2 agents):** 3-4 hours  
**Speedup:** 2x faster ⚡

**Orchestrator Command:**

```bash
"Use orchestrator to implement Spec 004 in parallel"
```

---

## Post-Implementation Validation Checklist

- [ ] All protected routes have auth checks
- [ ] Middleware configured correctly
- [ ] Role-based access working
- [ ] Enrollment checks working
- [ ] 403 page created
- [ ] Auth utils tested
- [ ] Manual testing completed
- [ ] No unauthorized access possible
- [ ] Tests passing

---

**Dependencies:**

- Can run independently
- Complements Spec 001 (Convex auth already done)

**Related Specs:** None (final spec)

---

_This spec is executable and ready for implementation. See "Orchestration Notes" for fastest execution strategy._
