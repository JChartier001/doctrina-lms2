# Spec 003: Implement Frontend Testing Infrastructure

**Priority:** 🟡 **HIGH (3rd)**  
**Status:** Active  
**Created:** 2025-11-20  
**Estimated Effort:** 4-5 days sequential | 10-12 hours parallel (3x speedup)  
**Impact:** Code quality, regression prevention, confidence in deployments

---

## Summary

Implement comprehensive frontend testing with React Testing Library and Vitest, achieving 80%+ coverage for components, hooks, and critical user flows. Currently 0% frontend coverage (100% backend only).

---

## Problem Statement

**Current State:**
- ✅ Backend (Convex): 100% test coverage (21 test files) - EXCELLENT
- ❌ Frontend (React): 0% test coverage (0 test files) - MISSING
- No component tests
- No custom hook tests
- No integration tests
- No E2E tests for critical flows

**Issues:**
- **High Risk:** Changes to components can break UI without detection
- **No Regression Protection:** Bugs can resurface
- **Low Confidence:** Deployments are risky
- **Slow Feedback:** Manual testing only

**Violates Standard:** "100% test coverage goal with Vitest"

---

## Architecture Diagram

\`\`\`mermaid
graph TD
    subgraph "✅ Current: Backend Testing (100%)"
    A[Convex Functions] --> B[convex-test]
    B --> C[Unit Tests]
    C --> D[100% Coverage]
    end
    
    subgraph "🎯 Target: Frontend Testing (80%+)"
    E[React Components] --> F[React Testing Library]
    F --> G[Component Tests]
    
    H[Custom Hooks] --> I[@testing-library/react-hooks]
    I --> J[Hook Tests]
    
    K[User Flows] --> L[Vitest Browser Mode]
    L --> M[Integration Tests]
    
    G --> N[80%+ Coverage]
    J --> N
    M --> N
    end
    
    style D fill:#ccffcc
    style N fill:#ffffcc
\`\`\`

---

## Testing Pyramid

\`\`\`mermaid
graph TB
    subgraph "Testing Strategy"
    A[Unit Tests - 70%] -->|Components, Hooks| B[Integration Tests - 20%]
    B -->|User Flows| C[E2E Tests - 10%]
    end
    
    D[Fast, Many Tests] --> A
    E[Medium Speed] --> B
    F[Slow, Few Tests] --> C
    
    style A fill:#ccffcc
    style B fill:#ffffcc
    style C fill:#ffcccc
\`\`\`

---

## Requirements

### Functional Requirements

**FR1: Component Unit Tests**
- ✅ Test rendering with various props
- ✅ Test user interactions (clicks, inputs)
- ✅ Test conditional rendering
- ✅ Test accessibility (ARIA, keyboard nav)

**FR2: Hook Unit Tests**
- ✅ Test custom hook behavior
- ✅ Test hook state changes
- ✅ Test hook side effects

**FR3: Integration Tests**
- ✅ Test component interactions
- ✅ Test form submission flows
- ✅ Test Convex query/mutation integration

**FR4: E2E Tests (Optional/Future)**
- ⚠️ Critical user flows only
- ⚠️ Authentication flow
- ⚠️ Checkout flow
- ⚠️ Course enrollment flow

### Non-Functional Requirements

**NFR1: Test Performance**
- ✅ Unit tests run in < 2 seconds total
- ✅ Integration tests run in < 10 seconds total
- ✅ Fast feedback loop for developers

**NFR2: Test Maintainability**
- ✅ Tests use user-centric queries (not implementation)
- ✅ Clear test structure (AAA pattern: Arrange, Act, Assert)
- ✅ Reusable test utilities

**NFR3: CI/CD Integration**
- ✅ Tests run on every PR
- ✅ Coverage reports generated
- ✅ Failing tests block merges

### Acceptance Criteria

- [ ] 80%+ frontend code coverage
- [ ] All critical components tested
- [ ] All custom hooks tested
- [ ] 5-10 integration tests for key flows
- [ ] Tests run in CI/CD pipeline
- [ ] Coverage report visible in PRs
- [ ] Zero flaky tests

---

## Task Breakdown

### Phase 1: Foundation (Sequential - 3 hours)

**T1.1: Setup Testing Infrastructure**
- [ ] Verify Vitest configuration (already exists ✅)
- [ ] Install React Testing Library dependencies
- [ ] Configure test environment (jsdom)
- [ ] Setup coverage reporting
- [ ] Create test utilities directory

```bash
# Install dependencies
bun add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
bun add -D @vitejs/plugin-react
bun add -D jsdom
```

**T1.2: Create Test Utilities**
```typescript
// tests/utils/test-utils.tsx
import { render, RenderOptions } from '@testing-library/react';
import { ConvexReactClient } from 'convex/react';
import { ConvexProvider } from 'convex/react';
import { ClerkProvider } from '@clerk/nextjs';

// Mock Convex client for tests
const createMockConvexClient = () => {
  return new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
};

// Custom render with providers
export const renderWithProviders = (
  ui: React.ReactElement,
  options?: RenderOptions & { convexClient?: ConvexReactClient }
) => {
  const convexClient = options?.convexClient || createMockConvexClient();
  
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <ConvexProvider client={convexClient}>
      <ClerkProvider>
        {children}
      </ClerkProvider>
    </ConvexProvider>
  );
  
  return render(ui, { wrapper: Wrapper, ...options });
};

// Re-export everything
export * from '@testing-library/react';
export { renderWithProviders as render };
```

**T1.3: Configure vitest.config.ts**
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.test.{ts,tsx}',
        '**/*.config.{ts,js}',
        '**/types/**',
      ],
      threshold: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

**T1.4: Create Setup File**
```typescript
// tests/setup.ts
import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Extend matchers
expect.extend({});

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Convex auth
vi.mock('@/lib/auth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    isAuthenticated: true,
  }),
}));
```

---

### Phase 2: Parallel Test Implementation (3 streams - 8-10 hours)

#### Stream A: Critical UI Components (droidz-test)

**T2.1: Test Core UI Components**
```typescript
// components/ui/__tests__/button.test.tsx
import { render, screen } from '@/tests/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { Button } from '../button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });
  
  it('handles click events', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledOnce();
  });
  
  it('disables button when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
  
  it('applies variant styles', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-destructive');
  });
});
```

**Components to Test (Priority Order):**
1. `components/ui/button.tsx` - Core interaction
2. `components/ui/input.tsx` - Form input
3. `components/ui/form.tsx` - Form wrapper
4. `components/ui/card.tsx` - Container
5. `components/ui/dialog.tsx` - Modal interactions
6. `components/ui/select.tsx` - Dropdown
7. `components/ui/switch.tsx` - Toggle
8. `components/ui/tabs.tsx` - Navigation

**T2.2: Test Feature Components**
```typescript
// components/__tests__/notification-center.test.tsx
import { render, screen, waitFor } from '@/tests/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { NotificationCenter } from '../notification-center';

describe('NotificationCenter', () => {
  it('displays notifications from Convex query', async () => {
    render(<NotificationCenter />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Notification')).toBeInTheDocument();
    });
  });
  
  it('marks notification as read on click', async () => {
    const user = userEvent.setup();
    render(<NotificationCenter />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Notification')).toBeInTheDocument();
    });
    
    await user.click(screen.getByRole('button', { name: /mark as read/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Marked as read')).toBeInTheDocument();
    });
  });
  
  it('filters notifications by type', async () => {
    const user = userEvent.setup();
    render(<NotificationCenter />);
    
    await user.click(screen.getByRole('tab', { name: /messages/i }));
    
    await waitFor(() => {
      expect(screen.queryByText('Course Update')).not.toBeInTheDocument();
      expect(screen.getByText('New Message')).toBeInTheDocument();
    });
  });
});
```

**Feature Components to Test:**
1. `components/notification-center.tsx`
2. `components/course-progress-card.tsx`
3. `components/search-bar.tsx`
4. `components/user-nav.tsx`
5. `components/main-nav.tsx`

---

#### Stream B: Form Components (droidz-test)

**T2.3: Test Course Wizard Steps**
```typescript
// components/course-wizard/__tests__/basic-info-step.test.tsx
import { render, screen, waitFor } from '@/tests/utils/test-utils';
import { FormProvider, useForm } from 'react-hook-form';
import userEvent from '@testing-library/user-event';
import { BasicInfoStep } from '../basic-info-step';
import { courseWizardSchema } from '@/schema/CourseWizardSchema';

describe('BasicInfoStep', () => {
  const renderWithForm = () => {
    const Wrapper = () => {
      const form = useForm({ 
        resolver: zodResolver(courseWizardSchema),
        defaultValues: { title: '', description: '' }
      });
      
      return (
        <FormProvider {...form}>
          <BasicInfoStep />
        </FormProvider>
      );
    };
    
    return render(<Wrapper />);
  };
  
  it('validates required fields', async () => {
    const user = userEvent.setup();
    renderWithForm();
    
    const titleInput = screen.getByLabelText(/course title/i);
    await user.type(titleInput, 'A'); // Too short
    await user.clear(titleInput);
    await user.tab(); // Trigger blur validation
    
    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    });
  });
  
  it('accepts valid input', async () => {
    const user = userEvent.setup();
    renderWithForm();
    
    await user.type(
      screen.getByLabelText(/course title/i),
      'Advanced Botox Techniques'
    );
    await user.type(
      screen.getByLabelText(/description/i),
      'Comprehensive course on botox application...'
    );
    
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});
```

**Form Components to Test:**
1. `components/course-wizard/basic-info-step.tsx`
2. `components/course-wizard/pricing-step.tsx`
3. `components/course-wizard/content-step.tsx`
4. `components/course-wizard/review-step.tsx`

**T2.4: Test Form Validation**
```typescript
// schema/__tests__/CourseWizardSchema.test.ts
import { courseWizardSchema } from '../CourseWizardSchema';

describe('Course Wizard Schema', () => {
  it('validates title length', () => {
    const result = courseWizardSchema.safeParse({
      title: 'Ab', // Too short
      description: 'Valid description here...',
    });
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['title']);
    }
  });
  
  it('validates description length', () => {
    const result = courseWizardSchema.safeParse({
      title: 'Valid Title',
      description: 'Too short',
    });
    
    expect(result.success).toBe(false);
  });
  
  it('accepts valid data', () => {
    const result = courseWizardSchema.safeParse({
      title: 'Advanced Botox Techniques',
      description: 'A comprehensive course covering advanced botox application techniques...',
    });
    
    expect(result.success).toBe(true);
  });
});
```

---

#### Stream C: Custom Hooks & Pages (droidz-test)

**T2.5: Test Custom Hooks**
```typescript
// hooks/__tests__/use-media-query.test.ts
import { renderHook } from '@testing-library/react';
import { useMediaQuery } from '../use-media-query';

describe('useMediaQuery', () => {
  it('returns true when media query matches', () => {
    // Mock matchMedia
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query === '(min-width: 768px)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(true);
  });
  
  it('returns false when media query does not match', () => {
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      media: '',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(false);
  });
});
```

**Hooks to Test:**
1. `hooks/use-media-query.ts`
2. `hooks/use-mobile.tsx`
3. `lib/auth.tsx` (useAuth if custom)

**T2.6: Test Page Components**
```typescript
// app/notifications/__tests__/page.test.tsx
import { render, screen, waitFor } from '@/tests/utils/test-utils';
import userEvent from '@testing-library/user-event';
import NotificationsPage from '../page';

describe('Notifications Page', () => {
  it('renders loading state initially', () => {
    render(<NotificationsPage />);
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });
  
  it('displays notifications after loading', async () => {
    render(<NotificationsPage />);
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument();
      expect(screen.getByText('Test Notification 1')).toBeInTheDocument();
    });
  });
  
  it('filters notifications by tab', async () => {
    const user = userEvent.setup();
    render(<NotificationsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('All Notifications')).toBeInTheDocument();
    });
    
    await user.click(screen.getByRole('tab', { name: /unread/i }));
    
    // Should only show unread
    await waitFor(() => {
      expect(screen.queryByText('Read Notification')).not.toBeInTheDocument();
    });
  });
});
```

**Pages to Test:**
1. `app/notifications/page.tsx`
2. `app/profile/page.tsx`
3. `app/courses/page.tsx`
4. `app/dashboard/page.tsx`

---

### Phase 3: Integration & E2E Tests (Sequential - 2-3 hours)

**T3.1: Integration Tests (User Flows)**
```typescript
// tests/integration/course-enrollment.test.tsx
import { render, screen, waitFor } from '@/tests/utils/test-utils';
import userEvent from '@testing-library/user-event';
import CoursePage from '@/app/courses/[id]/page';
import CheckoutPage from '@/app/checkout/[courseId]/page';

describe('Course Enrollment Flow', () => {
  it('completes full enrollment flow', async () => {
    const user = userEvent.setup();
    
    // Step 1: View course
    render(<CoursePage params={{ id: 'test-course-id' }} />);
    
    await waitFor(() => {
      expect(screen.getByText('Advanced Botox Techniques')).toBeInTheDocument();
    });
    
    // Step 2: Click enroll
    await user.click(screen.getByRole('button', { name: /enroll now/i }));
    
    // Step 3: Redirected to checkout (test with router mock)
    expect(mockRouter.push).toHaveBeenCalledWith('/checkout/test-course-id');
    
    // Step 4: Fill payment form
    render(<CheckoutPage params={{ courseId: 'test-course-id' }} />);
    
    await user.type(screen.getByLabelText(/card number/i), '4242424242424242');
    await user.type(screen.getByLabelText(/expiry/i), '12/25');
    await user.type(screen.getByLabelText(/cvc/i), '123');
    
    await user.click(screen.getByRole('button', { name: /complete purchase/i }));
    
    // Step 5: Verify success
    await waitFor(() => {
      expect(screen.getByText(/purchase successful/i)).toBeInTheDocument();
    });
  });
});
```

**Integration Tests to Create:**
1. Course enrollment flow (above)
2. Notification creation & real-time update
3. Profile update flow
4. Course creation wizard (full wizard)
5. Search and filter flow

**T3.2: E2E Tests (Optional - Playwright)**
```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('user can sign in and view dashboard', async ({ page }) => {
  await page.goto('/sign-in');
  
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'TestPassword123!');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByText('Welcome back')).toBeVisible();
});

test('protected routes redirect to sign-in', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/sign-in/);
});
```

---

### Phase 4: CI/CD Integration (Sequential - 1 hour)

**T4.1: GitHub Actions Workflow**
```yaml
# .github/workflows/test.yml
name: Tests

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: 1.3.2
      
      - name: Install dependencies
        run: bun install
      
      - name: Run linter
        run: bun lint
      
      - name: Run TypeScript check
        run: bun typescript
      
      - name: Run tests with coverage
        run: bun test:coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          flags: frontend
      
      - name: Comment PR with coverage
        uses: romeovs/lcov-reporter-action@v0.3.1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          lcov-file: ./coverage/lcov.info
```

**T4.2: Coverage Thresholds**
```typescript
// vitest.config.ts (update)
coverage: {
  threshold: {
    lines: 80,
    functions: 80,
    branches: 75,
    statements: 80,
  },
  // Fail CI if coverage drops below threshold
  failOnCoverage: true,
}
```

---

## Security Considerations

### OWASP Checklist

✅ **A03: Injection**
- Test XSS prevention in text inputs
- Verify sanitization of user content

✅ **A04: Insecure Design**
- Test auth protection on components
- Verify unauthorized access blocked

✅ **A05: Security Misconfiguration**
- Test error boundaries don't leak sensitive info
- Verify no secrets in test fixtures

---

## Edge Cases & Error Handling

### Edge Case 1: Async Component Loading
```typescript
it('handles async data loading', async () => {
  render(<NotificationsPage />);
  
  // Loading state
  expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  
  // Data loaded
  await waitFor(() => {
    expect(screen.getByText('Notification 1')).toBeInTheDocument();
  });
});
```

### Edge Case 2: Error States
```typescript
it('displays error when query fails', async () => {
  // Mock failed query
  vi.mocked(useQuery).mockReturnValue({
    error: new Error('Failed to fetch'),
  });
  
  render(<NotificationsPage />);
  
  expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
});
```

### Edge Case 3: Empty States
```typescript
it('displays empty state when no data', async () => {
  vi.mocked(useQuery).mockReturnValue([]);
  
  render(<NotificationsPage />);
  
  await waitFor(() => {
    expect(screen.getByText(/no notifications/i)).toBeInTheDocument();
  });
});
```

### Edge Case 4: Accessibility Testing
```typescript
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

it('has no accessibility violations', async () => {
  const { container } = render(<Button>Click me</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Edge Case 5: Keyboard Navigation
```typescript
it('supports keyboard navigation', async () => {
  const user = userEvent.setup();
  render(<Dialog><Button>Open</Button></Dialog>);
  
  // Tab to button
  await user.tab();
  expect(screen.getByRole('button')).toHaveFocus();
  
  // Press Enter
  await user.keyboard('{Enter}');
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  
  // Press Escape
  await user.keyboard('{Escape}');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
```

---

## Testing Strategy Summary

### Test Distribution (Target)

| Type | Count | Coverage Target | Speed |
|------|-------|----------------|-------|
| Unit Tests (Components) | 40-50 | 80%+ | < 2s |
| Unit Tests (Hooks) | 5-10 | 90%+ | < 1s |
| Integration Tests | 10-15 | Key flows | < 10s |
| E2E Tests | 5-10 | Critical paths | Optional |

### Coverage Goals by Area

| Area | Target Coverage |
|------|----------------|
| `components/ui/` | 85%+ |
| `components/` (feature) | 80%+ |
| `hooks/` | 90%+ |
| `lib/` | 80%+ |
| `app/` pages | 75%+ |

---

## Success Metrics

### Code Coverage

**Before:**
- Frontend coverage: 0%
- Backend coverage: 100%
- Overall: 50%

**After:**
- Frontend coverage: 80%+ ✅
- Backend coverage: 100% ✅
- Overall: 90%+ ✅

### Quality Metrics

- **Bug Detection:** Catch 80% of bugs before production
- **Regression Prevention:** 0 regressions after test implementation
- **CI/CD Speed:** Tests run in < 2 minutes
- **Flaky Tests:** 0 (strict rule)

---

## Dependencies

**New Dependencies:**
```json
{
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/user-event": "^14.5.1",
    "@vitejs/plugin-react": "^4.2.1",
    "jsdom": "^23.0.1",
    "jest-axe": "^8.0.0"
  }
}
```

---

## Files to Create

### Test Files (40-60 total):
- `tests/utils/test-utils.tsx` - Custom render
- `tests/setup.ts` - Global setup
- `components/ui/__tests__/*.test.tsx` - 8-10 files
- `components/__tests__/*.test.tsx` - 10-15 files
- `components/course-wizard/__tests__/*.test.tsx` - 4 files
- `hooks/__tests__/*.test.ts` - 3-5 files
- `app/**/__tests__/page.test.tsx` - 8-10 files
- `tests/integration/*.test.tsx` - 5-10 files

### Configuration:
- `.github/workflows/test.yml` - CI/CD
- `vitest.config.ts` - Update coverage config

---

## Rollout Plan

### Week 1: Foundation & UI Components (Days 1-2)
- Day 1: Setup infrastructure, test utilities
- Day 2: Test core UI components (Stream A)

### Week 2: Forms & Hooks (Days 3-4)
- Day 3: Test form components (Stream B)
- Day 4: Test custom hooks (Stream C)

### Week 3: Integration & CI (Days 5-6)
- Day 5: Integration tests, page tests
- Day 6: CI/CD setup, coverage enforcement

---

## Resources

**Documentation:**
- React Testing Library: https://testing-library.com/react
- Vitest: https://vitest.dev/guide/
- Testing Accessibility: https://github.com/nickcolley/jest-axe

**Standards:**
- `.factory/standards/testing.md` - Testing patterns

**Examples:**
- Backend tests: `convex/__test__/` - 100% coverage reference

---

## Orchestration Notes

**Recommended Execution:** Parallel with Droidz Orchestrator

**Why Parallel Works:**
- ✅ 3 independent test categories (UI, forms, hooks/pages)
- ✅ No dependencies between test files
- ✅ Clear separation of concerns

**Sequential Time:** 32-40 hours  
**Parallel Time (3 agents):** 10-12 hours  
**Speedup:** 3x faster ⚡

**Orchestrator Command:**
```bash
"Use orchestrator to implement Spec 003 in parallel"
```

---

## Post-Implementation Validation Checklist

- [ ] 80%+ frontend coverage achieved
- [ ] All critical components tested
- [ ] All custom hooks tested
- [ ] Integration tests passing
- [ ] CI/CD pipeline running tests
- [ ] Coverage report generated
- [ ] No flaky tests
- [ ] Tests run in < 2 minutes
- [ ] Coverage thresholds enforced

---

**Dependencies:**
- Can run in parallel with Spec 001 & 002
- Independent implementation

**Next Spec:** [004-auth-protection.md](./004-auth-protection.md)

---

*This spec is executable and ready for implementation. See "Orchestration Notes" for fastest execution strategy.*
