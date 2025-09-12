import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    role: v.union(v.literal("admin"), v.literal("instructor"), v.literal("student")),
    createdAt: v.number(),
    externalId: v.optional(v.string()), // e.g., Clerk user id or other provider subject
  })
    .index("by_email", ["email"])
    .index("by_externalId", ["externalId"]),

  courses: defineTable({
    title: v.string(),
    description: v.string(),
    instructorId: v.id("users"),
    level: v.optional(v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced"))),
    duration: v.optional(v.string()),
    price: v.optional(v.number()),
    thumbnailUrl: v.optional(v.string()),
    rating: v.optional(v.number()),
    reviewCount: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_instructor", ["instructorId"]),

  resources: defineTable({
    title: v.string(),
    description: v.string(),
    type: v.string(),
    categories: v.array(v.string()),
    tags: v.array(v.string()),
    url: v.string(),
    thumbnailUrl: v.optional(v.string()),
    author: v.string(),
    dateAdded: v.string(),
    featured: v.boolean(),
    downloadCount: v.number(),
    favoriteCount: v.number(),
    rating: v.number(),
    reviewCount: v.number(),
    difficulty: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    duration: v.optional(v.string()),
    fileSize: v.optional(v.string()),
    courseId: v.optional(v.id("courses")),
    restricted: v.boolean(),
  }).index("by_course", ["courseId"]),

  favorites: defineTable({
    userId: v.id("users"),
    resourceId: v.id("resources"),
    createdAt: v.number(),
  }).index("by_user_resource", ["userId", "resourceId"]),

  notifications: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.string(),
    type: v.union(
      v.literal("course_update"),
      v.literal("message"),
      v.literal("announcement"),
      v.literal("community"),
      v.literal("live_session"),
      v.literal("certificate"),
      v.literal("milestone"),
    ),
    read: v.boolean(),
    createdAt: v.number(),
    link: v.optional(v.string()),
    metadata: v.optional(v.any()),
  }).index("by_user_created", ["userId", "createdAt"]),

  liveSessions: defineTable({
    title: v.string(),
    description: v.string(),
    instructorId: v.id("users"),
    scheduledFor: v.number(),
    duration: v.number(),
    isRecorded: v.boolean(),
    maxParticipants: v.number(),
    status: v.union(v.literal("scheduled"), v.literal("live"), v.literal("completed"), v.literal("cancelled")),
    recordingUrl: v.optional(v.string()),
  }).index("by_status", ["status"]).index("by_instructor", ["instructorId"]),

  sessionParticipants: defineTable({
    sessionId: v.id("liveSessions"),
    userId: v.id("users"),
    joinedAt: v.number(),
  }).index("by_session", ["sessionId"]).index("by_user", ["userId"]),

  certificates: defineTable({
    userId: v.id("users"),
    userName: v.string(),
    courseId: v.id("courses"),
    courseName: v.string(),
    instructorId: v.id("users"),
    instructorName: v.string(),
    issueDate: v.string(),
    expiryDate: v.optional(v.string()),
    verificationCode: v.string(),
    templateId: v.string(),
  }).index("by_user", ["userId"]).index("by_verification", ["verificationCode"]),

  purchases: defineTable({
    userId: v.id("users"),
    courseId: v.id("courses"),
    amount: v.number(),
    currency: v.string(),
    status: v.union(v.literal("open"), v.literal("complete"), v.literal("expired")),
    createdAt: v.number(),
  }).index("by_user", ["userId"]).index("by_course", ["courseId"]),
})
