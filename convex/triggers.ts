import type { GenericMutationCtx } from 'convex/server';
import { Triggers } from 'convex-helpers/server/triggers';

import { api } from './_generated/api';
import type { DataModel, Doc, Id } from './_generated/dataModel';

/**
 * Initialize Triggers system for event-driven architecture
 * Used to automatically trigger side effects when data changes
 */
export const triggers = new Triggers<DataModel>();

/**
 * Type for trigger change events
 * Based on convex-helpers trigger callback signature
 * Note: oldDoc/newDoc can be null (not just undefined) depending on operation
 */
export type EnrollmentChange = {
	operation: 'insert' | 'update' | 'delete';
	id: Id<'enrollments'>;
	oldDoc?: Doc<'enrollments'> | null;
	newDoc?: Doc<'enrollments'> | null;
};

/**
 * Handle enrollment completion and generate certificate
 * Internal function - use handleEnrollmentChange for operation filtering
 *
 * @param ctx - Mutation context with database access
 * @param oldEnrollment - Enrollment before update (or undefined/null)
 * @param newEnrollment - Enrollment after update (or undefined/null)
 */
export async function handleEnrollmentCompletion(
	ctx: GenericMutationCtx<DataModel>,
	oldEnrollment: Doc<'enrollments'> | undefined | null,
	newEnrollment: Doc<'enrollments'> | undefined | null,
) {
	// Check if completedAt was just set (wasn't set before, is set now)
	// Note: ?. handles both undefined and null
	if (newEnrollment?.completedAt && !oldEnrollment?.completedAt) {
		// Fetch required data for certificate generation
		const course = await ctx.db.get(newEnrollment.courseId);
		if (!course) return;

		const user = await ctx.db
			.query('users')
			.withIndex('by_externalId', q => q.eq('externalId', newEnrollment.userId))
			.first();

		// Instructor ID is already a Convex Id<'users'>, not externalId
		const instructor = await ctx.db.get(course.instructorId);

		// Generate certificate directly (runs in same transaction)
		if (user && instructor) {
			await ctx.runMutation(api.certificates.generate, {
				userId: user._id,
				userName: `${user.firstName} ${user.lastName}`,
				courseId: course._id,
				courseName: course.title,
				instructorId: instructor._id,
				instructorName: `${instructor.firstName} ${instructor.lastName}`,
				templateId: 'default',
			});
		}
	}
}

/**
 * Handle enrollment database change with operation filtering
 * Testable wrapper that includes the operation type check
 *
 * @param ctx - Mutation context with database access
 * @param change - Trigger change object with operation, oldDoc, newDoc
 * @returns true if handler was executed, false if filtered out
 */
export async function handleEnrollmentChange(
	ctx: GenericMutationCtx<DataModel>,
	change: EnrollmentChange,
): Promise<boolean> {
	// Only process 'update' operations (not 'insert', 'delete', etc.)
	if (change.operation !== 'update') {
		return false;
	}

	await handleEnrollmentCompletion(ctx, change.oldDoc, change.newDoc);
	return true;
}

/**
 * Certificate Generation Trigger
 * Automatically generates certificate when enrollment reaches 100% completion
 *
 * This trigger fires when enrollment.completedAt is set (indicating 100% course completion).
 * It handles all certificate orchestration logic that was previously inline in
 * lessonProgress.recalculateProgress mutation (refactored for separation of concerns).
 *
 * @see convex/certificates.ts - Certificate generation implementation
 * @see convex/lessonProgress.ts - Progress tracking that triggers this
 */
triggers.register('enrollments', async (ctx, change) => {
	await handleEnrollmentChange(ctx, change);
});
