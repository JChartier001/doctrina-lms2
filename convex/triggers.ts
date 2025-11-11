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
 * Generate certificate when enrollment completes
 * Exported for testing purposes
 *
 * @param ctx - Mutation context with database access
 * @param change - Trigger change object with operation, oldDoc, newDoc
 */
export async function generateCertificateOnCompletion(ctx: GenericMutationCtx<DataModel>, change: EnrollmentChange) {
	// Only process updates where completedAt was just set
	if (change.operation === 'update' && change.newDoc?.completedAt && !change.oldDoc?.completedAt) {
		// Fetch required data for certificate generation
		const course = await ctx.db.get(change.newDoc.courseId);
		if (!course) return;

		const user = await ctx.db.get(change.newDoc.userId);
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
