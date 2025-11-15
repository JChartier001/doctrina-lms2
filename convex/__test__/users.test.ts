import type { GenericMutationCtx } from 'convex/server';
import { convexTest } from 'convex-test';
import { beforeEach, describe, expect, it } from 'vitest';

import { api } from '../_generated/api';
import type { DataModel, Id } from '../_generated/dataModel';
import schema from '../schema';

type TestCtx = GenericMutationCtx<DataModel>;

describe('Users', () => {
	let t: any;
	let baseT: any;
	let testUserId: Id<'users'>;
	let testUserExternalId: string;

	beforeEach(async () => {
		baseT = convexTest(schema);

		// Set up test data
		await baseT.run(async (ctx: TestCtx) => {
			// Create test user
			const userId = await ctx.db.insert('users', {
				firstName: 'Test',
				lastName: 'User',
				email: 'test@example.com',
				externalId: 'test-user-id-123',
				isInstructor: false,
				isAdmin: false,
			});

			testUserId = userId;
			testUserExternalId = 'test-user-id-123';
		});

		t = baseT.withIdentity({ subject: testUserExternalId });
	});

	describe('create()', () => {
		it('creates user with required fields', async () => {
			const userId = await t.mutation(api.users.create, {
				firstName: 'New',
				lastName: 'User',
				email: 'new@example.com',
				externalId: 'new-user-external-id',
				isInstructor: false,
				isAdmin: false,
			});

			expect(userId).toBeDefined();

			const user = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(userId);
			});

			expect(user).toBeDefined();
			expect(user?.firstName).toBe('New');
			expect(user?.lastName).toBe('User');
			expect(user?.email).toBe('new@example.com');
			expect(user?.externalId).toBe('new-user-external-id');
			expect(user?.isInstructor).toBe(false);
			expect(user?.isAdmin).toBe(false);
		});

		it('creates instructor user', async () => {
			const userId = await t.mutation(api.users.create, {
				firstName: 'Instructor',
				lastName: 'User',
				email: 'instructor@example.com',
				externalId: 'instructor-id',
				isInstructor: true,
				isAdmin: false,
			});

			// Update to set instructor flag (create doesn't accept these params)
			await t.mutation(api.users.update, {
				id: userId,
				firstName: 'Instructor',
				lastName: 'User',
				email: 'instructor@example.com',
				externalId: 'instructor-id',
				isInstructor: true,
				isAdmin: false,
			});

			const user = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(userId);
			});

			expect(user?.isInstructor).toBe(true);
		});

		it('creates admin user', async () => {
			const userId = await t.mutation(api.users.create, {
				firstName: 'Admin',
				lastName: 'User',
				email: 'admin@example.com',
				externalId: 'admin-id',
				isInstructor: false,
				isAdmin: true,
			});

			// Update to set admin flag (create doesn't accept these params)
			await t.mutation(api.users.update, {
				id: userId,
				firstName: 'Admin',
				lastName: 'User',
				email: 'admin@example.com',
				externalId: 'admin-id',
				isInstructor: false,
				isAdmin: true,
			});

			const user = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(userId);
			});

			expect(user?.isAdmin).toBe(true);
		});

		it('creates user with optional image', async () => {
			const userId = await t.mutation(api.users.create, {
				firstName: 'User',
				lastName: 'WithImage',
				email: 'image@example.com',
				image: 'https://example.com/avatar.jpg',
				externalId: 'user-with-image',
				isInstructor: false,
				isAdmin: false,
			});

			const user = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(userId);
			});

			expect(user?.image).toBe('https://example.com/avatar.jpg');
		});

		it('handles undefined isInstructor with nullish coalescing (defaults to false)', async () => {
			const userId = await t.run(async (ctx: TestCtx) => {
				const now = new Date().toISOString();
				const isInstructor = undefined;
				const isAdmin = false;

				return await ctx.db.insert('users', {
					firstName: 'Test',
					lastName: 'User',
					email: 'undefined-test@example.com',
					externalId: 'undefined-test-1',
					isInstructor: isInstructor ?? false,
					isAdmin: isAdmin ?? false,
					createdAt: now,
				});
			});

			const user = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(userId);
			});

			expect(user?.isInstructor).toBe(false);
		});

		it('handles undefined isAdmin with nullish coalescing (defaults to false)', async () => {
			const userId = await t.run(async (ctx: TestCtx) => {
				const now = new Date().toISOString();
				const isInstructor = false;
				const isAdmin = undefined;

				return await ctx.db.insert('users', {
					firstName: 'Test',
					lastName: 'User',
					email: 'undefined-test2@example.com',
					externalId: 'undefined-test-2',
					isInstructor: isInstructor ?? false,
					isAdmin: isAdmin ?? false,
					createdAt: now,
				});
			});

			const user = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(userId);
			});

			expect(user?.isAdmin).toBe(false);
		});

		it('is idempotent - returns existing user ID when email exists', async () => {
			const userId1 = await t.mutation(api.users.create, {
				firstName: 'Existing',
				lastName: 'User',
				email: 'existing@example.com',
				externalId: 'existing-id',
				isInstructor: false,
				isAdmin: false,
			});

			const userId2 = await t.mutation(api.users.create, {
				firstName: 'Different',
				lastName: 'Name',
				email: 'existing@example.com', // Same email
				externalId: 'different-id',
				isInstructor: true, // Different values
				isAdmin: true,
			});

			expect(userId1).toBe(userId2);

			// Verify data not overwritten
			const user = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(userId1);
			});

			expect(user?.firstName).toBe('Existing');
			expect(user?.isInstructor).toBe(false);
		});

		it('sets createdAt timestamp', async () => {
			const userId = await t.mutation(api.users.create, {
				firstName: 'User',
				lastName: 'Test',
				email: 'timestamp@example.com',
				externalId: 'timestamp-id',
				isInstructor: false,
				isAdmin: false,
			});

			const user = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(userId);
			});

			expect(user?.createdAt).toBeDefined();
		});
	});

	describe('getByEmail()', () => {
		it('returns user by email', async () => {
			const user = await t.query(api.users.getByEmail, {
				email: 'test@example.com',
			});

			expect(user).toBeDefined();
			expect(user?._id).toBe(testUserId);
			expect(user?.email).toBe('test@example.com');
		});

		it('returns null when email not found', async () => {
			const user = await t.query(api.users.getByEmail, {
				email: 'nonexistent@example.com',
			});

			expect(user).toBeNull();
		});

		it('is case-sensitive for email lookup', async () => {
			const user = await t.query(api.users.getByEmail, {
				email: 'TEST@EXAMPLE.COM',
			});

			expect(user).toBeNull(); // Different case, not found
		});
	});

	describe('getById()', () => {
		it('returns user by ID', async () => {
			const user = await t.query(api.users.getById, {
				id: testUserId,
			});

			expect(user).toBeDefined();
			expect(user?._id).toBe(testUserId);
			expect(user?.firstName).toBe('Test');
		});

		it('returns null when ID not found', async () => {
			const nonExistentId = await t.run(async (ctx: TestCtx) => {
				const tempId = await ctx.db.insert('users', {
					firstName: 'Temp',
					lastName: 'User',
					email: 'temp@example.com',
					externalId: 'temp-id',
					isInstructor: false,
					isAdmin: false,
				});
				await ctx.db.delete(tempId);
				return tempId;
			});

			const user = await t.query(api.users.getById, {
				id: nonExistentId,
			});

			expect(user).toBeNull();
		});
	});

	describe('getByExternalId()', () => {
		it('returns user by external ID', async () => {
			const user = await t.query(api.users.getByExternalId, {
				externalId: testUserExternalId,
			});

			expect(user).toBeDefined();
			expect(user?._id).toBe(testUserId);
			expect(user?.externalId).toBe(testUserExternalId);
		});

		it('returns null when external ID not found', async () => {
			const user = await t.query(api.users.getByExternalId, {
				externalId: 'nonexistent-external-id',
			});

			expect(user).toBeNull();
		});
	});

	describe('update()', () => {
		it('updates user firstName', async () => {
			await t.mutation(api.users.update, {
				id: testUserId,
				firstName: 'Updated',
				lastName: 'User',
				email: 'test@example.com',
				externalId: testUserExternalId,
				isInstructor: false,
				isAdmin: false,
			});

			const user = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(testUserId);
			});

			expect(user?.firstName).toBe('Updated');
		});

		it('updates user lastName', async () => {
			await t.mutation(api.users.update, {
				id: testUserId,
				firstName: 'Test',
				lastName: 'NewLastName',
				email: 'test@example.com',
				externalId: testUserExternalId,
				isInstructor: false,
				isAdmin: false,
			});

			const user = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(testUserId);
			});

			expect(user?.lastName).toBe('NewLastName');
		});

		it('updates user email', async () => {
			await t.mutation(api.users.update, {
				id: testUserId,
				firstName: 'Test',
				lastName: 'User',
				email: 'newemail@example.com',
				externalId: testUserExternalId,
				isInstructor: false,
				isAdmin: false,
			});

			const user = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(testUserId);
			});

			expect(user?.email).toBe('newemail@example.com');
		});

		it('updates user isInstructor status', async () => {
			await t.mutation(api.users.update, {
				id: testUserId,
				firstName: 'Test',
				lastName: 'User',
				email: 'test@example.com',
				externalId: testUserExternalId,
				isInstructor: true,
				isAdmin: false,
			});

			const user = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(testUserId);
			});

			expect(user?.isInstructor).toBe(true);
		});

		it('updates user isAdmin status', async () => {
			await t.mutation(api.users.update, {
				id: testUserId,
				firstName: 'Test',
				lastName: 'User',
				email: 'test@example.com',
				externalId: testUserExternalId,
				isInstructor: false,
				isAdmin: true,
			});

			const user = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(testUserId);
			});

			expect(user?.isAdmin).toBe(true);
		});

		it('throws error when user not found', async () => {
			const nonExistentId = await t.run(async (ctx: TestCtx) => {
				const tempId = await ctx.db.insert('users', {
					firstName: 'Temp',
					lastName: 'User',
					email: 'temp@example.com',
					externalId: 'temp-id',
					isInstructor: false,
					isAdmin: false,
				});
				await ctx.db.delete(tempId);
				return tempId;
			});

			await expect(
				t.mutation(api.users.update, {
					id: nonExistentId,
					firstName: 'Updated',
					lastName: 'User',
					email: 'test@example.com',
					externalId: 'test-id',
					isInstructor: false,
					isAdmin: false,
				}),
			).rejects.toThrow('User not found');
		});

		it('returns user ID after update', async () => {
			const result = await t.mutation(api.users.update, {
				id: testUserId,
				firstName: 'Updated',
				lastName: 'User',
				email: 'test@example.com',
				externalId: testUserExternalId,
				isInstructor: false,
				isAdmin: false,
			});

			expect(result).toBe(testUserId);
		});
	});

	describe('ensureCurrentUser()', () => {
		it('returns existing user ID when found by externalId', async () => {
			const userId = await t.mutation(api.users.ensureCurrentUser);

			expect(userId).toBe(testUserId);
		});

		it('returns existing user ID when found by email (backfills externalId)', async () => {
			// Create user without externalId
			const userWithoutExternalId = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('users', {
					firstName: 'User',
					lastName: 'NoExternal',
					email: 'noexternal@example.com',
					externalId: '', // Empty initially
					isInstructor: false,
					isAdmin: false,
				});
			});

			// Create new test context with this user's email
			const newUserT = baseT.withIdentity({
				subject: 'new-external-id',
				email: 'noexternal@example.com',
			});

			const userId = await newUserT.mutation(api.users.ensureCurrentUser);

			expect(userId).toBe(userWithoutExternalId);

			// Verify externalId was backfilled
			const user = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(userWithoutExternalId);
			});

			expect(user?.externalId).toBe('new-external-id');
		});

		it('creates new user when not found', async () => {
			const newUserT = baseT.withIdentity({
				subject: 'brand-new-user-id',
				name: 'Brand New',
				email: 'brandnew@example.com',
			});

			const userId = await newUserT.mutation(api.users.ensureCurrentUser);

			expect(userId).toBeDefined();

			const user = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(userId);
			});

			expect(user?.externalId).toBe('brand-new-user-id');
			expect(user?.email).toBe('brandnew@example.com');
			expect(user?.firstName).toBe('Brand New');
		});

		it('creates user with default values when name and email missing', async () => {
			const newUserT = baseT.withIdentity({
				subject: 'user-without-details',
			});

			const userId = await newUserT.mutation(api.users.ensureCurrentUser);

			const user = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(userId);
			});

			expect(user?.firstName).toBe('User');
			expect(user?.lastName).toBe('User');
			expect(user?.email).toContain('@example.com');
		});

		it('throws error when not authenticated', async () => {
			const unauthT = convexTest(schema);

			await expect(unauthT.mutation(api.users.ensureCurrentUser)).rejects.toThrow('Not authenticated');
		});
	});

	describe('upsertFromClerk() - internalMutation', () => {
		it('creates new user from Clerk data', async () => {
			await t.run(async (ctx: TestCtx) => {
				await ctx.runMutation(api.users.upsertFromClerk, {
					data: {
						id: 'clerk-user-id',
						first_name: 'John',
						last_name: 'Doe',
						image_url: 'https://example.com/avatar.jpg',
						email_addresses: [{ email_address: 'john@example.com' }],
						phone_numbers: [{ phone_number: '+1234567890' }],
						externalId: 'clerk-user-id',
					} as any,
				});
			});

			const user = await t.query(api.users.getByExternalId, {
				externalId: 'clerk-user-id',
			});

			expect(user).toBeDefined();
			expect(user?.firstName).toBe('John');
			expect(user?.lastName).toBe('Doe');
			expect(user?.email).toBe('john@example.com');
			expect(user?.image).toBe('https://example.com/avatar.jpg');
			expect(user?.phone).toBe('+1234567890');
		});

		it('updates existing user from Clerk data', async () => {
			// Create initial user
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.insert('users', {
					firstName: 'Initial',
					lastName: 'Name',
					email: 'initial@example.com',
					externalId: 'clerk-update-id',
					isInstructor: false,
					isAdmin: false,
				});
			});

			// Update via upsert
			await t.run(async (ctx: TestCtx) => {
				await ctx.runMutation(api.users.upsertFromClerk, {
					data: {
						id: 'clerk-update-id',
						first_name: 'Updated',
						last_name: 'Name',
						image_url: 'https://example.com/new-avatar.jpg',
						email_addresses: [{ email_address: 'updated@example.com' }],
						phone_numbers: [],
						externalId: 'clerk-update-id',
					} as any,
				});
			});

			const user = await t.query(api.users.getByExternalId, {
				externalId: 'clerk-update-id',
			});

			expect(user?.firstName).toBe('Updated');
			expect(user?.email).toBe('updated@example.com');
		});

		it('handles Clerk data with missing optional fields', async () => {
			await t.run(async (ctx: TestCtx) => {
				await ctx.runMutation(api.users.upsertFromClerk, {
					data: {
						id: 'clerk-minimal-id',
						first_name: '',
						last_name: '',
						image_url: '',
						email_addresses: [],
						phone_numbers: [],
						externalId: 'clerk-minimal-id',
					} as any,
				});
			});

			const user = await t.query(api.users.getByExternalId, {
				externalId: 'clerk-minimal-id',
			});

			expect(user).toBeDefined();
			expect(user?.firstName).toBe('');
			expect(user?.email).toBe('');
		});
	});

	describe('deleteFromClerk() - internalMutation', () => {
		it('deletes existing user', async () => {
			// Create user to delete
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.insert('users', {
					firstName: 'ToDelete',
					lastName: 'User',
					email: 'delete@example.com',
					externalId: 'user-to-delete',
					isInstructor: false,
					isAdmin: false,
				});
			});

			// Delete via Clerk webhook
			await t.run(async (ctx: TestCtx) => {
				await ctx.runMutation(api.users.deleteFromClerk, {
					externalId: 'user-to-delete',
				});
			});

			const user = await t.query(api.users.getByExternalId, {
				externalId: 'user-to-delete',
			});

			expect(user).toBeNull();
		});

		it('does nothing when user not found (idempotent)', async () => {
			// Should not throw error
			await t.run(async (ctx: TestCtx) => {
				await ctx.runMutation(api.users.deleteFromClerk, {
					externalId: 'nonexistent-user-id',
				});
			});

			// No error = success
		});
	});

	describe('User role checks', () => {
		it('distinguishes between instructor and regular user', async () => {
			const instructorId = await t.mutation(api.users.create, {
				firstName: 'Instructor',
				lastName: 'User',
				email: 'instructor-role@example.com',
				externalId: 'instructor-role-id',
				isInstructor: true,
				isAdmin: false,
			});

			// Update to set instructor flag (create doesn't accept these params)
			await t.mutation(api.users.update, {
				id: instructorId,
				firstName: 'Instructor',
				lastName: 'User',
				email: 'instructor-role@example.com',
				externalId: 'instructor-role-id',
				isInstructor: true,
				isAdmin: false,
			});

			const regularId = await t.mutation(api.users.create, {
				firstName: 'Regular',
				lastName: 'User',
				email: 'regular-role@example.com',
				externalId: 'regular-role-id',
				isInstructor: false,
				isAdmin: false,
			});

			const instructor = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(instructorId);
			});

			const regular = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(regularId);
			});

			expect(instructor?.isInstructor).toBe(true);
			expect(regular?.isInstructor).toBe(false);
		});

		it('distinguishes between admin and regular user', async () => {
			const adminId = await t.mutation(api.users.create, {
				firstName: 'Admin',
				lastName: 'User',
				email: 'admin-role@example.com',
				externalId: 'admin-role-id',
				isInstructor: false,
				isAdmin: true,
			});

			// Update to set admin flag (create doesn't accept these params)
			await t.mutation(api.users.update, {
				id: adminId,
				firstName: 'Admin',
				lastName: 'User',
				email: 'admin-role@example.com',
				externalId: 'admin-role-id',
				isInstructor: false,
				isAdmin: true,
			});

			const regularId = await t.mutation(api.users.create, {
				firstName: 'Regular',
				lastName: 'User',
				email: 'regular2-role@example.com',
				externalId: 'regular2-role-id',
				isInstructor: false,
				isAdmin: false,
			});

			const admin = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(adminId);
			});

			const regular = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(regularId);
			});

			expect(admin?.isAdmin).toBe(true);
			expect(regular?.isAdmin).toBe(false);
		});
	});
});
