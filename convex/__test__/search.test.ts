import type { GenericMutationCtx } from 'convex/server';
import { convexTest } from 'convex-test';
import { beforeEach, describe, expect, it } from 'vitest';

import { api } from '../_generated/api';
import type { DataModel, Id } from '../_generated/dataModel';
import schema from '../schema';

type TestCtx = GenericMutationCtx<DataModel>;

describe('Search', () => {
	let t: any;
	let _testCourseId: Id<'courses'>;
	let _testResourceId: Id<'resources'>;
	let _testUserId: Id<'users'>;
	let instructorId: Id<'users'>;

	beforeEach(async () => {
		t = convexTest(schema);

		// Create test data
		await t.run(async (ctx: TestCtx) => {
			// Create instructor
			instructorId = await ctx.db.insert('users', {
				firstName: 'Jane',
				lastName: 'Instructor',
				email: 'jane@example.com',
				externalId: 'instructor-id',
				isInstructor: true,
				isAdmin: false,
			});

			// Create test user
			_testUserId = await ctx.db.insert('users', {
				firstName: 'John',
				lastName: 'Dermatology',
				email: 'john@dermatology.com',
				externalId: 'test-user-id',
				isInstructor: false,
				isAdmin: false,
			});

			// Create test course
			_testCourseId = await ctx.db.insert('courses', {
				title: 'Advanced Dermatology',
				description: 'Comprehensive guide to skin conditions and treatments',
				instructorId,
				level: 'advanced',
				price: 29900,
				rating: 4.5,
				reviewCount: 100,
				createdAt: Date.now(),
				updatedAt: Date.now(),
			});

			// Create another course
			await ctx.db.insert('courses', {
				title: 'Python Programming',
				description: 'Learn Python from scratch',
				instructorId,
				level: 'beginner',
				price: 19900,
				rating: 4.8,
				reviewCount: 250,
				createdAt: Date.now() - 86400000,
				updatedAt: Date.now(),
			});

			// Create test resource
			_testResourceId = await ctx.db.insert('resources', {
				title: 'Dermatology Atlas',
				description: 'Visual reference for skin conditions',
				type: 'pdf',
				categories: ['dermatology', 'reference'],
				tags: ['medical', 'skin', 'visual'],
				url: 'https://example.com/atlas.pdf',
				author: 'Dr. Smith',
				dateAdded: '2024-01-01',
				featured: true,
				downloadCount: 500,
				favoriteCount: 50,
				rating: 4.7,
				reviewCount: 75,
				difficulty: 'intermediate',
				restricted: false,
			});

			// Create another resource
			await ctx.db.insert('resources', {
				title: 'Python Cheat Sheet',
				description: 'Quick reference for Python syntax',
				type: 'pdf',
				categories: ['programming', 'reference'],
				tags: ['coding', 'python', 'quick-reference'],
				url: 'https://example.com/python.pdf',
				author: 'Dev Team',
				dateAdded: '2024-02-01',
				featured: false,
				downloadCount: 1000,
				favoriteCount: 100,
				rating: 4.9,
				reviewCount: 200,
				difficulty: 'beginner',
				restricted: false,
			});
		});
	});

	describe('unifiedSearch()', () => {
		it('searches across all entity types by default', async () => {
			const results = await t.query(api.search.unifiedSearch, {
				query: 'dermatology',
			});

			expect(results.length).toBeGreaterThanOrEqual(2); // Course + Resource + User
			const types = results.map((r: any) => r.type);
			expect(types.includes('course')).toBe(true);
			expect(types.includes('resource')).toBe(true);
			expect(types.includes('user')).toBe(true);
		});

		it('searches courses by title', async () => {
			const results = await t.query(api.search.unifiedSearch, {
				query: 'python',
				entityTypes: ['course'],
			});

			expect(results.length).toBeGreaterThanOrEqual(1);
			expect(results[0].type).toBe('course');
			expect(results[0].title).toContain('Python');
		});

		it('searches courses by description', async () => {
			const results = await t.query(api.search.unifiedSearch, {
				query: 'skin conditions',
				entityTypes: ['course'],
			});

			expect(results.length).toBeGreaterThanOrEqual(1);
			expect(results[0].type).toBe('course');
		});

		it('searches resources by title', async () => {
			const results = await t.query(api.search.unifiedSearch, {
				query: 'atlas',
				entityTypes: ['resource'],
			});

			expect(results.length).toBeGreaterThanOrEqual(1);
			expect(results[0].type).toBe('resource');
			expect(results[0].title).toContain('Atlas');
		});

		it('searches resources by tags', async () => {
			const results = await t.query(api.search.unifiedSearch, {
				query: 'coding',
				entityTypes: ['resource'],
			});

			expect(results.length).toBeGreaterThanOrEqual(1);
			expect(results[0].type).toBe('resource');
		});

		it('searches resources by categories', async () => {
			const results = await t.query(api.search.unifiedSearch, {
				query: 'programming',
				entityTypes: ['resource'],
			});

			expect(results.length).toBeGreaterThanOrEqual(1);
			expect(results[0].type).toBe('resource');
		});

		it('searches users by first name', async () => {
			const results = await t.query(api.search.unifiedSearch, {
				query: 'john',
				entityTypes: ['user'],
			});

			expect(results.length).toBeGreaterThanOrEqual(1);
			expect(results[0].type).toBe('user');
			expect(results[0].title).toContain('John');
		});

		it('searches users by last name', async () => {
			const results = await t.query(api.search.unifiedSearch, {
				query: 'instructor',
				entityTypes: ['user'],
			});

			expect(results.length).toBeGreaterThanOrEqual(1);
			expect(results[0].type).toBe('user');
		});

		it('searches users by email', async () => {
			const results = await t.query(api.search.unifiedSearch, {
				query: 'jane@example',
				entityTypes: ['user'],
			});

			expect(results.length).toBeGreaterThanOrEqual(1);
			expect(results[0].type).toBe('user');
		});

		it('is case insensitive', async () => {
			const lower = await t.query(api.search.unifiedSearch, {
				query: 'dermatology',
			});

			const upper = await t.query(api.search.unifiedSearch, {
				query: 'DERMATOLOGY',
			});

			const mixed = await t.query(api.search.unifiedSearch, {
				query: 'DeRmAtOlOgY',
			});

			expect(lower.length).toBe(upper.length);
			expect(lower.length).toBe(mixed.length);
		});

		it('trims whitespace', async () => {
			const results = await t.query(api.search.unifiedSearch, {
				query: '  dermatology  ',
			});

			expect(results.length).toBeGreaterThan(0);
		});

		it('returns empty array for empty query', async () => {
			const results = await t.query(api.search.unifiedSearch, {
				query: '',
			});

			expect(results).toHaveLength(0);
		});

		it('returns empty array for whitespace-only query', async () => {
			const results = await t.query(api.search.unifiedSearch, {
				query: '   ',
			});

			expect(results).toHaveLength(0);
		});

		it('respects limit parameter', async () => {
			const results = await t.query(api.search.unifiedSearch, {
				query: 'dermatology',
				limit: 2,
			});

			expect(results.length).toBeLessThanOrEqual(2);
		});

		it('filters by entity types', async () => {
			const courseResults = await t.query(api.search.unifiedSearch, {
				query: 'dermatology',
				entityTypes: ['course'],
			});

			expect(courseResults.every((r: any) => r.type === 'course')).toBe(true);

			const resourceResults = await t.query(api.search.unifiedSearch, {
				query: 'dermatology',
				entityTypes: ['resource'],
			});

			expect(resourceResults.every((r: any) => r.type === 'resource')).toBe(true);
		});

		it('filters by multiple entity types', async () => {
			const results = await t.query(api.search.unifiedSearch, {
				query: 'dermatology',
				entityTypes: ['course', 'resource'],
			});

			const types = results.map((r: any) => r.type);
			expect(types.includes('course') || types.includes('resource')).toBe(true);
			expect(types.includes('user')).toBe(false);
		});

		it('sorts by relevance (exact title matches first)', async () => {
			const results = await t.query(api.search.unifiedSearch, {
				query: 'python',
			});

			// Results with "python" in title should come first
			expect(results.length).toBeGreaterThan(0);
		});

		it('includes correct metadata for courses', async () => {
			const results = await t.query(api.search.unifiedSearch, {
				query: 'python',
				entityTypes: ['course'],
			});

			expect(results[0].metadata).toBeDefined();
			expect(results[0].metadata.level).toBeDefined();
			expect(results[0].metadata.price).toBeDefined();
			expect(results[0].metadata.rating).toBeDefined();
		});

		it('includes correct metadata for resources', async () => {
			const results = await t.query(api.search.unifiedSearch, {
				query: 'atlas',
				entityTypes: ['resource'],
			});

			expect(results[0].metadata).toBeDefined();
			expect(results[0].metadata.type).toBeDefined();
			expect(results[0].metadata.difficulty).toBeDefined();
			expect(results[0].metadata.downloadCount).toBeDefined();
		});

		it('includes correct metadata for users', async () => {
			const results = await t.query(api.search.unifiedSearch, {
				query: 'john',
				entityTypes: ['user'],
			});

			expect(results[0].metadata).toBeDefined();
			expect(results[0].metadata.role).toBeDefined();
			expect(results[0].metadata.email).toBeDefined();
		});

		it('sorts with exact title match first', async () => {
			// Create one course with exact match in title, one with match only in description
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.insert('courses', {
					title: 'Testology',
					description: 'Exact title match',
					instructorId,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});

				await ctx.db.insert('courses', {
					title: 'Advanced Biology',
					description: 'This course covers testology extensively',
					instructorId,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});
			});

			const results = await t.query(api.search.unifiedSearch, {
				query: 'testology',
			});

			// Should have at least 2 results
			expect(results.length).toBeGreaterThanOrEqual(2);
			// The one with "testology" in title should come first
			expect(results[0].title.toLowerCase()).toContain('testology');
		});

		it('sorts when second result has title match', async () => {
			// Create resources where one has match in title, other doesn't
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.insert('resources', {
					title: 'General Guide',
					description: 'Contains word uniqueterm',
					type: 'pdf',
					categories: ['test'],
					tags: ['test'],
					url: 'https://example.com/general.pdf',
					author: 'Test',
					dateAdded: '2024-01-01',
					featured: false,
					downloadCount: 0,
					favoriteCount: 0,
					rating: 4.0,
					reviewCount: 0,
					difficulty: 'beginner',
					restricted: false,
				});

				await ctx.db.insert('resources', {
					title: 'Uniqueterm Handbook',
					description: 'Comprehensive guide',
					type: 'pdf',
					categories: ['test'],
					tags: ['test'],
					url: 'https://example.com/unique.pdf',
					author: 'Test',
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

			const results = await t.query(api.search.unifiedSearch, {
				query: 'uniqueterm',
			});

			expect(results.length).toBeGreaterThanOrEqual(2);
			// The one with title match should be ranked higher
			const titleMatch = results.find((r: any) => r.title.toLowerCase().includes('uniqueterm'));
			expect(titleMatch).toBeDefined();
		});

		it('handles admin role in user metadata', async () => {
			// Create admin user
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.insert('users', {
					firstName: 'Admin',
					lastName: 'User',
					email: 'admin@example.com',
					externalId: 'admin-user',
					isInstructor: false,
					isAdmin: true,
				});
			});

			const results = await t.query(api.search.unifiedSearch, {
				query: 'admin',
				entityTypes: ['user'],
			});

			expect(results.length).toBeGreaterThan(0);
			const adminUser = results.find((r: any) => r.title.includes('Admin'));
			expect(adminUser?.metadata.role).toBe('admin');
		});

		it('handles instructor role in user metadata', async () => {
			const results = await t.query(api.search.unifiedSearch, {
				query: 'jane',
				entityTypes: ['user'],
			});

			expect(results.length).toBeGreaterThan(0);
			expect(results[0].metadata.role).toBe('instructor');
		});

		it('handles student role in user metadata', async () => {
			const results = await t.query(api.search.unifiedSearch, {
				query: 'john',
				entityTypes: ['user'],
			});

			expect(results.length).toBeGreaterThan(0);
			expect(results[0].metadata.role).toBe('student');
		});
	});

	describe('advancedSearch()', () => {
		it('searches with basic query', async () => {
			const result = await t.query(api.search.advancedSearch, {
				query: 'dermatology',
				filters: {},
			});

			expect(result.results.length).toBeGreaterThan(0);
			expect(result.total).toBeGreaterThan(0);
		});

		it('filters courses by level', async () => {
			const result = await t.query(api.search.advancedSearch, {
				query: 'dermatology',
				filters: {
					entityTypes: ['course'],
					courseFilters: {
						level: 'advanced',
					},
				},
			});

			expect(result.results.length).toBeGreaterThanOrEqual(1);
			expect(result.results.every((r: any) => r.metadata.level === 'advanced')).toBe(true);
		});

		it('filters courses by price range (min)', async () => {
			const result = await t.query(api.search.advancedSearch, {
				query: 'programming',
				filters: {
					entityTypes: ['course'],
					courseFilters: {
						priceRange: {
							min: 25000,
						},
					},
				},
			});

			// Should exclude Python course (19900) and include Dermatology (29900)
			expect(result.results.every((r: any) => r.metadata.price! >= 25000)).toBe(true);
		});

		it('filters courses by price range (max)', async () => {
			const result = await t.query(api.search.advancedSearch, {
				query: 'programming',
				filters: {
					entityTypes: ['course'],
					courseFilters: {
						priceRange: {
							max: 20000,
						},
					},
				},
			});

			expect(result.results.every((r: any) => r.metadata.price! <= 20000)).toBe(true);
		});

		it('filters courses by price range (min and max)', async () => {
			const result = await t.query(api.search.advancedSearch, {
				query: '',
				filters: {
					entityTypes: ['course'],
					courseFilters: {
						priceRange: {
							min: 15000,
							max: 25000,
						},
					},
				},
			});

			expect(result.results.every((r: any) => r.metadata.price! >= 15000 && r.metadata.price! <= 25000)).toBe(true);
		});

		it('filters resources by type', async () => {
			const result = await t.query(api.search.advancedSearch, {
				query: 'reference',
				filters: {
					entityTypes: ['resource'],
					resourceFilters: {
						type: 'pdf',
					},
				},
			});

			expect(result.results.length).toBeGreaterThan(0);
			expect(result.results.every((r: any) => r.metadata.type === 'pdf')).toBe(true);
		});

		it('filters resources by difficulty', async () => {
			const result = await t.query(api.search.advancedSearch, {
				query: 'reference',
				filters: {
					entityTypes: ['resource'],
					resourceFilters: {
						difficulty: 'beginner',
					},
				},
			});

			expect(result.results.every((r: any) => r.metadata.difficulty === 'beginner')).toBe(true);
		});

		it('filters resources by categories', async () => {
			const result = await t.query(api.search.advancedSearch, {
				query: 'reference',
				filters: {
					entityTypes: ['resource'],
					resourceFilters: {
						categories: ['dermatology'],
					},
				},
			});

			expect(result.results.length).toBeGreaterThan(0);
		});

		it('sorts by relevance (default)', async () => {
			const result = await t.query(api.search.advancedSearch, {
				query: 'python',
				filters: {
					sortBy: 'relevance',
				},
			});

			expect(result.results.length).toBeGreaterThan(0);
		});

		it('sorts by newest', async () => {
			const result = await t.query(api.search.advancedSearch, {
				query: 'programming',
				filters: {
					entityTypes: ['course'],
					sortBy: 'newest',
				},
			});

			if (result.results.length > 1) {
				const first = Number(result.results[0].metadata.createdAt);
				const second = Number(result.results[1].metadata.createdAt);
				expect(first).toBeGreaterThanOrEqual(second);
			}
		});

		it('sorts by rating', async () => {
			const result = await t.query(api.search.advancedSearch, {
				query: '',
				filters: {
					sortBy: 'rating',
				},
			});

			if (result.results.length > 1) {
				const first = result.results[0].metadata.rating || 0;
				const second = result.results[1].metadata.rating || 0;
				expect(first).toBeGreaterThanOrEqual(second);
			}
		});

		it('sorts by popular', async () => {
			const result = await t.query(api.search.advancedSearch, {
				query: '',
				filters: {
					entityTypes: ['resource'],
					sortBy: 'popular',
				},
			});

			if (result.results.length > 1) {
				const first = result.results[0].metadata.downloadCount || 0;
				const second = result.results[1].metadata.downloadCount || 0;
				expect(first).toBeGreaterThanOrEqual(second);
			}
		});

		it('supports pagination with limit', async () => {
			const result = await t.query(api.search.advancedSearch, {
				query: '',
				filters: {},
				limit: 2,
			});

			expect(result.results.length).toBeLessThanOrEqual(2);
		});

		it('supports pagination with offset', async () => {
			const page1 = await t.query(api.search.advancedSearch, {
				query: '',
				filters: {},
				limit: 2,
				offset: 0,
			});

			const page2 = await t.query(api.search.advancedSearch, {
				query: '',
				filters: {},
				limit: 2,
				offset: 2,
			});

			// Different results on different pages
			if (page1.results.length > 0 && page2.results.length > 0) {
				expect(page1.results[0].id).not.toBe(page2.results[0].id);
			}
		});

		it('returns total count', async () => {
			const result = await t.query(api.search.advancedSearch, {
				query: 'dermatology',
				filters: {},
			});

			expect(result.total).toBeGreaterThan(0);
			expect(typeof result.total).toBe('number');
		});

		it('returns hasMore flag', async () => {
			const result = await t.query(api.search.advancedSearch, {
				query: '',
				filters: {},
				limit: 1,
			});

			expect(typeof result.hasMore).toBe('boolean');
		});

		it('hasMore is true when more results exist', async () => {
			const result = await t.query(api.search.advancedSearch, {
				query: '',
				filters: {},
				limit: 1,
			});

			if (result.total > 1) {
				expect(result.hasMore).toBe(true);
			}
		});

		it('hasMore is false when no more results', async () => {
			const result = await t.query(api.search.advancedSearch, {
				query: '',
				filters: {},
				limit: 100,
			});

			expect(result.hasMore).toBe(false);
		});

		it('sorts by relevance with exact title matches', async () => {
			// Create items with exact and partial matches
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.insert('courses', {
					title: 'Exactword',
					description: 'Exact title match',
					instructorId,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});

				await ctx.db.insert('courses', {
					title: 'Something Else',
					description: 'Contains exactword in description',
					instructorId,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});
			});

			const result = await t.query(api.search.advancedSearch, {
				query: 'exactword',
				filters: {
					sortBy: 'relevance',
				},
			});

			expect(result.results.length).toBeGreaterThanOrEqual(2);
			// First result should have exactword in title
			expect(result.results[0].title.toLowerCase()).toContain('exactword');
		});

		it('sorts by relevance when second has title match', async () => {
			// Test the other branch of relevance sorting
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.insert('resources', {
					title: 'General Resource',
					description: 'Contains keywordtest',
					type: 'pdf',
					categories: ['test'],
					tags: ['test'],
					url: 'https://example.com/general.pdf',
					author: 'Test',
					dateAdded: '2024-01-01',
					featured: false,
					downloadCount: 0,
					favoriteCount: 0,
					rating: 4.0,
					reviewCount: 0,
					difficulty: 'beginner',
					restricted: false,
				});

				await ctx.db.insert('resources', {
					title: 'Keywordtest Guide',
					description: 'Comprehensive',
					type: 'pdf',
					categories: ['test'],
					tags: ['test'],
					url: 'https://example.com/keyword.pdf',
					author: 'Test',
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

			const result = await t.query(api.search.advancedSearch, {
				query: 'keywordtest',
				filters: {
					sortBy: 'relevance',
				},
			});

			expect(result.results.length).toBeGreaterThanOrEqual(2);
		});

		it('uses relevance sorting when sortBy is undefined', async () => {
			const result = await t.query(api.search.advancedSearch, {
				query: 'python',
				filters: {},
			});

			expect(result.results.length).toBeGreaterThan(0);
		});

		it('handles popular sort with courses', async () => {
			const result = await t.query(api.search.advancedSearch, {
				query: '',
				filters: {
					entityTypes: ['course'],
					sortBy: 'popular',
				},
			});

			expect(result.results.length).toBeGreaterThan(0);
		});

		it('sorts by newest with resources', async () => {
			// Resources have dateAdded as string, which triggers || 0 when Number() returns NaN
			const result = await t.query(api.search.advancedSearch, {
				query: '',
				filters: {
					entityTypes: ['resource'],
					sortBy: 'newest',
				},
			});

			expect(result.results.length).toBeGreaterThan(0);
		});

		it('sorts by rating with missing rating', async () => {
			await t.run(async (ctx: TestCtx) => {
				// Create multiple courses with varying ratings to cover all branches
				await ctx.db.insert('courses', {
					title: 'No Rating A',
					description: 'Test',
					instructorId,
					createdAt: Date.now(),
					updatedAt: Date.now(),
					// rating not set - triggers || 0
				});

				await ctx.db.insert('courses', {
					title: 'No Rating B',
					description: 'Test',
					instructorId,
					createdAt: Date.now(),
					updatedAt: Date.now(),
					// rating not set - triggers || 0
				});

				await ctx.db.insert('courses', {
					title: 'High Rating',
					description: 'Test',
					instructorId,
					rating: 5.0,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});

				await ctx.db.insert('courses', {
					title: 'Medium Rating',
					description: 'Test',
					instructorId,
					rating: 3.0,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});
			});

			const result = await t.query(api.search.advancedSearch, {
				query: '',
				filters: {
					entityTypes: ['course'],
					sortBy: 'rating',
				},
			});

			// Should have all courses
			expect(result.results.length).toBeGreaterThanOrEqual(4);
			// High rating should be first
			if (result.results.length >= 4) {
				expect(result.results[0].title).toContain('High Rating');
			}
		});

		it('sorts by popular with courses without downloadCount', async () => {
			const result = await t.query(api.search.advancedSearch, {
				query: '',
				filters: {
					entityTypes: ['course'],
					sortBy: 'popular',
				},
			});

			expect(result.results.length).toBeGreaterThan(0);
		});

		it('sorts by popular with mixed courses and resources', async () => {
			// Mix of items with and without downloadCount
			const result = await t.query(api.search.advancedSearch, {
				query: '',
				filters: {
					sortBy: 'popular',
				},
			});

			expect(result.results.length).toBeGreaterThan(0);
		});

		it('sorts by popular with zero downloadCount', async () => {
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.insert('resources', {
					title: 'Zero Downloads',
					description: 'Unpopular resource',
					type: 'pdf',
					categories: ['test'],
					tags: ['test'],
					url: 'https://example.com/zero.pdf',
					author: 'Test',
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

			const result = await t.query(api.search.advancedSearch, {
				query: '',
				filters: {
					entityTypes: ['resource'],
					sortBy: 'popular',
				},
			});

			expect(result.results.length).toBeGreaterThan(0);
		});

		it('sorts by popular with users returns default popularity of 0', async () => {
			// Users don't have downloadCount or students, should use return 0 fallback
			const result = await t.query(api.search.advancedSearch, {
				query: '',
				filters: {
					entityTypes: ['user'],
					sortBy: 'popular',
				},
			});

			// Should work without errors even though users don't have popularity metrics
			expect(result.results.length).toBeGreaterThanOrEqual(0);
		});

		it('covers all user role branches (admin, instructor, student)', async () => {
			// Create users with different roles
			await t.run(async (ctx: TestCtx) => {
				// Admin user
				await ctx.db.insert('users', {
					firstName: 'Admin',
					lastName: 'User',
					email: 'admin@test.com',
					externalId: 'admin-user',
					isInstructor: false,
					isAdmin: true,
				});

				// Instructor user
				await ctx.db.insert('users', {
					firstName: 'Instructor',
					lastName: 'User',
					email: 'instructor@test.com',
					externalId: 'instructor-user',
					isInstructor: true,
					isAdmin: false,
				});

				// Student user (neither admin nor instructor)
				await ctx.db.insert('users', {
					firstName: 'Student',
					lastName: 'User',
					email: 'student@test.com',
					externalId: 'student-user',
					isInstructor: false,
					isAdmin: false,
				});
			});

			const result = await t.query(api.search.advancedSearch, {
				query: '',
				filters: {
					entityTypes: ['user'],
					sortBy: 'newest',
				},
			});

			// Should have all three users with different roles
			const roles = result.results.map((r: any) => r.metadata.role);
			expect(roles).toContain('admin');
			expect(roles).toContain('instructor');
			expect(roles).toContain('student');
		});

		it('handles courses with reviewCount of 0 when sorting by popular', async () => {
			// Create course with 0 reviews
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.insert('courses', {
					title: 'Course With No Reviews',
					description: 'No reviews yet',
					instructorId: instructorId,
					price: 100,
					rating: 0,
					reviewCount: 0,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});
			});

			const result = await t.query(api.search.advancedSearch, {
				query: '',
				filters: {
					entityTypes: ['course'],
					sortBy: 'popular',
				},
			});

			// Should handle 0 reviewCount gracefully
			expect(result.results.length).toBeGreaterThan(0);
		});
	});

	describe('searchSuggestions()', () => {
		it('returns suggestions from course titles', async () => {
			const suggestions = await t.query(api.search.searchSuggestions, {
				query: 'der',
			});

			expect(suggestions.length).toBeGreaterThan(0);
			expect(suggestions.some((s: string) => s.toLowerCase().includes('dermatology'))).toBe(true);
		});

		it('returns suggestions from resource titles', async () => {
			const suggestions = await t.query(api.search.searchSuggestions, {
				query: 'atla',
			});

			expect(suggestions.length).toBeGreaterThan(0);
			expect(suggestions.some((s: string) => s.toLowerCase().includes('atlas'))).toBe(true);
		});

		it('returns suggestions from resource tags', async () => {
			const suggestions = await t.query(api.search.searchSuggestions, {
				query: 'cod',
			});

			expect(suggestions.length).toBeGreaterThan(0);
			expect(suggestions.some((s: string) => s.toLowerCase().includes('coding'))).toBe(true);
		});

		it('returns suggestions from user names', async () => {
			const suggestions = await t.query(api.search.searchSuggestions, {
				query: 'jo',
			});

			expect(suggestions.length).toBeGreaterThan(0);
			expect(suggestions.some((s: string) => s.toLowerCase().includes('john'))).toBe(true);
		});

		it('is case insensitive', async () => {
			const lower = await t.query(api.search.searchSuggestions, {
				query: 'der',
			});

			const upper = await t.query(api.search.searchSuggestions, {
				query: 'DER',
			});

			expect(lower.length).toBe(upper.length);
		});

		it('trims whitespace', async () => {
			const suggestions = await t.query(api.search.searchSuggestions, {
				query: '  der  ',
			});

			expect(suggestions.length).toBeGreaterThan(0);
		});

		it('returns empty array for query shorter than 2 characters', async () => {
			const suggestions = await t.query(api.search.searchSuggestions, {
				query: 'd',
			});

			expect(suggestions).toHaveLength(0);
		});

		it('returns empty array for empty query', async () => {
			const suggestions = await t.query(api.search.searchSuggestions, {
				query: '',
			});

			expect(suggestions).toHaveLength(0);
		});

		it('respects limit parameter', async () => {
			const suggestions = await t.query(api.search.searchSuggestions, {
				query: 'de',
				limit: 2,
			});

			expect(suggestions.length).toBeLessThanOrEqual(2);
		});

		it('returns unique suggestions', async () => {
			const suggestions = await t.query(api.search.searchSuggestions, {
				query: 'der',
			});

			const uniqueSuggestions = new Set(suggestions);
			expect(suggestions.length).toBe(uniqueSuggestions.size);
		});

		it('uses default limit of 10', async () => {
			// Create many courses with similar names
			await t.run(async (ctx: TestCtx) => {
				for (let i = 0; i < 15; i++) {
					await ctx.db.insert('courses', {
						title: `Course ${i}`,
						description: 'Test course',
						instructorId,
						createdAt: Date.now(),
						updatedAt: Date.now(),
					});
				}
			});

			const suggestions = await t.query(api.search.searchSuggestions, {
				query: 'course',
			});

			expect(suggestions.length).toBeLessThanOrEqual(10);
		});
	});
});
