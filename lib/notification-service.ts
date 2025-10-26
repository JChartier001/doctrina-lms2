import { useMutation, useQuery } from 'convex/react';

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
	metadata?: Record<string, unknown>;
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

export const deleteNotification = async (notificationId: Id<'notifications'>) => {
	console.log(notificationId);
};
export const getUserNotifications = async (userId: Id<'users'>) => {
	console.log(userId);
};
export const markAsRead = async (notificationId: Id<'notifications'>) => {
	console.log(notificationId);
};
export const markAllAsRead = async (userId: Id<'users'>) => {
	console.log(userId);
};
