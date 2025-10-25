# Mock Data Replacement Guide

## Doctrina LMS2 - Replace Hardcoded Data with Convex Queries

**Version:** 1.0
**Last Updated:** January 2025
**Status:** Work In Progress

---

## Overview

The UI was built with v0 using mock/hardcoded data for rapid prototyping. Now that Convex backend functions are being implemented, we need to systematically replace all mock data with real Convex queries.

### Current State

- **Files with mock data:** 8
- **Files using real Convex:** ~95% (most services already using Convex)
- **Impact:** Mock data prevents platform from functioning with real users

---

## Mock Data Inventory

### 🔴 HIGH PRIORITY - Blocks Core Functionality

#### 1. `/lib/course-migration.ts`

**Lines:** 5-144
**Mock Data:** Complete course object with curriculum, reviews, instructor
**Impact:** Course detail page (`/courses/[id]`) uses this instead of real data
**Depends On:** ✅ `courses.getWithCurriculum()` - Already implemented
**Effort:** 3 story points

**Current Code:**

```typescript
const mockCourseData = {
	// ... extensive hardcoded course object
};

export const useCourseData = (courseId: string) => {
	return mockCourseData; // Returns mock regardless of courseId
};
```

**Replace With:**

```typescript
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

export const useCourseData = (courseId: Id<'courses'>) => {
	return useQuery(api.courses.getWithCurriculum, { courseId });
};
```

**Files Affected:**

- `/app/courses/[id]/page.tsx` - Course detail page

**Acceptance Criteria:**

- [ ] Remove `mockCourseData` object
- [ ] Replace with `useQuery(api.courses.getWithCurriculum)`
- [ ] Course detail page shows real course data
- [ ] Curriculum displays real modules and lessons
- [ ] Instructor info shows real instructor from database

---

#### 2. `/app/dashboard/progress/page.tsx`

**Lines:** 19-123
**Mock Data:** Extensive progress tracking data (enrolled courses, activities, goals, skills)
**Impact:** Student progress dashboard non-functional
**Depends On:**

- ✅ `enrollments.getMyEnrollments()` - Already implemented
- ❌ `lessonProgress.getUserProgress()` - Sprint 2
- ❌ Activities tracking - Not yet implemented
- ❌ Learning goals - Not yet implemented

**Effort:** 8 story points (includes implementing missing queries)

**Current Mock Data:**

```typescript
const mockData = {
	overallProgress: 68,
	enrolledCourses: [
		{
			id: '1',
			title: 'Advanced Botox Techniques',
			progress: 75,
			lastAccessed: '2024-01-15',
			nextLesson: 'Module 3: Safety Protocols',
		},
		// ... 3 more courses
	],
	recentActivity: [
		/* 4 activities */
	],
	learningGoals: [
		/* 3 goals */
	],
	skills: [
		/* 5 skills */
	],
	// ... more mock data
};
```

**Replace With:**

```typescript
// Get enrolled courses with progress
const enrollments = useQuery(api.enrollments.getMyEnrollments);

// Get user progress for each course
const progressData = enrollments?.map(enrollment => {
	const progress = useQuery(api.lessonProgress.getUserProgress, {
		courseId: enrollment.courseId,
	});
	return { enrollment, progress };
});

// Activities, goals, skills need new tables/queries (Sprint 3+)
```

**Files Affected:**

- `/app/dashboard/progress/page.tsx` - Progress dashboard

**Acceptance Criteria:**

- [ ] Enrolled courses from real Convex data
- [ ] Progress percentages from lessonProgress
- [ ] Recent activity from real activity log (if implemented)
- [ ] Learning goals from goals table (if implemented)
- [ ] Remove all mockData object

---

#### 3. `/app/courses/[id]/learn/page.tsx`

**Lines:** 20-85
**Mock Data:** Course learning data with lessons
**Impact:** Learning page shows hardcoded course regardless of URL
**Depends On:** ✅ `courses.getWithCurriculum()` + `lessons.get()` - Already implemented
**Effort:** 3 story points

**Current Code:**

```typescript
const courseData = {
	id: '1',
	title: 'Advanced Botox Techniques',
	lessons: [
		{
			id: '1',
			title: 'Introduction to Botox',
			duration: '15:00',
			completed: true,
		},
		// ... 5 more lessons
	],
	progress: 100,
};
```

**Replace With:**

```typescript
const course = useQuery(api.courses.getWithCurriculum, {
	courseId: params.id as Id<'courses'>,
});

const progress = useQuery(api.lessonProgress.getUserProgress, {
	courseId: params.id as Id<'courses'>,
});

const currentLesson = useQuery(api.lessons.get, {
	lessonId: currentLessonId,
});
```

**Acceptance Criteria:**

- [ ] Course loads from real database
- [ ] Lessons display from real curriculum
- [ ] Progress accurate based on completed lessons
- [ ] Video player shows real lesson video

---

#### 4. `/app/community/page.tsx`

**Lines:** 21-102
**Mock Data:** Discussion topics, study groups, leaderboard
**Impact:** Community features non-functional
**Depends On:** ❌ `discussions` table and functions - Not implemented
**Effort:** 21 story points (includes implementing discussion system)

**Current Mock Data:**

```typescript
const discussionTopics = [
	{
		id: '1',
		title: 'Best practices for Botox...',
		author: 'Dr. Sarah Johnson',
		replies: 23,
		views: 145,
		lastActivity: '2 hours ago',
		tags: ['botox', 'best-practices'],
	},
	// ... 3 more topics
];

const studyGroups = [
	{
		id: '1',
		name: 'Aesthetic Injectors Network',
		members: 156,
		description: '...',
		category: 'Injectables',
	},
	// ... 2 more groups
];
```

**Replace With:** (After implementing discussions)

```typescript
const discussions = useQuery(api.discussions.list, {
	category: selectedCategory,
	limit: 20,
});

const studyGroups = useQuery(api.studyGroups.list);
```

**Acceptance Criteria:**

- [ ] Implement discussions backend first (EPIC-106)
- [ ] Replace hardcoded topics with real discussions
- [ ] Study groups from database
- [ ] Leaderboard from real user activity

**Note:** This is P2 priority - defer to post-MVP

---

### 🟡 MEDIUM PRIORITY - Affects UX but Not Blocking

#### 5. `/app/checkout/[courseId]/page.tsx`

**Lines:** 27-55
**Mock Data:** 3 courses with prices for checkout demo
**Impact:** Shows wrong course info on checkout page
**Depends On:** ✅ `courses.get()` - Already implemented
**Effort:** 2 story points

**Replace With:**

```typescript
const course = useQuery(api.courses.get, {
	id: params.courseId as Id<'courses'>,
});
```

---

#### 6. `/app/instructor/dashboard/page.tsx`

**Lines:** 282-419
**Mock Data:** 3 hardcoded instructor courses (fallback when Convex returns null)
**Impact:** Instructor sees fake courses if they have no real courses
**Depends On:** ✅ `courses.list({ instructorId })` - Already implemented
**Effort:** 2 story points

**Current Code:**

```typescript
{!courses || courses.length === 0 ? (
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    {/* 3 hardcoded course cards */}
  </div>
) : (
  // Real courses
)}
```

**Replace With:**

```typescript
{!courses || courses.length === 0 ? (
  <div className="text-center py-12">
    <p className="text-muted-foreground">No courses yet.</p>
    <Button href="/instructor/courses/wizard">Create Your First Course</Button>
  </div>
) : (
  // Real courses
)}
```

---

#### 7. `/app/dashboard/page.tsx`

**Lines:** 429-446
**Mock Data:** Certificate names and issue dates
**Impact:** Shows placeholder certificates
**Depends On:** ✅ `certificates.listForUser()` - Already implemented
**Effort:** 2 story points

**Current Code:**

```typescript
<div className="space-y-2">
  {['Basic Injection Techniques', 'Medical Aesthetics Fundamentals'].map((cert, i) => (
    // Hardcoded certificate cards
  ))}
</div>
```

**Replace With:**

```typescript
const certificates = useQuery(api.certificates.listForUser, {
  userId: user.id
});

<div className="space-y-2">
  {certificates?.map((cert) => (
    <CertificateCard key={cert._id} certificate={cert} />
  ))}
</div>
```

---

#### 8. `/app/profile/page.tsx`

**Lines:** 36-104, 115, 524-575
**Mock Data:** Certifications, activities, achievements, enrolled courses
**Impact:** Profile page shows static data
**Depends On:**

- ✅ `certificates.listForUser()` - Already implemented
- ✅ `enrollments.getMyEnrollments()` - Already implemented
- ❌ User activities - Need to implement
- ❌ Achievements - Need to implement (or remove feature)

**Effort:** 5 story points

---

## Replacement Epic

### EPIC-109: Replace Mock Data with Real Convex Queries

**Status:** 🔴 Not Started
**Priority:** P0 - CRITICAL
**Effort:** 25 story points total
**Target Sprint:** Sprint 2-3

#### Phase 1: Quick Wins (Sprint 2) - 10 pts

Replace mock data where Convex queries already exist:

1. ✅ **Course Detail Page** - Use `courses.getWithCurriculum()`
   - File: `/lib/course-migration.ts`
   - Effort: 3 pts

2. ✅ **Checkout Page** - Use `courses.get()`
   - File: `/app/checkout/[courseId]/page.tsx`
   - Effort: 2 pts

3. ✅ **Instructor Dashboard** - Remove mock course fallback
   - File: `/app/instructor/dashboard/page.tsx`
   - Effort: 2 pts

4. ✅ **Dashboard Certificates** - Use `certificates.listForUser()`
   - File: `/app/dashboard/page.tsx`
   - Effort: 2 pts

5. ✅ **Profile Enrolled Courses** - Use `enrollments.getMyEnrollments()`
   - File: `/app/profile/page.tsx`
   - Effort: 1 pt

#### Phase 2: After Progress Tracking (Sprint 2-3) - 11 pts

Replace mock data that requires new backend functions:

6. **Learning Page** - Use real course + progress
   - File: `/app/courses/[id]/learn/page.tsx`
   - Depends: `lessonProgress.getUserProgress()`
   - Effort: 3 pts

7. **Progress Dashboard** - Use real enrollments + progress
   - File: `/app/dashboard/progress/page.tsx`
   - Depends: `lessonProgress`, `enrollments`
   - Effort: 8 pts

#### Phase 3: Post-MVP (Sprint 5+) - 4 pts

Features that require new backend systems:

8. **Community Page** - Implement discussions backend first
   - File: `/app/community/page.tsx`
   - Depends: EPIC-106 (Discussions)
   - Effort: 21 pts (includes backend)

9. **Profile Activities/Achievements** - Decide if keeping these features
   - File: `/app/profile/page.tsx`
   - Depends: New tables (userActivities, achievements)
   - Effort: 8 pts (if implementing)
   - **OR** Remove these sections entirely (0 pts)

---

## Implementation Checklist

### Sprint 2 Quick Wins (Can Do Now)

**Course Detail Page:**

- [ ] Delete `mockCourseData` object from `/lib/course-migration.ts`
- [ ] Update `useCourseData()` to call `api.courses.getWithCurriculum`
- [ ] Test course detail page with real course data
- [ ] Handle loading state (when query returns undefined)
- [ ] Handle error state (when course not found)

**Checkout Page:**

- [ ] Remove `coursesData` mock object from `/app/checkout/[courseId]/page.tsx`
- [ ] Replace with `useQuery(api.courses.get, { id: params.courseId })`
- [ ] Update price display to use real course.price
- [ ] Test checkout flow

**Instructor Dashboard:**

- [ ] Remove hardcoded fallback courses from `/app/instructor/dashboard/page.tsx`
- [ ] Show empty state with "Create Course" CTA when no courses
- [ ] Test instructor dashboard

**Dashboard Certificates:**

- [ ] Remove hardcoded certificate array from `/app/dashboard/page.tsx`
- [ ] Replace with `useQuery(api.certificates.listForUser, { userId })`
- [ ] Test certificate display

**Profile Enrolled Courses:**

- [ ] Remove hardcoded courses from `/app/profile/page.tsx` sidebar
- [ ] Replace with `useQuery(api.enrollments.getMyEnrollments)`
- [ ] Test profile page

**Estimated Time:** 1 day (5 small files, straightforward replacements)

---

### Sprint 2-3: After Progress Tracking Implemented

**Learning Page:**

- [ ] Remove `courseData` mock from `/app/courses/[id]/learn/page.tsx`
- [ ] Use `courses.getWithCurriculum()` for course structure
- [ ] Use `lessonProgress.getUserProgress()` for completion status
- [ ] Use `lessons.get()` for current lesson content
- [ ] Implement "Mark as Complete" button functionality
- [ ] Test learning interface end-to-end

**Progress Dashboard:**

- [ ] Remove entire `mockData` object from `/app/dashboard/progress/page.tsx`
- [ ] Use `enrollments.getMyEnrollments()` for courses
- [ ] Use `lessonProgress.getUserProgress()` for each course
- [ ] Decide on activities/goals/skills:
  - **Option A:** Implement full tracking (8+ pts)
  - **Option B:** Remove those tabs (0 pts)
- [ ] Test progress dashboard

**Estimated Time:** 2-3 days (depends on whether implementing activities/goals)

---

### Post-MVP: Community Features

**Community Page:**

- [ ] Implement EPIC-106 (Discussion Forums) first
- [ ] Replace discussion topics mock with `useQuery(api.discussions.list)`
- [ ] Replace study groups mock with real groups
- [ ] Implement leaderboard from user activity
- [ ] Test community features

**Estimated Time:** 1 week (includes backend implementation)

---

## Decision Points

### Question 1: User Activities / Achievements / Learning Goals

**Files Affected:** `/app/dashboard/progress/page.tsx`, `/app/profile/page.tsx`

The UI shows:

- Recent activity timeline (lesson completions, quiz passes, etc.)
- Learning goals tracking
- Skills proficiency radar chart
- Achievement badges

**Options:**

1. **Implement Full Feature** (13 pts)
   - Create `userActivities` table
   - Create `learningGoals` table
   - Create `achievements` table
   - Implement all CRUD functions
   - Replace mock data

2. **Simplify Feature** (3 pts)
   - Auto-generate activities from enrollments/completions (no new table)
   - Remove goals and achievements sections
   - Just show course progress

3. **Remove Feature Entirely** (1 pt)
   - Delete progress page tabs for activities/goals/skills
   - Keep only "Courses" tab with progress bars

**Recommendation:** Option 2 (Simplify) - Auto-generate activities, remove goals/achievements until post-MVP

---

### Question 2: Study Groups

**File:** `/app/community/page.tsx`

Study groups are shown but may not be MVP-critical.

**Options:**

1. **Implement Study Groups** (13 pts) - Full feature with tables and functions
2. **Remove Study Groups Section** (1 pt) - Focus on discussions only

**Recommendation:** Option 2 (Remove) - Discussions are more important for MVP

---

## Recommended Implementation Order

### Week 3-4 (Sprint 2) - Part of Progress Tracking Epic

**Priority:** HIGH (Blocks student learning flow)

1. ✅ **Course Detail Page** (`/lib/course-migration.ts`) - 3 pts
2. ✅ **Learning Page** (`/app/courses/[id]/learn/page.tsx`) - 3 pts
3. ✅ **Checkout Page** (`/app/checkout/[courseId]/page.tsx`) - 2 pts
4. ✅ **Dashboard Certificates** (`/app/dashboard/page.tsx`) - 2 pts
5. ✅ **Instructor Dashboard** (`/app/instructor/dashboard/page.tsx`) - 2 pts

**Subtotal:** 12 pts

### Week 5-6 (Sprint 3) - After Progress Functions Implemented

**Priority:** MEDIUM (Enhances UX)

6. **Progress Dashboard** (`/app/dashboard/progress/page.tsx`) - 8 pts
   - Simplify: Remove goals/achievements, keep course progress only
7. **Profile Page** (`/app/profile/page.tsx`) - 3 pts
   - Simplify: Remove achievements, keep certificates + enrolled courses

**Subtotal:** 11 pts

### Post-MVP (Sprint 5+)

**Priority:** LOW (Nice to have)

8. **Community Page** (`/app/community/page.tsx`) - 21 pts
   - Requires EPIC-106 (Discussion backend)

**Total Mock Replacement Work:** 44 story points (including backend dependencies)
**Core Mock Replacement (UI only):** 23 story points

---

## Testing Checklist

After each replacement:

- [ ] Page loads without errors
- [ ] Loading states show properly (when query undefined)
- [ ] Error states handled (when query fails)
- [ ] Real data displays correctly
- [ ] No console errors
- [ ] TypeScript types correct
- [ ] Mobile responsive still works

---

**Document Status:** ✅ Complete - Ready for Sprint Planning
**Next Action:** Add EPIC-109 (Mock Data Replacement) to EPICS.md
