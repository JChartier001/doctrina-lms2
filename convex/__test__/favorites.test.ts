import type { GenericMutationCtx } from 'convex/server';
import { convexTest } from 'convex-test';
import { beforeEach, describe, expect, it } from 'vitest';

import { api } from '../_generated/api';
import type { DataModel, Id } from '../_generated/dataModel';
import schema from '../schema';

type TestCtx = GenericMutationCtx<DataModel>;

describe('Favorites', () => {
	let t: any;
	let testUserId: Id<'users'>;
	let otherUserId: Id<'users'>;
	let testResourceId: Id<'resources'>;
	let otherResourceId: Id<'resources'>;

	beforeEach(async () => {
		t = convexTest(schema);

		// Create test data
		await t.run(async (ctx: TestCtx) => {
			// Create users
			testUserId = await ctx.db.insert('users', {
				firstName: 'Test',
				lastName: 'User',
				email: 'test@example.com',
				externalId: 'test-user-id',
				isInstructor: false,
				isAdmin: false,
			});

			otherUserId = await ctx.db.insert('users', {
				firstName: 'Other',
				lastName: 'User',
				email: 'other@example.com',
				externalId: 'other-user-id',
				isInstructor: false,
				isAdmin: false,
			});

			// Create resources
			testResourceId = await ctx.db.insert('resources', {
				title: 'Test Resource',
				description: 'Test description',
				type: 'pdf',
				categories: ['test'],
				tags: ['sample'],
				url: 'https://example.com/resource1.pdf',
				author: 'Test Author',
				dateAdded: '2024-01-01',
				featured: false,
				downloadCount: 0,
				favoriteCount: 0,
				rating: 4.5,
				reviewCount: 10,
				difficulty: 'beginner',
				restricted: false,
			});

			otherResourceId = await ctx.db.insert('resources', {
				title: 'Other Resource',
				description: 'Other description',
				type: 'video',
				categories: ['test'],
				tags: ['sample'],
				url: 'https://example.com/resource2.mp4',
				author: 'Test Author',
				dateAdded: '2024-01-02',
				featured: false,
				downloadCount: 0,
				favoriteCount: 0,
				rating: 4.0,
				reviewCount: 5,
				difficulty: 'intermediate',
				restricted: false,
			});
		});
	});

	describe('add()', () => {
		it('adds favorite for user', async () => {
			const favoriteId = await t.mutation(api.favorites.add, {
				userId: testUserId,
				resourceId: testResourceId,
			});

			expect(favoriteId).toBeDefined();

			const favorite = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(favoriteId);
			});

			expect(favorite).toBeDefined();
			expect(favorite?.userId).toBe(testUserId);
			expect(favorite?.resourceId).toBe(testResourceId);
			expect(favorite?.createdAt).toBeGreaterThan(0);
		});

		it('is idempotent - returns existing favorite ID', async () => {
			const favoriteId1 = await t.mutation(api.favorites.add, {
				userId: testUserId,
				resourceId: testResourceId,
			});

			const favoriteId2 = await t.mutation(api.favorites.add, {
				userId: testUserId,
				resourceId: testResourceId,
			});

			expect(favoriteId1).toBe(favoriteId2);

			// Verify only one favorite exists
			const favorites = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.query('favorites').collect();
			});

			expect(favorites).toHaveLength(1);
		});

		it('allows same resource to be favorited by different users', async () => {
			const favorite1 = await t.mutation(api.favorites.add, {
				userId: testUserId,
				resourceId: testResourceId,
			});

			const favorite2 = await t.mutation(api.favorites.add, {
				userId: otherUserId,
				resourceId: testResourceId,
			});

			expect(favorite1).not.toBe(favorite2);

			const favorites = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.query('favorites').collect();
			});

			expect(favorites).toHaveLength(2);
		});

		it('allows same user to favorite multiple resources', async () => {
			const favorite1 = await t.mutation(api.favorites.add, {
				userId: testUserId,
				resourceId: testResourceId,
			});

			const favorite2 = await t.mutation(api.favorites.add, {
				userId: testUserId,
				resourceId: otherResourceId,
			});

			expect(favorite1).not.toBe(favorite2);

			const favorites = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.query('favorites').collect();
			});

			expect(favorites).toHaveLength(2);
		});

		it('sets createdAt timestamp', async () => {
			const beforeTime = Date.now();

			const favoriteId = await t.mutation(api.favorites.add, {
				userId: testUserId,
				resourceId: testResourceId,
			});

			const afterTime = Date.now();

			const favorite = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(favoriteId);
			});

			expect(favorite?.createdAt).toBeGreaterThanOrEqual(beforeTime);
			expect(favorite?.createdAt).toBeLessThanOrEqual(afterTime);
		});
	});

	describe('remove()', () => {
		it('removes favorite', async () => {
			// Add favorite
			const favoriteId = await t.mutation(api.favorites.add, {
				userId: testUserId,
				resourceId: testResourceId,
			});

			// Verify exists
			let favorite = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(favoriteId);
			});
			expect(favorite).toBeDefined();

			// Remove
			const result = await t.mutation(api.favorites.remove, {
				userId: testUserId,
				resourceId: testResourceId,
			});

			expect(result).toBe(true);

			// Verify deleted
			favorite = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(favoriteId);
			});
			expect(favorite).toBeNull();
		});

		it('returns true even if favorite does not exist', async () => {
			// Try to remove non-existent favorite
			const result = await t.mutation(api.favorites.remove, {
				userId: testUserId,
				resourceId: testResourceId,
			});

			expect(result).toBe(true);
		});

		it('is idempotent - can call multiple times', async () => {
			// Add favorite
			await t.mutation(api.favorites.add, {
				userId: testUserId,
				resourceId: testResourceId,
			});

			// Remove multiple times
			const result1 = await t.mutation(api.favorites.remove, {
				userId: testUserId,
				resourceId: testResourceId,
			});

			const result2 = await t.mutation(api.favorites.remove, {
				userId: testUserId,
				resourceId: testResourceId,
			});

			expect(result1).toBe(true);
			expect(result2).toBe(true);
		});

		it('does not affect other users favorites', async () => {
			// Both users favorite the same resource
			const user1FavoriteId = await t.mutation(api.favorites.add, {
				userId: testUserId,
				resourceId: testResourceId,
			});

			const user2FavoriteId = await t.mutation(api.favorites.add, {
				userId: otherUserId,
				resourceId: testResourceId,
			});

			// Remove for test user only
			await t.mutation(api.favorites.remove, {
				userId: testUserId,
				resourceId: testResourceId,
			});

			// Verify test user's favorite is gone
			const user1Favorite = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(user1FavoriteId);
			});
			expect(user1Favorite).toBeNull();

			// Verify other user's favorite still exists
			const user2Favorite = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(user2FavoriteId);
			});
			expect(user2Favorite).toBeDefined();
		});

		it('does not affect other resource favorites', async () => {
			// User favorites two resources
			const favorite1Id = await t.mutation(api.favorites.add, {
				userId: testUserId,
				resourceId: testResourceId,
			});

			const favorite2Id = await t.mutation(api.favorites.add, {
				userId: testUserId,
				resourceId: otherResourceId,
			});

			// Remove one
			await t.mutation(api.favorites.remove, {
				userId: testUserId,
				resourceId: testResourceId,
			});

			// Verify first is gone
			const favorite1 = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(favorite1Id);
			});
			expect(favorite1).toBeNull();

			// Verify second still exists
			const favorite2 = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(favorite2Id);
			});
			expect(favorite2).toBeDefined();
		});
	});

	describe('isFavorited()', () => {
		it('returns true when resource is favorited by user', async () => {
			await t.mutation(api.favorites.add, {
				userId: testUserId,
				resourceId: testResourceId,
			});

			const isFavorited = await t.query(api.favorites.isFavorited, {
				userId: testUserId,
				resourceId: testResourceId,
			});

			expect(isFavorited).toBe(true);
		});

		it('returns false when resource is not favorited by user', async () => {
			const isFavorited = await t.query(api.favorites.isFavorited, {
				userId: testUserId,
				resourceId: testResourceId,
			});

			expect(isFavorited).toBe(false);
		});

		it('returns false for different user', async () => {
			// Test user favorites the resource
			await t.mutation(api.favorites.add, {
				userId: testUserId,
				resourceId: testResourceId,
			});

			// Check if other user has favorited it
			const isFavorited = await t.query(api.favorites.isFavorited, {
				userId: otherUserId,
				resourceId: testResourceId,
			});

			expect(isFavorited).toBe(false);
		});

		it('returns false for different resource', async () => {
			// User favorites one resource
			await t.mutation(api.favorites.add, {
				userId: testUserId,
				resourceId: testResourceId,
			});

			// Check if they favorited different resource
			const isFavorited = await t.query(api.favorites.isFavorited, {
				userId: testUserId,
				resourceId: otherResourceId,
			});

			expect(isFavorited).toBe(false);
		});

		it('returns false after unfavoriting', async () => {
			// Add favorite
			await t.mutation(api.favorites.add, {
				userId: testUserId,
				resourceId: testResourceId,
			});

			// Verify favorited
			let isFavorited = await t.query(api.favorites.isFavorited, {
				userId: testUserId,
				resourceId: testResourceId,
			});
			expect(isFavorited).toBe(true);

			// Remove favorite
			await t.mutation(api.favorites.remove, {
				userId: testUserId,
				resourceId: testResourceId,
			});

			// Verify not favorited
			isFavorited = await t.query(api.favorites.isFavorited, {
				userId: testUserId,
				resourceId: testResourceId,
			});
			expect(isFavorited).toBe(false);
		});
	});

	describe('listForUser()', () => {
		it('returns favorited resources for user', async () => {
			// Add favorites
			await t.mutation(api.favorites.add, {
				userId: testUserId,
				resourceId: testResourceId,
			});

			await t.mutation(api.favorites.add, {
				userId: testUserId,
				resourceId: otherResourceId,
			});

			const resources = await t.query(api.favorites.listForUser, {
				userId: testUserId,
			});

			expect(resources).toHaveLength(2);
			expect(resources.some(r => r?._id === testResourceId)).toBe(true);
			expect(resources.some(r => r?._id === otherResourceId)).toBe(true);
		});

		it('returns empty array when user has no favorites', async () => {
			const resources = await t.query(api.favorites.listForUser, {
				userId: testUserId,
			});

			expect(resources).toHaveLength(0);
		});

		it('does not return favorites for other users', async () => {
			// Test user favorites one resource
			await t.mutation(api.favorites.add, {
				userId: testUserId,
				resourceId: testResourceId,
			});

			// Other user favorites different resource
			await t.mutation(api.favorites.add, {
				userId: otherUserId,
				resourceId: otherResourceId,
			});

			const resources = await t.query(api.favorites.listForUser, {
				userId: testUserId,
			});

			expect(resources).toHaveLength(1);
			expect(resources[0]?._id).toBe(testResourceId);
		});

		it('filters out deleted resources', async () => {
			// Create and favorite a resource
			const tempResourceId = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('resources', {
					title: 'Temp Resource',
					description: 'Will be deleted',
					type: 'pdf',
					categories: ['test'],
					tags: ['temp'],
					url: 'https://example.com/temp.pdf',
					author: 'Test Author',
					dateAdded: '2024-01-01',
					featured: false,
					downloadCount: 0,
					favoriteCount: 0,
					rating: 4.0,
					reviewCount: 0,
					difficulty: 'beginner',
					restricted: false,
				});
			});

			await t.mutation(api.favorites.add, {
				userId: testUserId,
				resourceId: tempResourceId,
			});

			// Also favorite the test resource
			await t.mutation(api.favorites.add, {
				userId: testUserId,
				resourceId: testResourceId,
			});

			// Delete the temp resource (but keep the favorite link)
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.delete(tempResourceId);
			});

			// List favorites - should filter out deleted resource
			const resources = await t.query(api.favorites.listForUser, {
				userId: testUserId,
			});

			expect(resources).toHaveLength(1);
			expect(resources[0]?._id).toBe(testResourceId);
		});

		it('returns resource details, not just IDs', async () => {
			await t.mutation(api.favorites.add, {
				userId: testUserId,
				resourceId: testResourceId,
			});

			const resources = await t.query(api.favorites.listForUser, {
				userId: testUserId,
			});

			expect(resources).toHaveLength(1);
			expect(resources[0]?.title).toBe('Test Resource');
			expect(resources[0]?.description).toBe('Test description');
			expect(resources[0]?.type).toBe('pdf');
		});
	});
});
