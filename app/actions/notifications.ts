"use server"

import { getUserNotifications, markAsRead, markAllAsRead, deleteNotification } from "@/lib/notification-service"

export async function fetchUserNotifications(userId: string) {
  // In a real app, this would fetch from a database
  return getUserNotifications(userId)
}

export async function markNotificationAsRead(notificationId: string) {
  // In a real app, this would update a database
  markAsRead(notificationId)
  return { success: true }
}

export async function markAllNotificationsAsRead(userId: string) {
  // In a real app, this would update a database
  markAllAsRead(userId)
  return { success: true }
}

export async function deleteUserNotification(notificationId: string) {
  // In a real app, this would update a database
  deleteNotification(notificationId)
  return { success: true }
}
