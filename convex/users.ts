import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first()
  },
})

export const getById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => ctx.db.get(args.id),
})

export const getByExternalId = query({
  args: { externalId: v.string() },
  handler: async (ctx, { externalId }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_externalId", (q) => q.eq("externalId", externalId))
      .first()
  },
})

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    role: v.optional(v.union(v.literal("admin"), v.literal("instructor"), v.literal("student"))),
  },
  handler: async (ctx, { name, email, image, role }) => {
    const now = Date.now()
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first()
    if (existing) return existing._id
    return await ctx.db.insert("users", {
      name,
      email,
      image,
      role: role ?? "student",
      createdAt: now,
    })
  },
})

export const update = mutation({
  args: {
    id: v.id("users"),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    role: v.optional(v.union(v.literal("admin"), v.literal("instructor"), v.literal("student"))),
  },
  handler: async (ctx, { id, ...updates }) => {
    const user = await ctx.db.get(id)
    if (!user) throw new Error("User not found")
    await ctx.db.patch(id, updates)
    return id
  },
})

export const ensureCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity?.()
    if (!identity) throw new Error("Not authenticated")

    const existingByExternal = await ctx.db
      .query("users")
      .withIndex("by_externalId", (q) => q.eq("externalId", identity.subject))
      .first()
    if (existingByExternal) return existingByExternal._id

    const existingByEmail = identity.email
      ? await ctx.db
          .query("users")
          .withIndex("by_email", (q) => q.eq("email", identity.email!))
          .first()
      : null
    if (existingByEmail) {
      await ctx.db.patch(existingByEmail._id, { externalId: identity.subject })
      return existingByEmail._id
    }

    return await ctx.db.insert("users", {
      name: identity.name ?? "User",
      email: identity.email ?? `${identity.subject}@example.com`,
      image: identity.pictureUrl ?? undefined,
      role: "student",
      createdAt: Date.now(),
      externalId: identity.subject,
    })
  },
})
