import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

// Notification types - using Convex types
export type NotificationType =
	| 'course_update'
	| 'message'
	| 'announcement'
	| 'community'
	| 'live_session'
	| 'certificate'
	| 'milestone';

// Notification model - using Convex types
export interface Notification {
	_id: Id<'notifications'>;
	_creationTime: number;
	userId: Id<'users'>;
	title: string;
	description: string;
	type: NotificationType;
	read: boolean;
	createdAt: number;
	link?: string;
	metadata?: any;
}

// React hooks for Convex integration

// Get notifications for a user
export function useUserNotifications(userId: Id<'users'>) {
	return useQuery(api.notifications.listForUser, { userId });
}

// Mark a notification as read mutation
export function useMarkAsRead() {
	return useMutation(api.notifications.markRead);
}

// Mark all notifications as read mutation
export function useMarkAllAsRead() {
	return useMutation(api.notifications.markAllRead);
}

// Create a notification mutation
export function useCreateNotification() {
	return useMutation(api.notifications.create);
}

// Delete a notification mutation
export function useRemoveNotification() {
	return useMutation(api.notifications.remove);
}

// Legacy functions for backward compatibility (deprecated - use hooks instead)

// Get notifications for a user (deprecated)
export const getUserNotifications = (userId: string): Notification[] => {
	// This function is deprecated - use useUserNotifications hook instead
	console.warn(
		'getUserNotifications is deprecated. Use useUserNotifications hook instead.'
	);
	return [];
};

// Get unread count for a user (deprecated)
export const getUnreadCount = (userId: string): number => {
	// This function is deprecated - calculate from useUserNotifications hook instead
	console.warn(
		'getUnreadCount is deprecated. Calculate from useUserNotifications hook instead.'
	);
	return 0;
};

// Mark a notification as read (deprecated)
export const markAsRead = (notificationId: string): void => {
	// This function is deprecated - use useMarkAsRead mutation hook instead
	console.warn(
		'markAsRead is deprecated. Use useMarkAsRead mutation hook instead.'
	);
	throw new Error(
		'This function is deprecated. Use the Convex mutation hook instead.'
	);
};

// Mark all notifications as read for a user (deprecated)
export const markAllAsRead = (userId: string): void => {
	// This function is deprecated - use useMarkAllAsRead mutation hook instead
	console.warn(
		'markAllAsRead is deprecated. Use useMarkAllAsRead mutation hook instead.'
	);
	throw new Error(
		'This function is deprecated. Use the Convex mutation hook instead.'
	);
};

// Create a new notification (deprecated)
export const createNotification = (
	userId: string,
	title: string,
	description: string,
	type: NotificationType,
	link?: string,
	metadata?: Record<string, any>
): Notification => {
	// This function is deprecated - use useCreateNotification mutation hook instead
	console.warn(
		'createNotification is deprecated. Use useCreateNotification mutation hook instead.'
	);
	throw new Error(
		'This function is deprecated. Use the Convex mutation hook instead.'
	);
};

// Delete a notification (deprecated)
export const deleteNotification = (notificationId: string): void => {
	// This function is deprecated - use useRemoveNotification mutation hook instead
	console.warn(
		'deleteNotification is deprecated. Use useRemoveNotification mutation hook instead.'
	);
	throw new Error(
		'This function is deprecated. Use the Convex mutation hook instead.'
	);
};

// Format relative time for notifications (keeping this utility function)
export const formatRelativeTime = (date: Date): string => {
	const now = new Date();
	const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

	if (diffInSeconds < 60) {
		return `${diffInSeconds} seconds ago`;
	}

	const diffInMinutes = Math.floor(diffInSeconds / 60);
	if (diffInMinutes < 60) {
		return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
	}

	const diffInHours = Math.floor(diffInMinutes / 60);
	if (diffInHours < 24) {
		return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
	}

	const diffInDays = Math.floor(diffInHours / 24);
	if (diffInDays < 30) {
		return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
	}

	const diffInMonths = Math.floor(diffInDays / 30);
	return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
};

// Format relative time for Convex timestamps
export const formatRelativeTimeFromTimestamp = (timestamp: number): string => {
	return formatRelativeTime(new Date(timestamp));
};
