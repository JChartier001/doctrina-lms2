# Doctrina LMS - Database Schema

## Overview

Doctrina LMS uses **Convex** as its database, providing real-time reactivity, ACID transactions, and automatic TypeScript type generation. The schema is defined in `convex/schema.ts` and consists of 8 core tables organized around users, courses, and platform features.

### Schema Philosophy

- **Normalization** - Minimize data duplication
- **Type Safety** - Strict TypeScript types for all fields
- **Indexing** - Optimized for common query patterns
- **Relationships** - ID references with indexes for efficient joins
- **Timestamps** - Consistent timestamp handling (Unix ms for Convex, ISO strings for display)

---

## Entity Relationship Diagram

```
┌──────────────┐
│    Users     │◄────┐
└──────────────┘     │
       │             │
       │ instructorId│
       ▼             │
┌──────────────┐     │
│   Courses    │─────┘
└──────────────┘
       │
       │ courseId
       ▼
┌──────────────┐     ┌──────────────┐
│  Resources   │     │  Purchases   │◄───┐
└──────────────┘     └──────────────┘    │
       │                    │             │
       │ resourceId    courseId           │
       ▼                    │             │
┌──────────────┐           │             │
│  Favorites   │◄──────────┘             │ userId
└──────────────┘                         │
       │                                 │
       │                          ┌──────────────┐
       │                          │Notifications │
       │                          └──────────────┘
       │                                 │
       │                                 │
       │                          ┌──────────────┐
       │                          │LiveSessions  │
       │                          └──────────────┘
       │                                 │
       │                          ┌──────────────┐
       │                          │  Session     │
       │                          │ Participants │
       │                          └──────────────┘
       │
       │                          ┌──────────────┐
       └──────────────────────────┤Certificates  │
                                  └──────────────┘
```

---

## Tables

### 1. Users

The central table for all platform users (students, instructors, admins).

**Schema:**

```typescript
{
  firstName: string,
  lastName: string,
  email: string,
  image?: string,
  isInstructor: boolean,     // Can create and teach courses
  isAdmin: boolean,          // Platform administration access
  phone?: string,
  externalId?: string,       // Clerk user ID
  lastLogin?: string,        // ISO 8601 timestamp
  createdAt?: string,        // ISO 8601 timestamp
  updatedAt?: string,        // ISO 8601 timestamp
}
```

**Indexes:**

- `by_email` - Lookup users by email address
- `by_externalId` - Link Convex users with Clerk accounts

**Relationships:**

- **One-to-Many** → Courses (as instructor)
- **One-to-Many** → Purchases
- **One-to-Many** → Favorites
- **One-to-Many** → Notifications
- **One-to-Many** → Certificates
- **Many-to-Many** → LiveSessions (via SessionParticipants)

**Common Queries:**

```typescript
// Get user by email
const user = await ctx.db
	.query('users')
	.withIndex('by_email', q => q.eq('email', 'user@example.com'))
	.first();

// Get user by Clerk ID
const user = await ctx.db
	.query('users')
	.withIndex('by_externalId', q => q.eq('externalId', clerkId))
	.first();

// Get all instructors
const instructors = await ctx.db
	.query('users')
	.filter(q => q.eq(q.field('isInstructor'), true))
	.collect();

// Get all admins
const admins = await ctx.db
	.query('users')
	.filter(q => q.eq(q.field('isAdmin'), true))
	.collect();

// Check if user is instructor
if (user.isInstructor) {
	// Allow course creation
}

// Check if user is admin
if (user.isAdmin) {
	// Allow platform administration
}

// Check if user is both (rare case)
if (user.isInstructor && user.isAdmin) {
	// Full platform access
}
```

**Validation Rules:**

- `email` must be unique
- `isInstructor` defaults to `false` (requires vetting/approval)
- `isAdmin` defaults to `false` (assigned manually by platform)
- `externalId` should be set after Clerk authentication
- Users can be both instructor AND admin (rare but allowed)

**Notes:**

- Created automatically on first Clerk login via `ensureCurrentUser` mutation
- `externalId` links to Clerk's user ID for authentication
- New users default to student (both `isInstructor` and `isAdmin` are `false`)
- Instructor status requires application and vetting process
- Admin status assigned manually by existing admins

---

### 2. Courses

Educational content created by instructors.

#### 2.1 Current Schema (Implemented)

**What exists in `convex/schema.ts` now:**

```typescript
{
  title: string,
  description: string,
  instructorId: Id<'users'>,       // Foreign key to Users
  level?: 'beginner' | 'intermediate' | 'advanced',
  duration?: string,               // e.g., "4 hours", "2 weeks"
  price?: number,                  // In cents (Stripe convention)
  thumbnailUrl?: string,           // Course cover image
  rating?: number,                 // 0-5 stars
  reviewCount?: number,
  createdAt: number,               // Unix timestamp (ms)
  updatedAt: number,               // Unix timestamp (ms)
}
```

#### 2.2 Complete Schema (Needed for Full Application)

**Based on `lib/course-migration.ts` and course wizard requirements:**

```typescript
{
  // ✅ CURRENT FIELDS (already in schema)
  title: string,
  description: string,              // Short description for listings
  instructorId: Id<'users'>,
  level?: 'beginner' | 'intermediate' | 'advanced',
  duration?: string,
  price?: number,                   // In cents
  thumbnailUrl?: string,
  rating?: number,
  reviewCount?: number,
  createdAt: number,
  updatedAt: number,

  // ⚠️ MISSING FIELDS (needed, not yet in schema)
  longDescription?: string,         // Full detailed description
  category: string,                 // e.g., 'botox', 'fillers', 'laser'
  tags: string[],                   // Searchable tags array
  visibility: 'public' | 'private' | 'draft',  // Publication status
  certificateEnabled: boolean,      // Whether completion certificate is issued
  discussionEnabled: boolean,       // Whether discussion forum enabled
  lessonCount: number,              // Total lessons (denormalized)
  studentCount: number,             // Total enrollments (denormalized)

  // Additional fields from migration file
  whatYouWillLearn?: string[],     // Learning objectives (or separate table)
  requirements?: string[],          // Prerequisites (or separate table)
}
```

#### 2.3 Missing Related Tables

To fully support the course wizard and application features, these tables need to be created:

**CourseModules** (curriculum sections):

```typescript
{
  _id: Id<'courseModules'>,
  courseId: Id<'courses'>,
  title: string,
  description?: string,
  order: number,                    // Display order
  createdAt: number,
  updatedAt: number,
}
```

**Lessons** (individual lessons within modules):

```typescript
{
  _id: Id<'lessons'>,
  moduleId: Id<'courseModules'>,
  courseId: Id<'courses'>,          // Denormalized for queries
  title: string,
  type: 'video' | 'document' | 'quiz' | 'assignment',
  content: string,                  // Video URL, document content, etc.
  duration?: number,                // Duration in minutes
  order: number,                    // Display order within module
  createdAt: number,
  updatedAt: number,
}
```

**QuizQuestions** (for quiz lessons):

```typescript
{
  _id: Id<'quizQuestions'>,
  lessonId: Id<'lessons'>,
  question: string,
  options: string[],
  correctOption: number,            // Index of correct answer
  explanation?: string,
  order: number,
}
```

**CourseReviews** (student reviews):

```typescript
{
  _id: Id<'courseReviews'>,
  courseId: Id<'courses'>,
  userId: Id<'users'>,
  userName: string,                 // Denormalized
  userImage?: string,               // Denormalized
  rating: number,                   // 1-5 stars
  content: string,                  // Review text
  createdAt: number,
}
```

**Indexes:**

- `by_instructor` - Get all courses by instructor (✅ exists)
- ⚠️ **Needed:** `by_category` - Get courses by category
- ⚠️ **Needed:** `by_visibility` - Get published/draft courses
- ⚠️ **Needed:** `by_tags` - Search courses by tags

**Relationships (Current):**

- **Many-to-One** → Users (instructor) ✅
- **One-to-Many** → Resources ✅
- **One-to-Many** → Purchases ✅
- **One-to-Many** → Certificates ✅

**Relationships (Needed):**

- **One-to-Many** → CourseModules ⚠️
- **One-to-Many** → Lessons (via modules) ⚠️
- **One-to-Many** → CourseReviews ⚠️

**Common Queries (Current Implementation):**

```typescript
// Get all courses
const courses = await ctx.db.query('courses').collect();

// Get courses by instructor
const courses = await ctx.db
	.query('courses')
	.withIndex('by_instructor', q => q.eq('instructorId', instructorId))
	.collect();

// Get course by ID
const course = await ctx.db.get(courseId);

// Get featured courses (using current schema)
const featured = await ctx.db
	.query('courses')
	.filter(q => q.gte(q.field('rating'), 4.5))
	.order('desc')
	.take(10);
```

**Queries Needed (With Complete Schema):**

```typescript
// Get published courses only
const published = await ctx.db
	.query('courses')
	.filter(q => q.eq(q.field('visibility'), 'public'))
	.collect();

// Get courses by category (needs index)
const categoryCourses = await ctx.db
	.query('courses')
	.withIndex('by_category', q => q.eq('category', 'botox'))
	.collect();

// Get course with full curriculum
const course = await ctx.db.get(courseId);
const modules = await ctx.db
	.query('courseModules')
	.withIndex('by_course', q => q.eq('courseId', courseId))
	.order('asc') // by order field
	.collect();

for (const module of modules) {
	module.lessons = await ctx.db
		.query('lessons')
		.withIndex('by_module', q => q.eq('moduleId', module._id))
		.order('asc')
		.collect();
}
```

**Validation Rules:**

- `title` required, non-empty
- `instructorId` must reference a valid user with `isInstructor=true`
- `price` if set, must be >= 0
- `rating` if set, must be 0-5
- `level` if set, must be 'beginner', 'intermediate', or 'advanced'
- `visibility` must be 'public', 'private', or 'draft' (when field added)
- `category` must be from predefined list (when field added)

**Notes:**

- `price` in cents follows Stripe's convention (e.g., 9999 = $99.99)
- `duration` is free-form text for flexibility
- Soft deletes recommended for courses with enrollments
- `rating` and `reviewCount` are denormalized from CourseReviews table
- `lessonCount` and `studentCount` are denormalized for performance

#### 2.4 Migration Priority

**Phase 1: Essential Fields (Do First)**

1. Add `visibility` field (default 'draft')
2. Add `category` field
3. Add index for `by_visibility`

**Phase 2: Course Structure (Core Functionality)**

1. Create `courseModules` table with indexes
2. Create `lessons` table with indexes
3. Create `quizQuestions` table
4. Update course wizard to save to these tables

**Phase 3: Enhanced Features**

1. Add `tags`, `longDescription`, `whatYouWillLearn`, `requirements` to courses
2. Create `courseReviews` table
3. Add denormalized counts (`lessonCount`, `studentCount`)
4. Add `certificateEnabled` and `discussionEnabled` booleans

---

### 3. Resources

Supplementary materials (PDFs, templates, guides, videos).

**Schema:**

```typescript
{
  title: string,
  description: string,
  type: string,                    // e.g., 'pdf', 'video', 'template'
  categories: string[],            // e.g., ['anatomy', 'injection-techniques']
  tags: string[],
  url: string,                     // File URL or external link
  thumbnailUrl?: string,
  author: string,
  dateAdded: string,               // ISO 8601 timestamp
  featured: boolean,
  downloadCount: number,
  favoriteCount: number,
  rating: number,                  // 0-5 stars
  reviewCount: number,
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  duration?: string,
  fileSize?: string,               // e.g., "2.5 MB"
  courseId?: Id<'courses'>,        // Optional: resource belongs to course
  restricted: boolean,             // Requires enrollment to access
}
```

**Indexes:**

- `by_course` - Get all resources for a course

**Relationships:**

- **Many-to-One** → Courses (optional)
- **One-to-Many** → Favorites

**Common Queries:**

```typescript
// Get all public resources
const resources = await ctx.db
	.query('resources')
	.filter(q => q.eq(q.field('restricted'), false))
	.collect();

// Get resources for a course
const resources = await ctx.db
	.query('resources')
	.withIndex('by_course', q => q.eq('courseId', courseId))
	.collect();

// Search by category
const resources = await ctx.db
	.query('resources')
	.filter(q => q.eq(q.field('categories'), 'anatomy'))
	.collect();

// Get featured resources
const featured = await ctx.db
	.query('resources')
	.filter(q => q.eq(q.field('featured'), true))
	.collect();
```

**Validation Rules:**

- `title` and `description` required
- `categories` and `tags` must be arrays (can be empty)
- `difficulty` must be 'beginner', 'intermediate', or 'advanced'
- `restricted=true` resources require purchase verification

**Notes:**

- Resources can exist independently or be part of a course
- `favoriteCount` and `downloadCount` are denormalized for performance
- `url` can point to Convex file storage or external services

---

### 4. Favorites

User-saved resources for quick access.

**Schema:**

```typescript
{
  userId: Id<'users'>,
  resourceId: Id<'resources'>,
  createdAt: number,               // Unix timestamp (ms)
}
```

**Indexes:**

- `by_user_resource` - Compound index for uniqueness and fast lookups

**Relationships:**

- **Many-to-One** → Users
- **Many-to-One** → Resources

**Common Queries:**

```typescript
// Get user's favorites
const favorites = await ctx.db
	.query('favorites')
	.withIndex('by_user_resource', q => q.eq('userId', userId))
	.collect();

// Check if resource is favorited
const favorite = await ctx.db
	.query('favorites')
	.withIndex('by_user_resource', q => q.eq('userId', userId).eq('resourceId', resourceId))
	.first();

// Toggle favorite
if (favorite) {
	await ctx.db.delete(favorite._id);
} else {
	await ctx.db.insert('favorites', {
		userId,
		resourceId,
		createdAt: Date.now(),
	});
}
```

**Validation Rules:**

- Compound index ensures one favorite per user-resource pair
- Both `userId` and `resourceId` must reference valid records

**Notes:**

- Simple join table for many-to-many relationship
- Consider adding `favoriteCount` cache in Resources table

---

### 5. Notifications

Platform notifications for users (course updates, messages, etc.).

**Schema:**

```typescript
{
  userId: Id<'users'>,
  title: string,
  description: string,
  type: 'course_update' | 'message' | 'announcement' | 'community' |
        'live_session' | 'certificate' | 'milestone',
  read: boolean,
  createdAt: number,               // Unix timestamp (ms)
  link?: string,                   // URL to navigate to
  metadata?: any,                  // Additional context (flexible)
}
```

**Indexes:**

- `by_user_created` - Get user's notifications sorted by time

**Relationships:**

- **Many-to-One** → Users

**Common Queries:**

```typescript
// Get user's unread notifications
const unread = await ctx.db
	.query('notifications')
	.withIndex('by_user_created', q => q.eq('userId', userId))
	.filter(q => q.eq(q.field('read'), false))
	.order('desc')
	.collect();

// Mark notification as read
await ctx.db.patch(notificationId, { read: true });

// Get recent notifications (last 30 days)
const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
const recent = await ctx.db
	.query('notifications')
	.withIndex('by_user_created', q => q.eq('userId', userId))
	.filter(q => q.gte(q.field('createdAt'), thirtyDaysAgo))
	.collect();
```

**Validation Rules:**

- `type` must be one of the defined notification types
- `read` defaults to false
- `metadata` is flexible JSON for extensibility

**Notes:**

- Consider archiving old notifications after 90 days
- `link` enables notification click navigation
- Real-time updates via Convex subscriptions

---

### 6. LiveSessions

Scheduled or live training sessions with instructors.

**Schema:**

```typescript
{
  title: string,
  description: string,
  instructorId: Id<'users'>,
  scheduledFor: number,            // Unix timestamp (ms)
  duration: number,                // Duration in minutes
  isRecorded: boolean,
  maxParticipants: number,
  status: 'scheduled' | 'live' | 'completed' | 'cancelled',
  recordingUrl?: string,
}
```

**Indexes:**

- `by_status` - Get sessions by current status
- `by_instructor` - Get instructor's sessions

**Relationships:**

- **Many-to-One** → Users (instructor)
- **Many-to-Many** → Users (participants via SessionParticipants)

**Common Queries:**

```typescript
// Get upcoming sessions
const upcoming = await ctx.db
	.query('liveSessions')
	.withIndex('by_status', q => q.eq('status', 'scheduled'))
	.filter(q => q.gte(q.field('scheduledFor'), Date.now()))
	.collect();

// Get live sessions
const live = await ctx.db
	.query('liveSessions')
	.withIndex('by_status', q => q.eq('status', 'live'))
	.collect();

// Get instructor's sessions
const sessions = await ctx.db
	.query('liveSessions')
	.withIndex('by_instructor', q => q.eq('instructorId', instructorId))
	.collect();
```

**Validation Rules:**

- `status` must be one of: scheduled, live, completed, cancelled
- `scheduledFor` must be future timestamp when status='scheduled'
- `duration` must be positive integer (minutes)
- `maxParticipants` must be positive

**Notes:**

- Status transitions: scheduled → live → completed
- `recordingUrl` populated after session completes
- Real-time status updates for participants

---

### 7. SessionParticipants

Join table for LiveSessions and Users (many-to-many).

**Schema:**

```typescript
{
  sessionId: Id<'liveSessions'>,
  userId: Id<'users'>,
  joinedAt: number,                // Unix timestamp (ms)
}
```

**Indexes:**

- `by_session` - Get all participants for a session
- `by_user` - Get all sessions a user joined

**Relationships:**

- **Many-to-One** → LiveSessions
- **Many-to-One** → Users

**Common Queries:**

```typescript
// Get session participants
const participants = await ctx.db
	.query('sessionParticipants')
	.withIndex('by_session', q => q.eq('sessionId', sessionId))
	.collect();

// Get user's joined sessions
const sessions = await ctx.db
	.query('sessionParticipants')
	.withIndex('by_user', q => q.eq('userId', userId))
	.collect();

// Check if user joined session
const joined = await ctx.db
	.query('sessionParticipants')
	.withIndex('by_session', q => q.eq('sessionId', sessionId))
	.filter(q => q.eq(q.field('userId'), userId))
	.first();
```

**Validation Rules:**

- Prevent duplicate joins (user can't join same session twice)
- Enforce `maxParticipants` limit from LiveSessions

**Notes:**

- `joinedAt` tracks when user entered the session
- Consider adding `leftAt` timestamp for session analytics

---

### 8. Certificates

Course completion certificates for students.

**Schema:**

```typescript
{
  userId: Id<'users'>,
  userName: string,                // Denormalized for certificate display
  courseId: Id<'courses'>,
  courseName: string,              // Denormalized for certificate display
  instructorId: Id<'users'>,
  instructorName: string,          // Denormalized
  issueDate: string,               // ISO 8601 timestamp
  expiryDate?: string,             // ISO 8601 timestamp (if applicable)
  verificationCode: string,        // Unique code for public verification
  templateId: string,              // Certificate design template
}
```

**Indexes:**

- `by_user` - Get user's certificates
- `by_verification` - Verify certificate by code

**Relationships:**

- **Many-to-One** → Users (student)
- **Many-to-One** → Courses
- **Many-to-One** → Users (instructor)

**Common Queries:**

```typescript
// Get user's certificates
const certificates = await ctx.db
	.query('certificates')
	.withIndex('by_user', q => q.eq('userId', userId))
	.collect();

// Verify certificate
const certificate = await ctx.db
	.query('certificates')
	.withIndex('by_verification', q => q.eq('verificationCode', code))
	.first();

// Generate certificate on course completion
await ctx.db.insert('certificates', {
	userId,
	userName: `${user.firstName} ${user.lastName}`,
	courseId,
	courseName: course.title,
	instructorId: course.instructorId,
	instructorName: `${instructor.firstName} ${instructor.lastName}`,
	issueDate: new Date().toISOString(),
	verificationCode: generateUniqueCode(),
	templateId: 'default',
});
```

**Validation Rules:**

- `verificationCode` must be globally unique
- `issueDate` must be <= current date
- `expiryDate` if set, must be > issueDate

**Notes:**

- Names denormalized for certificate permanence (name changes don't affect certificates)
- `verificationCode` enables public verification without authentication
- Consider CE credit information in metadata field

---

### 9. Purchases

Course enrollment/purchase tracking.

**Schema:**

```typescript
{
  userId: Id<'users'>,
  courseId: Id<'courses'>,
  amount: number,                  // Price paid in cents
  currency: string,                // e.g., 'usd'
  status: 'open' | 'complete' | 'expired',
  createdAt: number,               // Unix timestamp (ms)
}
```

**Indexes:**

- `by_user` - Get user's purchases
- `by_course` - Get course enrollments

**Relationships:**

- **Many-to-One** → Users
- **Many-to-One** → Courses

**Common Queries:**

```typescript
// Check if user purchased course
const purchase = await ctx.db
	.query('purchases')
	.withIndex('by_user', q => q.eq('userId', userId))
	.filter(q => q.eq(q.field('courseId'), courseId))
	.filter(q => q.eq(q.field('status'), 'complete'))
	.first();

// Get user's purchased courses
const purchases = await ctx.db
	.query('purchases')
	.withIndex('by_user', q => q.eq('userId', userId))
	.filter(q => q.eq(q.field('status'), 'complete'))
	.collect();

// Get course enrollment count
const enrollments = await ctx.db
	.query('purchases')
	.withIndex('by_course', q => q.eq('courseId', courseId))
	.filter(q => q.eq(q.field('status'), 'complete'))
	.collect();
```

**Validation Rules:**

- `amount` must match course price at purchase time
- `status` must be one of: open, complete, expired
- Only 'complete' status grants access

**Notes:**

- Created by Stripe webhook after successful payment
- `status='open'` during checkout process
- `status='complete'` after payment success
- Consider adding refund tracking

---

## Data Migration Patterns

### Seeding Test Data

```typescript
// convex/seed.ts
import { mutation } from './_generated/server';

export const seedTestData = mutation({
	handler: async ctx => {
		// Create test instructor
		const instructorId = await ctx.db.insert('users', {
			firstName: 'Jane',
			lastName: 'Instructor',
			email: 'jane@example.com',
			role: 'instructor',
			createdAt: new Date().toISOString(),
		});

		// Create test course
		await ctx.db.insert('courses', {
			title: 'Introduction to Medical Aesthetics',
			description: 'Learn the fundamentals...',
			instructorId,
			level: 'beginner',
			price: 9999, // $99.99
			createdAt: Date.now(),
			updatedAt: Date.now(),
		});

		return { success: true };
	},
});
```

### Schema Evolution

When adding new fields:

```typescript
// Old schema
courses: { title: string }

// New schema (backwards compatible)
courses: {
  title: string,
  subtitle?: string  // Optional field
}
```

When removing fields (migrate in steps):

1. Make field optional
2. Stop writing to it
3. Backfill/migrate data
4. Remove from schema

---

## Performance Best Practices

### 1. Use Indexes for Common Queries

```typescript
// Bad: Full table scan
const courses = await ctx.db
	.query('courses')
	.filter(q => q.eq(q.field('instructorId'), id))
	.collect();

// Good: Index scan
const courses = await ctx.db
	.query('courses')
	.withIndex('by_instructor', q => q.eq('instructorId', id))
	.collect();
```

### 2. Limit Result Sets

```typescript
// Get top 10 rated courses
const top = await ctx.db
	.query('courses')
	.filter(q => q.gte(q.field('rating'), 4.0))
	.order('desc')
	.take(10);
```

### 3. Denormalize for Read-Heavy Data

```typescript
// Certificate stores names, not just IDs
{
  userName: 'John Doe',  // Denormalized
  courseName: 'Botox 101',  // Denormalized
  // Prevents joins on certificate display
}
```

### 4. Batch Writes

```typescript
// Create multiple records efficiently
await Promise.all([
	ctx.db.insert('resources', resource1),
	ctx.db.insert('resources', resource2),
	ctx.db.insert('resources', resource3),
]);
```

---

## Backup & Recovery

### Convex Automatic Backups

- Convex handles backups automatically
- Point-in-time recovery available
- No manual backup scripts needed

### Export Data (if needed)

```typescript
// Export all courses
export const exportCourses = query({
	handler: async ctx => {
		return await ctx.db.query('courses').collect();
	},
});
```

---

## Monitoring & Maintenance

### Key Metrics to Track

- **Query Performance** - Slow queries, missing indexes
- **Storage Growth** - Table sizes, file storage
- **Access Patterns** - Hot paths, read/write ratios
- **Error Rates** - Failed mutations, constraint violations

### Regular Maintenance Tasks

- Review and optimize slow queries
- Archive old notifications (90+ days)
- Clean up expired checkout sessions
- Audit orphaned records

---

## Schema Gap Summary & Migration Roadmap

### Current State vs. Application Requirements

This section provides a comprehensive view of what exists vs. what the application needs based on actual code analysis (`lib/course-migration.ts`, course wizard forms, and service files).

### Missing Fields in Existing Tables

#### Users Table

- ⚠️ **CRITICAL:** `role` enum needs to be replaced with `isInstructor` and `isAdmin` booleans
- Current: `role: 'admin' | 'instructor' | 'student'`
- Needed: `isInstructor: boolean`, `isAdmin: boolean`

#### Courses Table

- ⚠️ `longDescription` - Full course description (wizard has this)
- ⚠️ `category` - Course category for filtering (wizard has this)
- ⚠️ `tags` - Array of searchable tags (migration file shows this)
- ⚠️ `visibility` - 'public' | 'private' | 'draft' status (wizard has this)
- ⚠️ `certificateEnabled` - Boolean flag (wizard has this)
- ⚠️ `discussionEnabled` - Boolean flag (wizard has this)
- ⚠️ `lessonCount` - Denormalized count (application displays this)
- ⚠️ `studentCount` - Denormalized enrollment count (application displays this)

### Missing Tables

#### 🔴 CRITICAL - Required for Course Wizard to Function

**1. CourseModules**

- Purpose: Course curriculum sections
- Required by: Course wizard structure step
- Fields: courseId, title, description, order, timestamps
- Indexes: by_course, by_order

**2. Lessons**

- Purpose: Individual lessons within modules
- Required by: Course wizard content step
- Fields: moduleId, courseId, title, type ('video' | 'document' | 'quiz' | 'assignment'), content, duration, order, timestamps
- Indexes: by_module, by_course, by_type

**3. QuizQuestions**

- Purpose: Quiz questions for quiz-type lessons
- Required by: Course wizard AI quiz generator
- Fields: lessonId, question, options[], correctOption, explanation, order
- Indexes: by_lesson

#### 🟡 HIGH PRIORITY - Core Application Features

**4. CourseReviews**

- Purpose: Student course reviews and ratings
- Required by: Course detail pages, rating aggregation
- Fields: courseId, userId, userName (denormalized), userImage (denormalized), rating, content, timestamps
- Indexes: by_course, by_user, by_rating

**5. LessonProgress** (for student tracking)

- Purpose: Track which lessons students have completed
- Required by: Progress tracking, certificate generation
- Fields: userId, courseId, lessonId, completed, completedAt, timeSpent
- Indexes: by_user_course, by_lesson

**6. InstructorApplications** (for vetting process)

- Purpose: Track instructor verification applications
- Required by: Instructor vetting workflow (documented in doctrina)
- Fields: userId, status, licenseNumber, licenseState, licenseExpiry, insuranceProvider, documents[], submittedAt, reviewedAt, reviewedBy, rejectionReason
- Indexes: by_user, by_status

#### 🟢 MEDIUM PRIORITY - Enhanced Features

**7. CourseTags** (if not using array field)

- Purpose: Separate tagging system for search/filtering
- Alternative: Could use `tags: string[]` in Courses table
- Fields: courseId, tag, createdAt

**8. CourseDiscussions**

- Purpose: Course discussion forums
- Required by: Discussion feature in wizard
- Fields: courseId, userId, title, content, parentId (for replies), timestamps
- Indexes: by_course, by_user, by_parent

**9. Wishlist**

- Purpose: Save courses for later
- Fields: userId, courseId, addedAt
- Indexes: by_user, by_course

**10. CourseEnrollments** (separate from Purchases)

- Purpose: Track active enrollments independent of payment
- Note: Currently using Purchases table for this
- Consider: Separating enrollment status from payment status

### Missing Indexes

**Users:**

- ⚠️ `by_isInstructor` - Query all instructors efficiently
- ⚠️ `by_isAdmin` - Query all admins

**Courses:**

- ⚠️ `by_category` - Filter courses by category
- ⚠️ `by_visibility` - Get only published courses
- ⚠️ `by_tags` - Search by tags (if using array field)

**Resources:**

- ✅ All needed indexes exist

### Migration Phases

#### Phase 1: Critical Infrastructure (Week 1)

**Goal:** Make course wizard functional

1. **Update Users schema:**
   - Add `isInstructor: boolean` (default false)
   - Add `isAdmin: boolean` (default false)
   - Migrate existing `role` data to boolean fields
   - Add indexes: `by_isInstructor`, `by_isAdmin`
   - Update `convex/users.ts` to use new fields

2. **Extend Courses schema:**
   - Add `visibility: 'public' | 'private' | 'draft'` (default 'draft')
   - Add `category: string`
   - Add `longDescription?: string`
   - Add index: `by_visibility`, `by_category`

3. **Create course structure tables:**
   - Create `courseModules` table with schema
   - Create `lessons` table with schema
   - Create `quizQuestions` table with schema
   - Add all necessary indexes

4. **Update course wizard:**
   - Modify wizard to save to new tables
   - Test full course creation flow

#### Phase 2: Core Features (Week 2-3)

**Goal:** Enable reviews, progress tracking, instructor vetting

1. **Course reviews and ratings:**
   - Create `courseReviews` table
   - Add review submission and display
   - Implement rating aggregation (denormalize to Courses)

2. **Progress tracking:**
   - Create `lessonProgress` table
   - Track lesson completions
   - Calculate course completion percentage

3. **Instructor vetting:**
   - Create `instructorApplications` table
   - Build application submission form
   - Implement admin review workflow

#### Phase 3: Enhanced Features (Week 4+)

**Goal:** Polish and additional functionality

1. **Course enhancements:**
   - Add `tags`, `certificateEnabled`, `discussionEnabled` to Courses
   - Add `lessonCount`, `studentCount` (denormalized)
   - Implement tag-based search

2. **Discussion forums:**
   - Create `courseDiscussions` table
   - Build discussion UI
   - Add reply threading

3. **Wishlist and recommendations:**
   - Create `wishlist` table
   - Implement wishlist UI
   - Enhance recommendation algorithm

#### Phase 4: Optimization & Scale (Ongoing)

**Goal:** Performance and scalability

1. **Denormalization:**
   - Add computed counts to courses
   - Cache frequently accessed data
   - Optimize query patterns

2. **Search improvements:**
   - Implement full-text search
   - Add advanced filtering
   - Optimize tag search

3. **Analytics and reporting:**
   - Add usage analytics tables
   - Implement reporting dashboards
   - Track key metrics

### Development Checklist

- [ ] **Users Table:** Convert role enum to isInstructor/isAdmin booleans
- [ ] **Courses Table:** Add visibility, category, longDescription fields
- [ ] **Create CourseModules table** with indexes
- [ ] **Create Lessons table** with indexes
- [ ] **Create QuizQuestions table** with indexes
- [ ] **Update course wizard** to use new tables
- [ ] **Create CourseReviews table**
- [ ] **Create LessonProgress table**
- [ ] **Create InstructorApplications table**
- [ ] **Add missing indexes** to all tables
- [ ] **Update convex functions** to work with new schema
- [ ] **Test all CRUD operations**
- [ ] **Update UI components** to display new data
- [ ] **Data migration scripts** for existing records

---

## Future Schema Extensions (Post-MVP)

### Planned Additions

- **Announcements** - Course/platform announcements
- **Assignments** - Submitted student work
- **Grading** - Assignment grading system
- **Badges** - Achievement system
- **Cohorts** - Group-based course runs
- **Subscriptions** - Subscription-based access
- **Coupons** - Discount code system
- **Refunds** - Refund tracking

### Scalability Considerations

- Add archival tables for historical data
- Consider partitioning strategies for large tables (if >1M records)
- Implement soft deletes for user-generated content
- Add audit logs for compliance (instructor actions, admin changes)
- Consider read replicas for analytics queries

---

**Last Updated:** 2025-01-25
**Version:** 2.0 (Current + Needed State)
