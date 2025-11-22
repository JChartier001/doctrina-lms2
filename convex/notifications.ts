import { v } from 'convex/values';

import { mutation, query } from './_generated/server';

/**
 * List all notifications for the authenticated user
 * Returns notifications ordered by creation date (newest first)
 */
export const listForUser = query({
	args: { userId: v.id('users') },
	handler: async (ctx, { userId }) => {
		// TODO: Add authentication check in production
		// const identity = await ctx.auth.getUserIdentity();
		// if (!identity) throw new Error('Unauthorized');
		// TODO: Verify userId matches the authenticated user

		return await ctx.db
			.query('notifications')
			.withIndex('by_user_created', q => q.eq('userId', userId))
			.order('desc')
			.collect();
	},
});

/**
 * Mark a single notification as read
 */
export const markAsRead = mutation({
	args: { id: v.id('notifications') },
	handler: async (ctx, { id }) => {
		// TODO: Add authentication check in production
		// const identity = await ctx.auth.getUserIdentity();
		// if (!identity) throw new Error('Unauthorized: Must be logged in');

		// Get the notification to verify ownership
		const notification = await ctx.db.get(id);
		if (!notification) {
			throw new Error('Notification not found');
		}

		// TODO: Authorization check - verify the notification belongs to the user
		// In production, get user ID from identity and compare with notification.userId

		await ctx.db.patch(id, { read: true });
		return id;
	},
});

/**
 * Mark all notifications as read for the authenticated user
 */
export const markAllAsRead = mutation({
	args: { userId: v.id('users') },
	handler: async (ctx, { userId }) => {
		// TODO: Add authentication check in production
		// const identity = await ctx.auth.getUserIdentity();
		// if (!identity) throw new Error('Unauthorized: Must be logged in');
		// TODO: Verify userId matches the authenticated user

		// Get all unread notifications for the user
		const unreadItems = await ctx.db
			.query('notifications')
			.withIndex('by_user_read', q => q.eq('userId', userId).eq('read', false))
			.collect();

		// Mark all as read
		await Promise.all(unreadItems.map(n => ctx.db.patch(n._id, { read: true })));

		// Return total count of ALL notifications for the user (not just newly marked)
		const allNotifications = await ctx.db
			.query('notifications')
			.withIndex('by_user', q => q.eq('userId', userId))
			.collect();

		return allNotifications.length;
	},
});

/**
 * Delete a notification
 */
export const deleteNotification = mutation({
	args: { id: v.id('notifications') },
	handler: async (ctx, { id }) => {
		// TODO: Add authentication check in production
		// const identity = await ctx.auth.getUserIdentity();
		// if (!identity) throw new Error('Unauthorized: Must be logged in');

		// Get the notification to verify ownership
		const notification = await ctx.db.get(id);
		if (!notification) {
			throw new Error('Notification not found');
		}

		// TODO: Authorization check - verify the notification belongs to the user
		// In production, get user ID from identity and compare with notification.userId

		await ctx.db.delete(id);
		return id;
	},
});

/**
 * Create a new notification (system function - typically called by other backend functions)
 */
export const create = mutation({
	args: {
		userId: v.id('users'),
		title: v.string(),
		description: v.string(),
		type: v.union(
			v.literal('course_update'),
			v.literal('message'),
			v.literal('announcement'),
			v.literal('community'),
			v.literal('live_session'),
			v.literal('certificate'),
			v.literal('milestone'),
		),
		link: v.optional(v.string()),
		metadata: v.optional(v.any()),
	},
	handler: async (ctx, args) => {
		// No authentication required - this is typically called by other backend functions
		// to create system notifications
		const id = await ctx.db.insert('notifications', {
			...args,
			read: false,
			createdAt: Date.now(),
		});
		return id;
	},
});

// Keep the old function names as aliases for backward compatibility
export const markRead = markAsRead;
export const remove = deleteNotification;
export const markAllRead = markAllAsRead;
