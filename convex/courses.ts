import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const list = query({
  args: { instructorId: v.optional(v.id("users")) },
  handler: async (ctx, { instructorId }) => {
    if (instructorId) {
      return await ctx.db
        .query("courses")
        .withIndex("by_instructor", (q) => q.eq("instructorId", instructorId))
        .order("desc")
        .collect()
    }
    return await ctx.db.query("courses").order("desc").collect()
  },
})

export const get = query({
  args: { id: v.id("courses") },
  handler: async (ctx, { id }) => ctx.db.get(id),
})

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    instructorId: v.id("users"),
    level: v.optional(v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced"))),
    duration: v.optional(v.string()),
    price: v.optional(v.number()),
    thumbnailUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const id = await ctx.db.insert("courses", {
      ...args,
      rating: 0,
      reviewCount: 0,
      createdAt: now,
      updatedAt: now,
    })
    return id
  },
})

export const update = mutation({
  args: {
    id: v.id("courses"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    level: v.optional(v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced"))),
    duration: v.optional(v.string()),
    price: v.optional(v.number()),
    thumbnailUrl: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...updates }) => {
    const existing = await ctx.db.get(id)
    if (!existing) throw new Error("Course not found")
    await ctx.db.patch(id, { ...updates, updatedAt: Date.now() })
    return id
  },
})

export const remove = mutation({
  args: { id: v.id("courses") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id)
    return id
  },
})

