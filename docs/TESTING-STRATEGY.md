# Testing Strategy - Doctrina LMS

## 1. Overview

This document outlines the testing strategy for Doctrina LMS, focusing on **smart coverage** - testing what matters most while skipping low-value edge cases.

## 2. Testing Philosophy

### 2.1 Priority-Based Testing (Not Arbitrary Percentages)

**Core Principle:** Test based on risk and impact, not coverage numbers.

**Our Approach:**

- **100% coverage** on code that handles money or security
- **85% coverage** on core features users pay for
- **70% coverage** on UI and less critical paths
- **0% coverage** on defensive code and "impossible" edge cases (documented why)

**Why this works:**

- Protects financial and legal liability
- Tests features that actually matter to users
- Doesn't waste time testing things that are obvious when broken
- Focuses effort on high-value tests

### 2.2 Test Coverage Priority Matrix

```
┌─────────────────────────────────────────────────────────┐
│ MUST TEST (Priority 1) - 100% Coverage                 │
│ • Payments, refunds, instructor payouts                │
│ • Access control, authentication                       │
│ • Course enrollment and purchases                      │
├─────────────────────────────────────────────────────────┤
│ SHOULD TEST (Priority 2) - 85% Coverage                │
│ • Course creation and publishing                       │
│ • Lesson progress tracking                            │
│ • Certificate generation                              │
│ • Main user workflows                                 │
├─────────────────────────────────────────────────────────┤
│ NICE TO TEST (Priority 3) - 70% Coverage               │
│ • UI components, visual elements                       │
│ • Course search and filtering                          │
│ • Non-critical features                                │
├─────────────────────────────────────────────────────────┤
│ CAN SKIP (Priority 4) - 0% Coverage (Documented)       │
│ • Defensive "should never happen" checks               │
│ • Third-party service failures                         │
│ • Logging and analytics                                │
│ • Extremely rare edge cases (0.001%)                   │
└─────────────────────────────────────────────────────────┘
```

---

## 3. What to Test (Priority 1: MUST TEST)

### 3.1 Financial Code - 100% Coverage Required

**Criteria:**

- Handles money/payments
- Calculates commissions or payouts
- Determines refund eligibility
- Any code where bugs = lawsuits

**Examples:**

```typescript
// ✅ MUST TEST - Platform commission calculation
// lib/payments.ts
export function calculatePlatformCommission(amount: number, coursePrice: number): number {
	const commissionRate = 0.15; // 15% platform fee
	return amount * commissionRate;
}

// Test EVERY edge case
describe('calculatePlatformCommission', () => {
	it('calculates 15% commission correctly', () => {
		expect(calculatePlatformCommission(100, 100)).toBe(15);
		expect(calculatePlatformCommission(299, 299)).toBe(44.85);
	});

	it('handles zero amount', () => {
		expect(calculatePlatformCommission(0, 0)).toBe(0);
	});

	it('handles fractional cents correctly', () => {
		expect(calculatePlatformCommission(99.99, 99.99)).toBe(14.9985);
	});

	it('handles large amounts', () => {
		expect(calculatePlatformCommission(9999, 9999)).toBe(1499.85);
	});
});
```

```typescript
// ✅ MUST TEST - Refund eligibility
// lib/refunds.ts
const REFUND_POLICY_CONFIG = {
	generous: { days: 30, maxCompletion: 0.5 },
	standard: { days: 14, maxCompletion: 0.3 },
	strict: { days: 7, maxCompletion: 0.1 },
};

export function canRefund(purchase: Purchase, course: Course, progress: LessonProgress[]): RefundResult {
	const policy = REFUND_POLICY_CONFIG[course.refundPolicy || 'standard'];
	const daysSince = getDaysSince(purchase.createdAt);
	const totalLessons = course.lessonCount;
	const completedLessons = progress.filter(p => p.completed).length;
	const completion = completedLessons / totalLessons;

	if (daysSince > policy.days) {
		return {
			allowed: false,
			reason: 'OUTSIDE_WINDOW',
			message: `Refund requests must be made within ${policy.days} days`,
		};
	}

	if (completion > policy.maxCompletion) {
		return {
			allowed: false,
			reason: 'TOO_MUCH_COMPLETED',
			message: `You've completed ${Math.round(completion * 100)}% of the course`,
		};
	}

	return {
		allowed: true,
		refundAmount: purchase.amount,
	};
}

// Test EVERY policy, EVERY branch
describe('canRefund', () => {
	describe('Generous Policy (30 days, 50% completion)', () => {
		const course = {
			refundPolicy: 'generous',
			lessonCount: 10,
		};

		it('allows refund within window and completion', () => {
			const purchase = {
				createdAt: daysAgo(20),
				amount: 29900,
			};
			const progress = [
				{ lessonId: '1', completed: true },
				{ lessonId: '2', completed: true },
				{ lessonId: '3', completed: true },
				{ lessonId: '4', completed: true }, // 40% complete
			];

			const result = canRefund(purchase, course, progress);

			expect(result.allowed).toBe(true);
			expect(result.refundAmount).toBe(29900);
		});

		it('allows refund at exact window limit (day 30)', () => {
			const purchase = {
				createdAt: daysAgo(30),
				amount: 29900,
			};
			const progress = [{ lessonId: '1', completed: true }];

			expect(canRefund(purchase, course, progress).allowed).toBe(true);
		});

		it('allows refund at exact completion limit (50%)', () => {
			const purchase = {
				createdAt: daysAgo(10),
				amount: 29900,
			};
			const progress = Array(5)
				.fill(null)
				.map((_, i) => ({
					lessonId: `${i}`,
					completed: true,
				})); // Exactly 50%

			expect(canRefund(purchase, course, progress).allowed).toBe(true);
		});

		it('denies refund one day outside window (day 31)', () => {
			const purchase = {
				createdAt: daysAgo(31),
				amount: 29900,
			};
			const progress = [{ lessonId: '1', completed: true }];

			const result = canRefund(purchase, course, progress);

			expect(result.allowed).toBe(false);
			expect(result.reason).toBe('OUTSIDE_WINDOW');
		});

		it('denies refund one percent over completion (51%)', () => {
			const purchase = {
				createdAt: daysAgo(10),
				amount: 29900,
			};
			const progress = Array(6)
				.fill(null)
				.map((_, i) => ({
					lessonId: `${i}`,
					completed: true,
				})); // 60% complete

			const result = canRefund(purchase, course, progress);

			expect(result.allowed).toBe(false);
			expect(result.reason).toBe('TOO_MUCH_COMPLETED');
		});
	});

	describe('Standard Policy (14 days, 30% completion)', () => {
		// Repeat all boundary tests for standard policy
	});

	describe('Strict Policy (7 days, 10% completion)', () => {
		// Repeat all boundary tests for strict policy
	});
});
```

```typescript
// ✅ MUST TEST - Instructor payout calculation
// lib/payouts.ts
export function calculateInstructorPayout(purchases: Purchase[], refunds: Refund[]): number {
	const totalEarnings = purchases.reduce((sum, p) => sum + p.amount, 0);
	const totalRefunds = refunds.reduce((sum, r) => sum + r.amount, 0);
	const platformFee = (totalEarnings - totalRefunds) * 0.15;

	return totalEarnings - totalRefunds - platformFee;
}

// Test with real scenarios
describe('calculateInstructorPayout', () => {
	it('calculates payout with no refunds', () => {
		const purchases = [{ amount: 29900 }, { amount: 19900 }];

		// Total: $499.00
		// Fee: $74.85 (15%)
		// Payout: $424.15
		expect(calculateInstructorPayout(purchases, [])).toBe(42415);
	});

	it('deducts refunds from payout', () => {
		const purchases = [{ amount: 29900 }, { amount: 19900 }];
		const refunds = [{ amount: 19900 }];

		// Total: $499.00
		// Refunds: $199.00
		// Net: $300.00
		// Fee: $45.00 (15%)
		// Payout: $255.00
		expect(calculateInstructorPayout(purchases, refunds)).toBe(25500);
	});

	it('handles zero earnings', () => {
		expect(calculateInstructorPayout([], [])).toBe(0);
	});

	it('handles all refunded', () => {
		const purchases = [{ amount: 29900 }];
		const refunds = [{ amount: 29900 }];

		expect(calculateInstructorPayout(purchases, refunds)).toBe(0);
	});
});
```

### 3.2 Security & Access Control - 100% Coverage Required

**Criteria:**

- Authentication checks
- Authorization logic
- Data access permissions
- Any code that prevents unauthorized access

**Examples:**

```typescript
// ✅ MUST TEST - Course access verification
// convex/courses.ts
export const hasAccess = query({
	args: {
		userId: v.id('users'),
		courseId: v.id('courses'),
	},
	handler: async (ctx, { userId, courseId }) => {
		const purchase = await ctx.db
			.query('purchases')
			.withIndex('by_user', q => q.eq('userId', userId))
			.filter(q => q.eq(q.field('courseId'), courseId))
			.first();

		if (!purchase) return false;
		if (purchase.status === 'expired') return false;
		if (purchase.status === 'open') return false;

		return purchase.status === 'complete';
	},
});

// Test EVERY access scenario
describe('Course access control', () => {
	let t: ConvexTestingHelper;

	beforeEach(() => {
		t = new ConvexTestingHelper();
	});

	it('allows access for completed purchase', async () => {
		await t.mutation(api.purchases.create, {
			userId: 'u1',
			courseId: 'c1',
			amount: 29900,
			status: 'complete',
		});

		const hasAccess = await t.query(api.courses.hasAccess, {
			userId: 'u1',
			courseId: 'c1',
		});

		expect(hasAccess).toBe(true);
	});

	it('denies access without purchase', async () => {
		const hasAccess = await t.query(api.courses.hasAccess, {
			userId: 'u1',
			courseId: 'c1',
		});

		expect(hasAccess).toBe(false);
	});

	it('denies access for expired purchase', async () => {
		await t.mutation(api.purchases.create, {
			userId: 'u1',
			courseId: 'c1',
			amount: 29900,
			status: 'expired',
		});

		const hasAccess = await t.query(api.courses.hasAccess, {
			userId: 'u1',
			courseId: 'c1',
		});

		expect(hasAccess).toBe(false);
	});

	it('denies access for open (unpaid) purchase', async () => {
		await t.mutation(api.purchases.create, {
			userId: 'u1',
			courseId: 'c1',
			amount: 29900,
			status: 'open',
		});

		const hasAccess = await t.query(api.courses.hasAccess, {
			userId: 'u1',
			courseId: 'c1',
		});

		expect(hasAccess).toBe(false);
	});

	it('denies access to different user', async () => {
		await t.mutation(api.purchases.create, {
			userId: 'u1',
			courseId: 'c1',
			amount: 29900,
			status: 'complete',
		});

		const hasAccess = await t.query(api.courses.hasAccess, {
			userId: 'u2',
			courseId: 'c1',
		});

		expect(hasAccess).toBe(false);
	});
});
```

```typescript
// ✅ MUST TEST - Instructor verification status
// convex/users.ts
export const canCreateCourse = query({
	args: { userId: v.id('users') },
	handler: async (ctx, { userId }) => {
		const user = await ctx.db.get(userId);

		if (!user) return false;
		if (!user.isInstructor) return false;

		// Check if instructor verification is complete
		const application = await ctx.db
			.query('instructorApplications')
			.withIndex('by_user', q => q.eq('userId', userId))
			.first();

		return application?.status === 'approved';
	},
});

// Test ALL permission scenarios
describe('Instructor permissions', () => {
	it('allows verified instructor to create courses', async () => {
		const userId = await t.mutation(api.users.create, {
			firstName: 'Jane',
			lastName: 'Instructor',
			email: 'jane@example.com',
			isInstructor: true,
			isAdmin: false,
		});

		await t.mutation(api.instructorApplications.create, {
			userId,
			status: 'approved',
		});

		const canCreate = await t.query(api.users.canCreateCourse, { userId });

		expect(canCreate).toBe(true);
	});

	it('denies non-instructor from creating courses', async () => {
		const userId = await t.mutation(api.users.create, {
			firstName: 'John',
			lastName: 'Student',
			email: 'john@example.com',
			isInstructor: false,
			isAdmin: false,
		});

		const canCreate = await t.query(api.users.canCreateCourse, { userId });

		expect(canCreate).toBe(false);
	});

	it('denies pending instructor application', async () => {
		const userId = await t.mutation(api.users.create, {
			firstName: 'Jane',
			lastName: 'Pending',
			email: 'jane@example.com',
			isInstructor: true,
			isAdmin: false,
		});

		await t.mutation(api.instructorApplications.create, {
			userId,
			status: 'pending',
		});

		const canCreate = await t.query(api.users.canCreateCourse, { userId });

		expect(canCreate).toBe(false);
	});
});
```

---

## 4. What to Test (Priority 2: SHOULD TEST)

### 4.1 Core Business Logic - 85% Coverage Target

**Criteria:**

- Main user workflows
- Features users pay for
- Calculations that affect UX
- Data transformations

**Focus:** Test happy path + common errors. Skip extremely rare edge cases.

**Examples:**

```typescript
// ✅ SHOULD TEST - Course progress calculation
// lib/progress.ts
export function calculateCourseProgress(completedLessons: LessonProgress[], totalLessons: number): ProgressResult {
	const completed = completedLessons.filter(l => l.completed).length;
	const percentage = (completed / totalLessons) * 100;
	const isComplete = completed === totalLessons;

	return {
		completed,
		totalLessons,
		percentage,
		isComplete,
	};
}

// Test common paths, skip rare combinations
describe('calculateCourseProgress', () => {
	it('calculates progress for partially completed course', () => {
		const progress = [
			{ lessonId: '1', completed: true },
			{ lessonId: '2', completed: true },
			{ lessonId: '3', completed: false },
			{ lessonId: '4', completed: false },
		];

		const result = calculateCourseProgress(progress, 4);

		expect(result.completed).toBe(2);
		expect(result.percentage).toBe(50);
		expect(result.isComplete).toBe(false);
	});

	it('marks course complete when all lessons done', () => {
		const progress = Array(10)
			.fill(null)
			.map((_, i) => ({
				lessonId: `${i}`,
				completed: true,
			}));

		const result = calculateCourseProgress(progress, 10);

		expect(result.percentage).toBe(100);
		expect(result.isComplete).toBe(true);
	});

	it('handles zero progress', () => {
		const result = calculateCourseProgress([], 10);

		expect(result.completed).toBe(0);
		expect(result.percentage).toBe(0);
		expect(result.isComplete).toBe(false);
	});

	// ❌ DON'T TEST: Every possible lesson count (1-1000)
	// ❌ DON'T TEST: Floating point precision edge cases
	// ✅ DO TEST: Key milestones (0%, 50%, 100%)
});
```

```typescript
// ✅ SHOULD TEST - Certificate generation eligibility
// lib/certificates.ts
export function canGenerateCertificate(courseProgress: ProgressResult, course: Course): CertificateEligibility {
	if (!course.certificateEnabled) {
		return {
			eligible: false,
			reason: 'CERTIFICATE_NOT_ENABLED',
		};
	}

	if (!courseProgress.isComplete) {
		return {
			eligible: false,
			reason: 'COURSE_NOT_COMPLETE',
			progress: courseProgress.percentage,
		};
	}

	return {
		eligible: true,
	};
}

// Test typical cases
describe('canGenerateCertificate', () => {
	it('allows certificate for completed course', () => {
		const progress = {
			completed: 10,
			totalLessons: 10,
			percentage: 100,
			isComplete: true,
		};
		const course = { certificateEnabled: true };

		const result = canGenerateCertificate(progress, course);

		expect(result.eligible).toBe(true);
	});

	it('denies certificate for incomplete course', () => {
		const progress = {
			completed: 5,
			totalLessons: 10,
			percentage: 50,
			isComplete: false,
		};
		const course = { certificateEnabled: true };

		const result = canGenerateCertificate(progress, course);

		expect(result.eligible).toBe(false);
		expect(result.reason).toBe('COURSE_NOT_COMPLETE');
	});

	it('denies certificate when not enabled', () => {
		const progress = {
			completed: 10,
			totalLessons: 10,
			percentage: 100,
			isComplete: true,
		};
		const course = { certificateEnabled: false };

		const result = canGenerateCertificate(progress, course);

		expect(result.eligible).toBe(false);
		expect(result.reason).toBe('CERTIFICATE_NOT_ENABLED');
	});

	// ❌ DON'T TEST: progress = 99.9999% (impossible via UI)
	// ❌ DON'T TEST: certificateEnabled = undefined (TypeScript prevents)
});
```

```typescript
// ✅ SHOULD TEST - Lesson completion tracking
// convex/lessons.ts
export const markComplete = mutation({
	args: {
		userId: v.id('users'),
		lessonId: v.id('lessons'),
		timeSpent: v.number(),
	},
	handler: async (ctx, { userId, lessonId, timeSpent }) => {
		const lesson = await ctx.db.get(lessonId);
		if (!lesson) throw new Error('Lesson not found');

		// Check if user has access to course
		const hasAccess = await ctx.runQuery(api.courses.hasAccess, {
			userId,
			courseId: lesson.courseId,
		});

		if (!hasAccess) {
			throw new Error('No access to this course');
		}

		// Check if already completed
		const existing = await ctx.db
			.query('lessonProgress')
			.withIndex('by_user_lesson', q => q.eq('userId', userId).eq('lessonId', lessonId))
			.first();

		if (existing) {
			// Update time spent
			await ctx.db.patch(existing._id, {
				timeSpent: existing.timeSpent + timeSpent,
				lastAccessedAt: Date.now(),
			});
			return existing._id;
		}

		// Create new progress record
		return await ctx.db.insert('lessonProgress', {
			userId,
			lessonId,
			courseId: lesson.courseId,
			completed: true,
			completedAt: Date.now(),
			timeSpent,
		});
	},
});

// Test main workflow
describe('Lesson completion', () => {
	it('marks lesson as complete for enrolled user', async () => {
		const courseId = await createTestCourse();
		const lessonId = await createTestLesson(courseId);
		const userId = await createTestUser();
		await enrollUser(userId, courseId);

		const progressId = await t.mutation(api.lessons.markComplete, {
			userId,
			lessonId,
			timeSpent: 300,
		});

		const progress = await t.query(api.lessonProgress.get, { id: progressId });

		expect(progress.completed).toBe(true);
		expect(progress.timeSpent).toBe(300);
	});

	it('throws error for non-enrolled user', async () => {
		const courseId = await createTestCourse();
		const lessonId = await createTestLesson(courseId);
		const userId = await createTestUser();
		// NOT enrolled

		await expect(
			t.mutation(api.lessons.markComplete, {
				userId,
				lessonId,
				timeSpent: 300,
			}),
		).rejects.toThrow('No access to this course');
	});

	it('accumulates time spent on re-completion', async () => {
		const courseId = await createTestCourse();
		const lessonId = await createTestLesson(courseId);
		const userId = await createTestUser();
		await enrollUser(userId, courseId);

		// First completion
		await t.mutation(api.lessons.markComplete, {
			userId,
			lessonId,
			timeSpent: 300,
		});

		// Second time (reviewing)
		await t.mutation(api.lessons.markComplete, {
			userId,
			lessonId,
			timeSpent: 120,
		});

		const progress = await t.query(api.lessonProgress.getByUserAndLesson, {
			userId,
			lessonId,
		});

		expect(progress.timeSpent).toBe(420); // 300 + 120
	});
});
```

---

## 5. What to Test (Priority 3: NICE TO TEST)

### 5.1 UI Components - 70% Coverage Target

**Criteria:**

- Visual components
- Layout logic
- Non-critical user interactions

**Focus:** Test main rendering paths, skip visual variations.

**Examples:**

```typescript
// ✅ NICE TO TEST - Course card component
// components/CourseCard.test.tsx
import { render, screen } from '@testing-library/react';
import { CourseCard } from './CourseCard';

describe('CourseCard', () => {
  it('displays course information', () => {
    const course = {
      title: 'Advanced Botox Techniques',
      price: 29900, // cents
      instructor: {
        name: 'Dr. Jane Smith',
        image: '/jane.jpg',
      },
      level: 'advanced',
    };

    render(<CourseCard course={course} />);

    expect(screen.getByText('Advanced Botox Techniques')).toBeInTheDocument();
    expect(screen.getByText('$299.00')).toBeInTheDocument();
    expect(screen.getByText(/Dr. Jane Smith/)).toBeInTheDocument();
  });

  it('shows enrollment count', () => {
    const course = {
      title: 'Course',
      price: 19900,
      studentCount: 156,
    };

    render(<CourseCard course={course} />);

    expect(screen.getByText('156 students enrolled')).toBeInTheDocument();
  });

  it('displays difficulty level badge', () => {
    const course = {
      title: 'Course',
      price: 19900,
      level: 'beginner',
    };

    render(<CourseCard course={course} />);

    expect(screen.getByText('Beginner')).toBeInTheDocument();
  });

  // ❌ DON'T TEST: Exact pixel spacing, colors, font sizes
  // ❌ DON'T TEST: Hover states (visual QA)
  // ❌ DON'T TEST: Mobile vs desktop layout variations
});
```

```typescript
// ✅ NICE TO TEST - Search filtering component
// components/CourseSearch.test.tsx
describe('CourseSearch', () => {
  it('filters courses by search term', async () => {
    const courses = [
      { title: 'Botox Basics', category: 'injectables' },
      { title: 'Laser Fundamentals', category: 'laser' },
    ];

    render(<CourseSearch courses={courses} />);

    const searchInput = screen.getByPlaceholderText('Search courses...');
    await userEvent.type(searchInput, 'botox');

    expect(screen.getByText('Botox Basics')).toBeInTheDocument();
    expect(screen.queryByText('Laser Fundamentals')).not.toBeInTheDocument();
  });

  it('filters by category', async () => {
    const courses = [
      { title: 'Botox Basics', category: 'injectables' },
      { title: 'Laser Fundamentals', category: 'laser' },
    ];

    render(<CourseSearch courses={courses} />);

    await userEvent.click(screen.getByText('Injectables'));

    expect(screen.getByText('Botox Basics')).toBeInTheDocument();
    expect(screen.queryByText('Laser Fundamentals')).not.toBeInTheDocument();
  });

  // ❌ DON'T TEST: Every possible search term combination
  // ✅ DO TEST: Main filter mechanisms work
});
```

---

## 6. What NOT to Test (Priority 4: CAN SKIP)

### 6.1 Defensive Code - Document Why Skipped

**Criteria:**

- "This should never happen" checks
- Type safety guards (TypeScript already enforces)
- Impossible states

**How to document:**

```typescript
// convex/courses.ts
export const get = query({
	args: { id: v.id('courses') },
	handler: async (ctx, { id }) => {
		const course = await ctx.db.get(id);

		// COVERAGE_SKIP: Defensive check for data corruption
		// This would only happen if database got corrupted, which we can't
		// simulate in tests. Monitored via Sentry in production.
		if (course && !course.title) {
			console.error('Corrupted course: missing title', { id });
			throw new Error('Course data corrupted');
		}

		return course;
	},
});

// COVERAGE_SKIP: TypeScript guarantees number type at compile time
// This defensive check is for runtime type coercion safety only
export function formatPrice(price: number): string {
	if (typeof price !== 'number') {
		console.warn('Non-number price received', { price });
		return '$0.00';
	}
	return `$${(price / 100).toFixed(2)}`;
}
```

### 6.2 Third-Party Service Failures - Can't Test Reliably

```typescript
// lib/email.ts
export async function sendEnrollmentConfirmation(user: User, course: Course) {
  try {
    await resend.emails.send({
      to: user.email,
      subject: `Welcome to ${course.title}`,
      react: <EnrollmentEmail user={user} course={course} />,
    });
  } catch (error) {
    // COVERAGE_SKIP: Resend service failure - out of our control
    // We can't reliably mock "Resend is down" in tests.
    // Monitored via error tracking in production.
    console.error('Email send failed', { error, userId: user._id });
    // Don't throw - email failure shouldn't block enrollment
  }
}
```

### 6.3 Logging and Analytics - No Business Logic

```typescript
// lib/analytics.ts
export function trackCourseView(courseId: string) {
	// COVERAGE_SKIP: Pure analytics tracking - no business logic
	// If this breaks, we lose tracking but app still works
	if (typeof window !== 'undefined') {
		gtag('event', 'course_view', {
			course_id: courseId,
			timestamp: Date.now(),
		});
	}
}

export function logUserAction(userId: string, action: string) {
	// COVERAGE_SKIP: Logging only - no conditional logic to test
	console.log(`[User ${userId}] ${action}`);
}
```

### 6.4 Configuration and Constants

```typescript
// config/platform.ts
// COVERAGE_SKIP: Static configuration - no logic to test
export const PLATFORM_CONFIG = {
	commissionRate: 0.15, // 15%
	refundPolicies: {
		generous: { days: 30, maxCompletion: 0.5 },
		standard: { days: 14, maxCompletion: 0.3 },
		strict: { days: 7, maxCompletion: 0.1 },
	},
};

// lib/constants.ts
// COVERAGE_SKIP: Constants - no logic
export const MAX_VIDEO_SIZE = 5 * 1024 * 1024 * 1024; // 5GB
export const MAX_FILE_UPLOADS = 50;
export const CERTIFICATE_VALIDITY_YEARS = 2;
```

---

## 7. Test Decision Framework

### When writing new code, use this flowchart:

```
Does this code handle money or payments?
├─ YES → ✅ MUST TEST (100%)
└─ NO → Continue ↓

Does this code control access/permissions?
├─ YES → ✅ MUST TEST (100%)
└─ NO → Continue ↓

Is this a main user workflow?
├─ YES → ✅ SHOULD TEST (85%)
└─ NO → Continue ↓

Is this defensive/logging code?
├─ YES → ❌ CAN SKIP (document why)
└─ NO → Continue ↓

Would a bug be immediately obvious?
├─ YES (visual bug) → 🤔 NICE TO TEST (70%)
└─ NO (silent data issue) → ✅ SHOULD TEST (85%)
```

### Quick Reference Table

| Code Type              | Test?     | Coverage | Why                   |
| ---------------------- | --------- | -------- | --------------------- |
| Payment processing     | ✅ MUST   | 100%     | Money = lawsuits      |
| Refund logic           | ✅ MUST   | 100%     | Financial disputes    |
| Access control         | ✅ MUST   | 100%     | Security critical     |
| Course enrollment      | ✅ MUST   | 100%     | Core transaction      |
| Progress tracking      | ✅ SHOULD | 85%      | Core feature          |
| Certificate generation | ✅ SHOULD | 85%      | Core feature          |
| Course search          | ✅ SHOULD | 85%      | User-facing           |
| UI components          | 🤔 NICE   | 70%      | Visual testing easier |
| Defensive null checks  | ❌ SKIP   | 0%       | TypeScript prevents   |
| Third-party errors     | ❌ SKIP   | 0%       | Can't control         |
| Logging/analytics      | ❌ SKIP   | 0%       | No business logic     |

---

## 8. Testing Tools & Setup

### 8.1 Unit Testing with Vitest

**Installation:**

```bash
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

**Configuration:**

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
		setupFiles: './test/setup.ts',
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			exclude: ['node_modules/', 'test/', '**/*.config.*', '**/types/**', 'convex/_generated/**'],
			// Priority-based thresholds
			thresholds: {
				// Critical: 100%
				'./lib/payments/**': {
					lines: 100,
					functions: 100,
					branches: 100,
					statements: 100,
				},
				'./lib/refunds/**': {
					lines: 100,
					functions: 100,
					branches: 100,
					statements: 100,
				},
				'./lib/payouts/**': {
					lines: 100,
					functions: 100,
					branches: 100,
					statements: 100,
				},
				'./convex/purchases.ts': {
					lines: 100,
					functions: 100,
					branches: 100,
				},

				// Core features: 85%
				'./convex/courses.ts': {
					lines: 85,
					functions: 85,
					branches: 80,
				},
				'./convex/lessons.ts': {
					lines: 85,
					functions: 85,
					branches: 80,
				},
				'./convex/certificates.ts': {
					lines: 85,
					functions: 85,
					branches: 80,
				},
				'./lib/progress.ts': {
					lines: 85,
					functions: 90,
					branches: 80,
				},

				// UI: 70%
				'./components/**': {
					lines: 70,
					functions: 75,
					branches: 65,
				},
				'./app/**': {
					lines: 70,
					functions: 70,
					branches: 65,
				},

				// Overall: 80%
				global: {
					lines: 80,
					functions: 80,
					branches: 75,
					statements: 80,
				},
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

**Setup File:**

```typescript
// test/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Next.js router
vi.mock('next/navigation', () => ({
	useRouter: () => ({
		push: vi.fn(),
		replace: vi.fn(),
		prefetch: vi.fn(),
	}),
	usePathname: () => '/',
	useSearchParams: () => new URLSearchParams(),
}));

// Mock Convex client
vi.mock('convex/react', () => ({
	useQuery: vi.fn(),
	useMutation: vi.fn(),
	useAction: vi.fn(),
	ConvexProvider: ({ children }: { children: React.ReactNode }) => children,
}));
```

**Run Tests:**

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# UI mode
npm run test:ui
```

**Package.json scripts:**

```json
{
	"scripts": {
		"test": "vitest run",
		"test:watch": "vitest",
		"test:ui": "vitest --ui",
		"test:coverage": "vitest run --coverage",
		"test:critical": "vitest run --coverage --config vitest.critical.config.ts"
	}
}
```

### 8.2 Integration Testing with Convex

**Installation:**

```bash
npm install -D convex-test
```

**Basic Test Setup:**

```typescript
// test/integration/enrollment.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { ConvexTestingHelper } from 'convex-test';
import { api } from '@/convex/_generated/api';

describe('Course Enrollment Integration', () => {
	let t: ConvexTestingHelper;

	beforeEach(async () => {
		t = new ConvexTestingHelper();
		await t.run(async ctx => {
			// Set up test data
			await ctx.db.insert('users', {
				firstName: 'Test',
				lastName: 'User',
				email: 'test@example.com',
				isInstructor: false,
				isAdmin: false,
			});
		});
	});

	it('creates purchase with valid payment', async () => {
		const courseId = await t.mutation(api.courses.create, {
			title: 'Test Course',
			description: 'Description',
			instructorId: 'instructor-1',
			price: 29900,
		});

		const purchaseId = await t.mutation(api.purchases.create, {
			userId: 'user-1',
			courseId,
			amount: 29900,
			currency: 'usd',
		});

		const purchase = await t.query(api.purchases.get, {
			id: purchaseId,
		});

		expect(purchase.status).toBe('complete');
		expect(purchase.amount).toBe(29900);
	});

	it('grants course access after purchase', async () => {
		const courseId = await createTestCourse();

		await t.mutation(api.purchases.create, {
			userId: 'user-1',
			courseId,
			amount: 29900,
			currency: 'usd',
		});

		const hasAccess = await t.query(api.courses.hasAccess, {
			userId: 'user-1',
			courseId,
		});

		expect(hasAccess).toBe(true);
	});

	it('tracks lesson completion', async () => {
		const courseId = await createTestCourse();
		const lessonId = await createTestLesson(courseId);
		await enrollUser('user-1', courseId);

		await t.mutation(api.lessons.markComplete, {
			userId: 'user-1',
			lessonId,
			timeSpent: 300,
		});

		const progress = await t.query(api.lessonProgress.getByUser, {
			userId: 'user-1',
			courseId,
		});

		expect(progress).toHaveLength(1);
		expect(progress[0].completed).toBe(true);
	});
});
```

**Testing Mutations:**

```typescript
// test/integration/refunds.test.ts
describe('Refund Integration', () => {
	it('processes refund within policy window', async () => {
		const purchaseId = await createTestPurchase({
			amount: 29900,
			createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000, // 10 days ago
		});

		const refundId = await t.mutation(api.purchases.refund, {
			purchaseId,
			reason: 'Not what I expected',
		});

		const refund = await t.query(api.refunds.get, { id: refundId });

		expect(refund.amount).toBe(29900);
		expect(refund.status).toBe('completed');
	});

	it('denies refund outside policy window', async () => {
		const purchaseId = await createTestPurchase({
			amount: 29900,
			createdAt: Date.now() - 31 * 24 * 60 * 60 * 1000, // 31 days ago
		});

		await expect(
			t.mutation(api.purchases.refund, {
				purchaseId,
				reason: 'Too late',
			}),
		).rejects.toThrow('Refund window expired');
	});
});
```

### 8.3 End-to-End Testing with Playwright

**Installation:**

```bash
npm install -D @playwright/test
npx playwright install
```

**Configuration:**

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: 'html',
	use: {
		baseURL: 'http://localhost:3000',
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
		{
			name: 'Mobile Chrome',
			use: { ...devices['Pixel 5'] },
		},
	],
	webServer: {
		command: 'npm run dev',
		url: 'http://localhost:3000',
		reuseExistingServer: !process.env.CI,
	},
});
```

**Critical Journey Tests:**

```typescript
// e2e/course-purchase.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Course Purchase Flow', () => {
	test('complete course purchase journey', async ({ page }) => {
		// 1. Sign in

		await page.fill('input[name="identifier"]', 'student@test.com');
		await page.fill('input[name="password"]', 'TestP@ss123');
		await page.click('button[type="submit"]');

		// 2. Browse courses
		await page.goto('/courses');
		await expect(page.locator('h1')).toContainText('Browse Courses');

		// 3. View course details
		await page.click('text=Advanced Botox Techniques');
		await expect(page.locator('h1')).toContainText('Advanced Botox');
		await expect(page.locator('text=$299')).toBeVisible();

		// 4. Start enrollment
		await page.click('button:has-text("Enroll Now")');

		// 5. Complete Stripe checkout
		const stripeFrame = page.frameLocator('iframe[name*="stripe"]');
		await stripeFrame.fill('input[name="cardNumber"]', '4242424242424242');
		await stripeFrame.fill('input[name="cardExpiry"]', '1230');
		await stripeFrame.fill('input[name="cardCvc"]', '123');
		await stripeFrame.fill('input[name="billingName"]', 'Test User');

		await page.click('button:has-text("Pay $299")');

		// 6. Verify redirect to learning interface
		await expect(page).toHaveURL(/\/courses\/.*\/learn/, { timeout: 10000 });

		// 7. Verify course content is accessible
		await expect(page.locator('text=Lesson 1')).toBeVisible();
		await expect(page.locator('.lesson-player')).toBeVisible();
	});

	test('prevent access without purchase', async ({ page }) => {
		await page.fill('input[name="identifier"]', 'student@test.com');
		await page.fill('input[name="password"]', 'TestP@ss123');
		await page.click('button[type="submit"]');

		// Try to directly access course learning page
		await page.goto('/courses/test-course-id/learn');

		// Should redirect to course details page
		await expect(page).toHaveURL(/\/courses\/test-course-id$/);
		await expect(page.locator('text=Enroll Now')).toBeVisible();
	});
});
```

```typescript
// e2e/lesson-completion.spec.ts
test.describe('Lesson Completion', () => {
	test('mark lesson complete and update progress', async ({ page }) => {
		await loginAsStudent(page);
		await enrollInTestCourse(page);

		// Navigate to course
		await page.goto('/dashboard');
		await page.click('text=My Courses');
		await page.click('text=Test Course');

		// Start first lesson
		await page.click('text=Lesson 1: Introduction');
		await expect(page.locator('video')).toBeVisible();

		// Wait for video to play for a few seconds
		await page.waitForTimeout(3000);

		// Mark as complete
		await page.click('button:has-text("Mark as Complete")');

		// Verify progress updated
		await expect(page.locator('text=1 of 10 lessons complete')).toBeVisible();
		await expect(page.locator('.progress-bar')).toHaveAttribute('aria-valuenow', '10');
	});
});
```

---

## 9. Continuous Integration

### 9.1 GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm run test:coverage

      # Fail if critical code below 100%
      - run: npm run test:critical

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          fail_ci_if_error: true

  integration-tests:
    runs-on: ubuntu-latest
    needs: unit-tests

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    needs: [unit-tests, integration-tests]

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npx playwright install --with-deps

      # Start Convex dev
      - run: npx convex dev &
        env:
          CONVEX_DEPLOYMENT: ${{ secrets.CONVEX_TEST_DEPLOYMENT }}

      # Build and start Next.js
      - run: npm run build
      - run: npm run start &

      # Wait for server
      - run: npx wait-on http://localhost:3000

      # Run E2E tests
      - run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

### 9.2 Critical Code Verification

```typescript
// vitest.critical.config.ts
import { defineConfig } from 'vitest/config';
import baseConfig from './vitest.config';

export default defineConfig({
	...baseConfig,
	test: {
		...baseConfig.test,
		include: [
			'lib/payments/**/*.test.ts',
			'lib/refunds/**/*.test.ts',
			'lib/payouts/**/*.test.ts',
			'convex/purchases.test.ts',
		],
		coverage: {
			...baseConfig.test.coverage,
			thresholds: {
				lines: 100,
				functions: 100,
				branches: 100,
				statements: 100,
			},
		},
	},
});
```

### 9.3 Pre-Commit Hooks

**Installation:**

```bash
npm install -D husky lint-staged
npx husky install
```

**Configuration:**

```json
// package.json
{
	"lint-staged": {
		"*.{ts,tsx}": ["eslint --fix", "prettier --write", "vitest related --run --coverage=false"],
		"convex/**/*.ts": ["eslint --fix", "prettier --write"]
	}
}
```

**Husky Hook:**

```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged

# Run critical tests before commit
npm run test:critical
```

---

## 10. Test Maintenance Guidelines

### 10.1 When to Update Tests

**Always update when:**

- Business logic changes (refund policy, commission rates)
- Security rules change (access control)
- Payment flow changes
- Core features modified

**Consider updating when:**

- UI components change significantly
- New edge cases discovered in production
- Data model changes

**Don't update when:**

- Visual styling changes only
- Unrelated features added
- Comments or documentation updated

### 10.2 Removing Obsolete Tests

**Delete tests when:**

- Feature completely removed
- Code path no longer possible
- Test duplicates another test
- Code replaced with library function

**Example:**

```typescript
// ❌ DELETE - Feature removed
describe('Old refund approval flow', () => {
	// This workflow was replaced with automated system
	// Delete these tests
});

// ❌ DELETE - Duplicate test
it('calculates commission', () => {
	/*...*/
});
it('computes platform fee', () => {
	/*...*/
}); // Same thing

// ✅ KEEP - Tests different scenarios
it('calculates commission for standard course', () => {
	/*...*/
});
it('calculates commission with discount applied', () => {
	/*...*/
});
```

### 10.3 Test Performance

**Keep tests fast:**

- Unit tests: <100ms each
- Integration tests: <1s each
- E2E tests: <30s each

**Slow test warning signs:**

- Unnecessary database calls
- Real API calls (use mocks)
- Waiting for arbitrary timeouts
- Not using parallel execution
- Loading entire application for unit tests

**Optimization strategies:**

```typescript
// ❌ SLOW - Loads entire app
import { App } from '@/app/page';
render(<App />);

// ✅ FAST - Tests component in isolation
import { CourseCard } from '@/components/CourseCard';
render(<CourseCard course={mockCourse} />);

// ❌ SLOW - Real database calls
const courses = await db.query('courses').collect();

// ✅ FAST - Mocked data
const courses = mockCourses;

// ❌ SLOW - Arbitrary timeout
await page.waitForTimeout(5000);

// ✅ FAST - Wait for specific condition
await page.waitForSelector('.course-loaded');
```

---

## 11. Testing Checklist

### Before Committing Code

- [ ] All MUST TEST code has 100% coverage
- [ ] SHOULD TEST code has >85% coverage
- [ ] Tests pass locally (`npm run test`)
- [ ] No skipped tests without COVERAGE_SKIP comment
- [ ] Critical tests pass (`npm run test:critical`)
- [ ] Integration tests pass for affected features

### Before Deploying to Production

- [ ] Full test suite passes
- [ ] E2E tests pass on staging environment
- [ ] Critical user journeys manually tested
- [ ] Performance tests pass (Lighthouse >90)
- [ ] No P0/P1 bugs open
- [ ] All MUST TEST coverage at 100%
- [ ] Security audit completed
- [ ] Load testing completed (if expecting traffic spike)

### Before Merging Pull Request

- [ ] All CI checks pass
- [ ] Code coverage hasn't decreased
- [ ] New features have appropriate tests
- [ ] Test names are descriptive
- [ ] No console.log statements in tests
- [ ] Mocks are properly cleaned up

---

## 12. Common Testing Patterns

### 12.1 Testing Async Functions

```typescript
describe('async operations', () => {
  it('processes payment asynchronously', async () => {
    const result = await processPayment({
      amount: 29900,
      userId: 'user-1',
      courseId: 'course-1',
    });

    expect(result.status).toBe('succeeded');
    expect(result.amount).toBe(29900);
  });

  it('handles timeout correctly', async () => {
    vi.useFakeTimers();

    const promise = processPayment({...}, { timeout: 5000 });

    vi.advanceTimersByTime(6000);

    await expect(promise).rejects.toThrow('Payment timeout');

    vi.useRealTimers();
  });
});
```

### 12.2 Testing Error Handling

```typescript
describe('error scenarios', () => {
  it('throws on invalid refund request', async () => {
    await expect(
      processRefund('invalid-purchase-id')
    ).rejects.toThrow('Purchase not found');
  });

  it('returns error object on validation failure', () => {
    const result = validatePurchase({ userId: null, courseId: 'c1' });

    expect(result.success).toBe(false);
    expect(result.error).toContain('userId is required');
  });

  it('handles Convex errors gracefully', async () => {
    vi.spyOn(api.purchases, 'create').mockRejectedValue(
      new Error('Database unavailable')
    );

    const result = await attemptPurchase({...});

    expect(result.success).toBe(false);
    expect(result.error).toBe('SERVICE_UNAVAILABLE');
  });
});
```

### 12.3 Testing with Mocks

```typescript
import { vi } from 'vitest';

describe('with mocked dependencies', () => {
	it('sends email on enrollment', async () => {
		const sendEmail = vi.fn().mockResolvedValue({ success: true });

		await createEnrollment({
			userId: 'user-1',
			courseId: 'course-1',
			emailService: { send: sendEmail },
		});

		expect(sendEmail).toHaveBeenCalledWith({
			to: 'user@example.com',
			subject: 'Enrollment Confirmation',
			template: 'enrollment-confirmation',
			data: expect.objectContaining({
				courseName: expect.any(String),
			}),
		});
	});

	it('continues even if email fails', async () => {
		const sendEmail = vi.fn().mockRejectedValue(new Error('SMTP error'));

		const result = await createEnrollment({
			userId: 'user-1',
			courseId: 'course-1',
			emailService: { send: sendEmail },
		});

		// Enrollment should succeed despite email failure
		expect(result.success).toBe(true);
	});
});
```

### 12.4 Testing React Components with Convex

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { useQuery } from 'convex/react';
import { vi } from 'vitest';
import { MyCourses } from '@/components/MyCourses';

vi.mock('convex/react');

describe('MyCourses component', () => {
  it('displays loading state', () => {
    vi.mocked(useQuery).mockReturnValue(undefined);

    render(<MyCourses userId="user-1" />);

    expect(screen.getByText('Loading courses...')).toBeInTheDocument();
  });

  it('displays enrolled courses', async () => {
    const mockCourses = [
      { _id: '1', title: 'Botox 101', progress: 50 },
      { _id: '2', title: 'Fillers Advanced', progress: 25 },
    ];

    vi.mocked(useQuery).mockReturnValue(mockCourses);

    render(<MyCourses userId="user-1" />);

    await waitFor(() => {
      expect(screen.getByText('Botox 101')).toBeInTheDocument();
      expect(screen.getByText('Fillers Advanced')).toBeInTheDocument();
      expect(screen.getByText('50% complete')).toBeInTheDocument();
    });
  });

  it('shows empty state when no courses', () => {
    vi.mocked(useQuery).mockReturnValue([]);

    render(<MyCourses userId="user-1" />);

    expect(screen.getByText('No courses yet')).toBeInTheDocument();
    expect(screen.getByText('Browse courses')).toBeInTheDocument();
  });
});
```

### 12.5 Testing Server Actions

```typescript
// app/actions/enroll.test.ts
import { enrollInCourse } from './enroll';
import { api } from '@/convex/_generated/api';

describe('enrollInCourse server action', () => {
	it('creates purchase and redirects', async () => {
		vi.spyOn(api.purchases, 'create').mockResolvedValue('purchase-123');

		const result = await enrollInCourse({
			courseId: 'course-1',
			paymentIntentId: 'pi_123',
		});

		expect(result.success).toBe(true);
		expect(result.redirect).toBe('/courses/course-1/learn');
	});

	it('handles payment failure', async () => {
		vi.spyOn(api.purchases, 'create').mockRejectedValue(new Error('Payment failed'));

		const result = await enrollInCourse({
			courseId: 'course-1',
			paymentIntentId: 'pi_failed',
		});

		expect(result.success).toBe(false);
		expect(result.error).toBe('PAYMENT_FAILED');
	});
});
```

---

## 13. Documentation and Reporting

### 13.1 Test Documentation

**Good test names:**

```typescript
// ✅ GOOD - Describes what and expected outcome
it('denies refund after 30 days on generous policy');
it('calculates 15% commission on course purchase');
it('allows instructor to create course after verification');

// ❌ BAD - Vague or implementation-focused
it('test refund');
it('commission calculation');
it('it works');
```

**Test comments:**

```typescript
it('allows partial refund for early cancellation', () => {
  // Given: User enrolled 5 days ago in a $299 course
  // When: User requests refund having completed 20% of content
  // Then: Should allow full refund as within policy limits

  const result = processRefund({...});

  expect(result.refundAmount).toBe(29900);
});
```

### 13.2 Coverage Reports

**Generate and view reports:**

```bash
# Generate coverage
npm run test:coverage

# Open HTML report
open coverage/index.html
```

**CI/CD integration:**

```yaml
# Upload to Codecov
- uses: codecov/codecov-action@v3
  with:
    files: ./coverage/coverage-final.json
    flags: unittests
    name: codecov-umbrella
```

---

**Document Version:** 1.0
**Last Updated:** January 2025
**Next Review:** Quarterly
**Owner:** Engineering Team

**Key Takeaway:** Test what matters. 100% coverage on financial code, 85% on core features, 70% on UI, and 0% on defensive edge cases (documented). Focus effort on high-value tests that protect money and security.
