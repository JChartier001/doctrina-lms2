import { UserJSON } from '@clerk/backend';
import { v, Validator } from 'convex/values';

import { now } from '../lib/dayjs';
import { internalMutation, mutation, query } from './_generated/server';
import { userSchema } from './schema';

export const getByEmail = query({
	args: { email: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query('users')
			.withIndex('by_email', q => q.eq('email', args.email))
			.first();
	},
});

export const getById = query({
	args: { id: v.id('users') },
	handler: async (ctx, args) => ctx.db.get(args.id),
});

export const getByExternalId = query({
	args: { externalId: v.string() },
	handler: async (ctx, { externalId }) => {
		return await ctx.db
			.query('users')
			.withIndex('by_externalId', q => q.eq('externalId', externalId))
			.first();
	},
});

export const create = mutation({
	args: userSchema,
	handler: async (ctx, { firstName, lastName, email, image, externalId, isInstructor, isAdmin }) => {
		const existing = await ctx.db
			.query('users')
			.withIndex('by_email', q => q.eq('email', email))
			.first();
		if (existing) return existing._id;
		const now = new Date().toISOString();
		return await ctx.db.insert('users', {
			firstName,
			lastName,
			externalId,
			email,
			image,
			isInstructor: isInstructor ?? false,
			isAdmin: isAdmin ?? false,
			createdAt: now,
		});
	},
});

export const update = mutation({
	args: {
		id: v.id('users'),
		...userSchema,
	},
	handler: async (ctx, { id, ...updates }) => {
		const user = await ctx.db.get(id);
		if (!user) throw new Error('User not found');
		await ctx.db.patch(id, updates);
		return id;
	},
});

export const ensureCurrentUser = mutation({
	args: {},
	handler: async ctx => {
		const identity = await ctx.auth.getUserIdentity?.();
		if (!identity) throw new Error('Not authenticated');

		const existingByExternal = await ctx.db
			.query('users')
			.withIndex('by_externalId', q => q.eq('externalId', identity.subject))
			.first();
		if (existingByExternal) return existingByExternal._id;

		const existingByEmail = identity.email
			? await ctx.db
					.query('users')
					.withIndex('by_email', q => q.eq('email', identity.email!))
					.first()
			: null;
		if (existingByEmail) {
			await ctx.db.patch(existingByEmail._id, { externalId: identity.subject });
			return existingByEmail._id;
		}

		return await ctx.db.insert('users', {
			firstName: identity.name ?? 'User',
			lastName: 'User',
			email: identity.email ?? `${identity.subject}@example.com`,
			image: identity.pictureUrl ?? undefined,
			isInstructor: false,
			isAdmin: false,
			createdAt: now,
			externalId: identity.subject,
		});
	},
});

export const upsertFromClerk = internalMutation({
	args: { data: v.any() as Validator<UserJSON & { externalId: string }> },
	async handler(ctx, { data }) {
		const userAttributes = {
			firstName: data.first_name || '',
			lastName: data.last_name || '',
			image: data.image_url || '',
			email: data.email_addresses?.[0]?.email_address || '',
			phone: data.phone_numbers?.[0]?.phone_number || '',
			externalId: data.externalId,
			isInstructor: false,
			isAdmin: false,
			lastLogin: now,
			createdAt: now,
			updatedAt: now,
		};
		const user = await ctx.db
			.query('users')
			.withIndex('by_externalId', q => q.eq('externalId', data.id))
			.unique();
		if (user === null) {
			// New user - insert and update analytics
			await ctx.db.insert('users', userAttributes);
		} else {
			// Existing user - just update
			await ctx.db.patch(user._id, userAttributes);
		}
	},
});

export const deleteFromClerk = internalMutation({
	args: { externalId: v.string() },
	async handler(ctx, { externalId }) {
		const user = await ctx.db
			.query('users')
			.withIndex('by_externalId', q => q.eq('externalId', externalId))
			.unique();

		if (user !== null) {
			await ctx.db.delete(user._id);
		} else {
			console.warn(`Can't delete user, there is none for Clerk user ID: ${externalId}`);
		}
	},
});
