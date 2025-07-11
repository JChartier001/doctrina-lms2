// Notification types
export type NotificationType =
  | "course_update"
  | "message"
  | "announcement"
  | "community"
  | "live_session"
  | "certificate"
  | "milestone"

// Notification model
export interface Notification {
  id: string
  userId: string
  title: string
  description: string
  type: NotificationType
  read: boolean
  createdAt: Date
  link?: string
  metadata?: Record<string, any>
}

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: "1",
    userId: "3", // student
    title: "New Course Content Available",
    description: "Advanced Dermal Fillers Masterclass has new content",
    type: "course_update",
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    link: "/courses/dermal-fillers-masterclass",
  },
  {
    id: "2",
    userId: "3", // student
    title: "Certificate Awarded",
    description: "You've earned a certificate for Botox Fundamentals",
    type: "certificate",
    read: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    link: "/profile/certificates",
  },
  {
    id: "3",
    userId: "3", // student
    title: "New Message from Instructor",
    description: "Dr. Sarah Johnson sent you a message",
    type: "message",
    read: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    link: "/messages/instructor-sarah",
  },
  {
    id: "4",
    userId: "3", // student
    title: "Upcoming Live Session",
    description: "Don't miss the Advanced Techniques webinar tomorrow",
    type: "live_session",
    read: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    link: "/live",
  },
  {
    id: "5",
    userId: "3", // student
    title: "Course Update",
    description: "Facial Anatomy course has been updated with new content",
    type: "course_update",
    read: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    link: "/courses/facial-anatomy",
  },
  {
    id: "6",
    userId: "2", // instructor
    title: "New Student Enrollment",
    description: "A new student has enrolled in your Botox Fundamentals course",
    type: "course_update",
    read: false,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    link: "/instructor/courses/botox-fundamentals/students",
  },
  {
    id: "7",
    userId: "2", // instructor
    title: "Course Review",
    description: "A student left a 5-star review on your course",
    type: "course_update",
    read: false,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    link: "/instructor/courses/botox-fundamentals/reviews",
  },
  {
    id: "8",
    userId: "1", // admin
    title: "New Instructor Application",
    description: "A new instructor has applied to join the platform",
    type: "announcement",
    read: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    link: "/admin/instructors/applications",
  },
  {
    id: "9",
    userId: "1", // admin
    title: "System Update Completed",
    description: "The platform has been updated to the latest version",
    type: "announcement",
    read: true,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    link: "/admin/system/updates",
  },
  {
    id: "10",
    userId: "3", // student
    title: "Community Post Reply",
    description: "Someone replied to your post in the Aesthetics forum",
    type: "community",
    read: false,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    link: "/community/topic/aesthetics-forum",
  },
]

// Get notifications for a user
export const getUserNotifications = (userId: string): Notification[] => {
  return mockNotifications
    .filter((notification) => notification.userId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

// Get unread count for a user
export const getUnreadCount = (userId: string): number => {
  return mockNotifications.filter((notification) => notification.userId === userId && !notification.read).length
}

// Mark a notification as read
export const markAsRead = (notificationId: string): void => {
  const notification = mockNotifications.find((n) => n.id === notificationId)
  if (notification) {
    notification.read = true
  }
}

// Mark all notifications as read for a user
export const markAllAsRead = (userId: string): void => {
  mockNotifications
    .filter((notification) => notification.userId === userId)
    .forEach((notification) => {
      notification.read = true
    })
}

// Create a new notification
export const createNotification = (
  userId: string,
  title: string,
  description: string,
  type: NotificationType,
  link?: string,
  metadata?: Record<string, any>,
): Notification => {
  const newNotification: Notification = {
    id: Date.now().toString(),
    userId,
    title,
    description,
    type,
    read: false,
    createdAt: new Date(),
    link,
    metadata,
  }

  mockNotifications.push(newNotification)
  return newNotification
}

// Delete a notification
export const deleteNotification = (notificationId: string): void => {
  const index = mockNotifications.findIndex((n) => n.id === notificationId)
  if (index !== -1) {
    mockNotifications.splice(index, 1)
  }
}

// Format relative time for notifications
export const formatRelativeTime = (date: Date): string => {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  return `${diffInMonths} month${diffInMonths === 1 ? "" : "s"} ago`
}
