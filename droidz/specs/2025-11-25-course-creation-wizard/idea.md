# Course Creation Wizard - Complete Implementation

**Date**: 2025-11-25  
**Status**: Requirements Gathering  
**Priority**: High

## Feature Overview

Complete the existing Course Creation Wizard to allow instructors to create and publish courses through a guided 5-step process.

## Current State

**What exists:**
- UI for 5-step wizard (Basic Info, Structure, Content, Pricing, Review)
- Form components for each step
- Progress tracking UI
- React Hook Form integration
- Convex backend with courses, modules, and lessons tables

**What's missing:**
- Backend mutations not connected (commented out)
- Save draft functionality
- Publish functionality
- Course status management (draft/published)
- Data persistence between steps
- Form validation and error handling

## Goal

Enable instructors to:
1. Create a new course through the wizard
2. Save progress as a draft at any step
3. Preview course before publishing
4. Publish course to make it available to students
5. Edit draft courses later

## User Flow

1. Instructor clicks "Create Course"
2. Goes through 5 steps filling in course details
3. Can save draft at any point (data persisted)
4. Can preview course before publishing
5. Publishes course (status changes to "published")
6. Course appears in course catalog

## Technical Requirements

**Backend:**
- Add `status` field to course schema (draft/published/archived)
- Implement course creation mutations
- Implement course update mutations
- Create modules and lessons from wizard data
- Handle course lifecycle (draft → published)

**Frontend:**
- Connect wizard to Convex mutations
- Implement save draft button
- Implement publish button
- Add form validation
- Show loading states
- Handle errors gracefully
- Persist form data between steps

## Success Criteria

- ✅ Instructor can create a course from start to finish
- ✅ Draft courses are saved and can be edited later
- ✅ Published courses appear in the course catalog
- ✅ All form fields are validated
- ✅ Error messages are clear and helpful
- ✅ No data loss between wizard steps

## Related Files

- `app/instructor/courses/wizard/page.tsx` - Main wizard page
- `components/course-wizard/*.tsx` - Wizard step components
- `convex/courses.ts` - Course backend operations
- `convex/courseModules.ts` - Module backend operations
- `convex/lessons.ts` - Lesson backend operations
- `convex/schema.ts` - Database schema

## Notes

- Existing wizard UI is well-designed and just needs backend connection
- Need to decide on video upload strategy (later phase or include now?)
- Quiz builder AI component exists but needs integration
- Consider whether to allow partial course publishing (e.g., publish with no lessons yet)
