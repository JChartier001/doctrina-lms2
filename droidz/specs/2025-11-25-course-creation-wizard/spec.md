# Course Creation Wizard - Technical Specification

**Feature**: Complete Course Creation Wizard Implementation  
**Date**: 2025-11-25  
**Status**: Ready for Implementation  
**Tech Stack**: Next.js 16, React 19, Convex 1.28.2, React Hook Form, Zod  
**Priority**: High

---

## 1. Overview

### 1.1 Feature Summary

The Course Creation Wizard enables instructors to create and publish courses through a guided 5-step process. The UI components already exist but are not connected to the backend. This specification details the implementation of backend mutations, data persistence, validation, video upload integration, and error handling needed to complete the feature.

### 1.2 Current State

**Existing Components:**

- ✅ 5-step wizard UI: Basic Info, Structure, Content, Pricing, Review
- ✅ Form components using React Hook Form
- ✅ Convex backend tables: `courses`, `courseModules`, `lessons`
- ✅ Zod validation schemas in `schema/CourseWizardSchema.ts`
- ✅ Wizard page at `app/instructor/courses/wizard/page.tsx`

**Missing Implementation:**

- ❌ Backend mutations (commented out in wizard page)
- ❌ Save draft functionality
- ❌ Course status management (draft/published/archived)
- ❌ Data persistence between steps
- ❌ Video upload integration with Bunny.net Stream
- ❌ Form validation and error handling
- ❌ Preview functionality
- ❌ Publishing requirements validation

### 1.3 Goals

1. Allow instructors to create courses from start to finish through the wizard
2. Save drafts at any step with auto-retry on failure
3. Validate minimum requirements before publishing
4. Integrate Bunny.net Stream for video hosting
5. Provide course preview before publishing
6. Handle errors gracefully with localStorage backup
7. Support editing of published courses with student notifications

### 1.4 Success Criteria

- ✅ Instructor can complete the wizard and publish a course
- ✅ Draft courses save correctly at each step
- ✅ Published courses appear in the course catalog
- ✅ Video uploads work with Bunny.net Stream
- ✅ Validation prevents incomplete course publishing
- ✅ Connection loss doesn't cause data loss (localStorage backup)
- ✅ Students receive notifications when enrolled courses are updated
- ✅ All existing tests continue to pass
- ✅ New functionality has 100% test coverage

---

## 2. User Stories

### 2.1 Create New Course

**As an instructor**, I want to create a new course through a guided wizard  
**So that** I can organize my content in a structured way

**Acceptance Criteria:**

- Can access wizard from instructor dashboard
- Can fill in basic info (title, description, category, thumbnail)
- Can create course structure (modules and lessons)
- Can upload video content for lessons
- Can set pricing information
- Can review all details before publishing

### 2.2 Save Draft

**As an instructor**, I want to save my course as a draft at any step  
**So that** I can continue editing it later without losing progress

**Acceptance Criteria:**

- "Save Draft" button available at every step
- Draft saves the current step number
- Draft saves all form data entered so far
- Can resume editing from the saved step
- Auto-retry 3 times if save fails
- localStorage backup if all retries fail

### 2.3 Publish Course

**As an instructor**, I want to publish my course  
**So that** students can discover and enroll in it

**Acceptance Criteria:**

- Can only publish if minimum requirements met:
  - At least 1 module
  - At least 1 lesson
  - Thumbnail uploaded
  - Pricing set (can be free based on tier)
- Course status changes from `draft` to `published`
- Course appears in catalog immediately
- Instructor receives confirmation

### 2.4 Preview Course

**As an instructor**, I want to preview my course before publishing  
**So that** I can see how students will see it

**Acceptance Criteria:**

- "Preview" button available at any step
- Opens course landing page in new tab/modal
- Shows: title, description, pricing, curriculum, requirements
- Does not show course as published yet

### 2.5 Edit Published Course

**As an instructor**, I want to edit my published course  
**So that** I can keep content up-to-date

**Acceptance Criteria:**

- Can access wizard for published course
- Can update all fields
- Changes save immediately
- Enrolled students see updates
- Students receive in-app notification badge

---

## 3. Technical Requirements

### 3.1 Database Schema Changes

#### 3.1.1 Add Status Field to Courses Table

**File**: `convex/schema.ts`

```typescript
const courseSchema = {
  title: v.string(),
  description: v.string(),
  instructorId: v.id('users'),

  // NEW: Course lifecycle status
  status: v.union(
    v.literal('draft'),
    v.literal('published'),
    v.literal('archived'),
    v.optional(v.literal('unpublished')) // Optional: was published, now hidden
  ),

  // NEW: Track wizard progress
  currentStep: v.optional(v.number()), // 0-4 (which step instructor is on)

  level: v.optional(v.union(v.literal('beginner'), v.literal('intermediate'), v.literal('advanced'))),
  duration: v.optional(v.string()),
  price: v.optional(v.number()),
  thumbnailUrl: v.optional(v.string()),

  // NEW: Video hosting metadata
  bunnyLibraryId: v.optional(v.string()), // Bunny.net Stream library ID

  rating: v.optional(v.number()),
  reviewCount: v.optional(v.number()),
  tags: v.optional(v.array(v.string())),
  whatYouWillLearn: v.optional(v.array(v.string())),
  requirements: v.optional(v.array(v.string())),

  // NEW: Track last update for student notifications
  lastUpdatedAt: v.optional(v.number()),

  createdAt: v.number(),
  updatedAt: v.number(),
};

// NEW: Index for status filtering
courses: defineTable(courseSchema)
  .index('by_instructor', ['instructorId'])
  .index('by_status', ['status']) // Query published courses
  .index('by_instructor_status', ['instructorId', 'status']), // Instructor's drafts
```

#### 3.1.2 Add Video Metadata to Lessons Table

**File**: `convex/schema.ts`

```typescript
const lessonSchema = {
	moduleId: v.id('courseModules'),
	title: v.string(),
	description: v.optional(v.string()),
	type: v.union(v.literal('video'), v.literal('quiz'), v.literal('assignment')),
	duration: v.optional(v.string()),

	// EXISTING video fields
	videoUrl: v.optional(v.string()),
	videoId: v.optional(v.string()),

	// NEW: Bunny.net Stream metadata
	bunnyVideoId: v.optional(v.string()), // Bunny.net video GUID
	bunnyVideoStatus: v.optional(v.string()), // 'uploading', 'processing', 'ready', 'failed'
	bunnyThumbnailUrl: v.optional(v.string()),
	bunnyPlaybackUrl: v.optional(v.string()),

	content: v.optional(v.string()),
	isPreview: v.boolean(),
	order: v.number(),
	createdAt: v.number(),
};
```

#### 3.1.3 Add Course Update Notifications

**File**: `convex/schema.ts`

```typescript
// EXISTING notification types already include 'course_update'
const notificationSchema = {
	userId: v.id('users'),
	title: v.string(),
	description: v.string(),
	type: v.union(
		v.literal('course_update'), // ALREADY EXISTS ✅
		v.literal('message'),
		v.literal('announcement'),
		v.literal('community'),
		v.literal('live_session'),
		v.literal('certificate'),
		v.literal('milestone'),
	),
	read: v.boolean(),
	createdAt: v.number(),
	link: v.optional(v.string()),

	// NEW: Store course reference for updates
	metadata: v.optional(
		v.object({
			courseId: v.optional(v.id('courses')),
			courseName: v.optional(v.string()),
		}),
	),
};
```

### 3.2 Backend Mutations

#### 3.2.1 Create Course (Save First Draft)

**File**: `convex/courses.ts`

```typescript
import { v } from 'convex/values';
import { mutation } from './_generated/server';

/**
 * Create a new course in draft status
 * Called when instructor first enters wizard and saves
 */
export const createDraft = mutation({
	args: {
		title: v.string(), // Required for draft
		description: v.optional(v.string()),
		instructorId: v.id('users'),
		currentStep: v.number(), // Which step they saved at (0-4)

		// Optional fields filled in later
		level: v.optional(v.union(v.literal('beginner'), v.literal('intermediate'), v.literal('advanced'))),
		duration: v.optional(v.string()),
		price: v.optional(v.number()),
		thumbnailUrl: v.optional(v.string()),
		tags: v.optional(v.array(v.string())),
		whatYouWillLearn: v.optional(v.array(v.string())),
		requirements: v.optional(v.array(v.string())),
	},
	handler: async (ctx, args) => {
		// Verify user is instructor
		const user = await ctx.db.get(args.instructorId);
		if (!user || !user.isInstructor) {
			throw new Error('Only instructors can create courses');
		}

		const now = Date.now();
		const courseId = await ctx.db.insert('courses', {
			...args,
			status: 'draft',
			rating: 0,
			reviewCount: 0,
			createdAt: now,
			updatedAt: now,
			lastUpdatedAt: now,
		});

		return courseId;
	},
});
```

#### 3.2.2 Update Course Draft

**File**: `convex/courses.ts`

```typescript
/**
 * Update existing course draft
 * Called on every "Save Draft" click or step navigation
 */
export const updateDraft = mutation({
	args: {
		id: v.id('courses'),
		currentStep: v.optional(v.number()),

		// All fields optional - only update what changed
		title: v.optional(v.string()),
		description: v.optional(v.string()),
		level: v.optional(v.union(v.literal('beginner'), v.literal('intermediate'), v.literal('advanced'))),
		duration: v.optional(v.string()),
		price: v.optional(v.number()),
		thumbnailUrl: v.optional(v.string()),
		tags: v.optional(v.array(v.string())),
		whatYouWillLearn: v.optional(v.array(v.string())),
		requirements: v.optional(v.array(v.string())),
	},
	handler: async (ctx, { id, ...updates }) => {
		const course = await ctx.db.get(id);
		if (!course) {
			throw new Error('Course not found');
		}

		// Only allow updating drafts or published courses
		if (course.status === 'archived') {
			throw new Error('Cannot update archived course');
		}

		await ctx.db.patch(id, {
			...updates,
			updatedAt: Date.now(),
		});

		return id;
	},
});
```

#### 3.2.3 Publish Course

**File**: `convex/courses.ts`

```typescript
/**
 * Publish a course (change status from draft to published)
 * Validates minimum requirements before publishing
 */
export const publish = mutation({
	args: {
		id: v.id('courses'),
	},
	handler: async (ctx, { id }) => {
		const course = await ctx.db.get(id);
		if (!course) {
			throw new Error('Course not found');
		}

		// Validate publishing requirements
		const errors: string[] = [];

		// 1. Must have thumbnail
		if (!course.thumbnailUrl) {
			errors.push('Course must have a thumbnail image');
		}

		// 2. Must have pricing set (can be 0 for free)
		if (course.price === undefined || course.price === null) {
			errors.push('Course must have pricing set');
		}

		// 3. Must have at least 1 module
		const modules = await ctx.db
			.query('courseModules')
			.withIndex('by_course', q => q.eq('courseId', id))
			.collect();

		if (modules.length === 0) {
			errors.push('Course must have at least one module');
		}

		// 4. Must have at least 1 lesson
		const hasLessons = await Promise.all(
			modules.map(async module => {
				const lessons = await ctx.db
					.query('lessons')
					.withIndex('by_module', q => q.eq('moduleId', module._id))
					.collect();
				return lessons.length > 0;
			}),
		);

		if (!hasLessons.some(has => has)) {
			errors.push('Course must have at least one lesson');
		}

		if (errors.length > 0) {
			throw new Error(`Cannot publish course:\n${errors.join('\n')}`);
		}

		// All validations passed - publish course
		const now = Date.now();
		await ctx.db.patch(id, {
			status: 'published',
			updatedAt: now,
			lastUpdatedAt: now,
		});

		// If editing existing published course, notify enrolled students
		if (course.status === 'published') {
			await notifyEnrolledStudents(ctx, id, course.title);
		}

		return id;
	},
});

/**
 * Helper: Notify enrolled students when course is updated
 */
async function notifyEnrolledStudents(ctx: any, courseId: string, courseName: string) {
	const enrollments = await ctx.db
		.query('enrollments')
		.withIndex('by_course', q => q.eq('courseId', courseId))
		.collect();

	// Create notification for each enrolled student
	const now = Date.now();
	await Promise.all(
		enrollments.map(enrollment =>
			ctx.db.insert('notifications', {
				userId: enrollment.userId,
				title: 'Course Updated',
				description: `${courseName} has new content!`,
				type: 'course_update',
				read: false,
				createdAt: now,
				link: `/courses/${courseId}`,
				metadata: {
					courseId,
					courseName,
				},
			}),
		),
	);
}
```

#### 3.2.4 Archive Course

**File**: `convex/courses.ts`

```typescript
/**
 * Archive a course
 * - No new purchases allowed
 * - Existing students retain access
 * - Hidden from catalog
 */
export const archive = mutation({
	args: {
		id: v.id('courses'),
	},
	handler: async (ctx, { id }) => {
		const course = await ctx.db.get(id);
		if (!course) {
			throw new Error('Course not found');
		}

		await ctx.db.patch(id, {
			status: 'archived',
			updatedAt: Date.now(),
		});

		return id;
	},
});
```

#### 3.2.5 Create Module

**File**: `convex/courseModules.ts`

```typescript
import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

/**
 * Create a new module for a course
 */
export const create = mutation({
	args: {
		courseId: v.id('courses'),
		title: v.string(),
		description: v.optional(v.string()),
		order: v.number(),
	},
	handler: async (ctx, args) => {
		const course = await ctx.db.get(args.courseId);
		if (!course) {
			throw new Error('Course not found');
		}

		const moduleId = await ctx.db.insert('courseModules', {
			...args,
			createdAt: Date.now(),
		});

		return moduleId;
	},
});

/**
 * Update module
 */
export const update = mutation({
	args: {
		id: v.id('courseModules'),
		title: v.optional(v.string()),
		description: v.optional(v.string()),
		order: v.optional(v.number()),
	},
	handler: async (ctx, { id, ...updates }) => {
		const module = await ctx.db.get(id);
		if (!module) {
			throw new Error('Module not found');
		}

		await ctx.db.patch(id, updates);
		return id;
	},
});

/**
 * Delete module (and all its lessons)
 */
export const remove = mutation({
	args: {
		id: v.id('courseModules'),
	},
	handler: async (ctx, { id }) => {
		// Get all lessons in this module
		const lessons = await ctx.db
			.query('lessons')
			.withIndex('by_module', q => q.eq('moduleId', id))
			.collect();

		// Delete all lessons
		await Promise.all(lessons.map(lesson => ctx.db.delete(lesson._id)));

		// Delete module
		await ctx.db.delete(id);
		return id;
	},
});

/**
 * Get modules for a course
 */
export const listByCourse = query({
	args: {
		courseId: v.id('courses'),
	},
	handler: async (ctx, { courseId }) => {
		const modules = await ctx.db
			.query('courseModules')
			.withIndex('by_course', q => q.eq('courseId', courseId))
			.collect();

		return modules.sort((a, b) => a.order - b.order);
	},
});
```

#### 3.2.6 Create Lesson

**File**: `convex/lessons.ts`

```typescript
import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

/**
 * Create a new lesson in a module
 */
export const create = mutation({
	args: {
		moduleId: v.id('courseModules'),
		title: v.string(),
		description: v.optional(v.string()),
		type: v.union(v.literal('video'), v.literal('quiz'), v.literal('assignment')),
		duration: v.optional(v.string()),
		content: v.optional(v.string()),
		isPreview: v.boolean(),
		order: v.number(),

		// Video fields (filled after upload)
		videoUrl: v.optional(v.string()),
		videoId: v.optional(v.string()),
		bunnyVideoId: v.optional(v.string()),
		bunnyVideoStatus: v.optional(v.string()),
		bunnyThumbnailUrl: v.optional(v.string()),
		bunnyPlaybackUrl: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const module = await ctx.db.get(args.moduleId);
		if (!module) {
			throw new Error('Module not found');
		}

		const lessonId = await ctx.db.insert('lessons', {
			...args,
			createdAt: Date.now(),
		});

		return lessonId;
	},
});

/**
 * Update lesson
 */
export const update = mutation({
	args: {
		id: v.id('lessons'),
		title: v.optional(v.string()),
		description: v.optional(v.string()),
		type: v.optional(v.union(v.literal('video'), v.literal('quiz'), v.literal('assignment'))),
		duration: v.optional(v.string()),
		content: v.optional(v.string()),
		isPreview: v.optional(v.boolean()),
		order: v.optional(v.number()),
		videoUrl: v.optional(v.string()),
		videoId: v.optional(v.string()),
		bunnyVideoId: v.optional(v.string()),
		bunnyVideoStatus: v.optional(v.string()),
		bunnyThumbnailUrl: v.optional(v.string()),
		bunnyPlaybackUrl: v.optional(v.string()),
	},
	handler: async (ctx, { id, ...updates }) => {
		const lesson = await ctx.db.get(id);
		if (!lesson) {
			throw new Error('Lesson not found');
		}

		await ctx.db.patch(id, updates);
		return id;
	},
});

/**
 * Delete lesson
 */
export const remove = mutation({
	args: {
		id: v.id('lessons'),
	},
	handler: async (ctx, { id }) => {
		await ctx.db.delete(id);
		return id;
	},
});

/**
 * Get lessons for a module
 */
export const listByModule = query({
	args: {
		moduleId: v.id('courseModules'),
	},
	handler: async (ctx, { moduleId }) => {
		const lessons = await ctx.db
			.query('lessons')
			.withIndex('by_module', q => q.eq('moduleId', moduleId))
			.collect();

		return lessons.sort((a, b) => a.order - b.order);
	},
});
```

### 3.3 Video Upload Integration (Bunny.net Stream)

#### 3.3.1 Bunny.net Stream Setup

**Decision**: Use Bunny.net Stream (90% cheaper than AWS)

**Pricing:**

- Storage: $0.01/GB/month
- Encoding (1080p): $0.05/minute
- CDN Delivery (US/EU): $0.01/GB
- Estimated cost for 100 courses (300 hours): ~$59/month

**Setup Requirements:**

1. Create Bunny.net account
2. Create Stream library (get Library ID and API Key)
3. Store credentials in environment variables

**Environment Variables:**

```env
# Bunny.net Stream
BUNNY_STREAM_LIBRARY_ID=your-library-id
BUNNY_STREAM_API_KEY=your-api-key
BUNNY_STREAM_CDN_HOSTNAME=vz-abc123.b-cdn.net
```

#### 3.3.2 Video Upload Flow

**File**: `lib/bunny-stream.ts` (NEW)

```typescript
/**
 * Bunny.net Stream API client
 */

const BUNNY_API_BASE = 'https://video.bunnycdn.com';
const BUNNY_LIBRARY_ID = process.env.BUNNY_STREAM_LIBRARY_ID!;
const BUNNY_API_KEY = process.env.BUNNY_STREAM_API_KEY!;
const BUNNY_CDN_HOSTNAME = process.env.BUNNY_STREAM_CDN_HOSTNAME!;

export interface BunnyVideoResponse {
	guid: string;
	videoLibraryId: number;
	title: string;
	status: number; // 0=queued, 1=processing, 2=encoding, 3=finished, 4=failed
	thumbnailUrl: string;
	length: number; // seconds
	width: number;
	height: number;
}

/**
 * Create video in Bunny.net Stream
 * Returns video GUID for upload
 */
export async function createBunnyVideo(title: string): Promise<string> {
	const response = await fetch(`${BUNNY_API_BASE}/library/${BUNNY_LIBRARY_ID}/videos`, {
		method: 'POST',
		headers: {
			AccessKey: BUNNY_API_KEY,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ title }),
	});

	if (!response.ok) {
		throw new Error(`Failed to create video: ${response.statusText}`);
	}

	const data: BunnyVideoResponse = await response.json();
	return data.guid;
}

/**
 * Upload video file to Bunny.net Stream
 * Must be called after createBunnyVideo()
 */
export async function uploadBunnyVideo(videoGuid: string, videoFile: File): Promise<void> {
	const response = await fetch(`${BUNNY_API_BASE}/library/${BUNNY_LIBRARY_ID}/videos/${videoGuid}`, {
		method: 'PUT',
		headers: {
			AccessKey: BUNNY_API_KEY,
			'Content-Type': 'application/octet-stream',
		},
		body: videoFile,
	});

	if (!response.ok) {
		throw new Error(`Failed to upload video: ${response.statusText}`);
	}
}

/**
 * Get video status and metadata
 */
export async function getBunnyVideo(videoGuid: string): Promise<BunnyVideoResponse> {
	const response = await fetch(`${BUNNY_API_BASE}/library/${BUNNY_LIBRARY_ID}/videos/${videoGuid}`, {
		headers: {
			AccessKey: BUNNY_API_KEY,
		},
	});

	if (!response.ok) {
		throw new Error(`Failed to get video: ${response.statusText}`);
	}

	return response.json();
}

/**
 * Get video playback URL
 */
export function getBunnyPlaybackUrl(videoGuid: string): string {
	return `https://${BUNNY_CDN_HOSTNAME}/${videoGuid}/playlist.m3u8`;
}

/**
 * Get video thumbnail URL
 */
export function getBunnyThumbnailUrl(videoGuid: string): string {
	return `https://${BUNNY_CDN_HOSTNAME}/${videoGuid}/thumbnail.jpg`;
}
```

#### 3.3.3 Video Upload Component

**File**: `components/course-wizard/video-upload.tsx` (NEW)

```typescript
'use client';

import { Upload, Video, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  createBunnyVideo,
  uploadBunnyVideo,
  getBunnyVideo,
  getBunnyPlaybackUrl,
  getBunnyThumbnailUrl
} from '@/lib/bunny-stream';

interface VideoUploadProps {
  lessonId: string;
  onUploadComplete: (metadata: {
    bunnyVideoId: string;
    bunnyPlaybackUrl: string;
    bunnyThumbnailUrl: string;
    duration: string;
  }) => void;
}

export function VideoUpload({ lessonId, onUploadComplete }: VideoUploadProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'complete' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setStatus('uploading');
      setErrorMessage('');

      // 1. Create video in Bunny.net
      const videoGuid = await createBunnyVideo(file.name);

      // 2. Upload video file
      await uploadBunnyVideo(videoGuid, file);
      setUploadProgress(100);
      setStatus('processing');

      // 3. Poll for encoding completion
      const metadata = await pollVideoStatus(videoGuid);

      // 4. Return metadata to parent
      onUploadComplete(metadata);
      setStatus('complete');

    } catch (error) {
      console.error('Video upload failed:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Upload failed');
      setStatus('error');
    }
  };

  /**
   * Poll Bunny.net API until video is encoded
   */
  const pollVideoStatus = async (videoGuid: string) => {
    const maxAttempts = 60; // 5 minutes max
    let attempts = 0;

    while (attempts < maxAttempts) {
      const video = await getBunnyVideo(videoGuid);

      // Status: 3 = finished encoding
      if (video.status === 3) {
        return {
          bunnyVideoId: video.guid,
          bunnyPlaybackUrl: getBunnyPlaybackUrl(video.guid),
          bunnyThumbnailUrl: getBunnyThumbnailUrl(video.guid),
          duration: formatDuration(video.length),
        };
      }

      // Status: 4 = failed
      if (video.status === 4) {
        throw new Error('Video encoding failed');
      }

      // Wait 5 seconds before next poll
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }

    throw new Error('Video encoding timeout');
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="border-2 border-dashed rounded-lg p-6">
      {status === 'idle' && (
        <div className="flex flex-col items-center">
          <Video className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm font-medium mb-2">Upload video lesson</p>
          <p className="text-xs text-muted-foreground mb-4">
            MP4, MOV, or AVI. Max 2GB.
          </p>
          <Button
            variant="outline"
            onClick={() => document.getElementById(`video-${lessonId}`)?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Choose Video
          </Button>
          <input
            id={`video-${lessonId}`}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      )}

      {status === 'uploading' && (
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <p className="text-sm font-medium mb-2">Uploading video...</p>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}

      {status === 'processing' && (
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <p className="text-sm font-medium">Processing video...</p>
          <p className="text-xs text-muted-foreground">
            This may take a few minutes
          </p>
        </div>
      )}

      {status === 'complete' && (
        <div className="flex flex-col items-center">
          <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
          <p className="text-sm font-medium text-green-500">Upload complete!</p>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <p className="text-sm font-medium text-red-500">Upload failed</p>
          <p className="text-xs text-muted-foreground mb-4">{errorMessage}</p>
          <Button
            variant="outline"
            onClick={() => setStatus('idle')}
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
```

### 3.4 Frontend Components Updates

#### 3.4.1 Update Wizard Page to Connect Backend

**File**: `app/instructor/courses/wizard/page.tsx`

```typescript
'use client';

import { useMutation, useQuery } from 'convex/react';
import { CheckCircle2, ChevronLeft, ChevronRight, Eye, Save } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import { BasicInfoStep } from '@/components/course-wizard/basic-info-step';
import { ContentStep } from '@/components/course-wizard/content-step';
import { PricingStep } from '@/components/course-wizard/pricing-step';
import { ReviewStep } from '@/components/course-wizard/review-step';
import { StructureStep } from '@/components/course-wizard/structure-step';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useAuth } from '@/lib/auth';
import { CreateCourseDefaultValues, CreateCourseWizardType } from '@/schema/CourseWizardSchema';

const STORAGE_KEY = 'course-wizard-backup';
const MAX_RETRY_ATTEMPTS = 3;

export default function CourseWizard() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get('id') as Id<'courses'> | null;

  const form = useForm<CreateCourseWizardType>({
    mode: 'onChange',
    reValidateMode: 'onBlur',
    defaultValues: CreateCourseDefaultValues,
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(0);

  const { user } = useAuth();
  const router = useRouter();

  // Convex mutations
  const createDraft = useMutation(api.courses.createDraft);
  const updateDraft = useMutation(api.courses.updateDraft);
  const publishCourse = useMutation(api.courses.publish);
  const existingCourse = useQuery(
    api.courses.get,
    courseId ? { id: courseId } : 'skip'
  );

  // Load existing course or localStorage backup
  useEffect(() => {
    if (existingCourse) {
      // Editing existing course
      form.reset({
        title: existingCourse.title,
        description: existingCourse.description,
        // ... map all fields
      });
      setCurrentStep(existingCourse.currentStep || 0);
    } else {
      // Check localStorage backup
      const backup = localStorage.getItem(STORAGE_KEY);
      if (backup) {
        try {
          const data = JSON.parse(backup);
          form.reset(data.formData);
          setCurrentStep(data.currentStep);
          toast.info('Restored unsaved changes from backup');
        } catch (error) {
          console.error('Failed to restore backup:', error);
        }
      }
    }
  }, [existingCourse]);

  // Define the steps
  const steps = [
    { name: 'Basic Info', component: BasicInfoStep },
    { name: 'Structure', component: StructureStep },
    { name: 'Content', component: ContentStep },
    { name: 'Pricing', component: PricingStep },
    { name: 'Review', component: ReviewStep },
  ];

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  /**
   * Save draft with retry logic
   */
  const handleSaveDraft = async (data: CreateCourseWizardType) => {
    setIsSaving(true);
    setRetryAttempt(0);

    try {
      await saveDraftWithRetry(data);

      // Clear localStorage backup on successful save
      localStorage.removeItem(STORAGE_KEY);

      toast.success('Draft saved successfully');
      setRetryAttempt(0);

    } catch (error) {
      console.error('Failed to save draft after retries:', error);

      // Save to localStorage as backup
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        formData: data,
        currentStep,
        timestamp: Date.now(),
      }));

      toast.error(
        'Failed to save draft. Your changes are backed up locally.',
        {
          autoClose: false,
          closeButton: true,
        }
      );
    }

    setIsSaving(false);
  };

  /**
   * Retry save operation up to MAX_RETRY_ATTEMPTS times
   */
  const saveDraftWithRetry = async (
    data: CreateCourseWizardType,
    attempt = 1
  ): Promise<Id<'courses'>> => {
    try {
      setRetryAttempt(attempt);

      if (courseId) {
        // Update existing draft
        await updateDraft({
          id: courseId,
          currentStep,
          title: data.title,
          description: data.description,
          // ... map all fields
        });
        return courseId;
      } else {
        // Create new draft
        const newCourseId = await createDraft({
          instructorId: user!.id as Id<'users'>,
          currentStep,
          title: data.title,
          description: data.description,
          // ... map all fields
        });

        // Update URL with new course ID
        router.replace(`/instructor/courses/wizard?id=${newCourseId}`);
        return newCourseId;
      }

    } catch (error) {
      if (attempt < MAX_RETRY_ATTEMPTS) {
        // Wait before retry (exponential backoff)
        await new Promise(resolve =>
          setTimeout(resolve, 1000 * Math.pow(2, attempt))
        );
        return saveDraftWithRetry(data, attempt + 1);
      }
      throw error;
    }
  };

  /**
   * Preview course landing page
   */
  const handlePreview = () => {
    if (!courseId) {
      toast.error('Please save your course first');
      return;
    }

    // Open preview in new tab
    window.open(`/courses/${courseId}/preview`, '_blank');
  };

  /**
   * Publish course
   */
  const handlePublish = async () => {
    if (!courseId) {
      toast.error('Please save your course first');
      return;
    }

    setIsLoading(true);

    try {
      await publishCourse({ id: courseId });

      toast.success('Course published successfully!');
      router.push('/instructor/dashboard');

    } catch (error) {
      console.error('Failed to publish course:', error);

      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to publish course';

      toast.error(errorMessage);
    }

    setIsLoading(false);
  };

  // Render current step component
  const CurrentStepComponent = steps[currentStep].component;

  // Redirect if not instructor
  if (!user || !user.isInstructor) {
    return null;
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col space-y-8">
        {/* Step indicators */}
        <div className="flex justify-between">
          {steps.map((step, index) => (
            <button
              key={index}
              className={`flex flex-col items-center space-y-2 ${
                index <= currentStep
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
              onClick={() => {
                if (index <= currentStep) {
                  setCurrentStep(index);
                }
              }}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                  index < currentStep
                    ? 'border-primary bg-primary text-primary-foreground'
                    : index === currentStep
                      ? 'border-primary text-primary'
                      : 'border-muted-foreground text-muted-foreground'
                }`}
              >
                {index < currentStep
                  ? <CheckCircle2 className="h-5 w-5" />
                  : index + 1
                }
              </div>
              <span className="text-xs font-medium">{step.name}</span>
            </button>
          ))}
        </div>

        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Current step content */}
      <Card className="p-6 mt-8">
        <FormProvider {...form}>
          <CurrentStepComponent />
        </FormProvider>
      </Card>

      {/* Navigation buttons */}
      <div className="flex justify-between mt-8">
        <div>
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
          )}
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => handleSaveDraft(form.getValues())}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving
              ? `Saving... ${retryAttempt > 0 ? `(Retry ${retryAttempt}/${MAX_RETRY_ATTEMPTS})` : ''}`
              : 'Save Draft'
            }
          </Button>

          <Button
            variant="outline"
            onClick={handlePreview}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button
              onClick={handleNext}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handlePublish}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? 'Publishing...' : 'Publish Course'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
```

#### 3.4.2 Update Content Step for Video Upload

**File**: `components/course-wizard/content-step.tsx`

Add `VideoUpload` component integration for video lessons.

---

## 4. Wizard Flow

### 4.1 Step 1: Basic Info

**Required Fields:**

- Title (required for draft)
- Description
- Category
- Thumbnail (required for publish)
- Prerequisites
- Certificate option
- Discussion forum option

**Validation:**

- Title: Min 10 characters, max 100
- Description: Min 50 characters, max 1000
- Thumbnail: Image file, 16:9 aspect ratio preferred

**Save Behavior:**

- Creates initial course record with status `draft`
- Stores `currentStep: 0`

### 4.2 Step 2: Structure

**Fields:**

- Modules (array)
  - Module title
  - Module description
  - Order

**Validation:**

- At least 1 module (for publish)
- Module title: Min 5 characters

**Save Behavior:**

- Creates/updates modules in `courseModules` table
- Maintains order for display

### 4.3 Step 3: Content

**Fields:**

- For each module's lessons:
  - Lesson title
  - Lesson type (video, quiz, assignment)
  - Video upload (if type = video)
  - Content (if type != video)
  - Duration
  - Is preview (free preview lesson)

**Validation:**

- At least 1 lesson (for publish)
- Video lessons must have uploaded video
- Quiz lessons must have at least 1 question

**Save Behavior:**

- Creates/updates lessons in `lessons` table
- Uploads videos to Bunny.net Stream
- Stores video metadata (bunnyVideoId, playbackUrl, etc.)

### 4.4 Step 4: Pricing

**Fields:**

- Price (can be 0 for free)
- Currency (default USD)
- Free course checkbox

**Validation:**

- Price: >= 0
- Free courses: Check instructor tier (implement later)

**Save Behavior:**

- Updates course with pricing information

### 4.5 Step 5: Review

**Display:**

- Summary of all course information
- Module and lesson count
- Total duration
- Preview button

**Actions:**

- Save Draft (final save before publish)
- Publish (validate requirements, change status)

**Validation (Publish):**

- Title ✅
- Description ✅
- Thumbnail ✅
- At least 1 module ✅
- At least 1 lesson ✅
- Pricing set ✅

---

## 5. API Design

### 5.1 Course Mutations

```typescript
// Create draft course
api.courses.createDraft(args: {
  instructorId: Id<'users'>,
  title: string,
  currentStep: number,
  description?: string,
  // ... optional fields
}) => Id<'courses'>

// Update draft course
api.courses.updateDraft(args: {
  id: Id<'courses'>,
  currentStep?: number,
  title?: string,
  // ... optional fields
}) => Id<'courses'>

// Publish course
api.courses.publish(args: {
  id: Id<'courses'>
}) => Id<'courses'>
// Throws error if validation fails

// Archive course
api.courses.archive(args: {
  id: Id<'courses'>
}) => Id<'courses'>
```

### 5.2 Module Mutations

```typescript
// Create module
api.courseModules.create(args: {
  courseId: Id<'courses'>,
  title: string,
  description?: string,
  order: number,
}) => Id<'courseModules'>

// Update module
api.courseModules.update(args: {
  id: Id<'courseModules'>,
  title?: string,
  description?: string,
  order?: number,
}) => Id<'courseModules'>

// Delete module (and all lessons)
api.courseModules.remove(args: {
  id: Id<'courseModules'>
}) => Id<'courseModules'>
```

### 5.3 Lesson Mutations

```typescript
// Create lesson
api.lessons.create(args: {
  moduleId: Id<'courseModules'>,
  title: string,
  type: 'video' | 'quiz' | 'assignment',
  order: number,
  isPreview: boolean,
  description?: string,
  duration?: string,
  content?: string,
  bunnyVideoId?: string,
  // ... video metadata
}) => Id<'lessons'>

// Update lesson
api.lessons.update(args: {
  id: Id<'lessons'>,
  title?: string,
  // ... optional fields
}) => Id<'lessons'>

// Delete lesson
api.lessons.remove(args: {
  id: Id<'lessons'>
}) => Id<'lessons'>
```

### 5.4 Queries

```typescript
// Get course (with modules and lessons)
api.courses.getWithCurriculum(args: {
  courseId: Id<'courses'>
}) => Course & {
  curriculum: Module[],
  instructor: Instructor,
  students: number,
  lessons: number,
}

// List instructor's courses
api.courses.list(args: {
  instructorId: Id<'users'>
}) => Course[]

// List modules for course
api.courseModules.listByCourse(args: {
  courseId: Id<'courses'>
}) => Module[]

// List lessons for module
api.lessons.listByModule(args: {
  moduleId: Id<'courseModules'>
}) => Lesson[]
```

---

## 6. Error Handling

### 6.1 Save Draft Retry Logic

**Strategy**: Exponential backoff with 3 retry attempts

```typescript
const saveDraftWithRetry = async (data: CreateCourseWizardType, attempt = 1): Promise<Id<'courses'>> => {
	try {
		// Attempt save
		return await saveDraft(data);
	} catch (error) {
		if (attempt < MAX_RETRY_ATTEMPTS) {
			// Wait before retry: 1s, 2s, 4s
			await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
			return saveDraftWithRetry(data, attempt + 1);
		}
		throw error; // All retries failed
	}
};
```

**UI Feedback:**

- Show "Saving... (Retry 1/3)" during retries
- Show success toast on save
- Show error toast if all retries fail

### 6.2 localStorage Backup

**When to Backup:**

- After each form field change (debounced)
- Before page unload
- After failed save (all retries exhausted)

**Backup Structure:**

```typescript
interface WizardBackup {
	formData: CreateCourseWizardType;
	currentStep: number;
	timestamp: number;
}

// Save backup
localStorage.setItem('course-wizard-backup', JSON.stringify(backup));

// Restore backup
const backup = JSON.parse(localStorage.getItem('course-wizard-backup'));
if (backup && Date.now() - backup.timestamp < 24 * 60 * 60 * 1000) {
	form.reset(backup.formData);
	setCurrentStep(backup.currentStep);
}

// Clear backup
localStorage.removeItem('course-wizard-backup');
```

### 6.3 Validation Errors

**Display Strategy:**

- Show errors after submit attempt (not while typing)
- Inline errors below fields
- Summary at top if multiple errors
- Toast notifications for server errors

**Example Error Messages:**

```typescript
// Publishing validation errors
const errors = [
  'Course must have a thumbnail image',
  'Course must have at least one module',
  'Course must have at least one lesson',
  'Course must have pricing set',
];

// Display as list
toast.error(
  <div>
    <p>Cannot publish course:</p>
    <ul>
      {errors.map(e => <li key={e}>• {e}</li>)}
    </ul>
  </div>
);
```

### 6.4 Video Upload Errors

**Common Errors:**

- File too large (> 2GB)
- Unsupported format
- Upload timeout
- Encoding failure

**Handling:**

```typescript
try {
	await uploadVideo(file);
} catch (error) {
	if (error.message.includes('timeout')) {
		toast.error('Upload timeout. Please try again or use a smaller file.');
	} else if (error.message.includes('format')) {
		toast.error('Unsupported video format. Please use MP4, MOV, or AVI.');
	} else {
		toast.error(`Upload failed: ${error.message}`);
	}

	// Show retry button
	setShowRetryButton(true);
}
```

---

## 7. Validation Rules

### 7.1 Draft Requirements

**To save as draft:**

- ✅ Title (minimum 1 character)

That's it! Everything else is optional for drafts.

### 7.2 Publishing Requirements

**To publish course:**

1. ✅ Title (10-100 characters)
2. ✅ Description (50-1000 characters)
3. ✅ Thumbnail image uploaded
4. ✅ At least 1 module
5. ✅ At least 1 lesson
6. ✅ Pricing set (can be $0)

**Implementation:**

```typescript
export const publish = mutation({
	args: { id: v.id('courses') },
	handler: async (ctx, { id }) => {
		const course = await ctx.db.get(id);
		const errors: string[] = [];

		// Validate title
		if (!course.title || course.title.length < 10) {
			errors.push('Title must be at least 10 characters');
		}

		// Validate description
		if (!course.description || course.description.length < 50) {
			errors.push('Description must be at least 50 characters');
		}

		// Validate thumbnail
		if (!course.thumbnailUrl) {
			errors.push('Course must have a thumbnail image');
		}

		// Validate pricing
		if (course.price === undefined || course.price === null) {
			errors.push('Course must have pricing set');
		}

		// Validate modules
		const modules = await ctx.db
			.query('courseModules')
			.withIndex('by_course', q => q.eq('courseId', id))
			.collect();

		if (modules.length === 0) {
			errors.push('Course must have at least one module');
		}

		// Validate lessons
		const hasLessons = await Promise.all(
			modules.map(async module => {
				const lessons = await ctx.db
					.query('lessons')
					.withIndex('by_module', q => q.eq('moduleId', module._id))
					.collect();
				return lessons.length > 0;
			}),
		);

		if (!hasLessons.some(has => has)) {
			errors.push('Course must have at least one lesson');
		}

		if (errors.length > 0) {
			throw new Error(`Cannot publish course:\n${errors.join('\n')}`);
		}

		// Publish!
		await ctx.db.patch(id, {
			status: 'published',
			updatedAt: Date.now(),
		});
	},
});
```

### 7.3 Field Validation

**Title:**

- Required for draft
- 10-100 characters for publish
- No special characters except: `-`, `&`, `:`, `(`, `)`

**Description:**

- Optional for draft
- 50-1000 characters for publish

**Thumbnail:**

- Image file (JPG, PNG, GIF)
- Max 5MB
- 16:9 aspect ratio recommended

**Price:**

- Number >= 0
- Up to 2 decimal places
- Required for publish

**Module Title:**

- 5-100 characters

**Lesson Title:**

- 5-100 characters

**Video File:**

- MP4, MOV, AVI
- Max 2GB
- Min 10 seconds

---

## 8. Preview Functionality

### 8.1 Preview Page

**Route**: `/courses/[id]/preview`

**Display:**

- Course landing page (student purchase view)
- Shows: title, description, pricing, curriculum, requirements
- "Preview Mode" banner at top
- No purchase button (or disabled)

**Implementation:**

**File**: `app/courses/[id]/preview/page.tsx` (NEW)

```typescript
import { notFound } from 'next/navigation';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { fetchQuery } from 'convex/nextjs';

export default async function CoursePreviewPage({
  params,
}: {
  params: { id: string };
}) {
  const courseId = params.id as Id<'courses'>;
  const course = await fetchQuery(api.courses.getWithCurriculum, { courseId });

  if (!course) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Preview banner */}
      <div className="bg-yellow-100 border-b border-yellow-200 p-4 text-center">
        <p className="text-sm font-medium text-yellow-800">
          Preview Mode - This is how students will see your course
        </p>
      </div>

      {/* Course landing page content */}
      <div className="container py-10">
        {/* Reuse existing course landing page components */}
        <CourseLandingPage course={course} preview={true} />
      </div>
    </div>
  );
}
```

### 8.2 Preview Behavior

**Draft Courses:**

- Preview shows current draft state
- Not accessible by students (requires instructor auth)

**Published Courses:**

- Preview shows live published state
- Accessible by anyone (same as public landing page)

---

## 9. Edge Cases

### 9.1 Connection Loss During Save

**Scenario:** User clicks "Save Draft", network drops mid-request

**Handling:**

1. Retry 3 times with exponential backoff
2. If all retries fail, save to localStorage
3. Show error toast: "Failed to save. Changes backed up locally."
4. On next page load, detect localStorage backup and offer to restore

**Implementation:**

```typescript
// Detect backup on page load
useEffect(() => {
  const backup = localStorage.getItem(STORAGE_KEY);
  if (backup) {
    const { formData, timestamp } = JSON.parse(backup);

    // Only restore if < 24 hours old
    if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
      toast.info(
        'Unsaved changes detected. Would you like to restore them?',
        {
          autoClose: false,
          closeButton: (
            <div>
              <Button onClick={() => restoreBackup(formData)}>
                Restore
              </Button>
              <Button
                variant="outline"
                onClick={() => discardBackup()}
              >
                Discard
              </Button>
            </div>
          ),
        }
      );
    }
  }
}, []);
```

### 9.2 Video Upload Timeout

**Scenario:** Large video takes too long to upload/encode

**Handling:**

1. Show upload progress bar
2. Show encoding status: "Processing video... (This may take a few minutes)"
3. Poll Bunny.net API for status (max 5 minutes)
4. If timeout, show error with retry button

**Implementation:**

```typescript
const pollVideoStatus = async (videoGuid: string) => {
	const maxAttempts = 60; // 5 minutes (5s per poll)
	let attempts = 0;

	while (attempts < maxAttempts) {
		const video = await getBunnyVideo(videoGuid);

		if (video.status === 3) {
			return video; // Success
		}

		if (video.status === 4) {
			throw new Error('Video encoding failed');
		}

		await new Promise(resolve => setTimeout(resolve, 5000));
		attempts++;
	}

	throw new Error('Video encoding timeout. Please try again.');
};
```

### 9.3 Partial Data Entry

**Scenario:** User fills in some fields but not all, then closes browser

**Handling:**

1. Auto-save to localStorage every 30 seconds (debounced)
2. Save to localStorage on page unload
3. Restore from localStorage on next visit

**Implementation:**

```typescript
// Auto-save to localStorage
const debouncedSave = useMemo(
	() =>
		debounce((data: CreateCourseWizardType) => {
			localStorage.setItem(
				STORAGE_KEY,
				JSON.stringify({
					formData: data,
					currentStep,
					timestamp: Date.now(),
				}),
			);
		}, 30000), // 30 seconds
	[currentStep],
);

// Watch form changes
useEffect(() => {
	const subscription = form.watch(data => {
		debouncedSave(data);
	});
	return () => subscription.unsubscribe();
}, [form, debouncedSave]);

// Save on page unload
useEffect(() => {
	const handleUnload = () => {
		const data = form.getValues();
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({
				formData: data,
				currentStep,
				timestamp: Date.now(),
			}),
		);
	};

	window.addEventListener('beforeunload', handleUnload);
	return () => window.removeEventListener('beforeunload', handleUnload);
}, [form, currentStep]);
```

### 9.4 Deleting Modules/Lessons

**Scenario:** User creates modules/lessons, then decides to delete some

**Handling:**

1. Show confirmation dialog: "Delete [module/lesson]? This cannot be undone."
2. If module deleted, cascade delete all lessons
3. Reorder remaining modules/lessons

**Implementation:**

```typescript
const handleDeleteModule = async (moduleId: Id<'courseModules'>) => {
	const confirm = window.confirm(
		'Delete this module? All lessons in this module will also be deleted. This cannot be undone.',
	);

	if (!confirm) return;

	try {
		await removeModule({ id: moduleId });
		toast.success('Module deleted');
	} catch (error) {
		toast.error('Failed to delete module');
	}
};
```

### 9.5 Concurrent Editing

**Scenario:** Instructor opens wizard in 2 tabs, edits in both

**Handling:**

1. Each tab has its own form state
2. Last save wins (optimistic concurrency)
3. Show warning if another tab is detected

**Implementation:**

```typescript
// Detect multiple tabs
useEffect(() => {
	const channel = new BroadcastChannel('course-wizard');

	// Announce this tab
	channel.postMessage({ type: 'tab-opened', courseId });

	// Listen for other tabs
	channel.onmessage = event => {
		if (event.data.type === 'tab-opened' && event.data.courseId === courseId) {
			toast.warning('This course is open in another tab. Changes from both tabs will conflict.', { autoClose: false });
		}
	};

	return () => channel.close();
}, [courseId]);
```

---

## 10. Testing Requirements

### 10.1 Unit Tests

**Backend Mutations:**

**File**: `convex/courses.test.ts` (NEW)

```typescript
import { convexTest } from 'convex-test';
import { expect, test, describe } from 'vitest';
import schema from './schema';
import { createDraft, updateDraft, publish, archive } from './courses';

describe('Course mutations', () => {
	test('createDraft creates course with draft status', async () => {
		const t = convexTest(schema);

		// Create user
		const userId = await t.run(async ctx => {
			return await ctx.db.insert('users', {
				firstName: 'John',
				lastName: 'Doe',
				email: 'john@example.com',
				externalId: 'test-123',
				isInstructor: true,
				isAdmin: false,
			});
		});

		// Create draft
		const courseId = await t.mutation(createDraft, {
			instructorId: userId,
			title: 'Test Course',
			currentStep: 0,
		});

		// Verify
		const course = await t.run(async ctx => {
			return await ctx.db.get(courseId);
		});

		expect(course).toBeDefined();
		expect(course!.status).toBe('draft');
		expect(course!.title).toBe('Test Course');
		expect(course!.currentStep).toBe(0);
	});

	test('publish validates requirements', async () => {
		const t = convexTest(schema);

		// Create incomplete course
		const courseId = await t.run(async ctx => {
			return await ctx.db.insert('courses', {
				title: 'Test',
				description: 'Test',
				instructorId: 'test' as any,
				status: 'draft',
				createdAt: Date.now(),
				updatedAt: Date.now(),
			});
		});

		// Try to publish (should fail - no thumbnail)
		await expect(t.mutation(publish, { id: courseId })).rejects.toThrow('Course must have a thumbnail image');
	});

	test('publish succeeds with all requirements', async () => {
		const t = convexTest(schema);

		// Create complete course
		const userId = await t.run(async ctx => {
			return await ctx.db.insert('users', {
				firstName: 'Jane',
				lastName: 'Smith',
				email: 'jane@example.com',
				externalId: 'test-456',
				isInstructor: true,
				isAdmin: false,
			});
		});

		const courseId = await t.run(async ctx => {
			return await ctx.db.insert('courses', {
				title: 'Complete Course',
				description: 'This is a complete course description with at least 50 characters.',
				instructorId: userId,
				status: 'draft',
				thumbnailUrl: 'https://example.com/thumb.jpg',
				price: 99,
				createdAt: Date.now(),
				updatedAt: Date.now(),
			});
		});

		// Create module
		const moduleId = await t.run(async ctx => {
			return await ctx.db.insert('courseModules', {
				courseId,
				title: 'Module 1',
				order: 0,
				createdAt: Date.now(),
			});
		});

		// Create lesson
		await t.run(async ctx => {
			return await ctx.db.insert('lessons', {
				moduleId,
				title: 'Lesson 1',
				type: 'video',
				isPreview: false,
				order: 0,
				createdAt: Date.now(),
			});
		});

		// Publish should succeed
		await t.mutation(publish, { id: courseId });

		// Verify status
		const course = await t.run(async ctx => {
			return await ctx.db.get(courseId);
		});

		expect(course!.status).toBe('published');
	});
});
```

**Frontend Components:**

**File**: `components/course-wizard/basic-info-step.test.tsx` (NEW)

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { FormProvider, useForm } from 'react-hook-form';
import { BasicInfoStep } from './basic-info-step';
import { CreateCourseWizardType, CreateCourseDefaultValues } from '@/schema/CourseWizardSchema';

describe('BasicInfoStep', () => {
  const renderWithForm = () => {
    const Wrapper = () => {
      const form = useForm<CreateCourseWizardType>({
        defaultValues: CreateCourseDefaultValues,
      });

      return (
        <FormProvider {...form}>
          <BasicInfoStep />
        </FormProvider>
      );
    };

    return render(<Wrapper />);
  };

  it('renders all form fields', () => {
    renderWithForm();

    expect(screen.getByLabelText(/course title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/course description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/prerequisites/i)).toBeInTheDocument();
  });

  it('validates title length', async () => {
    renderWithForm();
    const user = userEvent.setup();

    const titleInput = screen.getByLabelText(/course title/i);
    await user.type(titleInput, 'Short');
    await user.tab(); // Blur

    await waitFor(() => {
      expect(screen.getByText(/title must be at least 10 characters/i))
        .toBeInTheDocument();
    });
  });

  it('accepts valid input', async () => {
    renderWithForm();
    const user = userEvent.setup();

    const titleInput = screen.getByLabelText(/course title/i);
    await user.type(titleInput, 'Advanced Botox Techniques');

    const descInput = screen.getByLabelText(/course description/i);
    await user.type(descInput, 'This course teaches advanced botox injection techniques for medical professionals.');

    expect(titleInput).toHaveValue('Advanced Botox Techniques');
    expect(descInput).toHaveValue('This course teaches advanced botox injection techniques for medical professionals.');
  });
});
```

### 10.2 Integration Tests

**File**: `tests/integration/course-wizard.test.ts` (NEW)

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { convexTest } from 'convex-test';
import schema from '@/convex/schema';
import { createDraft, updateDraft, publish } from '@/convex/courses';
import { create as createModule } from '@/convex/courseModules';
import { create as createLesson } from '@/convex/lessons';

describe('Course creation wizard flow', () => {
	it('completes full course creation flow', async () => {
		const t = convexTest(schema);

		// 1. Create instructor
		const userId = await t.run(async ctx => {
			return await ctx.db.insert('users', {
				firstName: 'Dr. Sarah',
				lastName: 'Johnson',
				email: 'sarah@example.com',
				externalId: 'instructor-123',
				isInstructor: true,
				isAdmin: false,
			});
		});

		// 2. Create draft (Step 1: Basic Info)
		const courseId = await t.mutation(createDraft, {
			instructorId: userId,
			title: 'Advanced Dermal Fillers Masterclass',
			description: 'Comprehensive training on advanced dermal filler techniques for medical aesthetics professionals.',
			currentStep: 0,
		});

		// 3. Update draft with thumbnail and pricing (Step 4: Pricing)
		await t.mutation(updateDraft, {
			id: courseId,
			thumbnailUrl: 'https://example.com/course-thumb.jpg',
			price: 299,
			currentStep: 3,
		});

		// 4. Create module (Step 2: Structure)
		const moduleId = await t.mutation(createModule, {
			courseId,
			title: 'Introduction to Dermal Fillers',
			description: 'Foundation concepts and safety',
			order: 0,
		});

		// 5. Create lesson (Step 3: Content)
		await t.mutation(createLesson, {
			moduleId,
			title: 'Facial Anatomy Overview',
			type: 'video',
			isPreview: true,
			order: 0,
			bunnyVideoId: 'test-video-123',
			bunnyPlaybackUrl: 'https://example.b-cdn.net/test-video-123/playlist.m3u8',
			duration: '15:30',
		});

		// 6. Publish course (Step 5: Review)
		await t.mutation(publish, { id: courseId });

		// Verify final state
		const course = await t.run(async ctx => {
			return await ctx.db.get(courseId);
		});

		expect(course!.status).toBe('published');
		expect(course!.title).toBe('Advanced Dermal Fillers Masterclass');
		expect(course!.price).toBe(299);
	});
});
```

### 10.3 E2E Tests

**File**: `tests/e2e/course-wizard.spec.ts` (NEW)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Course Creation Wizard', () => {
	test.beforeEach(async ({ page }) => {
		// Login as instructor
		await page.goto('/sign-in');
		await page.fill('[name="email"]', 'instructor@example.com');
		await page.fill('[name="password"]', 'password123');
		await page.click('button[type="submit"]');

		// Navigate to wizard
		await page.goto('/instructor/courses/wizard');
	});

	test('completes course creation flow', async ({ page }) => {
		// Step 1: Basic Info
		await page.fill('[name="title"]', 'E2E Test Course');
		await page.fill('[name="description"]', 'This is a test course created by automated E2E tests.');
		await page.selectOption('[name="category"]', 'botox');

		// Upload thumbnail
		await page.setInputFiles('[name="thumbnail"]', 'tests/fixtures/course-thumb.jpg');

		// Next step
		await page.click('button:has-text("Next")');

		// Step 2: Structure
		await page.click('button:has-text("Add Module")');
		await page.fill('[name="modules[0].title"]', 'Module 1');
		await page.click('button:has-text("Next")');

		// Step 3: Content
		await page.click('button:has-text("Add Lesson")');
		await page.fill('[name="modules[0].lessons[0].title"]', 'Lesson 1');
		await page.selectOption('[name="modules[0].lessons[0].type"]', 'video');

		// Upload video
		await page.setInputFiles('[name="video"]', 'tests/fixtures/sample-video.mp4');

		// Wait for upload to complete
		await page.waitForSelector('text=Upload complete', { timeout: 60000 });

		await page.click('button:has-text("Next")');

		// Step 4: Pricing
		await page.fill('[name="price"]', '99');
		await page.click('button:has-text("Next")');

		// Step 5: Review & Publish
		await expect(page.locator('text=E2E Test Course')).toBeVisible();
		await expect(page.locator('text=Module 1')).toBeVisible();
		await expect(page.locator('text=Lesson 1')).toBeVisible();

		await page.click('button:has-text("Publish Course")');

		// Verify success
		await expect(page.locator('text=Course published successfully')).toBeVisible();
		await expect(page).toHaveURL('/instructor/dashboard');
	});

	test('saves draft and resumes later', async ({ page }) => {
		// Fill in basic info
		await page.fill('[name="title"]', 'Draft Course');
		await page.fill('[name="description"]', 'This course is saved as a draft.');

		// Save draft
		await page.click('button:has-text("Save Draft")');
		await expect(page.locator('text=Draft saved successfully')).toBeVisible();

		// Navigate away
		await page.goto('/instructor/dashboard');

		// Return to wizard
		await page.goto('/instructor/courses/wizard');

		// Verify draft restored
		await expect(page.locator('[name="title"]')).toHaveValue('Draft Course');
		await expect(page.locator('[name="description"]')).toHaveValue('This course is saved as a draft.');
	});

	test('validates publishing requirements', async ({ page }) => {
		// Try to publish without required fields
		await page.fill('[name="title"]', 'Incomplete Course');

		// Go to review step without filling required fields
		for (let i = 0; i < 4; i++) {
			await page.click('button:has-text("Next")');
		}

		// Try to publish
		await page.click('button:has-text("Publish Course")');

		// Verify error messages
		await expect(page.locator('text=Course must have a thumbnail')).toBeVisible();
		await expect(page.locator('text=Course must have at least one module')).toBeVisible();
	});
});
```

### 10.4 Coverage Requirements

**Minimum Coverage: 100%**

- ✅ All mutations tested
- ✅ All queries tested
- ✅ All validation logic tested
- ✅ All error handling tested
- ✅ All UI components tested
- ✅ E2E flow tested

**Run Coverage:**

```bash
yarn test:coverage
```

---

## 11. Implementation Notes

### 11.1 Code Patterns

**Follow Project Standards:**

- See `.claude/standards/` for all coding standards
- React Hook Form with Controller pattern for forms
- Zod for validation schemas
- Named exports (not default exports)
- Server Components by default
- 'use client' only when needed

**Example: Form Field Pattern**

```typescript
<Controller
  control={control}
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
```

**Example: Convex Mutation Pattern**

```typescript
export const create = mutation({
	args: {
		field1: v.string(),
		field2: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		// 1. Validate auth
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new Error('Unauthorized');

		// 2. Validate data
		if (!args.field1) throw new Error('Field1 is required');

		// 3. Perform operation
		const id = await ctx.db.insert('table', {
			...args,
			createdAt: Date.now(),
		});

		return id;
	},
});
```

### 11.2 File Paths to Modify

**Backend:**

- ✅ `convex/schema.ts` - Add status, currentStep, bunny fields
- ✅ `convex/courses.ts` - Add createDraft, updateDraft, publish, archive
- ✅ `convex/courseModules.ts` - Add create, update, remove, listByCourse
- ✅ `convex/lessons.ts` - Add create, update, remove, listByModule
- 🆕 `lib/bunny-stream.ts` - Bunny.net API client

**Frontend:**

- ✅ `app/instructor/courses/wizard/page.tsx` - Connect mutations
- ✅ `components/course-wizard/basic-info-step.tsx` - Update form
- ✅ `components/course-wizard/structure-step.tsx` - Add module CRUD
- ✅ `components/course-wizard/content-step.tsx` - Add lesson CRUD + video upload
- ✅ `components/course-wizard/pricing-step.tsx` - Update form
- ✅ `components/course-wizard/review-step.tsx` - Add validation display
- 🆕 `components/course-wizard/video-upload.tsx` - Video upload component
- 🆕 `app/courses/[id]/preview/page.tsx` - Preview page

**Environment:**

- ✅ `.env.local` - Add Bunny.net credentials

**Tests:**

- 🆕 `convex/courses.test.ts`
- 🆕 `convex/courseModules.test.ts`
- 🆕 `convex/lessons.test.ts`
- 🆕 `components/course-wizard/basic-info-step.test.tsx`
- 🆕 `components/course-wizard/structure-step.test.tsx`
- 🆕 `tests/integration/course-wizard.test.ts`
- 🆕 `tests/e2e/course-wizard.spec.ts`

### 11.3 Best Practices

**Data Persistence:**

- Auto-save to localStorage every 30 seconds
- Save on page unload
- Clear localStorage on successful server save

**Error Handling:**

- Show loading states for all async operations
- Retry failed mutations with exponential backoff
- Provide clear error messages
- Always have fallback UI

**Performance:**

- Debounce auto-save
- Lazy load video player
- Optimize images (thumbnail)
- Use Suspense for data loading

**Security:**

- Validate on both client and server
- Check instructor role before mutations
- Verify course ownership before updates
- Sanitize user input

**Accessibility:**

- Use semantic HTML
- Provide ARIA labels
- Support keyboard navigation
- Show focus states

---

## 12. Future Enhancements

### 12.1 Course Versioning

**When to Add:** If certification tracking becomes critical

**Implementation:**

- Add `versions` table
- Store full course snapshot on each publish
- Link certificates to specific version
- Show "Completed Version 2.1" on certificates

**Schema:**

```typescript
const courseVersionSchema = {
	courseId: v.id('courses'),
	versionNumber: v.string(), // "1.0", "1.1", etc.
	snapshot: v.any(), // Full course data
	createdAt: v.number(),
};
```

### 12.2 Advanced Free Course Limits

**When to Add:** When implementing instructor subscription tiers

**Implementation:**

- Define tier limits:
  - Free tier: 1 free course, max 500MB
  - Pro tier: Unlimited free courses, max 5GB each
  - Enterprise: Unlimited
- Validate on publish based on instructor tier
- Show tier upgrade prompts

### 12.3 Auto-Save Indicator

**Enhancement:** Show "Saving...", "Saved", "Failed to save" indicator

**Implementation:**

```typescript
const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

// Show indicator in UI
{saveStatus === 'saving' && <Loader2 className="animate-spin" />}
{saveStatus === 'saved' && <Check className="text-green-500" />}
{saveStatus === 'error' && <AlertCircle className="text-red-500" />}
```

### 12.4 Collaborative Editing

**Enhancement:** Multiple instructors can edit the same course

**Implementation:**

- Add `courseCollaborators` table
- Use WebSockets for real-time updates
- Show "User X is editing Module Y" indicators
- Optimistic locking for conflict resolution

### 12.5 Content Templates

**Enhancement:** Pre-built course templates for common formats

**Implementation:**

- Add "Start from template" option
- Templates include structure + sample content
- Examples: "6-Week Bootcamp", "Certification Course", "Webinar Series"

### 12.6 Bulk Upload

**Enhancement:** Upload multiple videos at once

**Implementation:**

- Multi-file upload component
- Batch create lessons from filenames
- Show progress for each upload
- Auto-detect duration from video metadata

---

## Appendix: Database Indexes

**Add these indexes to support new queries:**

```typescript
courses: defineTable(courseSchema)
  .index('by_instructor', ['instructorId'])
  .index('by_status', ['status']) // NEW: Query published courses
  .index('by_instructor_status', ['instructorId', 'status']), // NEW: Instructor's drafts
```

**Query Examples:**

```typescript
// Get all published courses
const published = await ctx.db
	.query('courses')
	.withIndex('by_status', q => q.eq('status', 'published'))
	.collect();

// Get instructor's drafts
const drafts = await ctx.db
	.query('courses')
	.withIndex('by_instructor_status', q => q.eq('instructorId', userId).eq('status', 'draft'))
	.collect();
```

---

## Summary

This specification provides a complete implementation plan for the Course Creation Wizard feature. It includes:

✅ Database schema changes  
✅ Backend mutations for CRUD operations  
✅ Bunny.net Stream integration for video hosting  
✅ Frontend component updates  
✅ Error handling with retry logic and localStorage backup  
✅ Validation rules for drafts and publishing  
✅ Preview functionality  
✅ Student notification system  
✅ Comprehensive testing strategy  
✅ Edge case handling  
✅ Implementation best practices

**Ready for Implementation** 🚀

All code examples follow the project's tech stack (Next.js 16, React 19, Convex, React Hook Form, Zod) and coding standards documented in `.claude/standards/`.
