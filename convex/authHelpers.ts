/**
 * Shared Authentication and Authorization Helpers
 *
 * Reusable functions for verifying user identity and permissions
 * across Convex mutations and queries.
 */

import { api } from './_generated/api';
import type { Doc, Id } from './_generated/dataModel';
import type { MutationCtx, QueryCtx } from './_generated/server';

/**
 * Verify that the current user is authenticated and is the instructor for a course
 *
 * This helper encapsulates the common pattern of:
 * 1. Checking authentication
 * 2. Loading the course
 * 3. Verifying the user is the course instructor
 *
 * Used across mutations and queries: quizzes, courseModules, lessons, enrollments, etc.
 *
 * @param ctx - Mutation or Query context
 * @param courseId - Course ID to verify ownership
 * @returns Object containing the user and course documents
 * @throws "Not authenticated" if user not logged in
 * @throws "Course not found" if course doesn't exist
 * @throws "Not authorized" if user is not course instructor
 *
 * @example
 * ```typescript
 * const { user, course } = await verifyInstructorAccess(ctx, args.courseId);
 * ```
 */
export async function verifyInstructorAccess(
	ctx: MutationCtx | QueryCtx,
	courseId: Id<'courses'>,
): Promise<{ user: Doc<'users'>; course: Doc<'courses'> }> {
	// Authentication check
	const identity = await ctx.auth.getUserIdentity();
	if (!identity) {
		throw new Error('Not authenticated');
	}

	// Load course
	const course = await ctx.db.get(courseId);
	if (!course) {
		throw new Error('Course not found');
	}

	// Get user via helper query
	const user: Doc<'users'> | null = await ctx.runQuery(api.users.getByExternalId, {
		externalId: identity.subject,
	});

	// Authorization check
	if (!user || course.instructorId !== user._id) {
		throw new Error('Not authorized');
	}

	return { user, course };
}
