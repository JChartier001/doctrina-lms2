# Backend Implementation Backlog

## Doctrina LMS2 - Convex Function Implementation Tasks

**Version:** 1.0
**Last Updated:** January 2025
**Context:** Sprint-ready tasks for implementing missing Convex backend functions

---

## Sprint 1: Course Structure & Enrollment (Weeks 1-2)

**Goal:** Enable course creation with curriculum and student enrollment/purchase flow

**Total Points:** 34

---

### Task Group 1: Course Modules (Sections)

#### TASK-001: Create CourseModules Table Schema

**File:** `convex/schema.ts`
**Points:** 2
**Status:** 🔴 To Do

**Task:**
Add `courseModules` table definition to schema with proper indexes.

**Implementation:**

```typescript
courseModules: defineTable({
  courseId: v.id('courses'),
  title: v.string(),
  description: v.optional(v.string()),
  order: v.number(),
  createdAt: v.number(),
})
  .index('by_course', ['courseId'])
  .index('by_course_order', ['courseId', 'order']),
```

**Acceptance Criteria:**

- [ ] Table defined in schema.ts
- [ ] Indexes created
- [ ] Run `npx convex dev` successfully compiles

---

#### TASK-002: Create courseModules.create mutation

**File:** `convex/courseModules.ts` (new file)
**Points:** 3
**Status:** 🔴 To Do

**Implementation:**

```typescript
import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const create = mutation({
	args: {
		courseId: v.id('courses'),
		title: v.string(),
		description: v.optional(v.string()),
		order: v.number(),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new Error('Not authenticated');

		// Verify user is instructor and owns course
		const course = await ctx.db.get(args.courseId);
		if (!course) throw new Error('Course not found');

		const user = await ctx.db
			.query('users')
			.withIndex('by_externalId', q => q.eq('externalId', identity.subject))
			.first();

		if (!user?.isInstructor || course.instructorId !== identity.subject) {
			throw new Error('Not authorized');
		}

		const moduleId = await ctx.db.insert('courseModules', {
			...args,
			createdAt: Date.now(),
		});

		return moduleId;
	},
});
```

**Acceptance Criteria:**

- [ ] Function creates module record
- [ ] Verifies instructor owns course
- [ ] Returns moduleId
- [ ] Throws error if not authenticated or not authorized

**Test:**

```typescript
// In console or test:
// await createModule({ courseId: 'xxx', title: 'Module 1', order: 0 })
```

---

#### TASK-003: Create courseModules.list query

**File:** `convex/courseModules.ts`
**Points:** 2
**Status:** 🔴 To Do

**Implementation:**

```typescript
export const list = query({
	args: { courseId: v.id('courses') },
	handler: async (ctx, { courseId }) => {
		const modules = await ctx.db
			.query('courseModules')
			.withIndex('by_course', q => q.eq('courseId', courseId))
			.order('asc')
			.collect();

		// Sort by order field
		return modules.sort((a, b) => a.order - b.order);
	},
});
```

**Acceptance Criteria:**

- [ ] Returns modules for course
- [ ] Ordered by order field
- [ ] Public query (no auth required for viewing)

---

#### TASK-004: Create courseModules.update mutation

**File:** `convex/courseModules.ts`
**Points:** 2
**Status:** 🔴 To Do

**Implementation:**

```typescript
export const update = mutation({
	args: {
		moduleId: v.id('courseModules'),
		title: v.optional(v.string()),
		description: v.optional(v.string()),
		order: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const { moduleId, ...updates } = args;

		// Verify ownership
		const module = await ctx.db.get(moduleId);
		if (!module) throw new Error('Module not found');

		const course = await ctx.db.get(module.courseId);
		const identity = await ctx.auth.getUserIdentity();

		if (course.instructorId !== identity?.subject) {
			throw new Error('Not authorized');
		}

		await ctx.db.patch(moduleId, updates);
	},
});
```

**Acceptance Criteria:**

- [ ] Updates module fields
- [ ] Verifies instructor owns course
- [ ] Only updates provided fields

---

#### TASK-005: Create courseModules.remove mutation

**File:** `convex/courseModules.ts`
**Points:** 2
**Status:** 🔴 To Do

**Implementation:**

```typescript
export const remove = mutation({
	args: { moduleId: v.id('courseModules') },
	handler: async (ctx, { moduleId }) => {
		// Verify ownership
		const module = await ctx.db.get(moduleId);
		if (!module) throw new Error('Module not found');

		const course = await ctx.db.get(module.courseId);
		const identity = await ctx.auth.getUserIdentity();

		if (course.instructorId !== identity?.subject) {
			throw new Error('Not authorized');
		}

		// Delete all lessons in module first
		const lessons = await ctx.db
			.query('lessons')
			.withIndex('by_module', q => q.eq('moduleId', moduleId))
			.collect();

		for (const lesson of lessons) {
			await ctx.db.delete(lesson._id);
		}

		// Delete module
		await ctx.db.delete(moduleId);
	},
});
```

**Acceptance Criteria:**

- [ ] Deletes module
- [ ] Cascade deletes lessons
- [ ] Verifies ownership

---

#### TASK-006: Create courseModules.reorder mutation

**File:** `convex/courseModules.ts`
**Points:** 3
**Status:** 🔴 To Do

**Implementation:**

```typescript
export const reorder = mutation({
	args: {
		courseId: v.id('courses'),
		moduleIds: v.array(v.id('courseModules')),
	},
	handler: async (ctx, { courseId, moduleIds }) => {
		const identity = await ctx.auth.getUserIdentity();
		const course = await ctx.db.get(courseId);

		if (course.instructorId !== identity?.subject) {
			throw new Error('Not authorized');
		}

		// Update order for each module
		for (let i = 0; i < moduleIds.length; i++) {
			await ctx.db.patch(moduleIds[i], { order: i });
		}
	},
});
```

**Acceptance Criteria:**

- [ ] Updates order field for all modules
- [ ] Order reflects array position
- [ ] Verifies ownership

---

### Task Group 2: Lessons

#### TASK-007: Create Lessons Table Schema

**File:** `convex/schema.ts`
**Points:** 2
**Status:** 🔴 To Do

**Implementation:**

```typescript
lessons: defineTable({
  moduleId: v.id('courseModules'),
  title: v.string(),
  description: v.optional(v.string()),
  type: v.union(v.literal('video'), v.literal('quiz'), v.literal('assignment')),
  duration: v.optional(v.string()), // e.g., "15:30"
  videoUrl: v.optional(v.string()),
  videoId: v.optional(v.string()), // Vimeo/Cloudflare ID
  content: v.optional(v.string()), // Rich text content for non-video lessons
  isPreview: v.boolean(),
  order: v.number(),
  createdAt: v.number(),
})
  .index('by_module', ['moduleId'])
  .index('by_module_order', ['moduleId', 'order']),
```

**Acceptance Criteria:**

- [ ] Table defined in schema
- [ ] Indexes created
- [ ] Compiles successfully

---

#### TASK-008: Create lessons.create mutation

**File:** `convex/lessons.ts` (new file)
**Points:** 3
**Status:** 🔴 To Do

**Implementation:**

```typescript
export const create = mutation({
	args: {
		moduleId: v.id('courseModules'),
		title: v.string(),
		description: v.optional(v.string()),
		type: v.union(v.literal('video'), v.literal('quiz'), v.literal('assignment')),
		duration: v.optional(v.string()),
		videoUrl: v.optional(v.string()),
		videoId: v.optional(v.string()),
		isPreview: v.optional(v.boolean()),
		order: v.number(),
	},
	handler: async (ctx, args) => {
		// Verify instructor owns course
		const module = await ctx.db.get(args.moduleId);
		if (!module) throw new Error('Module not found');

		const course = await ctx.db.get(module.courseId);
		const identity = await ctx.auth.getUserIdentity();

		if (course.instructorId !== identity?.subject) {
			throw new Error('Not authorized');
		}

		const lessonId = await ctx.db.insert('lessons', {
			...args,
			isPreview: args.isPreview ?? false,
			createdAt: Date.now(),
		});

		return lessonId;
	},
});
```

**Acceptance Criteria:**

- [ ] Creates lesson record
- [ ] Verifies instructor owns course
- [ ] Default isPreview to false
- [ ] Returns lessonId

---

#### TASK-009: Create lessons.list query

**File:** `convex/lessons.ts`
**Points:** 2
**Status:** 🔴 To Do

**Implementation:**

```typescript
export const list = query({
	args: { moduleId: v.id('courseModules') },
	handler: async (ctx, { moduleId }) => {
		const lessons = await ctx.db
			.query('lessons')
			.withIndex('by_module', q => q.eq('moduleId', moduleId))
			.order('asc')
			.collect();

		return lessons.sort((a, b) => a.order - b.order);
	},
});
```

**Acceptance Criteria:**

- [ ] Returns lessons for module
- [ ] Ordered by order field

---

#### TASK-010: Create lessons.get query with access control

**File:** `convex/lessons.ts`
**Points:** 5
**Status:** 🔴 To Do

**Implementation:**

```typescript
export const get = query({
	args: { lessonId: v.id('lessons') },
	handler: async (ctx, { lessonId }) => {
		const lesson = await ctx.db.get(lessonId);
		if (!lesson) return null;

		// If preview lesson, allow anyone
		if (lesson.isPreview) {
			return lesson;
		}

		// Check authentication
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error('Must be authenticated to access non-preview lessons');
		}

		// Get course via module
		const module = await ctx.db.get(lesson.moduleId);
		const course = await ctx.db.get(module.courseId);

		// Check if user is instructor
		if (course.instructorId === identity.subject) {
			return lesson;
		}

		// Check if user is enrolled
		const enrollment = await ctx.db
			.query('enrollments')
			.withIndex('by_user_course', q => q.eq('userId', identity.subject).eq('courseId', course._id))
			.first();

		if (!enrollment) {
			throw new Error('Not enrolled in this course');
		}

		return lesson;
	},
});
```

**Acceptance Criteria:**

- [ ] Returns lesson if preview
- [ ] Returns lesson if user is instructor
- [ ] Returns lesson if user is enrolled
- [ ] Throws error otherwise

---

#### TASK-011: Create lessons.update and remove mutations

**File:** `convex/lessons.ts`
**Points:** 3
**Status:** 🔴 To Do

**Implementation:** Similar to modules (update/remove with ownership verification)

---

### Task Group 3: Enrollments

#### TASK-012: Create Enrollments Table Schema

**File:** `convex/schema.ts`
**Points:** 2
**Status:** 🔴 To Do

**Implementation:**

```typescript
enrollments: defineTable({
  userId: v.string(), // Clerk external ID
  courseId: v.id('courses'),
  purchaseId: v.id('purchases'),
  enrolledAt: v.number(),
  completedAt: v.optional(v.number()),
  progressPercent: v.number(), // 0-100
})
  .index('by_user', ['userId'])
  .index('by_course', ['courseId'])
  .index('by_user_course', ['userId', 'courseId']),
```

---

#### TASK-013: Create enrollments.create mutation

**File:** `convex/enrollments.ts` (new file)
**Points:** 5
**Status:** 🔴 To Do

**Implementation:**

```typescript
export const create = mutation({
	args: {
		userId: v.string(),
		courseId: v.id('courses'),
		purchaseId: v.id('purchases'),
	},
	handler: async (ctx, args) => {
		// Check if already enrolled (idempotent)
		const existing = await ctx.db
			.query('enrollments')
			.withIndex('by_user_course', q => q.eq('userId', args.userId).eq('courseId', args.courseId))
			.first();

		if (existing) {
			console.log('User already enrolled, returning existing enrollment');
			return existing._id;
		}

		// Create enrollment
		const enrollmentId = await ctx.db.insert('enrollments', {
			...args,
			enrolledAt: Date.now(),
			progressPercent: 0,
		});

		// Create notification
		await ctx.db.insert('notifications', {
			userId: args.userId,
			type: 'enrollment',
			title: 'Course enrolled!',
			message: `You've successfully enrolled in the course.`,
			courseId: args.courseId,
			read: false,
			createdAt: Date.now(),
		});

		return enrollmentId;
	},
});
```

**Acceptance Criteria:**

- [ ] Creates enrollment record
- [ ] Idempotent (doesn't create duplicate)
- [ ] Creates notification
- [ ] Returns enrollmentId

---

#### TASK-014: Create enrollments.isEnrolled query

**File:** `convex/enrollments.ts`
**Points:** 2
**Status:** 🔴 To Do

**Implementation:**

```typescript
export const isEnrolled = query({
	args: {
		userId: v.string(),
		courseId: v.id('courses'),
	},
	handler: async (ctx, { userId, courseId }) => {
		const enrollment = await ctx.db
			.query('enrollments')
			.withIndex('by_user_course', q => q.eq('userId', userId).eq('courseId', courseId))
			.first();

		return !!enrollment;
	},
});
```

---

#### TASK-015: Create enrollments.getUserEnrollments query

**File:** `convex/enrollments.ts`
**Points:** 3
**Status:** 🔴 To Do

**Implementation:**

```typescript
export const getUserEnrollments = query({
	args: { userId: v.string() },
	handler: async (ctx, { userId }) => {
		const enrollments = await ctx.db
			.query('enrollments')
			.withIndex('by_user', q => q.eq('userId', userId))
			.order('desc')
			.collect();

		// Populate course details
		return await Promise.all(
			enrollments.map(async enrollment => {
				const course = await ctx.db.get(enrollment.courseId);
				return {
					...enrollment,
					course,
				};
			}),
		);
	},
});
```

---

### Task Group 4: Stripe Payment Integration

#### TASK-016: Create payments.createCheckoutSession action

**File:** `convex/payments.ts` (new file)
**Points:** 8
**Status:** 🔴 To Do

**Prerequisites:**

- Install Stripe SDK: `npm install stripe`
- Add env vars to `.env.local`: `STRIPE_SECRET_KEY=sk_test_...`

**Implementation:**

```typescript
import { action } from './_generated/server';
import { v } from 'convex/values';
import { api } from './_generated/api';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: '2024-12-18.acacia',
});

export const createCheckoutSession = action({
	args: { courseId: v.id('courses') },
	handler: async (ctx, { courseId }) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new Error('Must be logged in');

		const course = await ctx.runQuery(api.courses.get, { id: courseId });
		if (!course) throw new Error('Course not found');

		// Check if already enrolled
		const enrolled = await ctx.runQuery(api.enrollments.isEnrolled, {
			userId: identity.subject,
			courseId,
		});

		if (enrolled) {
			throw new Error('Already enrolled in this course');
		}

		const session = await stripe.checkout.sessions.create({
			line_items: [
				{
					price_data: {
						currency: 'usd',
						product_data: {
							name: course.title,
							description: course.description || '',
							images: course.thumbnailUrl ? [course.thumbnailUrl] : [],
						},
						unit_amount: Math.round((course.price || 0) * 100), // cents
					},
					quantity: 1,
				},
			],
			mode: 'payment',
			success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${courseId}`,
			metadata: {
				courseId,
				userId: identity.subject,
			},
			customer_email: identity.email,
		});

		return { url: session.url };
	},
});
```

**Acceptance Criteria:**

- [ ] Creates Stripe checkout session
- [ ] Includes course details
- [ ] Stores courseId and userId in metadata
- [ ] Returns checkout URL
- [ ] Checks if already enrolled

---

#### TASK-017: Create Stripe webhook handler (Next.js API route)

**File:** `app/api/webhooks/stripe/route.ts` (new file)
**Points:** 8
**Status:** 🔴 To Do

**Prerequisites:**

- Add to `.env.local`: `STRIPE_WEBHOOK_SECRET=whsec_...`

**Implementation:**

```typescript
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { api } from '@/convex/_generated/api';
import { ConvexHttpClient } from 'convex/browser';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: '2024-12-18.acacia',
});

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
	const body = await req.text();
	const signature = headers().get('stripe-signature')!;

	let event: Stripe.Event;

	try {
		event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
	} catch (err: any) {
		console.error('Webhook signature verification failed:', err.message);
		return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
	}

	console.log('Received Stripe event:', event.type);

	if (event.type === 'checkout.session.completed') {
		const session = event.data.object as Stripe.Checkout.Session;
		const { courseId, userId } = session.metadata!;

		console.log('Processing purchase:', { courseId, userId });

		try {
			// Create purchase record
			const purchaseId = await convex.mutation(api.purchases.create, {
				userId,
				courseId,
				amount: (session.amount_total || 0) / 100,
				stripeSessionId: session.id,
				status: 'complete',
			});

			console.log('Created purchase:', purchaseId);

			// Create enrollment
			const enrollmentId = await convex.mutation(api.enrollments.create, {
				userId,
				courseId,
				purchaseId,
			});

			console.log('Created enrollment:', enrollmentId);
		} catch (error: any) {
			console.error('Error processing purchase:', error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}
	}

	return NextResponse.json({ received: true });
}
```

**Acceptance Criteria:**

- [ ] Verifies Stripe signature
- [ ] Handles checkout.session.completed event
- [ ] Creates purchase record
- [ ] Creates enrollment record
- [ ] Logs errors
- [ ] Returns 200 OK to Stripe

---

### Task Group 5: Enhanced Course Query

#### TASK-018: Create courses.getWithCurriculum query

**File:** `convex/courses.ts` (add to existing)
**Points:** 8
**Status:** 🔴 To Do

**Implementation:**

```typescript
export const getWithCurriculum = query({
	args: { courseId: v.id('courses') },
	handler: async (ctx, { courseId }) => {
		const course = await ctx.db.get(courseId);
		if (!course) return null;

		// Get modules
		const modules = await ctx.db
			.query('courseModules')
			.withIndex('by_course', q => q.eq('courseId', courseId))
			.collect();

		const sortedModules = modules.sort((a, b) => a.order - b.order);

		// Get lessons for each module
		const curriculum = await Promise.all(
			sortedModules.map(async module => {
				const lessons = await ctx.db
					.query('lessons')
					.withIndex('by_module', q => q.eq('moduleId', module._id))
					.collect();

				const sortedLessons = lessons.sort((a, b) => a.order - b.order);

				return {
					id: module._id,
					title: module.title,
					description: module.description,
					lessons: sortedLessons.map(l => ({
						id: l._id,
						title: l.title,
						type: l.type,
						duration: l.duration,
						isPreview: l.isPreview,
					})),
				};
			}),
		);

		// Get instructor details
		const instructor = await ctx.db
			.query('users')
			.withIndex('by_externalId', q => q.eq('externalId', course.instructorId))
			.first();

		// Get student count
		const enrollments = await ctx.db
			.query('enrollments')
			.withIndex('by_course', q => q.eq('courseId', courseId))
			.collect();

		return {
			...course,
			curriculum,
			instructor: instructor
				? {
						name: `${instructor.firstName} ${instructor.lastName}`,
						title: instructor.title || '',
						bio: instructor.bio || '',
						image: instructor.profilePhotoUrl,
					}
				: null,
			students: enrollments.length,
			lessons: curriculum.reduce((sum, m) => sum + m.lessons.length, 0),
		};
	},
});
```

**Acceptance Criteria:**

- [ ] Returns course with full curriculum
- [ ] Includes instructor details
- [ ] Includes student count
- [ ] Includes total lesson count
- [ ] Properly sorted by order

---

## Sprint 2: Progress Tracking & Quizzes (Weeks 3-4)

**Goal:** Track lesson completion and enable quiz functionality

**Total Points:** 23

### Task Group 6: Lesson Progress

#### TASK-019: Create LessonProgress Table Schema

**File:** `convex/schema.ts`
**Points:** 1

#### TASK-020: Create lessonProgress.markComplete mutation

**File:** `convex/lessonProgress.ts`
**Points:** 5

#### TASK-021: Create lessonProgress.getUserProgress query

**File:** `convex/lessonProgress.ts`
**Points:** 3

#### TASK-022: Update enrollment progress calculation

**File:** `convex/enrollments.ts`
**Points:** 5

### Task Group 7: Quiz System

#### TASK-023: Create Quizzes and QuizQuestions Table Schemas

**File:** `convex/schema.ts`
**Points:** 2

#### TASK-024: Create quizzes CRUD functions

**File:** `convex/quizzes.ts`
**Points:** 5

#### TASK-025: Create quiz submission and grading

**File:** `convex/quizzes.ts`
**Points:** 8

---

## Sprint 3: Reviews & Quiz Completion (Weeks 5-6)

**Goal:** Enable course reviews and complete quiz functionality

**Total Points:** 19

### Task Group 8: Course Reviews

#### TASK-026: Create CourseReviews Table Schema

**Points:** 1

#### TASK-027: Create courseReviews.create mutation

**Points:** 5

#### TASK-028: Create courseReviews.list query

**Points:** 3

#### TASK-029: Update courses.getWithCurriculum to include reviews

**Points:** 2

---

## Sprint 4: Discussions & Analytics (Weeks 7-8)

**Goal:** Community features and enhanced analytics

**Total Points:** 29

_(Tasks deferred to maintain focus on critical path)_

---

## Implementation Order Summary

**Priority 1 (Sprint 1 - MUST DO):**

1. Course modules CRUD
2. Lessons CRUD with access control
3. Enrollments management
4. Stripe checkout integration
5. Enhanced course query

**Priority 2 (Sprint 2 - HIGH):** 6. Lesson progress tracking 7. Quiz creation and grading

**Priority 3 (Sprint 3 - MEDIUM):** 8. Course reviews 9. Analytics enhancements

**Priority 4 (Sprint 4 - NICE TO HAVE):** 10. Discussions 11. Advanced features

---

**Document Status:** ✅ Ready for Implementation
**Next Action:** Begin TASK-001 (Create CourseModules schema)
