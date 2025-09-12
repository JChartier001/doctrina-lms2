import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const listForUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("purchases")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect()
  },
})

export const create = mutation({
  args: { userId: v.id("users"), courseId: v.id("courses"), amount: v.number(), currency: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("purchases", {
      ...args,
      status: "open",
      createdAt: Date.now(),
    })
  },
})

export const complete = mutation({
  args: { id: v.id("purchases") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { status: "complete" })
    return id
  },
})

export const expire = mutation({
  args: { id: v.id("purchases") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { status: "expired" })
    return id
  },
})

