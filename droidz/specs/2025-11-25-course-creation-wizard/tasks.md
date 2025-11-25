# Course Creation Wizard - Implementation Tasks

**Feature**: Complete Course Creation Wizard  
**Spec**: `spec.md`  
**Status**: Ready for Implementation  
**Estimated Timeline**: 2-3 weeks

---

## Task Organization

Tasks are grouped strategically for efficient implementation:
1. **Phase 1: Foundation** - Database, environment setup
2. **Phase 2: Backend** - Convex mutations and queries  
3. **Phase 3: Video Integration** - Bunny.net Stream setup
4. **Phase 4: Frontend** - Wizard UI connection
5. **Phase 5: Polish** - Error handling, validation, preview
6. **Phase 6: Testing** - Comprehensive test coverage
7. **Phase 7: Documentation** - User guides, API docs

---

## Phase 1: Foundation (Setup & Database)

### Task 1.1: Environment Setup for Bunny.net
**Priority**: HIGH | **Complexity**: S | **Dependencies**: None

**Description:**
Set up Bunny.net Stream account and configure environment variables.

**Steps:**
1. Create Bunny.net account at https://bunny.net
2. Create new Stream library
3. Get Library ID and API Key
4. Add environment variables to `.env.local`:
   ```env
   BUNNY_STREAM_LIBRARY_ID=your-library-id
   BUNNY_STREAM_API_KEY=your-api-key
   BUNNY_STREAM_CDN_HOSTNAME=vz-abc123.b-cdn.net
   ```

**Files:**
- `.env.local` (update)
- `.env.example` (update with placeholders)

**Acceptance Criteria:**
- ✅ Bunny.net Stream library created
- ✅ Environment variables configured
- ✅ Can access Bunny.net API with credentials

---

### Task 1.2: Update Database Schema
**Priority**: HIGH | **Complexity**: M | **Dependencies**: None

**Description:**
Add new fields to courses and lessons tables for status tracking and video metadata.

**Steps:**
1. Update `courseSchema` in `convex/schema.ts`:
   - Add `status` field (union type)
   - Add `currentStep` field (number)
   - Add `bunnyLibraryId` field (string)
   - Add `lastUpdatedAt` field (number)
2. Add indexes:
   - `by_status` on `status` field
   - `by_instructor_status` on `[instructorId, status]`
3. Update `lessonSchema`:
   - Add `bunnyVideoId` field
   - Add `bunnyVideoStatus` field
   - Add `bunnyThumbnailUrl` field
   - Add `bunnyPlaybackUrl` field

**Files:**
- `convex/schema.ts`

**Acceptance Criteria:**
- ✅ Schema changes compile without errors
- ✅ Convex dev server restarts successfully
- ✅ New indexes created
- ✅ Existing data still accessible

---

### Task 1.3: Run Database Migration (if needed)
**Priority**: MEDIUM | **Complexity**: S | **Dependencies**: 1.2

**Description:**
If there's existing course data, migrate to add new fields with default values.

**Steps:**
1. Create migration script if needed
2. Set default `status: 'draft'` for existing courses
3. Set default `currentStep: 0` for existing courses
4. Verify migration completed successfully

**Files:**
- `convex/migrations/001_add_course_status.ts` (create if needed)

**Acceptance Criteria:**
- ✅ All existing courses have `status` field
- ✅ No data loss during migration
- ✅ Can query courses by status

---

## Phase 2: Backend Implementation (Convex Mutations)

### Task 2.1: Implement Course Draft Mutations
**Priority**: HIGH | **Complexity**: M | **Dependencies**: 1.2

**Description:**
Create Convex mutations for creating and updating course drafts.

**Steps:**
1. Implement `createDraft` mutation in `convex/courses.ts`:
   - Validate instructor authorization
   - Create course with `status: 'draft'`
   - Set `currentStep` from args
   - Return course ID
2. Implement `updateDraft` mutation:
   - Get existing course
   - Validate status (not archived)
   - Update fields
   - Return course ID

**Files:**
- `convex/courses.ts`

**Code Reference:**
```typescript
export const createDraft = mutation({
  args: {
    instructorId: v.id('users'),
    title: v.string(),
    currentStep: v.number(),
    description: v.optional(v.string()),
    // ... other optional fields
  },
  handler: async (ctx, args) => {
    // Implementation from spec.md
  },
});

export const updateDraft = mutation({
  args: {
    id: v.id('courses'),
    currentStep: v.optional(v.number()),
    // ... optional update fields
  },
  handler: async (ctx, { id, ...updates }) => {
    // Implementation from spec.md
  },
});
```

**Acceptance Criteria:**
- ✅ Can create draft with minimal fields (just title)
- ✅ Can update draft with any fields
- ✅ `currentStep` persists correctly
- ✅ `updatedAt` timestamp updates
- ✅ Throws error if not authorized

---

### Task 2.2: Implement Course Publishing Mutation
**Priority**: HIGH | **Complexity**: L | **Dependencies**: 2.1

**Description:**
Create mutation to publish courses with validation of minimum requirements.

**Steps:**
1. Implement `publish` mutation in `convex/courses.ts`:
   - Validate thumbnail exists
   - Validate pricing set
   - Validate at least 1 module
   - Validate at least 1 lesson
   - Change status to 'published'
   - Update `lastUpdatedAt`
   - Notify enrolled students if updating published course

2. Implement `notifyEnrolledStudents` helper function:
   - Query enrollments for course
   - Create notification for each student
   - Use 'course_update' notification type

**Files:**
- `convex/courses.ts`

**Code Reference:**
```typescript
export const publish = mutation({
  args: { id: v.id('courses') },
  handler: async (ctx, { id }) => {
    const course = await ctx.db.get(id);
    const errors: string[] = [];

    // Validation logic from spec.md
    // ...

    if (errors.length > 0) {
      throw new Error(`Cannot publish course:\n${errors.join('\n')}`);
    }

    await ctx.db.patch(id, {
      status: 'published',
      updatedAt: Date.now(),
      lastUpdatedAt: Date.now(),
    });

    // Notify students if updating
    if (course.status === 'published') {
      await notifyEnrolledStudents(ctx, id, course.title);
    }

    return id;
  },
});
```

**Acceptance Criteria:**
- ✅ Cannot publish without thumbnail
- ✅ Cannot publish without pricing
- ✅ Cannot publish without module
- ✅ Cannot publish without lesson
- ✅ Can publish with all requirements met
- ✅ Students receive notification on update
- ✅ Clear error messages for validation failures

---

### Task 2.3: Implement Course Archive Mutation
**Priority**: MEDIUM | **Complexity**: S | **Dependencies**: 2.1

**Description:**
Create mutation to archive courses (no new purchases, existing students keep access).

**Steps:**
1. Implement `archive` mutation in `convex/courses.ts`:
   - Change status to 'archived'
   - Update `updatedAt`

**Files:**
- `convex/courses.ts`

**Acceptance Criteria:**
- ✅ Course status changes to 'archived'
- ✅ Archived courses don't appear in catalog
- ✅ Enrolled students can still access course

---

### Task 2.4: Update Module CRUD Operations
**Priority**: HIGH | **Complexity**: M | **Dependencies**: 1.2

**Description:**
Ensure module create/update/delete mutations work correctly with wizard flow.

**Steps:**
1. Verify existing `create`, `update`, `remove` mutations in `convex/courseModules.ts`
2. Add `listByCourse` query if not exists
3. Ensure cascade delete works (deleting module deletes lessons)

**Files:**
- `convex/courseModules.ts`

**Acceptance Criteria:**
- ✅ Can create module with title, description, order
- ✅ Can update module fields
- ✅ Deleting module deletes all its lessons
- ✅ Can list modules by course ID, sorted by order

---

### Task 2.5: Update Lesson CRUD Operations
**Priority**: HIGH | **Complexity**: M | **Dependencies**: 1.2, 2.4

**Description:**
Update lesson mutations to support Bunny.net video metadata.

**Steps:**
1. Update `create` mutation in `convex/lessons.ts`:
   - Add Bunny.net video fields to args
   - Store video metadata
2. Update `update` mutation:
   - Allow updating video metadata fields
3. Add `listByModule` query if not exists

**Files:**
- `convex/lessons.ts`

**Acceptance Criteria:**
- ✅ Can create lesson with video metadata
- ✅ Can update lesson video fields
- ✅ Can delete lesson
- ✅ Can list lessons by module ID, sorted by order

---

## Phase 3: Video Integration (Bunny.net Stream)

### Task 3.1: Create Bunny.net API Client
**Priority**: HIGH | **Complexity**: M | **Dependencies**: 1.1

**Description:**
Create utility functions for interacting with Bunny.net Stream API.

**Steps:**
1. Create `lib/bunny-stream.ts` with functions:
   - `createBunnyVideo(title)` - Create video placeholder
   - `uploadBunnyVideo(videoGuid, file)` - Upload video file
   - `getBunnyVideo(videoGuid)` - Get video status/metadata
   - `getBunnyPlaybackUrl(videoGuid)` - Get HLS playlist URL
   - `getBunnyThumbnailUrl(videoGuid)` - Get thumbnail URL

**Files:**
- `lib/bunny-stream.ts` (create)

**Code Reference:**
```typescript
const BUNNY_API_BASE = 'https://video.bunnycdn.com';
const BUNNY_LIBRARY_ID = process.env.BUNNY_STREAM_LIBRARY_ID!;
const BUNNY_API_KEY = process.env.BUNNY_STREAM_API_KEY!;

export interface BunnyVideoResponse {
  guid: string;
  status: number; // 0=queued, 1=processing, 2=encoding, 3=finished, 4=failed
  thumbnailUrl: string;
  length: number;
  // ... other fields
}

export async function createBunnyVideo(title: string): Promise<string> {
  // Implementation from spec.md
}

export async function uploadBunnyVideo(
  videoGuid: string,
  videoFile: File
): Promise<void> {
  // Implementation from spec.md
}

// ... other functions
```

**Acceptance Criteria:**
- ✅ Can create video in Bunny.net
- ✅ Can upload video file
- ✅ Can get video status
- ✅ Can get playback URL
- ✅ Proper error handling for API failures

---

### Task 3.2: Create Video Upload Component
**Priority**: HIGH | **Complexity**: L | **Dependencies**: 3.1

**Description:**
Create React component for uploading videos to Bunny.net with progress tracking.

**Steps:**
1. Create `components/course-wizard/video-upload.tsx`:
   - File input for video selection
   - Upload progress bar
   - Processing status indicator
   - Poll for encoding completion
   - Return metadata to parent on complete
2. Support states: idle, uploading, processing, complete, error
3. Show retry button on error

**Files:**
- `components/course-wizard/video-upload.tsx` (create)

**Code Reference:**
```typescript
'use client';

export function VideoUpload({ 
  lessonId, 
  onUploadComplete 
}: VideoUploadProps) {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'complete' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // 1. Create video in Bunny.net
    // 2. Upload file
    // 3. Poll for encoding
    // 4. Return metadata
  };

  // UI for each state
}
```

**Acceptance Criteria:**
- ✅ Can select video file
- ✅ Shows upload progress
- ✅ Shows processing status
- ✅ Polls until encoding complete
- ✅ Returns metadata on success
- ✅ Shows error message on failure
- ✅ Can retry on failure

---

### Task 3.3: Integrate Video Upload into Content Step
**Priority**: HIGH | **Complexity**: M | **Dependencies**: 3.2

**Description:**
Add video upload component to Content Step for video lessons.

**Steps:**
1. Update `components/course-wizard/content-step.tsx`:
   - Add `VideoUpload` component for video lessons
   - Handle upload completion
   - Update lesson with video metadata via mutation
2. Show video thumbnail after upload
3. Allow re-upload if needed

**Files:**
- `components/course-wizard/content-step.tsx`

**Acceptance Criteria:**
- ✅ Video upload shows for video lessons
- ✅ Upload completes successfully
- ✅ Lesson updates with video metadata
- ✅ Can re-upload video
- ✅ Thumbnail displays after upload

---

## Phase 4: Frontend Implementation (Wizard UI)

### Task 4.1: Connect Wizard Page to Backend
**Priority**: HIGH | **Complexity**: L | **Dependencies**: 2.1, 2.2

**Description:**
Update wizard page to use Convex mutations instead of commented-out code.

**Steps:**
1. Update `app/instructor/courses/wizard/page.tsx`:
   - Import Convex hooks (`useMutation`, `useQuery`)
   - Replace commented mutations with actual calls
   - Handle courseId from URL params (for editing)
   - Load existing course data if editing
   - Implement save draft handler
   - Implement publish handler

**Files:**
- `app/instructor/courses/wizard/page.tsx`

**Code Reference:**
```typescript
'use client';

import { useMutation, useQuery } from 'convex/react';
import { useSearchParams } from 'next/navigation';

export default function CourseWizard() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get('id') as Id<'courses'> | null;

  const createDraft = useMutation(api.courses.createDraft);
  const updateDraft = useMutation(api.courses.updateDraft);
  const publishCourse = useMutation(api.courses.publish);
  const existingCourse = useQuery(
    api.courses.get,
    courseId ? { id: courseId } : 'skip'
  );

  // Load existing course data
  useEffect(() => {
    if (existingCourse) {
      form.reset({/* map fields */});
      setCurrentStep(existingCourse.currentStep || 0);
    }
  }, [existingCourse]);

  const handleSaveDraft = async (data: CreateCourseWizardType) => {
    // Implementation
  };

  const handlePublish = async () => {
    // Implementation
  };

  // ... rest of component
}
```

**Acceptance Criteria:**
- ✅ Can create new draft course
- ✅ Can update existing draft
- ✅ Can load existing course for editing
- ✅ `currentStep` saves and restores correctly
- ✅ Can navigate between steps
- ✅ Form data persists between steps

---

### Task 4.2: Implement Save Draft with Retry Logic
**Priority**: HIGH | **Complexity**: M | **Dependencies**: 4.1

**Description:**
Add retry logic with exponential backoff for save draft operation.

**Steps:**
1. In `app/instructor/courses/wizard/page.tsx`:
   - Create `saveDraftWithRetry` function
   - Implement exponential backoff (1s, 2s, 4s)
   - Track retry attempt number
   - Show retry count in UI
2. Update save draft handler to use retry function

**Files:**
- `app/instructor/courses/wizard/page.tsx`

**Code Reference:**
```typescript
const MAX_RETRY_ATTEMPTS = 3;
const [retryAttempt, setRetryAttempt] = useState(0);

const saveDraftWithRetry = async (
  data: CreateCourseWizardType,
  attempt = 1
): Promise<Id<'courses'>> => {
  try {
    setRetryAttempt(attempt);

    if (courseId) {
      await updateDraft({/* ... */});
      return courseId;
    } else {
      const newCourseId = await createDraft({/* ... */});
      router.replace(`/instructor/courses/wizard?id=${newCourseId}`);
      return newCourseId;
    }
  } catch (error) {
    if (attempt < MAX_RETRY_ATTEMPTS) {
      await new Promise(resolve => 
        setTimeout(resolve, 1000 * Math.pow(2, attempt))
      );
      return saveDraftWithRetry(data, attempt + 1);
    }
    throw error;
  }
};
```

**Acceptance Criteria:**
- ✅ Retries up to 3 times on failure
- ✅ Uses exponential backoff (1s, 2s, 4s)
- ✅ Shows retry count in UI: "Saving... (Retry 2/3)"
- ✅ Throws error after 3 failed attempts
- ✅ Resets retry count on success

---

### Task 4.3: Implement localStorage Backup
**Priority**: MEDIUM | **Complexity**: M | **Dependencies**: 4.2

**Description:**
Save form data to localStorage as backup if save fails or browser closes.

**Steps:**
1. In `app/instructor/courses/wizard/page.tsx`:
   - Auto-save to localStorage every 30s (debounced)
   - Save to localStorage on page unload
   - Save to localStorage if all retries fail
   - Restore from localStorage on page load
   - Clear localStorage on successful save
2. Show restore prompt if backup detected

**Files:**
- `app/instructor/courses/wizard/page.tsx`

**Code Reference:**
```typescript
const STORAGE_KEY = 'course-wizard-backup';

// Auto-save every 30s
const debouncedSave = useMemo(
  () => debounce((data: CreateCourseWizardType) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      formData: data,
      currentStep,
      timestamp: Date.now(),
    }));
  }, 30000),
  [currentStep]
);

// Watch form changes
useEffect(() => {
  const subscription = form.watch(data => debouncedSave(data));
  return () => subscription.unsubscribe();
}, [form, debouncedSave]);

// Save on page unload
useEffect(() => {
  const handleUnload = () => {
    const data = form.getValues();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({/* ... */}));
  };
  window.addEventListener('beforeunload', handleUnload);
  return () => window.removeEventListener('beforeunload', handleUnload);
}, [form, currentStep]);

// Restore on load
useEffect(() => {
  const backup = localStorage.getItem(STORAGE_KEY);
  if (backup) {
    const { formData, timestamp } = JSON.parse(backup);
    if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
      // Show restore prompt
    }
  }
}, []);
```

**Acceptance Criteria:**
- ✅ Auto-saves to localStorage every 30s
- ✅ Saves on page unload
- ✅ Saves if all save retries fail
- ✅ Restores on page load (if < 24h old)
- ✅ Shows restore/discard prompt
- ✅ Clears localStorage on successful save

---

### Task 4.4: Update Wizard Step Components
**Priority**: MEDIUM | **Complexity**: M | **Dependencies**: 4.1

**Description:**
Update all 5 wizard step components to work with connected backend.

**Steps:**
1. Ensure all step components use React Hook Form context
2. Update field names to match database schema
3. Add proper TypeScript types
4. Update validation rules

**Files:**
- `components/course-wizard/basic-info-step.tsx`
- `components/course-wizard/structure-step.tsx`
- `components/course-wizard/content-step.tsx`
- `components/course-wizard/pricing-step.tsx`
- `components/course-wizard/review-step.tsx`

**Acceptance Criteria:**
- ✅ All steps use FormProvider context
- ✅ Field names match database schema
- ✅ TypeScript types correct
- ✅ Validation rules match spec
- ✅ No console errors or warnings

---

### Task 4.5: Add Loading States and Feedback
**Priority**: MEDIUM | **Complexity**: S | **Dependencies**: 4.1

**Description:**
Add loading indicators and user feedback throughout wizard.

**Steps:**
1. Add loading state during save
2. Add loading state during publish
3. Show success/error toasts
4. Disable buttons while loading
5. Show progress indicators

**Files:**
- `app/instructor/courses/wizard/page.tsx`

**Acceptance Criteria:**
- ✅ Save button shows "Saving..."
- ✅ Publish button shows "Publishing..."
- ✅ Buttons disabled while loading
- ✅ Success toast on save
- ✅ Error toast on failure
- ✅ Clear error messages

---

## Phase 5: Polish (Validation & Preview)

### Task 5.1: Implement Publishing Validation UI
**Priority**: HIGH | **Complexity**: M | **Dependencies**: 2.2, 4.1

**Description:**
Show validation errors clearly when trying to publish incomplete course.

**Steps:**
1. Catch publish error in wizard page
2. Parse error message (list of requirements)
3. Display errors in toast with list format
4. Highlight missing steps in wizard

**Files:**
- `app/instructor/courses/wizard/page.tsx`

**Code Reference:**
```typescript
const handlePublish = async () => {
  try {
    await publishCourse({ id: courseId });
    toast.success('Course published!');
    router.push('/instructor/dashboard');
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to publish';
    
    // Parse and display validation errors
    const errors = errorMessage.split('\n').filter(e => e.startsWith('•'));
    
    toast.error(
      <div>
        <p>Cannot publish course:</p>
        <ul>{errors.map(e => <li key={e}>{e}</li>)}</ul>
      </div>,
      { autoClose: false }
    );
  }
};
```

**Acceptance Criteria:**
- ✅ Shows clear error list when publish fails
- ✅ Errors indicate which requirements missing
- ✅ Toast stays open until dismissed
- ✅ Can navigate to fix issues

---

### Task 5.2: Create Course Preview Page
**Priority**: MEDIUM | **Complexity**: M | **Dependencies**: 2.1

**Description:**
Create preview page showing course landing page as students will see it.

**Steps:**
1. Create `app/courses/[id]/preview/page.tsx`:
   - Fetch course with `getWithCurriculum`
   - Show preview banner at top
   - Reuse course landing page components
   - Disable/hide purchase button
2. Add authentication check (instructors only for drafts)

**Files:**
- `app/courses/[id]/preview/page.tsx` (create)

**Code Reference:**
```typescript
import { fetchQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';

export default async function CoursePreviewPage({
  params,
}: {
  params: { id: string };
}) {
  const courseId = params.id as Id<'courses'>;
  const course = await fetchQuery(
    api.courses.getWithCurriculum, 
    { courseId }
  );

  if (!course) {
    notFound();
  }

  return (
    <div>
      {/* Preview banner */}
      <div className="bg-yellow-100 p-4 text-center">
        <p>Preview Mode - This is how students will see your course</p>
      </div>

      {/* Course landing page */}
      <CourseLandingPage course={course} preview={true} />
    </div>
  );
}
```

**Acceptance Criteria:**
- ✅ Preview shows course landing page
- ✅ Preview banner displays at top
- ✅ Purchase button hidden/disabled
- ✅ Can preview draft courses (instructor auth)
- ✅ Published courses preview same as public view

---

### Task 5.3: Implement Preview Button
**Priority**: MEDIUM | **Complexity**: S | **Dependencies**: 5.2, 4.1

**Description:**
Connect preview button in wizard to open preview page.

**Steps:**
1. In wizard page, implement `handlePreview`:
   - Check courseId exists
   - Open preview in new tab: `/courses/${courseId}/preview`
2. Add preview button to all steps (not just review)

**Files:**
- `app/instructor/courses/wizard/page.tsx`

**Acceptance Criteria:**
- ✅ Preview button available at all steps
- ✅ Opens preview in new tab
- ✅ Shows error if course not saved yet
- ✅ Preview loads correct course

---

### Task 5.4: Add Form Validation Rules
**Priority**: MEDIUM | **Complexity**: M | **Dependencies**: 4.4

**Description:**
Add Zod validation schemas matching publish requirements.

**Steps:**
1. Update `schema/CourseWizardSchema.ts`:
   - Title: 10-100 characters
   - Description: 50-1000 characters
   - Price: >= 0
   - Thumbnail: required URL
2. Show validation errors after submit attempt

**Files:**
- `schema/CourseWizardSchema.ts`

**Acceptance Criteria:**
- ✅ Title validates length
- ✅ Description validates length
- ✅ Price validates >= 0
- ✅ Errors show after submit
- ✅ Inline errors below fields

---

## Phase 6: Testing (Comprehensive Coverage)

### Task 6.1: Write Unit Tests for Course Mutations
**Priority**: HIGH | **Complexity**: M | **Dependencies**: 2.1, 2.2, 2.3

**Description:**
Test all course CRUD mutations with convex-test.

**Steps:**
1. Create `convex/courses.test.ts`:
   - Test `createDraft` creates course with draft status
   - Test `updateDraft` updates fields
   - Test `publish` validates requirements
   - Test `publish` succeeds with valid course
   - Test `archive` changes status

**Files:**
- `convex/courses.test.ts` (create)

**Code Reference:**
```typescript
import { convexTest } from 'convex-test';
import { expect, test, describe } from 'vitest';
import schema from './schema';
import { createDraft, updateDraft, publish, archive } from './courses';

describe('Course mutations', () => {
  test('createDraft creates course with draft status', async () => {
    const t = convexTest(schema);
    // Create user, create draft, verify
  });

  test('publish validates requirements', async () => {
    // Try to publish incomplete course, expect error
  });

  // ... more tests
});
```

**Acceptance Criteria:**
- ✅ All mutations have test coverage
- ✅ Tests pass consistently
- ✅ Edge cases tested
- ✅ Error cases tested

---

### Task 6.2: Write Unit Tests for Module/Lesson Mutations
**Priority**: MEDIUM | **Complexity**: M | **Dependencies**: 2.4, 2.5

**Description:**
Test module and lesson CRUD operations.

**Steps:**
1. Create `convex/courseModules.test.ts`
2. Create `convex/lessons.test.ts`
3. Test create, update, delete, list operations
4. Test cascade delete (module deletes lessons)

**Files:**
- `convex/courseModules.test.ts` (create)
- `convex/lessons.test.ts` (create)

**Acceptance Criteria:**
- ✅ All CRUD operations tested
- ✅ Cascade delete works
- ✅ List queries return sorted results
- ✅ Tests pass consistently

---

### Task 6.3: Write Integration Tests for Wizard Flow
**Priority**: HIGH | **Complexity**: L | **Dependencies**: 2.1, 2.2, 2.4, 2.5

**Description:**
Test complete course creation flow from start to finish.

**Steps:**
1. Create `tests/integration/course-wizard.test.ts`:
   - Test: Create draft → Add modules → Add lessons → Publish
   - Test: Save draft at each step, resume later
   - Test: Edit published course
   - Test: Validation prevents incomplete publish

**Files:**
- `tests/integration/course-wizard.test.ts` (create)

**Code Reference:**
```typescript
describe('Course creation wizard flow', () => {
  it('completes full course creation', async () => {
    // 1. Create instructor
    // 2. Create draft (Step 1)
    // 3. Add thumbnail/pricing (Step 4)
    // 4. Create module (Step 2)
    // 5. Create lesson (Step 3)
    // 6. Publish course
    // 7. Verify course is published
  });

  it('saves and resumes draft', async () => {
    // Create draft at step 2
    // Load draft
    // Verify currentStep === 2
  });
});
```

**Acceptance Criteria:**
- ✅ Full wizard flow test passes
- ✅ Draft save/resume test passes
- ✅ All integration tests pass
- ✅ Tests use realistic data

---

### Task 6.4: Write Component Tests for Wizard
**Priority**: MEDIUM | **Complexity**: M | **Dependencies**: 4.1, 4.4

**Description:**
Test wizard React components with Testing Library.

**Steps:**
1. Create tests for each step component:
   - `components/course-wizard/basic-info-step.test.tsx`
   - `components/course-wizard/structure-step.test.tsx`
   - `components/course-wizard/content-step.test.tsx`
   - `components/course-wizard/pricing-step.test.tsx`
   - `components/course-wizard/review-step.test.tsx`
2. Test form validation
3. Test user interactions
4. Mock Convex hooks

**Files:**
- `components/course-wizard/*.test.tsx` (create multiple)

**Acceptance Criteria:**
- ✅ All step components have tests
- ✅ Form validation tested
- ✅ User interactions tested
- ✅ Convex hooks mocked correctly

---

### Task 6.5: Write Component Test for Video Upload
**Priority**: MEDIUM | **Complexity**: M | **Dependencies**: 3.2

**Description:**
Test video upload component with mocked Bunny.net API.

**Steps:**
1. Create `components/course-wizard/video-upload.test.tsx`:
   - Test file selection
   - Test upload progress
   - Test processing status
   - Test success state
   - Test error handling
   - Mock Bunny.net API calls

**Files:**
- `components/course-wizard/video-upload.test.tsx` (create)

**Acceptance Criteria:**
- ✅ File selection works
- ✅ Upload progress displays
- ✅ Processing status shows
- ✅ Success callback fires
- ✅ Error handling works
- ✅ Retry button works

---

### Task 6.6: Write E2E Test for Complete Flow
**Priority**: LOW | **Complexity**: L | **Dependencies**: 4.1, 3.2, 5.2

**Description:**
Write end-to-end test simulating real instructor flow (optional, use Playwright).

**Steps:**
1. Create `tests/e2e/course-wizard.spec.ts`:
   - Navigate to wizard
   - Fill in all 5 steps
   - Upload video (use mock file)
   - Publish course
   - Verify course appears in dashboard

**Files:**
- `tests/e2e/course-wizard.spec.ts` (create)

**Acceptance Criteria:**
- ✅ Can complete full wizard in browser
- ✅ Video upload works with mock
- ✅ Course publishes successfully
- ✅ Test runs in CI/CD

---

## Phase 7: Documentation & Cleanup

### Task 7.1: Update README with Video Setup
**Priority**: MEDIUM | **Complexity**: S | **Dependencies**: 3.1

**Description:**
Document Bunny.net Stream setup in project README.

**Steps:**
1. Update `README.md`:
   - Add Bunny.net setup section
   - Document environment variables
   - Add video upload flow diagram
   - Link to Bunny.net docs

**Files:**
- `README.md`

**Acceptance Criteria:**
- ✅ Bunny.net setup documented
- ✅ Environment variables listed
- ✅ Clear setup instructions
- ✅ Links to relevant docs

---

### Task 7.2: Create API Documentation
**Priority**: LOW | **Complexity**: S | **Dependencies**: 2.1-2.5

**Description:**
Document all new Convex mutations and queries.

**Steps:**
1. Create `docs/api/courses.md`:
   - Document all course mutations
   - Document module mutations
   - Document lesson mutations
   - Include code examples
   - Document error responses

**Files:**
- `docs/api/courses.md` (create)

**Acceptance Criteria:**
- ✅ All mutations documented
- ✅ Code examples included
- ✅ Error responses documented
- ✅ Easy to understand

---

### Task 7.3: Update CLAUDE.md Development Guide
**Priority**: MEDIUM | **Complexity**: S | **Dependencies**: All

**Description:**
Update development guide with course wizard patterns.

**Steps:**
1. Update `CLAUDE.md`:
   - Add course wizard example
   - Document Bunny.net integration pattern
   - Add retry logic pattern
   - Add localStorage backup pattern

**Files:**
- `CLAUDE.md`

**Acceptance Criteria:**
- ✅ Wizard example added
- ✅ Bunny.net pattern documented
- ✅ Retry logic documented
- ✅ Backup pattern documented

---

### Task 7.4: Clean Up Console Logs and TODOs
**Priority**: LOW | **Complexity**: S | **Dependencies**: All

**Description:**
Remove debug console.logs and TODO comments.

**Steps:**
1. Search codebase for `console.log`
2. Remove or replace with proper logging
3. Search for `TODO` comments
4. Remove resolved TODOs
5. Create GitHub issues for remaining TODOs

**Files:**
- Multiple

**Acceptance Criteria:**
- ✅ No console.logs in production code
- ✅ All TODOs addressed or tracked
- ✅ Clean commit history

---

### Task 7.5: Run Full Verification Suite
**Priority**: HIGH | **Complexity**: S | **Dependencies**: All

**Description:**
Run all quality checks before marking feature complete.

**Steps:**
1. Run `yarn verify` (format + lint + typecheck + test)
2. Run E2E tests if implemented
3. Manual QA test full wizard flow
4. Check test coverage (aim for 100%)
5. Fix any failures

**Files:**
- All

**Acceptance Criteria:**
- ✅ `yarn verify` passes (0 warnings)
- ✅ All tests pass
- ✅ Coverage >= 90%
- ✅ Manual QA passes
- ✅ No TypeScript errors

---

## Implementation Strategy

### Recommended Order:

**Week 1: Foundation & Backend**
1. Day 1-2: Tasks 1.1 - 1.3 (Setup & Schema)
2. Day 3-4: Tasks 2.1 - 2.3 (Course mutations)
3. Day 5: Tasks 2.4 - 2.5 (Module/Lesson mutations)

**Week 2: Video & Frontend**
1. Day 1-2: Tasks 3.1 - 3.3 (Bunny.net integration)
2. Day 3-4: Tasks 4.1 - 4.3 (Wizard connection + retry)
3. Day 5: Tasks 4.4 - 4.5 (Step components + loading)

**Week 3: Polish & Testing**
1. Day 1: Tasks 5.1 - 5.4 (Validation & preview)
2. Day 2-3: Tasks 6.1 - 6.3 (Backend tests)
3. Day 4: Tasks 6.4 - 6.6 (Frontend tests)
4. Day 5: Tasks 7.1 - 7.5 (Documentation & verification)

### Parallel Work Opportunities:
- Task 3.1 can be done in parallel with 2.4-2.5
- Task 6.1-6.2 can start once 2.1-2.5 are done
- Task 7.1-7.3 can be written incrementally

### Critical Path:
```
1.2 → 2.1 → 2.2 → 4.1 → 4.2 → 5.1 → 6.3 → 7.5
   (Schema → Mutations → Wizard → Tests → Verify)
```

---

## Risk Mitigation

### High-Risk Areas:

1. **Video Upload Reliability**
   - Mitigation: Implement robust retry logic, show clear progress
   - Test with various file sizes and formats
   
2. **Data Loss on Connection Failure**
   - Mitigation: localStorage backup, auto-save every 30s
   - Test with network throttling
   
3. **Publishing Validation Complexity**
   - Mitigation: Clear error messages, step highlighting
   - Test all edge cases

4. **Video Encoding Timeout**
   - Mitigation: Poll with timeout, show processing status
   - Add manual retry option

---

## Success Metrics

- ✅ Instructors can create courses start-to-finish
- ✅ Zero data loss reported
- ✅ Video uploads succeed 99%+ of time
- ✅ Average wizard completion time < 20 minutes
- ✅ Zero ESLint warnings
- ✅ 100% test coverage on critical paths
- ✅ All existing tests continue passing

---

**Ready to implement? Start with Phase 1!** 🚀
