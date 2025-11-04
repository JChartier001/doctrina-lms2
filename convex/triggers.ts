import { Triggers } from 'convex-helpers/server/triggers';

import { api } from './_generated/api';
import { DataModel } from './_generated/dataModel';

/**
 * Initialize Triggers system for event-driven architecture
 * Used to automatically trigger side effects when data changes
 */
export const triggers = new Triggers<DataModel>();

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
	// Only trigger when completedAt is newly set (enrollment reaches 100%)
	// Note: convex-helpers uses 'update' operation for patches
	if (change.operation === 'update') {
		const oldEnrollment = change.oldDoc;
		const newEnrollment = change.newDoc;

		// Check if completedAt was just set (wasn't set before, is set now)
		if (newEnrollment?.completedAt && !oldEnrollment?.completedAt) {
			// Fetch required data for certificate generation
			const course = await ctx.db.get(newEnrollment.courseId);
			if (!course) return;

			const user = await ctx.db
				.query('users')
				.withIndex('by_externalId', q => q.eq('externalId', newEnrollment.userId))
				.first();

			const instructor = await ctx.db
				.query('users')
				.withIndex('by_externalId', q => q.eq('externalId', course.instructorId))
				.first();

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
});
