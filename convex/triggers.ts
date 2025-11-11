import type { GenericMutationCtx } from 'convex/server';
import { customCtx, customMutation } from 'convex-helpers/server/customFunctions';
import { Triggers } from 'convex-helpers/server/triggers';

import { api } from './_generated/api';
import type { DataModel, Doc, Id } from './_generated/dataModel';
import { mutation as rawMutation } from './_generated/server';

/**
 * Initialize Triggers system for event-driven architecture
 * Used to automatically trigger side effects when data changes
 */
const triggers = new Triggers<DataModel>();

/**
 * Type for trigger change events
 * Based on convex-helpers trigger callback signature
 */
export type EnrollmentChange = {
	operation: 'insert' | 'update' | 'delete';
	id: Id<'enrollments'>;
	oldDoc?: Doc<'enrollments'> | null;
	newDoc?: Doc<'enrollments'> | null;
};

/**
 * Handler for enrollment change events
 * Exported for testing purposes
 *
 * @param ctx - Mutation context with database access
 * @param change - Trigger change object with operation, id, oldDoc, newDoc
 * @returns true if handler executed, false if skipped
 */
export async function handleEnrollmentChange(
	ctx: GenericMutationCtx<DataModel>,
	change: EnrollmentChange,
): Promise<boolean> {
	// Only process update operations
	if (change.operation !== 'update') {
		return false;
	}

	// Check if completedAt was just set (enrollment completion)
	if (change.newDoc?.completedAt && !change.oldDoc?.completedAt) {
		await handleEnrollmentCompletion(ctx, change.oldDoc, change.newDoc);
		return true;
	}

	return false;
}

/**
 * Handler for enrollment completion events
 * Generates certificate when enrollment reaches 100% completion
 * Exported for testing purposes
 *
 * @param ctx - Mutation context with database access
 * @param oldDoc - Previous enrollment state (may be undefined on insert)
 * @param newDoc - New enrollment state
 */
export async function handleEnrollmentCompletion(
	ctx: GenericMutationCtx<DataModel>,
	oldDoc: Doc<'enrollments'> | undefined | null,
	newDoc: Doc<'enrollments'>,
): Promise<void> {
	// Only proceed if completedAt was just set (wasn't set before)
	if (!newDoc.completedAt || oldDoc?.completedAt) {
		return;
	}

	// Fetch required data for certificate generation
	const course = await ctx.db.get(newDoc.courseId);
	if (!course) return;

	const user = await ctx.db.get(newDoc.userId);
	if (!user) return;

	const instructor = await ctx.db.get(course.instructorId);
	if (!instructor) return;

	// Generate certificate directly (runs in same transaction)
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

/**
 * Generate certificate when enrollment completes
 * Used by the trigger system (wrapper around handleEnrollmentChange)
 *
 * @param ctx - Mutation context with database access
 * @param change - Trigger change object with operation, oldDoc, newDoc
 */
export async function generateCertificateOnCompletion(ctx: GenericMutationCtx<DataModel>, change: EnrollmentChange) {
	await handleEnrollmentChange(ctx, change);
}

/**
 * Certificate Generation Trigger
 * Automatically generates certificate when enrollment reaches 100% completion
 *
 * This trigger fires when enrollment.completedAt is set (indicating 100% course completion).
 *
 * @see convex/certificates.ts - Certificate generation implementation
 * @see convex/lessonProgress.ts - Progress tracking that triggers this
 */
triggers.register('enrollments', generateCertificateOnCompletion);

/**
 * Custom mutation wrapper with triggers enabled
 * Use this instead of raw mutation from _generated/server
 *
 * All ctx.db operations automatically fire registered triggers
 */
export const mutation = customMutation(rawMutation, customCtx(triggers.wrapDB));
