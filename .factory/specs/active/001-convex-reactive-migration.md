# Spec 001: Migrate useState to Convex Reactive Patterns

**Priority:** 🔴 **CRITICAL (Highest)**  
**Status:** Active  
**Created:** 2025-11-20  
**Estimated Effort:** 3-4 days sequential | 8-10 hours parallel (4x speedup)  
**Impact:** Core architecture compliance

---

## Summary

Migrate 25 pages from React useState-based data management to Convex reactive queries (useQuery/useMutation), eliminating manual state management and enabling real-time reactivity across the application.

---

## Problem Statement

**Current State:**

- 25+ pages use useState for server data that should be managed by Convex
- Manual loading states, error handling, and data fetching
- No real-time reactivity when data changes
- Violates core architecture standard: "Use Convex reactive queries, NOT useState for server data"

**Issues:**

```tsx
// ❌ CURRENT PATTERN (WRONG)
const [notifications, setNotifications] = useState<Notification[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
	fetchNotifications().then(data => {
		setNotifications(data);
		setLoading(false);
	});
}, []);
```

**Why This Is Bad:**

- No real-time updates (stale data)
- Manual loading/error state management
- Race conditions in useEffect
- Duplicate data fetching logic
- Breaks Convex's reactive data flow

---

## Architecture Diagram

\`\`\`mermaid
graph TD
A[Client Component] -->|❌ Current: useState| B[Manual State]
B -->|useEffect| C[API Call]
C -->|setState| B

    A2[Client Component] -->|✅ Target: useQuery| D[Convex Query]
    D -->|Auto Subscribe| E[Convex Backend]
    E -->|Real-time Updates| D
    D -->|Auto Re-render| A2

    style A fill:#ffcccc
    style B fill:#ffcccc
    style C fill:#ffcccc
    style A2 fill:#ccffcc
    style D fill:#ccffcc
    style E fill:#ccffcc

\`\`\`

---

## User Flow (Before vs After)

\`\`\`mermaid
sequenceDiagram
participant U as User
participant C as Component
participant S as useState
participant API as API/Fetch
participant CV as Convex

    rect rgb(255, 200, 200)
    Note over U,API: ❌ CURRENT: useState Pattern
    U->>C: Navigate to page
    C->>S: Initialize state (empty)
    C->>API: useEffect triggers fetch
    API-->>C: Return data
    C->>S: setState(data)
    C->>U: Render with data
    U->>C: Another user updates data
    Note over C,U: ⚠️ Component shows STALE data!
    end

    rect rgb(200, 255, 200)
    Note over U,CV: ✅ TARGET: Convex Reactive Pattern
    U->>C: Navigate to page
    C->>CV: useQuery(api.notifications.list)
    CV-->>C: Subscribe + return data
    C->>U: Render with data
    U->>C: Another user updates data
    CV->>C: Auto push update (reactive)
    C->>U: Auto re-render (fresh data!)
    end

\`\`\`

---

## Requirements

### Functional Requirements

**FR1: Replace useState with useQuery**

- ✅ All server data fetching must use `useQuery`
- ✅ Loading states provided by Convex (data === undefined)
- ✅ Error states handled by Convex

**FR2: Replace manual mutations with useMutation**

- ✅ All data updates must use `useMutation`
- ✅ Optimistic updates where applicable
- ✅ Error handling with toast notifications

**FR3: Preserve UI State in useState**

- ✅ Keep useState for pure UI state (form inputs, toggles, tabs)
- ✅ Only remove useState used for server data

**FR4: Maintain Existing Functionality**

- ✅ All pages work identically after migration
- ✅ No breaking changes to user experience

### Non-Functional Requirements

**NFR1: Real-time Reactivity**

- ✅ All data automatically updates across components
- ✅ Maximum 1 second latency for data changes

**NFR2: Performance**

- ✅ Eliminate unnecessary re-renders
- ✅ Reduce network requests via Convex caching

**NFR3: Code Quality**

- ✅ Follow `.factory/standards/templates/react.md`
- ✅ TypeScript strict mode compliance
- ✅ Zero ESLint warnings

### Acceptance Criteria

- [ ] All 25 pages migrated to useQuery/useMutation
- [ ] No useState used for server data
- [ ] All existing features work identically
- [ ] Real-time updates working (test with 2 browser windows)
- [ ] TypeScript strict mode passes (bun typescript)
- [ ] ESLint zero warnings (bun lint)
- [ ] All Convex tests still passing (bun test)

---

## Task Breakdown

### Phase 1: Foundation (Sequential - 1 hour)

**T1.1: Audit Existing Convex Queries**

- [ ] Review existing Convex functions in `convex/`
- [ ] Identify which queries/mutations need to be created
- [ ] Document data flow for each page

**T1.2: Create Missing Convex Functions**

- [ ] Add `convex/settings.ts` - user settings queries/mutations
- [ ] Add `convex/admin.ts` - admin dashboard queries
- [ ] Update existing files as needed

**T1.3: Setup convex-helpers Utilities**

- [ ] Create `lib/convex.ts` with `useQueryWithStatus` helper
- [ ] Document usage pattern for team
- [ ] Add to `.factory/standards/` if not already documented

**T1.4: Setup Testing Environment**

- [ ] Ensure convex-test configured
- [ ] Prepare test data fixtures

---

### Phase 2: Parallel Migration (4 streams - 6-8 hours)

**🔴 Critical Priority Pages (8 files)** - Migrate these first:

#### Stream A: Notifications & Certificates (droidz-codegen)

**T2.1: Migrate app/notifications/page.tsx**

```tsx
// Current: 3 useState calls
const [notifications, setNotifications] = useState<Notification[]>([]);
const [loading, setLoading] = useState(true);
const [activeTab, setActiveTab] = useState('all');

// Target:
const notifications = useQuery(api.notifications.list);
const markAsRead = useMutation(api.notifications.markAsRead);
const [activeTab, setActiveTab] = useState('all'); // Keep UI state
```

**T2.2: Migrate app/certificates/verify/page.tsx**

```tsx
// Current: 4 useState calls for server data
const [certificate, setCertificate] = useState<Certificate | null>(null);
const [isVerified, setIsVerified] = useState<boolean | null>(null);

// Target:
const certificate = useQuery(api.certificates.verify, { code: verificationCode });
```

**T2.3: Migrate app/admin/certificates/page.tsx**

- Replace 5 useState calls with Convex queries
- Use `api.certificates.listAll` query

---

#### Stream B: Profile & Settings (droidz-codegen)

**T2.4: Migrate app/profile/page.tsx**

```tsx
// Current: 6 useState calls for form data
const [name, setName] = useState('');
const [bio, setBio] = useState('');
// ... 4 more

// Target: Still needs useState for form inputs (UI state)
// But initial data should come from:
const user = useQuery(api.users.getCurrent);
const updateProfile = useMutation(api.users.updateProfile);

// Form should use React Hook Form (see Spec 002)
```

**T2.5: Migrate app/settings/page.tsx**

- 8 useState calls (biggest refactor)
- Create `convex/settings.ts` with queries/mutations
- Keep UI state in useState (form inputs)
- Use mutations for saving settings

---

#### Stream C: Search, Programs, Courses (droidz-codegen)

**T2.6: Migrate app/search/page.tsx**

```tsx
// Current: 4 useState calls
const [searchQuery, setSearchQuery] = useState(initialQuery);
const [activeTab, setActiveTab] = useState('all');
const [selectedTypes, setSelectedTypes] = useState<SearchResultType[]>([]);

// Target:
const [searchQuery, setSearchQuery] = useState(initialQuery); // Keep (UI state)
const [activeTab, setActiveTab] = useState('all'); // Keep (UI state)
const searchResults = useQuery(api.search.execute, {
	query: searchQuery,
	types: selectedTypes,
});
```

**T2.7: Migrate app/programs/page.tsx**

- 2 useState calls for filters
- Keep filters in useState (UI state)
- Use `useQuery` for programs data

**T2.8: Migrate app/courses/page.tsx**

- 3 useState calls for filters
- Keep filters in useState
- Use `useQuery(api.courses.list, { filters })`

---

#### Stream D: Admin & Checkout (droidz-codegen)

**T2.9: Migrate app/admin/dashboard/page.tsx**

```tsx
// Current: 1 useState for timeRange
const [timeRange, setTimeRange] = useState('year');

// Target:
const [timeRange, setTimeRange] = useState('year'); // Keep (UI state)
const dashboardData = useQuery(api.analytics.dashboard, { timeRange });
```

**T2.10: Migrate app/checkout/[courseId]/page.tsx**

- 8 useState calls (payment form + processing state)
- Keep form inputs in useState (or migrate to RHF in Spec 002)
- Use `useQuery` for course data
- Use `useMutation` for purchase creation

---

**🟡 Medium Priority Pages (10 files)** - Can be done in Phase 3:

#### Stream A2: Instructor Pages (droidz-codegen)

- app/instructor/verification/page.tsx (5 useState)
- app/instructor/courses/wizard/page.tsx (4 useState)
- app/instructor/courses/[id]/analytics/page.tsx (1 useState)

#### Stream B2: User Pages (droidz-codegen)

- app/profile/certificates/page.tsx (1 useState)
- app/profile/purchases/page.tsx (if exists)
- app/live/page.tsx (1 useState)
- app/live/[id]/page.tsx (1 useState)

#### Stream C2: Community & Misc (droidz-codegen)

- app/community/page.tsx (1 useState)
- app/community/topic/[id]/page.tsx (1 useState)
- app/dashboard/progress/page.tsx (1 useState)

---

### Phase 3: Integration & Testing (Sequential - 2 hours)

**T3.1: Integration Testing**

- [ ] Test all migrated pages
- [ ] Verify real-time updates (open 2 browser windows)
- [ ] Check loading states render correctly
- [ ] Verify error states display properly

**T3.2: Performance Validation**

- [ ] Monitor network requests (should reduce)
- [ ] Check for unnecessary re-renders
- [ ] Validate Convex caching working

**T3.3: Code Review**

- [ ] Ensure all useState for server data removed
- [ ] Verify TypeScript types correct
- [ ] Check ESLint passes

**T3.4: Documentation**

- [ ] Update code comments
- [ ] Document new Convex functions
- [ ] Create migration guide for future pages

---

## Security Considerations

### OWASP Checklist

✅ **A01: Broken Access Control**

- Convex functions already enforce auth via `ctx.auth`
- No changes needed (maintained from existing)

✅ **A02: Cryptographic Failures**

- Data in transit encrypted (Convex HTTPS)
- No sensitive data in client state (removed useState!)

✅ **A03: Injection**

- Convex validators prevent injection
- All queries parameterized

✅ **A04: Insecure Design**

- Migration improves design (reactive vs imperative)

✅ **A05: Security Misconfiguration**

- Convex handles secure defaults

✅ **A08: Software and Data Integrity Failures**

- Real-time sync prevents stale data issues

---

## Edge Cases & Error Handling

### Edge Case 1: useQuery Returns Undefined (Loading)

**❌ BASIC PATTERN (Old Way):**

```tsx
const notifications = useQuery(api.notifications.list);

if (notifications === undefined) {
	return <LoadingSkeleton />; // Convex-provided loading state
}

return <NotificationList data={notifications} />;
```

**✅ BETTER PATTERN (Use convex-helpers):**

```tsx
import { useQueryWithStatus } from '@/lib/convex'; // Created once in your codebase

const { status, data, error, isSuccess, isPending, isError } = useQueryWithStatus(api.notifications.list);

if (isPending) return <LoadingSkeleton />;
if (isError) return <ErrorDisplay error={error} />;
if (isSuccess) return <NotificationList data={data} />;
```

**Why Better:**

- Type-safe discriminated union (TypeScript knows exact state)
- Explicit error handling (no error boundaries needed)
- Clearer intent (`isPending` vs `=== undefined`)
- Better IDE autocomplete

### Edge Case 2: useQuery Error State

```tsx
const notifications = useQuery(api.notifications.list);

// Convex throws errors automatically, use ErrorBoundary
<ErrorBoundary fallback={<ErrorDisplay />}>
	<NotificationList data={notifications} />
</ErrorBoundary>;
```

### Edge Case 3: Conditional Query Execution

```tsx
// Don't execute query until condition met
const certificate = useQuery(
	verificationCode ? api.certificates.verify : 'skip',
	verificationCode ? { code: verificationCode } : undefined,
);
```

### Edge Case 4: Mutation Error Handling

```tsx
const markAsRead = useMutation(api.notifications.markAsRead);

const handleMarkRead = async (id: Id<'notifications'>) => {
	try {
		await markAsRead({ id });
		toast.success('Marked as read');
	} catch (error) {
		toast.error('Failed to mark as read');
		console.error(error);
	}
};
```

### Edge Case 5: Race Conditions (Eliminated!)

```tsx
// ❌ Old pattern had race conditions:
useEffect(() => {
	let cancelled = false;
	fetchData().then(data => {
		if (!cancelled) setState(data);
	});
	return () => {
		cancelled = true;
	};
}, []);

// ✅ New pattern eliminates race conditions:
const data = useQuery(api.data.get);
// Convex handles all subscription management
```

### Edge Case 6: Optimistic Updates

```tsx
const toggleFavorite = useMutation(api.favorites.toggle);

const handleToggle = async (resourceId: Id<'resources'>) => {
	// Optimistic UI update (optional)
	const optimisticId = Math.random().toString();

	try {
		await toggleFavorite({ resourceId });
		// Convex auto-updates queries, no manual refresh needed!
	} catch (error) {
		toast.error('Failed to update favorite');
		// Convex auto-reverts on error
	}
};
```

### Edge Case 7: Pagination

```tsx
const [paginationOpts, setPaginationOpts] = useState({
	limit: 20,
	cursor: null,
});

const results = useQuery(api.resources.list, paginationOpts);

const loadMore = () => {
	setPaginationOpts(prev => ({
		...prev,
		cursor: results.continueCursor,
	}));
};
```

### Edge Case 8: Stale Data on Navigation

```tsx
// ❌ Old pattern: Data stale after navigation
// ✅ New pattern: useQuery auto-subscribes on mount
// No special handling needed!
```

### Edge Case 9: Network Offline

```tsx
// Convex handles offline gracefully
// Shows last known data until reconnected
const data = useQuery(api.data.get);

// Optional: Show offline indicator
if (useConvexOfflineStatus()) {
	return <OfflineWarning />;
}
```

### Edge Case 10: Multiple Queries on Same Data

```tsx
// Convex automatically deduplicates queries
const user1 = useQuery(api.users.get, { id: userId });
const user2 = useQuery(api.users.get, { id: userId });
// Only 1 network request made, both get same data!
```

---

## Testing Strategy

### Unit Tests (Convex Functions)

**Existing Tests:** Already 100% coverage ✅

**New Tests Needed:**

```typescript
// convex/__test__/settings.test.ts
describe('Settings queries/mutations', () => {
	it('should get user settings', async () => {
		const t = convexTest(schema);
		const userId = await t.run(async ctx => {
			return await ctx.db.insert('users', testUser);
		});

		const settings = await t.query(api.settings.get, { userId });
		expect(settings).toMatchObject(expectedSettings);
	});

	it('should update notification preferences', async () => {
		// Test mutation
	});
});
```

### Integration Tests (React Components)

**New Tests Needed:**

```typescript
// app/notifications/__tests__/page.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { ConvexReactClient } from 'convex/react';
import { ConvexProvider } from '@/providers/ConvexProvider';

describe('Notifications Page', () => {
  it('should display notifications from Convex query', async () => {
    const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

    render(
      <ConvexProvider client={convex}>
        <NotificationsPage />
      </ConvexProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Notification')).toBeInTheDocument();
    });
  });

  it('should show loading state initially', () => {
    // Test undefined state renders skeleton
  });

  it('should mark notification as read via mutation', async () => {
    // Test mutation interaction
  });
});
```

### E2E Tests (Real-time Reactivity)

```typescript
// tests/e2e/realtime.spec.ts
test('notifications update in real-time across windows', async ({ page, context }) => {
	// Open page in window 1
	await page.goto('/notifications');

	// Open same page in window 2
	const page2 = await context.newPage();
	await page2.goto('/notifications');

	// Create notification via mutation in window 1
	await page.click('[data-testid="create-notification"]');

	// Verify it appears in window 2 automatically (real-time)
	await expect(page2.getByText('New Notification')).toBeVisible({ timeout: 2000 });
});
```

### Test Coverage Goals

- **Backend (Convex):** Maintain 100% ✅
- **Frontend (Components):** 80%+ (new requirement)
- **E2E (Critical Flows):** 5-10 key scenarios

---

## Success Metrics

### Code Metrics

**Before Migration:**

- useState calls for server data: 50+
- Manual loading state: 25 pages
- Manual error handling: 25 pages
- Real-time reactivity: 0%

**After Migration:**

- useState calls for server data: 0 ✅
- Manual loading state: 0 (Convex handles) ✅
- Manual error handling: Reduced 90% ✅
- Real-time reactivity: 100% ✅

### Performance Metrics

- **Network Requests:** Reduce by 30-40% (Convex caching)
- **Re-renders:** Reduce by 50% (eliminate useEffect waterfalls)
- **Time to Interactive:** Improve by 15-20% (faster data loading)
- **Stale Data Incidents:** 0 (real-time updates)

### Developer Experience Metrics

- **Lines of Code:** Reduce by ~30% (remove manual state management)
- **Bugs from Race Conditions:** 0 (Convex handles)
- **Time to Add New Query:** < 5 minutes (just add to Convex)

---

## Migration Pattern Reference

### Pattern 1: Simple Data Fetch

**Before:**

```tsx
const [data, setData] = useState<T[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
	fetchData().then(result => {
		setData(result);
		setLoading(false);
	});
}, []);

if (loading) return <Loading />;
return <Display data={data} />;
```

**After:**

```tsx
const data = useQuery(api.module.queryName);

if (data === undefined) return <Loading />;
return <Display data={data} />;
```

---

### Pattern 2: Data Fetch with Parameters

**Before:**

```tsx
const [data, setData] = useState<T | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
	fetchDataById(id).then(result => {
		setData(result);
		setLoading(false);
	});
}, [id]);
```

**After:**

```tsx
const data = useQuery(api.module.getById, { id });

if (data === undefined) return <Loading />;
return <Display data={data} />;
```

---

### Pattern 3: Data Mutation

**Before:**

```tsx
const [saving, setSaving] = useState(false);

const handleSave = async (data: T) => {
	setSaving(true);
	try {
		await saveData(data);
		toast.success('Saved!');
	} catch (error) {
		toast.error('Failed');
	} finally {
		setSaving(false);
	}
};
```

**After:**

```tsx
const saveData = useMutation(api.module.save);

const handleSave = async (data: T) => {
	try {
		await saveData(data);
		toast.success('Saved!');
		// Convex auto-updates related queries!
	} catch (error) {
		toast.error('Failed');
	}
};
```

---

### Pattern 4: Keep UI State (Forms, Toggles)

**Keep useState for:**

```tsx
// ✅ Pure UI state - KEEP these
const [activeTab, setActiveTab] = useState('all');
const [searchQuery, setSearchQuery] = useState('');
const [isDialogOpen, setIsDialogOpen] = useState(false);
const [selectedItems, setSelectedItems] = useState<string[]>([]);
```

**Remove useState for:**

```tsx
// ❌ Server data - REMOVE these
const [notifications, setNotifications] = useState<Notification[]>([]);
const [user, setUser] = useState<User | null>(null);
const [courses, setCourses] = useState<Course[]>([]);
```

---

## Dependencies

**Existing (Already Installed):**

- ✅ convex@1.28.2
- ✅ convex/react hooks (useQuery, useMutation)
- ✅ convex-helpers@0.1.104 ⚡ **IMPORTANT: Use this for better patterns!**
- ✅ @clerk/nextjs (auth)

**No New Dependencies Required** - Already have convex-helpers installed!

---

## Files to Modify

### High Priority (Phase 2, Streams A-D):

1. `app/notifications/page.tsx` - 3 useState → useQuery
2. `app/certificates/verify/page.tsx` - 4 useState → useQuery
3. `app/admin/certificates/page.tsx` - 5 useState → useQuery
4. `app/profile/page.tsx` - 6 useState → useQuery/useMutation
5. `app/settings/page.tsx` - 8 useState → useQuery/useMutation
6. `app/search/page.tsx` - 4 useState (partial, keep UI state)
7. `app/programs/page.tsx` - 2 useState (partial)
8. `app/courses/page.tsx` - 3 useState (partial)
9. `app/admin/dashboard/page.tsx` - 1 useState (partial)
10. `app/checkout/[courseId]/page.tsx` - 8 useState (partial)

### Medium Priority (Phase 3, if time):

11-25. [See task breakdown above]

### New Convex Files:

- `convex/settings.ts` - User settings queries/mutations
- `convex/admin.ts` - Admin dashboard queries

---

## Rollout Plan

### Week 1: Critical Pages (Days 1-3)

- Day 1: Streams A & B (notifications, certificates, profile, settings)
- Day 2: Streams C & D (search, programs, courses, admin, checkout)
- Day 3: Integration testing, bug fixes

### Week 2: Medium Priority (Days 4-5) - Optional

- Day 4: Instructor pages, user pages
- Day 5: Community, misc pages

### Validation (Continuous)

- Run `bun typescript` after each migration
- Run `bun lint:fix` after each migration
- Test in browser (2 windows for real-time verification)

---

## Resources

**Documentation:**

- Convex React Docs: https://docs.convex.dev/client/react
- Convex Best Practices: https://docs.convex.dev/understanding/best-practices/
- Stack Article "Use real persistence, not useState": https://stack.convex.dev/usestate-less

**Standards:**

- `.factory/standards/templates/react.md` - React patterns
- `.factory/standards/templates/convex.md` - Convex patterns

**Examples in Codebase:**

- ✅ Good: `app/courses/[id]/learn/page.tsx` - Uses useQuery correctly
- ✅ Good: `app/instructor/live-sessions/page.tsx` - Uses useQuery + useMutation
- ❌ Bad: `app/settings/page.tsx` - Uses useState for everything

---

## Orchestration Notes

**Recommended Execution:** Parallel with Droidz Orchestrator

**Why Parallel Works:**

- ✅ 4 independent page groups (notifications, profile, search, admin)
- ✅ No shared dependencies between pages
- ✅ Clear interfaces (Convex API contracts)
- ✅ Can test each stream independently

**Sequential Time:** 24-30 hours  
**Parallel Time (4 agents):** 6-8 hours  
**Speedup:** 4x faster ⚡

**Orchestrator Command:**

```bash
"Use orchestrator to implement Spec 001 in parallel"
```

---

## Post-Migration Validation Checklist

- [ ] All 25 pages tested manually
- [ ] Real-time updates verified (2 browser windows)
- [ ] No console errors
- [ ] `bun typescript` passes (0 errors)
- [ ] `bun lint` passes (0 warnings)
- [ ] `bun test` passes (100% coverage maintained)
- [ ] Network tab shows reduced requests
- [ ] No useState used for server data
- [ ] All loading states render correctly
- [ ] All error states handled properly

---

**Next Spec:** [002-form-standardization.md](./002-form-standardization.md)

---

_This spec is executable and ready for implementation. See "Orchestration Notes" for fastest execution strategy._
