# Product Backlog

## Doctrina LMS - Sprint Planning & User Stories

**Version:** 1.0
**Last Updated:** January 2025
**Owner:** Product & Engineering Teams

---

## Backlog Overview

This document contains all user stories organized by sprint for the MVP launch (Sprints 1-6, 12 weeks). Each story includes acceptance criteria, story point estimates, and technical notes.

### Story Point Scale (Fibonacci)

- **1 point:** Trivial change (< 2 hours)
- **2 points:** Simple task (2-4 hours)
- **3 points:** Straightforward feature (4-8 hours, 1 day)
- **5 points:** Moderate complexity (8-16 hours, 2 days)
- **8 points:** Complex feature (16-24 hours, 3 days)
- **13 points:** Very complex (24-40 hours, 1 week)
- **21 points:** Requires breakdown into smaller stories

### Story Status Legend

- 🔴 **To Do** - Not yet started
- 🟡 **In Progress** - Currently being worked on
- 🟢 **Done** - Completed and deployed
- 🔵 **Blocked** - Waiting on dependency

---

## Definition of Done

A story is considered "Done" when:

- [ ] Code complete and peer-reviewed
- [ ] All acceptance criteria met
- [ ] Unit tests written (if applicable, per TESTING-STRATEGY.md)
- [ ] Integration tests passing (if applicable)
- [ ] No critical bugs or regressions
- [ ] Deployed to staging environment
- [ ] Product owner approval
- [ ] Documentation updated (if user-facing feature)

---

## Sprint 1: Foundation (Weeks 1-2)

**Sprint Goal:** Users can register, log in, and browse courses

**Total Story Points:** 34
**Velocity Target:** 30-40 points (new team, establishing baseline)

---

### US-001: User Email/Password Registration

**Epic:** EPIC-001 (User Authentication)
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 3

#### Story

As a **student or prospective instructor**, I want to create an account with email and password so that I can access the platform.

#### Acceptance Criteria

- [ ] Registration form has fields: email, password, confirm password, first name, last name
- [ ] Email validation (valid format, not already registered)
- [ ] Password validation (min 8 chars, 1 uppercase, 1 number, 1 special char)
- [ ] Password confirmation must match
- [ ] Successful registration creates user record in Convex
- [ ] User redirected to email verification page
- [ ] Error messages clear and helpful

#### Technical Notes

- **Frontend:** Next.js page `/sign-up`, Clerk `<SignUp />` component
- **Backend:** Clerk handles authentication, webhook syncs to Convex users table
- **Database:** Users table with fields: externalId (Clerk ID), email, firstName, lastName, isInstructor (false), isAdmin (false), createdAt

#### Test Cases

- Valid registration succeeds
- Duplicate email shows error
- Weak password rejected
- Password mismatch rejected

---

### US-002: Email Verification

**Epic:** EPIC-001
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 2

#### Story

As a **new user**, I want to verify my email address so that the platform knows my email is valid and I can access features.

#### Acceptance Criteria

- [ ] Verification email sent immediately after registration
- [ ] Email contains verification link with token
- [ ] Clicking link verifies email and logs user in
- [ ] Unverified users cannot enroll in courses
- [ ] Verification page shows success message
- [ ] Can resend verification email (rate limited to 1 per minute)

#### Technical Notes

- **Email:** Resend API for sending verification emails
- **Auth:** Clerk handles verification flow
- **Template:** React Email template for verification email

---

### US-003: Google OAuth Login

**Epic:** EPIC-001
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 2

#### Story

As a **user**, I want to log in with my Google account so that I don't have to remember another password.

#### Acceptance Criteria

- [ ] "Sign in with Google" button on login page
- [ ] Clicking button redirects to Google OAuth consent
- [ ] After consent, user logged in and redirected to dashboard
- [ ] First-time Google login creates user record
- [ ] User can link Google account to existing email account

#### Technical Notes

- **Auth:** Clerk OAuth integration
- **Configuration:** Google OAuth app setup in Google Cloud Console
- **Scopes:** email, profile

---

### US-004: Password Reset

**Epic:** EPIC-001
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 3

#### Story

As a **user who forgot my password**, I want to reset it via email so that I can regain access to my account.

#### Acceptance Criteria

- [ ] "Forgot password?" link on login page
- [ ] Password reset page has email input
- [ ] Clicking "Send reset link" sends email with token
- [ ] Reset email received within 1 minute
- [ ] Reset link valid for 1 hour
- [ ] Reset page allows entering new password
- [ ] Password saved and user can log in with new password

#### Technical Notes

- **Auth:** Clerk password reset flow
- **Email:** Resend for password reset emails
- **Security:** Rate limit reset requests (5 per hour per email)

---

### US-005: User Profile Management

**Epic:** EPIC-001
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 3

#### Story

As a **user**, I want to edit my profile information so that my name and photo are up to date.

#### Acceptance Criteria

- [ ] Profile page shows current: first name, last name, email, profile photo
- [ ] Can edit first name, last name
- [ ] Can upload profile photo (max 5MB, JPG/PNG)
- [ ] Changes save and persist
- [ ] Profile photo appears in dashboard and on reviews

#### Technical Notes

- **Frontend:** Profile edit form
- **Backend:** Convex mutation to update users table
- **File Upload:** Convex file storage for profile photos
- **Image Optimization:** Resize to 200x200px

---

### US-006: Homepage Design

**Epic:** EPIC-002 (Course Discovery)
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 5

#### Story

As a **visitor**, I want to see an attractive homepage so that I understand what the platform offers and can browse featured courses.

#### Acceptance Criteria

- [ ] Hero section with headline, subheadline, CTA button
- [ ] "Featured Courses" section (6-8 courses in grid)
- [ ] "Become an Instructor" section with CTA
- [ ] Footer with links (About, Contact, Terms, Privacy)
- [ ] Mobile responsive
- [ ] Page loads in <2 seconds

#### Technical Notes

- **Frontend:** Next.js page `/` (app/page.tsx)
- **Backend:** Convex query for featured courses
- **Design:** Tailwind CSS, shadcn/ui components
- **SEO:** Meta tags, Open Graph tags

---

### US-007: Course Catalog Page

**Epic:** EPIC-002
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 5

#### Story

As a **student**, I want to browse all courses in a catalog so that I can find courses that interest me.

#### Acceptance Criteria

- [ ] Catalog page at `/courses` shows all published courses
- [ ] Courses displayed in grid (3 columns desktop, 1 column mobile)
- [ ] Each course card shows: thumbnail, title, instructor, price, rating, CE badge
- [ ] Pagination or infinite scroll (if >50 courses)
- [ ] Clicking course card navigates to course detail page

#### Technical Notes

- **Frontend:** Next.js page `/courses/page.tsx`
- **Backend:** Convex query `api.courses.list` with pagination
- **Component:** `<CourseCard />` reusable component

---

### US-008: Course Filtering (Category, Price, CE Credits)

**Epic:** EPIC-002
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 5

#### Story

As a **student**, I want to filter courses by category, price range, and CE credit availability so that I can find courses that meet my specific needs.

#### Acceptance Criteria

- [ ] Filter sidebar (or top bar on mobile) with options:
  - Category (Injectables, Lasers, Business, etc.)
  - Price range (slider or min/max inputs)
  - CE Credits Available (checkbox)
  - Level (Beginner, Intermediate, Advanced)
  - Rating (4+ stars, 4.5+ stars)
- [ ] Filters apply immediately (no "Apply" button needed)
- [ ] Filter state persists in URL query params
- [ ] Filtered results update in real-time
- [ ] "Clear all filters" button resets to default

#### Technical Notes

- **Frontend:** Filter UI components, URL state management
- **Backend:** Convex query with filter parameters
- **Performance:** Debounce filter changes (300ms)

---

### US-009: Course Search

**Epic:** EPIC-002
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 3

#### Story

As a **student**, I want to search courses by keyword so that I can quickly find specific topics.

#### Acceptance Criteria

- [ ] Search bar in header (visible on all pages)
- [ ] Typing in search shows autocomplete suggestions
- [ ] Pressing Enter navigates to search results page
- [ ] Search results show courses matching title or description
- [ ] Highlighting of search terms in results
- [ ] "No results" message if no matches

#### Technical Notes

- **Frontend:** Search input component with autocomplete
- **Backend:** Convex full-text search query
- **Search Index:** Index on courses.title and courses.description

---

### US-010: Course Card Component

**Epic:** EPIC-002
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 2

#### Story

As a **developer**, I want a reusable course card component so that courses display consistently across the platform.

#### Acceptance Criteria

- [ ] Component props: course object
- [ ] Displays: thumbnail, title, instructor name, price, rating, CE badge
- [ ] Hover effect (subtle shadow, slight scale)
- [ ] Responsive (stacks on mobile)
- [ ] Accessible (ARIA labels, keyboard navigation)

#### Technical Notes

- **Component:** `components/course-card.tsx`
- **Styling:** Tailwind CSS
- **Image:** Next.js `<Image />` component for optimization

---

## Sprint 2: Course Detail & Purchase (Weeks 3-4)

**Sprint Goal:** Students can view course details, preview lessons, and purchase courses

**Total Story Points:** 42
**Velocity Target:** 35-45 points

---

### US-011: Course Detail Page Layout

**Epic:** EPIC-002
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 5

#### Story

As a **student**, I want to see complete course information on a detail page so that I can decide if the course is worth purchasing.

#### Acceptance Criteria

- [ ] Course detail page at `/courses/[id]`
- [ ] Shows: title, short description, long description, price
- [ ] Shows instructor: name, photo, bio, credentials
- [ ] "Enroll Now" button prominent
- [ ] Curriculum section (collapsible modules with lessons)
- [ ] Reviews section (average rating + individual reviews)
- [ ] CE credit information (if applicable)
- [ ] Prerequisites, learning objectives, requirements
- [ ] Mobile responsive

#### Technical Notes

- **Frontend:** Next.js dynamic route `/courses/[id]/page.tsx`
- **Backend:** Convex query `api.courses.get` with courseId
- **SEO:** Dynamic meta tags for each course

---

### US-012: Course Curriculum Display

**Epic:** EPIC-002
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 3

#### Story

As a **student**, I want to see the course curriculum (modules and lessons) so that I know what content is covered.

#### Acceptance Criteria

- [ ] Curriculum section shows all modules
- [ ] Each module is collapsible/expandable
- [ ] Lessons listed under modules with: title, duration, preview badge
- [ ] Total course duration displayed
- [ ] Preview lessons marked with "Free Preview" badge
- [ ] Locked icon for non-preview lessons

#### Technical Notes

- **Component:** `<Curriculum />` component
- **Backend:** Convex query includes courseModules and lessons
- **Icons:** Lock icon for locked lessons, play icon for preview

---

### US-013: Preview Lesson Video Player

**Epic:** EPIC-002
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 5

#### Story

As a **student**, I want to preview selected lessons before purchasing so that I can see the teaching style and content quality.

#### Acceptance Criteria

- [ ] Clicking preview lesson opens video player
- [ ] Video player embedded (Vimeo or Cloudflare iframe)
- [ ] Video plays smoothly with adaptive quality
- [ ] Player controls: play/pause, seek, volume, fullscreen
- [ ] Preview lessons playable without login
- [ ] Non-preview lessons show "Enroll to access" message

#### Technical Notes

- **Video:** Vimeo Business or Cloudflare Stream embed
- **Component:** `<VideoPlayer />` reusable component
- **Security:** Preview lessons have public privacy setting

---

### US-014: Instructor Profile on Course Page

**Epic:** EPIC-002
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 2

#### Story

As a **student**, I want to see instructor credentials on the course page so that I can trust they are qualified to teach.

#### Acceptance Criteria

- [ ] Instructor section shows: name, photo, bio, credentials
- [ ] Credentials include: license type, years of experience, specialties
- [ ] "Verified Instructor" badge displayed
- [ ] Link to instructor's other courses

#### Technical Notes

- **Backend:** Convex query includes instructor user data
- **Design:** Card or sidebar component for instructor info

---

### US-015: Stripe Checkout Integration

**Epic:** EPIC-003 (Course Purchase)
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 8

#### Story

As a **student**, I want to purchase a course with my credit card so that I can access the learning content.

#### Acceptance Criteria

- [ ] "Enroll Now" button creates Stripe Checkout session
- [ ] User redirected to Stripe hosted checkout page
- [ ] Checkout page shows: course title, price, total
- [ ] User can enter payment info (Stripe handles)
- [ ] Successful payment redirects to `/courses/[id]/learn` (success URL)
- [ ] Failed payment returns to course page with error message (cancel URL)
- [ ] User must be logged in to enroll (redirect to sign in if not)

#### Technical Notes

- **Backend:** Convex action creates Stripe Checkout session
- **API:** Stripe Checkout Sessions API
- **Environment:** Stripe test keys for development, live keys for production
- **Success URL:** `/courses/[id]/learn?session_id={CHECKOUT_SESSION_ID}`
- **Cancel URL:** `/courses/[id]?canceled=true`

```typescript
// convex/payments.ts
export const createCheckoutSession = action({
	args: { courseId: v.id('courses') },
	handler: async (ctx, { courseId }) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new Error('Must be logged in');

		const course = await ctx.runQuery(api.courses.get, { courseId });

		const session = await stripe.checkout.sessions.create({
			line_items: [
				{
					price_data: {
						currency: 'usd',
						product_data: {
							name: course.title,
							images: [course.thumbnailUrl],
						},
						unit_amount: course.price * 100, // cents
					},
					quantity: 1,
				},
			],
			mode: 'payment',
			success_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${courseId}/learn?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${courseId}?canceled=true`,
			metadata: {
				courseId,
				userId: identity.subject,
			},
		});

		return { sessionUrl: session.url };
	},
});
```

---

### US-016: Stripe Webhook Handler

**Epic:** EPIC-003
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 8

#### Story

As the **system**, I want to process Stripe webhook events so that enrollments are created after successful payments.

#### Acceptance Criteria

- [ ] Webhook endpoint at `/api/webhooks/stripe/route.ts`
- [ ] Verifies Stripe signature (prevents fraud)
- [ ] Handles `checkout.session.completed` event
- [ ] Creates enrollment record in Convex
- [ ] Creates purchase record in Convex
- [ ] Returns 200 OK to Stripe
- [ ] Idempotent (duplicate webhooks don't create duplicate records)

#### Technical Notes

- **API Route:** Next.js API route (App Router)
- **Verification:** Stripe `constructEvent()` with webhook secret
- **Database:** Creates records in `enrollments` and `purchases` tables
- **Idempotency:** Check if enrollment already exists before creating

```typescript
// app/api/webhooks/stripe/route.ts
import { stripe } from '@/lib/stripe';
import { api } from '@/convex/_generated/api';
import { ConvexHttpClient } from 'convex/browser';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
	const body = await req.text();
	const signature = req.headers.get('stripe-signature')!;

	const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);

	if (event.type === 'checkout.session.completed') {
		const session = event.data.object;
		const { courseId, userId } = session.metadata;

		// Create enrollment
		await convex.mutation(api.enrollments.create, {
			userId,
			courseId,
			purchaseId: session.payment_intent,
			enrolledAt: Date.now(),
		});

		// Create purchase record
		await convex.mutation(api.purchases.create, {
			userId,
			courseId,
			amount: session.amount_total / 100,
			stripeSessionId: session.id,
			status: 'complete',
		});
	}

	return Response.json({ received: true });
}
```

---

### US-017: Receipt Email

**Epic:** EPIC-003
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 3

#### Story

As a **student**, I want to receive a receipt email after purchasing a course so that I have proof of purchase.

#### Acceptance Criteria

- [ ] Receipt email sent within 5 minutes of purchase
- [ ] Email includes: course title, price, purchase date, receipt number
- [ ] Email includes link to access course
- [ ] Email includes refund policy (30-day money-back guarantee)

#### Technical Notes

- **Email:** Resend API
- **Template:** React Email template `<PurchaseReceiptEmail />`
- **Trigger:** Sent from webhook handler after enrollment created

---

### US-018: Instructor Application Form

**Epic:** EPIC-006 (Instructor Verification)
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 5

#### Story

As a **prospective instructor**, I want to apply to teach on the platform so that I can create courses.

#### Acceptance Criteria

- [ ] Application form at `/instructor/apply`
- [ ] Multi-step wizard (3 steps)
- [ ] Step 1: Personal info (name, email, phone, bio)
- [ ] Step 2: Credentials (license type, number, state, expiration, years experience, specialties)
- [ ] Step 3: Documents (upload license, insurance cert, resume, headshot)
- [ ] All fields validated
- [ ] Can save and resume later
- [ ] Submit button creates application record

#### Technical Notes

- **Frontend:** Multi-step form with state management
- **Backend:** Convex mutation creates `instructorApplications` record
- **File Upload:** Convex file storage for documents
- **Validation:** Zod schemas for all fields

---

### US-019: Instructor Application Confirmation

**Epic:** EPIC-006
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 2

#### Story

As a **prospective instructor**, I want to receive confirmation that my application was submitted so that I know it's being reviewed.

#### Acceptance Criteria

- [ ] Confirmation email sent immediately after submission
- [ ] Email includes: application received, review timeline (5-7 days), what to expect next
- [ ] Application status page shows "Pending Review"

#### Technical Notes

- **Email:** Resend with React Email template
- **Template:** `<InstructorApplicationReceivedEmail />`

---

## Sprint 3: Learning Interface (Part 1) (Weeks 5-6)

**Sprint Goal:** Students can access enrolled courses, watch videos, and navigate lessons

**Total Story Points:** 39
**Velocity Target:** 38-42 points (team velocity stabilizing)

---

### US-020: Admin Instructor Application Queue

**Epic:** EPIC-006
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 5

#### Story

As an **admin**, I want to see all pending instructor applications so that I can review and approve/reject them.

#### Acceptance Criteria

- [ ] Admin dashboard at `/admin/applications`
- [ ] Table showing: applicant name, submitted date, status
- [ ] Can filter by status (pending, approved, rejected)
- [ ] Clicking row opens application detail view
- [ ] Shows count of pending applications

#### Technical Notes

- **Frontend:** Admin dashboard page (requires `isAdmin: true`)
- **Backend:** Convex query `api.instructorApplications.list`
- **Access Control:** Middleware checks `isAdmin` before rendering

---

### US-021: Admin Application Detail & Review

**Epic:** EPIC-006
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 8

#### Story

As an **admin**, I want to review instructor application details and uploaded documents so that I can verify credentials.

#### Acceptance Criteria

- [ ] Application detail page shows all submitted info
- [ ] Can view/download uploaded documents (license, insurance, resume, headshot)
- [ ] Verification checklist:
  - [ ] License verified (checkbox + notes field)
  - [ ] Insurance verified (checkbox + notes field)
  - [ ] Experience verified (checkbox + notes field)
- [ ] "Approve" button (requires all checkboxes checked)
- [ ] "Reject" button with reason dropdown + notes
- [ ] Actions create audit log

#### Technical Notes

- **Frontend:** Application detail page `/admin/applications/[id]`
- **Backend:** Convex mutations for approve/reject
- **File Download:** Convex file URL generation

---

### US-022: Instructor Approval Email & Onboarding

**Epic:** EPIC-006
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 3

#### Story

As an **approved instructor**, I want to receive approval notification and onboarding steps so that I can start creating courses.

#### Acceptance Criteria

- [ ] Approval email sent immediately after admin approves
- [ ] Email includes: congratulations message, next steps (Stripe Connect onboarding), link to instructor dashboard
- [ ] User's `isInstructor` field set to `true`
- [ ] Can access instructor dashboard

#### Technical Notes

- **Email:** Resend template `<InstructorApprovedEmail />`
- **Backend:** Convex mutation updates users.isInstructor to true
- **Link:** Email includes link to `/instructor/dashboard`

---

### US-023: Course Learning Page Layout

**Epic:** EPIC-004 (Course Learning)
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 5

#### Story

As a **student**, I want a clean learning interface so that I can focus on course content without distractions.

#### Acceptance Criteria

- [ ] Learning page at `/courses/[id]/learn`
- [ ] Layout: Sidebar (left) + Main content (right)
- [ ] Sidebar shows: course progress bar, module/lesson navigation
- [ ] Main content shows: video player, lesson title, description, "Mark Complete" button
- [ ] Mobile: Sidebar collapses to menu, main content full width
- [ ] Only accessible if user enrolled in course

#### Technical Notes

- **Frontend:** Protected route with enrollment check
- **Layout:** Flex layout or CSS Grid
- **Access Control:** Convex query checks enrollment before returning lesson data

---

### US-024: Video Player Integration

**Epic:** EPIC-004
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 5

#### Story

As a **student**, I want to watch course videos smoothly so that I can learn effectively.

#### Acceptance Criteria

- [ ] Video player embedded (Vimeo or Cloudflare iframe)
- [ ] Adaptive quality based on connection speed
- [ ] Player controls: play/pause, seek, volume, fullscreen, playback speed
- [ ] Video buffering < 2 seconds
- [ ] Remembers playback position (resume where left off in video)
- [ ] Works on mobile devices

#### Technical Notes

- **Video:** Vimeo Business iframe or Cloudflare Stream
- **Component:** `<VideoPlayer videoId={lesson.videoId} />`
- **Player SDK:** Vimeo Player API for advanced controls

---

### US-025: Module & Lesson Navigation

**Epic:** EPIC-004
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 5

#### Story

As a **student**, I want to navigate between lessons easily so that I can control my learning pace.

#### Acceptance Criteria

- [ ] Sidebar shows all modules (collapsible)
- [ ] Lessons listed under each module
- [ ] Current lesson highlighted
- [ ] Completed lessons have checkmark icon
- [ ] Locked lessons have lock icon (if sequential release enabled)
- [ ] Clicking lesson navigates to that lesson
- [ ] "Previous" and "Next" buttons in main content area

#### Technical Notes

- **Frontend:** Navigation component with expand/collapse state
- **Backend:** Convex query returns course structure + progress
- **Icons:** Checkmark for complete, lock for locked, play for current

---

### US-026: Mark Lesson as Complete

**Epic:** EPIC-004
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 3

#### Story

As a **student**, I want to mark lessons as complete so that I can track my progress.

#### Acceptance Criteria

- [ ] "Mark as Complete" button below video
- [ ] Clicking button updates progress in database
- [ ] Lesson shows checkmark in sidebar immediately (optimistic UI)
- [ ] Progress bar updates to reflect new completion %
- [ ] Can unmark as complete (toggle button)
- [ ] "Next Lesson" button appears after marking complete

#### Technical Notes

- **Backend:** Convex mutation `api.lessonProgress.markComplete`
- **Optimistic UI:** Update UI immediately, rollback if mutation fails
- **Database:** LessonProgress table with userId, lessonId, completedAt

---

### US-027: Progress Tracking (Overall Course %)

**Epic:** EPIC-004
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 3

#### Story

As a **student**, I want to see my overall course progress so that I know how much I've completed.

#### Acceptance Criteria

- [ ] Progress bar at top of sidebar
- [ ] Shows percentage complete (e.g., "45% complete")
- [ ] Updates in real-time when lesson marked complete
- [ ] Calculation: (completed lessons / total lessons) × 100

#### Technical Notes

- **Backend:** Convex query calculates progress
- **Formula:** Count lessons with lessonProgress record / total lessons
- **Caching:** Cache progress calculation (updates on lesson completion)

---

### US-028: Resume Where Left Off

**Epic:** EPIC-004
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 2

#### Story

As a **student**, I want to resume the course where I left off so that I don't have to remember which lesson I was on.

#### Acceptance Criteria

- [ ] When accessing `/courses/[id]/learn`, navigates to last incomplete lesson
- [ ] If all lessons complete, shows first lesson
- [ ] "Continue Learning" button on student dashboard navigates to correct lesson

#### Technical Notes

- **Backend:** Convex query finds first incomplete lesson
- **Logic:** Filter lessons by completed status, return first incomplete
- **Edge Case:** If 100% complete, show final lesson or completion screen

---

## Sprint 4: Quizzes & Certificates (Weeks 7-8)

**Sprint Goal:** Students can take quizzes, pass assessments, and earn certificates

**Total Story Points:** 40
**Velocity Target:** 38-42 points

---

### US-029: Quiz Interface (Multiple Choice)

**Epic:** EPIC-004
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 8

#### Story

As a **student**, I want to take quizzes to test my knowledge so that I can reinforce what I learned.

#### Acceptance Criteria

- [ ] Quiz accessed from sidebar (after module completion)
- [ ] Quiz shows questions one at a time (or all at once - configurable)
- [ ] Each question has 4 answer choices (radio buttons)
- [ ] Must select answer before submitting
- [ ] "Submit Quiz" button at end
- [ ] Progress indicator (Question 3 of 10)

#### Technical Notes

- **Frontend:** Quiz component with form state management
- **Backend:** Convex query `api.quizzes.get` returns questions
- **Database:** QuizQuestions table with question text, options, correctAnswer

---

### US-030: Quiz Grading & Feedback

**Epic:** EPIC-004
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 5

#### Story

As a **student**, I want to see my quiz results immediately so that I know what I got right/wrong and can improve.

#### Acceptance Criteria

- [ ] After submitting quiz, shows results page
- [ ] Displays: score (e.g., 8/10, 80%), pass/fail status (passing = 80%+)
- [ ] For each question, shows:
  - Question text
  - Student's answer (highlighted in red if wrong, green if correct)
  - Correct answer (if student got it wrong)
- [ ] "Retake Quiz" button if failed
- [ ] "Continue to Next Module" button if passed

#### Technical Notes

- **Backend:** Convex mutation `api.quizzes.submit` grades quiz
- **Grading Logic:** Compare submitted answers to correctAnswer in database
- **Database:** QuizAttempts table stores score, passed, answers

---

### US-031: Quiz Retry Logic

**Epic:** EPIC-004
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 2

#### Story

As a **student**, I want to retake a quiz if I failed so that I can pass and continue the course.

#### Acceptance Criteria

- [ ] Can retake quiz unlimited times
- [ ] Each attempt recorded in database
- [ ] Shows best score across all attempts
- [ ] Quiz questions randomized order on each attempt (future enhancement)

#### Technical Notes

- **Backend:** QuizAttempts table stores all attempts
- **Logic:** Query for best score with `max(score)`

---

### US-032: Course Completion Detection

**Epic:** EPIC-005 (Certificates)
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 3

#### Story

As the **system**, I want to detect when a student completes a course so that I can generate certificates.

#### Acceptance Criteria

- [ ] Completion detected when:
  - All lessons marked complete (100%)
  - All quizzes passed (80%+)
  - Final exam passed (if course has final exam)
- [ ] Completion triggers certificate generation
- [ ] Completion date recorded

#### Technical Notes

- **Backend:** Convex mutation checks completion criteria
- **Trigger:** Called after marking last lesson complete or passing final exam
- **Database:** Update enrollments.completedAt

---

### US-033: Completion Certificate Generation

**Epic:** EPIC-005
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 5

#### Story

As a **student**, I want to receive a completion certificate so that I can prove I finished the course.

#### Acceptance Criteria

- [ ] Certificate generated automatically on course completion
- [ ] Certificate includes:
  - Student name
  - Course title
  - Completion date
  - Unique certificate ID (for verification)
  - Doctrina LMS logo/signature
- [ ] Certificate downloadable as PDF
- [ ] Professional design and formatting

#### Technical Notes

- **PDF Generation:** jsPDF or Puppeteer
- **Template:** Certificate design with placeholders
- **Storage:** Convex file storage
- **Database:** Certificates table with uniqueId, userId, courseId, issuedAt

---

### US-034: CE Certificate Generation (If Applicable)

**Epic:** EPIC-005
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 5

#### Story

As a **student**, I want to receive a CE certificate so that I can use the credits for license renewal.

#### Acceptance Criteria

- [ ] CE certificate generated (in addition to completion cert) if course offers CE
- [ ] CE certificate includes:
  - All completion certificate fields
  - CE credit hours (e.g., "6.0 CE Credits")
  - Accrediting body (e.g., "ANCC Provider #P123456")
  - Instructor name and credentials
  - Statement: "This educational activity was approved by [Accrediting Body]"
- [ ] Downloadable as PDF

#### Technical Notes

- **Template:** Separate CE certificate template
- **Data:** Pull CE info from courses.ceAccreditation field
- **Validation:** Only generate if course.ceAccreditation exists

---

### US-035: Certificate Download from Dashboard

**Epic:** EPIC-005
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 2

#### Story

As a **student**, I want to download my certificates from my dashboard so that I can access them anytime.

#### Acceptance Criteria

- [ ] Certificates section on student dashboard
- [ ] Lists all earned certificates (completion + CE)
- [ ] Each certificate shows: course name, issue date, certificate type
- [ ] "Download PDF" button for each certificate
- [ ] PDF downloads immediately

#### Technical Notes

- **Frontend:** Dashboard certificates section
- **Backend:** Convex query `api.certificates.getUserCertificates`
- **Download:** Convex file URL with content-disposition: attachment

---

### US-036: Course Creation Wizard - Basic Info (Step 1)

**Epic:** EPIC-007 (Course Creation)
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 5

#### Story

As an **instructor**, I want to enter basic course information so that I can create a course listing.

#### Acceptance Criteria

- [ ] Wizard page at `/instructor/courses/create` (Step 1 of 5)
- [ ] Fields: title, short description (160 chars), long description (rich text)
- [ ] Dropdowns: category, level (Beginner/Intermediate/Advanced)
- [ ] Price input (min $50, max $5000)
- [ ] Thumbnail image upload (16:9 ratio, max 2MB)
- [ ] "Save & Continue" button advances to Step 2
- [ ] Data saved as draft

#### Technical Notes

- **Frontend:** Multi-step form with state management
- **Rich Text:** Tiptap or Quill editor for long description
- **Backend:** Convex mutation `api.courses.create` with status: "draft"
- **Validation:** Zod schema for all fields

---

## Sprint 5: Course Creation Wizard (Part 2) (Weeks 9-10)

**Sprint Goal:** Instructors can create courses with curriculum, quizzes, and settings

**Total Story Points:** 41
**Velocity Target:** 40-44 points

---

### US-037: Course Creation Wizard - Curriculum (Step 2)

**Epic:** EPIC-007
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 13

#### Story

As an **instructor**, I want to organize my course into modules and lessons so that students have a structured learning path.

#### Acceptance Criteria

- [ ] Can create modules (title, description)
- [ ] Can add lessons to modules (title, description, video upload)
- [ ] Drag-and-drop to reorder modules
- [ ] Drag-and-drop to reorder lessons within module
- [ ] Can delete modules/lessons
- [ ] Video upload with progress bar
- [ ] Video transcoding status indicator
- [ ] "Save & Continue" advances to Step 3

#### Technical Notes

- **Frontend:** Drag-drop library (dnd-kit or react-beautiful-dnd)
- **Video Upload:** Direct upload to Vimeo or Cloudflare
- **Upload UI:** Progress bar, cancel button, retry on failure
- **Backend:** Convex mutations create CourseModules and Lessons records
- **File Size:** Enforce max 5GB per video

---

### US-038: Video Upload with Progress Tracking

**Epic:** EPIC-007
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 8

#### Story

As an **instructor**, I want to see upload progress when uploading videos so that I know the upload is working.

#### Acceptance Criteria

- [ ] Upload button for each lesson
- [ ] File picker accepts .mp4, .mov, .avi (max 5GB)
- [ ] Upload progress bar shows % complete
- [ ] Estimated time remaining displayed
- [ ] Can cancel upload
- [ ] Success message when upload complete
- [ ] Error message if upload fails (with retry button)
- [ ] Transcoding status: "Processing..." → "Ready"

#### Technical Notes

- **Upload:** Chunked upload for large files (resumable upload)
- **API:** Vimeo upload API or Cloudflare Stream direct upload
- **Progress:** XMLHttpRequest or fetch with progress events
- **Retry Logic:** Retry failed chunks up to 3 times

---

### US-039: Course Creation Wizard - Quizzes (Step 3)

**Epic:** EPIC-007
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 8

#### Story

As an **instructor**, I want to create quizzes for my course so that students can test their knowledge.

#### Acceptance Criteria

- [ ] Can create module quizzes (one per module)
- [ ] Can create final exam (one per course)
- [ ] Quiz form: title, passing score % (default 80%)
- [ ] Can add questions (question text, 4 answer options, correct answer)
- [ ] Can reorder questions (drag-drop)
- [ ] Can delete questions
- [ ] Minimum 5 questions per quiz
- [ ] "Save & Continue" advances to Step 4

#### Technical Notes

- **Frontend:** Quiz builder component
- **Backend:** Convex mutations create QuizQuestions records
- **Validation:** At least 1 module quiz + 1 final exam required

---

### US-040: Course Creation Wizard - Settings (Step 4)

**Epic:** EPIC-007
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 3

#### Story

As an **instructor**, I want to configure course settings so that students have clear expectations.

#### Acceptance Criteria

- [ ] Learning objectives (list of bullet points)
- [ ] Prerequisites (text field)
- [ ] Requirements (text field)
- [ ] Select preview lessons (checkboxes on lessons)
- [ ] Enable discussion forum (checkbox)
- [ ] "Save & Continue" advances to Step 5

#### Technical Notes

- **Frontend:** Form with text inputs and checkboxes
- **Backend:** Convex mutation updates course record

---

### US-041: Course Creation Wizard - Review & Publish (Step 5)

**Epic:** EPIC-007
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 5

#### Story

As an **instructor**, I want to preview my course before publishing so that I can ensure everything looks correct.

#### Acceptance Criteria

- [ ] Review page shows course preview (as students would see it)
- [ ] Can navigate back to any previous step to make edits
- [ ] "Submit for Review" button (if first course or flagged instructor)
- [ ] "Publish Now" button (if trusted instructor)
- [ ] Published courses appear in catalog immediately
- [ ] Submitted courses go to admin review queue

#### Technical Notes

- **Backend:** Convex mutation updates course.status to "published" or "pending_review"
- **Email:** Notification email to instructor on publish
- **Catalog:** Real-time update (published courses queryable immediately)

---

### US-042: Instructor Dashboard - Overview

**Epic:** EPIC-008 (Instructor Dashboard)
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 5

#### Story

As an **instructor**, I want to see an overview of my performance so that I can track my success on the platform.

#### Acceptance Criteria

- [ ] Dashboard at `/instructor/dashboard`
- [ ] Overview cards showing:
  - Total students (all courses)
  - Total revenue (lifetime)
  - Pending payout balance
  - Average course rating
- [ ] "Create New Course" button
- [ ] Mobile responsive

#### Technical Notes

- **Backend:** Convex queries aggregate enrollments, purchases, reviews
- **Real-Time:** Updates when student enrolls or purchases

---

### US-043: Instructor Dashboard - My Courses List

**Epic:** EPIC-008
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 3

#### Story

As an **instructor**, I want to see all my courses with key metrics so that I can manage them effectively.

#### Acceptance Criteria

- [ ] Table/grid showing all instructor's courses
- [ ] Each course shows: thumbnail, title, students enrolled, revenue, rating, status (published/draft)
- [ ] Click course name to edit
- [ ] "View Analytics" link to course analytics page
- [ ] Can delete draft courses

#### Technical Notes

- **Backend:** Convex query filters courses by instructorId
- **Table:** Sortable by students, revenue, rating

---

### US-044: Student Dashboard - My Courses

**Epic:** EPIC-009 (Student Dashboard)
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 3

#### Story

As a **student**, I want to see all my enrolled courses so that I can continue learning.

#### Acceptance Criteria

- [ ] Dashboard at `/dashboard`
- [ ] "My Courses" section shows all enrolled courses
- [ ] Each course shows: thumbnail, title, instructor, progress %, "Continue Learning" button
- [ ] Clicking "Continue Learning" navigates to last incomplete lesson
- [ ] Mobile responsive

#### Technical Notes

- **Backend:** Convex query `api.enrollments.getUserEnrollments`
- **Progress:** Join with lessonProgress to calculate %

---

## Sprint 6: Payouts, Reviews, Final Polish (Weeks 11-12)

**Sprint Goal:** MVP feature complete, ready for soft launch

**Total Story Points:** 42
**Velocity Target:** 40-44 points

---

### US-045: Instructor Dashboard - Course Analytics

**Epic:** EPIC-008
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 8

#### Story

As an **instructor**, I want to see detailed course analytics so that I can understand student behavior and improve my course.

#### Acceptance Criteria

- [ ] Analytics page at `/instructor/courses/[id]/analytics`
- [ ] Enrollment trend chart (line chart, 30-day)
- [ ] Completion rate (students who completed / total enrolled)
- [ ] Average quiz scores
- [ ] Lesson drop-off chart (where students stop watching)
- [ ] Student reviews summary

#### Technical Notes

- **Charts:** Recharts or Chart.js
- **Backend:** Convex aggregation queries
- **Performance:** Cache analytics data (update hourly)

---

### US-046: Instructor Dashboard - Earnings

**Epic:** EPIC-008
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 5

#### Story

As an **instructor**, I want to see my earnings and request payouts so that I can receive income from my courses.

#### Acceptance Criteria

- [ ] Earnings page at `/instructor/earnings`
- [ ] Revenue chart (30-day, 90-day, lifetime)
- [ ] Pending payout balance (revenue - commission - fees - paid out)
- [ ] Payout history table (date, amount, status)
- [ ] "Request Payout" button (enabled if balance > $50)

#### Technical Notes

- **Backend:** Convex queries for purchases, payouts
- **Calculation:** Sum(purchases.amount) - commission - fees - Sum(payouts.amount)

---

### US-047: Stripe Connect Onboarding

**Epic:** EPIC-010 (Instructor Payouts)
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 8

#### Story

As an **instructor**, I want to connect my bank account so that I can receive payouts.

#### Acceptance Criteria

- [ ] "Connect Stripe" button on earnings page
- [ ] Clicking button creates Stripe Connect Express account
- [ ] Redirects to Stripe onboarding flow
- [ ] Stripe collects: personal info, tax ID, bank account
- [ ] Stripe Identity verification (ID upload + selfie)
- [ ] After completion, redirects back to dashboard
- [ ] "Connected" badge shows on earnings page

#### Technical Notes

- **API:** Stripe Connect Express accounts
- **Create Account:** `stripe.accounts.create({ type: 'express' })`
- **Account Link:** `stripe.accountLinks.create()` for onboarding
- **Webhook:** `account.updated` to track onboarding completion

---

### US-048: Payout Request & Processing

**Epic:** EPIC-010
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 8

#### Story

As an **instructor**, I want to request a payout so that I can receive my earnings.

#### Acceptance Criteria

- [ ] "Request Payout" button creates payout request
- [ ] Payout request status: "pending" (admin approval required)
- [ ] Admin reviews payout request in admin dashboard
- [ ] Admin can approve or deny
- [ ] Approved payout transfers via Stripe Connect
- [ ] Transfer completed within 1-2 business days
- [ ] Email notification on payout completion
- [ ] Payout history updates with new payout

#### Technical Notes

- **Backend:** Convex mutation creates Payouts record
- **Admin Approval:** Prevents fraud, checks for refunds
- **Stripe Transfer:** `stripe.transfers.create()` to instructor Connect account
- **Hold Period:** 30 days for new instructors, 7 days for trusted

---

### US-049: Course Reviews - Submit Review

**Epic:** EPIC-011 (Course Reviews)
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 3

#### Story

As a **student**, I want to leave a review after completing a course so that I can help other students make informed decisions.

#### Acceptance Criteria

- [ ] Review prompt appears after course completion
- [ ] Review form: star rating (1-5), written review (optional, 50-500 chars)
- [ ] Submit button creates review record
- [ ] Review appears on course detail page immediately
- [ ] Can only review each course once
- [ ] Can edit review later

#### Technical Notes

- **Backend:** Convex mutation `api.courseReviews.create`
- **Database:** CourseReviews table
- **Validation:** Check enrollment exists, one review per user per course

---

### US-050: Course Reviews - Display on Course Page

**Epic:** EPIC-011
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 3

#### Story

As a **student**, I want to read reviews before purchasing a course so that I can assess course quality.

#### Acceptance Criteria

- [ ] Reviews section on course detail page
- [ ] Shows average rating (stars + number)
- [ ] Shows total review count
- [ ] Lists individual reviews (most recent first)
- [ ] Each review shows: star rating, written review, reviewer name, date
- [ ] Pagination or "Load More" if >20 reviews

#### Technical Notes

- **Backend:** Convex query `api.courseReviews.getCourseReviews`
- **Average Rating:** Calculate on-the-fly or cached in courses table
- **Sorting:** Order by createdAt DESC

---

### US-051: Admin Review Moderation

**Epic:** EPIC-011
**Status:** 🔴 To Do
**Priority:** P0 - Critical
**Story Points:** 2

#### Story

As an **admin**, I want to moderate reviews so that I can hide inappropriate content.

#### Acceptance Criteria

- [ ] Admin reviews page at `/admin/reviews`
- [ ] Shows all reviews with flag count
- [ ] Can hide review (removes from public display)
- [ ] Can delete review permanently
- [ ] Hidden reviews visible only to admin

#### Technical Notes

- **Backend:** Convex mutation updates courseReviews.hidden to true
- **Query:** Public query filters out hidden reviews

---

### US-052: Pre-Launch Testing & Bug Fixes

**Priority:** P0 - Critical
**Story Points:** 8

#### Story

As the **team**, we want to test all features end-to-end so that we launch with minimal bugs.

#### Acceptance Criteria

- [ ] All user journeys tested (student, instructor, admin)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile testing (iOS Safari, Android Chrome)
- [ ] Performance testing (Lighthouse scores >90)
- [ ] Security review (no exposed secrets, proper auth checks)
- [ ] Critical bugs fixed

#### Technical Notes

- **Testing:** Manual testing + automated E2E tests (Playwright)
- **Browsers:** BrowserStack for cross-browser testing
- **Performance:** Lighthouse CI in GitHub Actions

---

### US-053: Email Templates & Notifications

**Priority:** P0 - Critical
**Story Points:** 3

#### Story

As the **team**, we want all email notifications designed and tested so that users receive clear, professional communications.

#### Acceptance Criteria

- [ ] All email templates created (see list below)
- [ ] Templates tested in major email clients (Gmail, Outlook, Apple Mail)
- [ ] Unsubscribe links functional
- [ ] From address: noreply@doctrina-lms.com
- [ ] Reply-to: support@doctrina-lms.com

**Email Templates:**

1. Welcome email (student/instructor)
2. Email verification
3. Password reset
4. Course purchase receipt
5. Course completion congratulations
6. Instructor application received
7. Instructor application approved
8. Instructor application rejected
9. New student enrolled (to instructor)
10. Payout processed

---

## Post-MVP Backlog (Sprints 7+)

### US-054: Discussion Forums (Per Course)

**Epic:** EPIC-012
**Priority:** P1 - Post-MVP
**Story Points:** 13

_Detailed story deferred to post-MVP planning_

---

### US-055: CE Credit Submission & Verification

**Epic:** EPIC-013
**Priority:** P1 - Post-MVP
**Story Points:** 13

_Detailed story deferred to post-MVP planning_

---

### US-056: Refund Request Workflow

**Epic:** EPIC-014
**Priority:** P1 - Post-MVP
**Story Points:** 8

_Detailed story deferred to post-MVP planning_

---

### US-057: Course Recommendations

**Epic:** EPIC-015
**Priority:** P1 - Post-MVP
**Story Points:** 13

_Detailed story deferred to post-MVP planning_

---

## Backlog Metrics

### MVP Sprint Summary

| Sprint    | Weeks        | Story Points   | Key Deliverables                                   |
| --------- | ------------ | -------------- | -------------------------------------------------- |
| Sprint 1  | 1-2          | 34             | Auth, Course catalog                               |
| Sprint 2  | 3-4          | 42             | Course detail, Purchase, Instructor application    |
| Sprint 3  | 5-6          | 39             | Learning interface, Video playback, Admin review   |
| Sprint 4  | 7-8          | 40             | Quizzes, Certificates, Course creation (Steps 1-2) |
| Sprint 5  | 9-10         | 41             | Course creation (Steps 3-5), Dashboards            |
| Sprint 6  | 11-12        | 42             | Payouts, Reviews, Polish                           |
| **Total** | **12 weeks** | **238 points** | **MVP Complete**                                   |

### Team Velocity Assumptions

- **Team Size:** 2-3 developers
- **Sprint Length:** 2 weeks
- **Expected Velocity:** 38-42 points per sprint
- **Buffer:** 10% for unknowns and bugs

---

**Document Status:** ✅ Complete - Ready for Sprint Planning
**Next Steps:** Begin Sprint 1 development, refine stories as needed during sprint planning meetings
