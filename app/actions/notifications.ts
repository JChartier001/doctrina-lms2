'use server';

import { Id } from '@/convex/_generated/dataModel';
import { deleteNotification, getUserNotifications, markAllAsRead, markAsRead } from '@/lib/notification-service';

export async function fetchUserNotifications(userId: Id<'users'>) {
	// In a real app, this would fetch from a database
	return getUserNotifications(userId);
}

export async function markNotificationAsRead(notificationId: Id<'notifications'>) {
	// In a real app, this would update a database
	markAsRead(notificationId);
	return { success: true };
}

export async function markAllNotificationsAsRead(userId: Id<'users'>) {
	// In a real app, this would update a database
	markAllAsRead(userId);
	return { success: true };
}

export async function deleteUserNotification(notificationId: Id<'notifications'>) {
	// In a real app, this would update a database
	deleteNotification(notificationId);
	return { success: true };
}
