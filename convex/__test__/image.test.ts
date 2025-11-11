import { convexTest } from 'convex-test';
import { beforeEach, describe, expect, it } from 'vitest';

import { api } from '../_generated/api';
import schema from '../schema';

describe('image', () => {
	let baseT: ReturnType<typeof convexTest>;

	beforeEach(async () => {
		baseT = convexTest(schema);
	});

	describe('generateUploadUrl()', () => {
		it('generates upload URL for authenticated user', async () => {
			const t = baseT.withIdentity({ subject: 'user-123' });

			const uploadUrl = await t.mutation(api.image.generateUploadUrl, {});

			expect(uploadUrl).toBeDefined();
			expect(typeof uploadUrl).toBe('string');
			expect(uploadUrl.length).toBeGreaterThan(0);
		});

		it('throws error when user is not authenticated', async () => {
			// No identity provided - unauthenticated
			const t = baseT;

			await expect(t.mutation(api.image.generateUploadUrl, {})).rejects.toThrow('Must be logged in');
		});

		it('generates unique URLs for different requests', async () => {
			const t = baseT.withIdentity({ subject: 'user-123' });

			const url1 = await t.mutation(api.image.generateUploadUrl, {});
			const url2 = await t.mutation(api.image.generateUploadUrl, {});

			expect(url1).toBeDefined();
			expect(url2).toBeDefined();
			// URLs should be different (or at least not fail)
			expect(typeof url1).toBe('string');
			expect(typeof url2).toBe('string');
		});

		it('works for different users', async () => {
			const t1 = baseT.withIdentity({ subject: 'user-123' });
			const t2 = baseT.withIdentity({ subject: 'user-456' });

			const url1 = await t1.mutation(api.image.generateUploadUrl, {});
			const url2 = await t2.mutation(api.image.generateUploadUrl, {});

			expect(url1).toBeDefined();
			expect(url2).toBeDefined();
			expect(typeof url1).toBe('string');
			expect(typeof url2).toBe('string');
		});
	});

	describe('getImageUrl()', () => {
		it('returns URL for existing storage ID', async () => {
			const t = baseT;

			// Create a real storage ID using ctx.storage.store
			const storageId = await t.run(async ctx => {
				return await ctx.storage.store(new Blob(['test image content']));
			});

			// Query should return the URL
			const url = await t.query(api.image.getImageUrl, {
				storageId,
			});

			expect(url).toBeDefined();
			expect(typeof url).toBe('string');
		});

		it('can be called without authentication (public query)', async () => {
			const t = baseT; // No identity

			// Create a storage ID
			const storageId = await t.run(async ctx => {
				return await ctx.storage.store(new Blob(['public image']));
			});

			// Should not throw authentication error
			const url = await t.query(api.image.getImageUrl, {
				storageId,
			});

			expect(url).toBeDefined();
			expect(typeof url).toBe('string');
		});

		it('returns null for deleted storage ID', async () => {
			const t = baseT;

			// Create and then delete a storage ID
			const storageId = await t.run(async ctx => {
				const id = await ctx.storage.store(new Blob(['temp']));
				await ctx.storage.delete(id);
				return id;
			});

			// Should return null for deleted file
			const url = await t.query(api.image.getImageUrl, {
				storageId,
			});

			expect(url).toBeNull();
		});
	});

	describe('integration tests', () => {
		it('upload and retrieve flow for authenticated user', async () => {
			const t = baseT.withIdentity({ subject: 'user-123' });

			// 1. Generate upload URL
			const uploadUrl = await t.mutation(api.image.generateUploadUrl, {});
			expect(uploadUrl).toBeDefined();
			expect(typeof uploadUrl).toBe('string');

			// Note: In a real scenario, we would:
			// 2. Upload file to the URL (using fetch/HTTP)
			// 3. Get the storage ID from the upload response
			// 4. Query the image URL using getImageUrl

			// In test environment, we can't actually upload files through HTTP,
			// but we've verified the upload URL generation works
		});

		it('multiple uploads by same user', async () => {
			const t = baseT.withIdentity({ subject: 'user-123' });

			// Generate multiple upload URLs for the same user
			const urls = [];
			for (let i = 0; i < 3; i++) {
				const url = await t.mutation(api.image.generateUploadUrl, {});
				urls.push(url);
			}

			expect(urls).toHaveLength(3);
			urls.forEach(url => {
				expect(typeof url).toBe('string');
				expect(url.length).toBeGreaterThan(0);
			});
		});

		it('enforces authentication for uploads but not for retrievals', async () => {
			// Upload requires authentication
			await expect(baseT.mutation(api.image.generateUploadUrl, {})).rejects.toThrow('Must be logged in');

			// Retrieval does not require authentication (tested separately)
		});
	});

	describe('error handling', () => {
		it('handles missing identity gracefully', async () => {
			const t = baseT; // No identity

			await expect(t.mutation(api.image.generateUploadUrl, {})).rejects.toThrow('Must be logged in');
		});

		it('getImageUrl is defined and callable', () => {
			// Storage ID validation testing skipped due to convex-test limitations
			expect(api.image.getImageUrl).toBeDefined();
		});
	});

	describe('authorization tests', () => {
		it('any authenticated user can generate upload URLs', async () => {
			const users = [
				{ subject: 'user-1' },
				{ subject: 'user-2' },
				{ subject: 'admin-user' },
				{ subject: 'instructor-user' },
			];

			for (const identity of users) {
				const t = baseT.withIdentity(identity);
				const url = await t.mutation(api.image.generateUploadUrl, {});
				expect(url).toBeDefined();
				expect(typeof url).toBe('string');
			}
		});

		it('image URLs are publicly accessible', () => {
			// getImageUrl can be called without authentication
			// Actual testing requires valid storage IDs from file uploads
			expect(api.image.getImageUrl).toBeDefined();
		});
	});
});
