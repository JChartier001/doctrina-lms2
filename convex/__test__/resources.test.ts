import type { GenericMutationCtx } from 'convex/server';
import { convexTest } from 'convex-test';
import { beforeEach, describe, expect, it } from 'vitest';

import { api } from '../_generated/api';
import type { DataModel, Id } from '../_generated/dataModel';
import schema from '../schema';

type TestCtx = GenericMutationCtx<DataModel>;

describe('Resources', () => {
	let t: any;
	let testCourseId: Id<'courses'>;
	let otherCourseId: Id<'courses'>;
	let instructorId: Id<'users'>;

	beforeEach(async () => {
		t = convexTest(schema);

		// Create test data
		await t.run(async (ctx: TestCtx) => {
			// Create instructor
			instructorId = await ctx.db.insert('users', {
				firstName: 'Test',
				lastName: 'Instructor',
				email: 'instructor@example.com',
				externalId: 'test-instructor-id',
				isInstructor: true,
				isAdmin: false,
			});

			// Create courses
			testCourseId = await ctx.db.insert('courses', {
				title: 'Test Course',
				description: 'Test description',
				instructorId,
				price: 29900,
				createdAt: Date.now(),
				updatedAt: Date.now(),
			});

			otherCourseId = await ctx.db.insert('courses', {
				title: 'Other Course',
				description: 'Other description',
				instructorId,
				price: 19900,
				createdAt: Date.now(),
				updatedAt: Date.now(),
			});
		});
	});

	describe('create()', () => {
		it('creates resource with all required fields', async () => {
			const resourceId = await t.mutation(api.resources.create, {
				title: 'Test Resource',
				description: 'Test description',
				type: 'pdf',
				categories: ['dermatology', 'education'],
				tags: ['medical', 'tutorial'],
				url: 'https://example.com/resource.pdf',
				author: 'Dr. Test',
				dateAdded: '2024-01-01',
				featured: false,
				downloadCount: 0,
				favoriteCount: 0,
				rating: 4.5,
				reviewCount: 10,
				difficulty: 'beginner',
				restricted: false,
			});

			expect(resourceId).toBeDefined();

			const resource = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(resourceId);
			});

			expect(resource).toBeDefined();
			expect(resource?.title).toBe('Test Resource');
			expect(resource?.type).toBe('pdf');
			expect(resource?.categories).toEqual(['dermatology', 'education']);
			expect(resource?.tags).toEqual(['medical', 'tutorial']);
		});

		it('creates resource with optional fields', async () => {
			const resourceId = await t.mutation(api.resources.create, {
				title: 'Resource with Optional Fields',
				description: 'Test',
				type: 'video',
				categories: ['test'],
				tags: ['sample'],
				url: 'https://example.com/video.mp4',
				thumbnailUrl: 'https://example.com/thumb.jpg',
				author: 'Test Author',
				dateAdded: '2024-01-01',
				featured: true,
				downloadCount: 5,
				favoriteCount: 10,
				rating: 4.8,
				reviewCount: 20,
				difficulty: 'intermediate',
				duration: '15:30',
				fileSize: '25MB',
				courseId: testCourseId,
				restricted: true,
			});

			const resource = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(resourceId);
			});

			expect(resource?.thumbnailUrl).toBe('https://example.com/thumb.jpg');
			expect(resource?.duration).toBe('15:30');
			expect(resource?.fileSize).toBe('25MB');
			expect(resource?.courseId).toBe(testCourseId);
			expect(resource?.featured).toBe(true);
			expect(resource?.restricted).toBe(true);
		});

		it('creates resource with all difficulty levels', async () => {
			const difficulties = ['beginner', 'intermediate', 'advanced'] as const;

			for (const difficulty of difficulties) {
				const resourceId = await t.mutation(api.resources.create, {
					title: `${difficulty} Resource`,
					description: 'Test',
					type: 'pdf',
					categories: ['test'],
					tags: ['sample'],
					url: `https://example.com/${difficulty}.pdf`,
					author: 'Test',
					dateAdded: '2024-01-01',
					featured: false,
					downloadCount: 0,
					favoriteCount: 0,
					rating: 4.0,
					reviewCount: 0,
					difficulty,
					restricted: false,
				});

				const resource = await t.run(async (ctx: TestCtx) => {
					return await ctx.db.get(resourceId);
				});

				expect(resource?.difficulty).toBe(difficulty);
			}
		});
	});

	describe('get()', () => {
		it('returns resource by ID', async () => {
			const resourceId = await t.mutation(api.resources.create, {
				title: 'Test Resource',
				description: 'Test',
				type: 'pdf',
				categories: ['test'],
				tags: ['sample'],
				url: 'https://example.com/test.pdf',
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

			const resource = await t.query(api.resources.get, { id: resourceId });

			expect(resource).toBeDefined();
			expect(resource?._id).toBe(resourceId);
			expect(resource?.title).toBe('Test Resource');
		});

		it('returns null for non-existent resource', async () => {
			const tempId = await t.run(async (ctx: TestCtx) => {
				const id = await ctx.db.insert('resources', {
					title: 'Temp',
					description: 'Temp',
					type: 'pdf',
					categories: ['test'],
					tags: ['temp'],
					url: 'https://example.com/temp.pdf',
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
				await ctx.db.delete(id);
				return id;
			});

			const resource = await t.query(api.resources.get, { id: tempId });

			expect(resource).toBeNull();
		});
	});

	describe('list()', () => {
		it('returns all resources', async () => {
			await t.mutation(api.resources.create, {
				title: 'Resource 1',
				description: 'Test',
				type: 'pdf',
				categories: ['test'],
				tags: ['sample'],
				url: 'https://example.com/1.pdf',
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

			await t.mutation(api.resources.create, {
				title: 'Resource 2',
				description: 'Test',
				type: 'video',
				categories: ['test'],
				tags: ['sample'],
				url: 'https://example.com/2.mp4',
				author: 'Test',
				dateAdded: '2024-01-02',
				featured: false,
				downloadCount: 0,
				favoriteCount: 0,
				rating: 4.0,
				reviewCount: 0,
				difficulty: 'beginner',
				restricted: false,
			});

			const resources = await t.query(api.resources.list, {});

			expect(resources.length).toBeGreaterThanOrEqual(2);
		});

		it('respects limit parameter', async () => {
			// Create 5 resources
			for (let i = 0; i < 5; i++) {
				await t.mutation(api.resources.create, {
					title: `Resource ${i}`,
					description: 'Test',
					type: 'pdf',
					categories: ['test'],
					tags: ['sample'],
					url: `https://example.com/${i}.pdf`,
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
			}

			const resources = await t.query(api.resources.list, { limit: 3 });

			expect(resources).toHaveLength(3);
		});

		it('filters by courseId', async () => {
			// Create resource for test course
			await t.mutation(api.resources.create, {
				title: 'Course 1 Resource',
				description: 'Test',
				type: 'pdf',
				categories: ['test'],
				tags: ['sample'],
				url: 'https://example.com/course1.pdf',
				author: 'Test',
				dateAdded: '2024-01-01',
				featured: false,
				downloadCount: 0,
				favoriteCount: 0,
				rating: 4.0,
				reviewCount: 0,
				difficulty: 'beginner',
				courseId: testCourseId,
				restricted: false,
			});

			// Create resource for other course
			await t.mutation(api.resources.create, {
				title: 'Course 2 Resource',
				description: 'Test',
				type: 'pdf',
				categories: ['test'],
				tags: ['sample'],
				url: 'https://example.com/course2.pdf',
				author: 'Test',
				dateAdded: '2024-01-01',
				featured: false,
				downloadCount: 0,
				favoriteCount: 0,
				rating: 4.0,
				reviewCount: 0,
				difficulty: 'beginner',
				courseId: otherCourseId,
				restricted: false,
			});

			// Create resource with no course
			await t.mutation(api.resources.create, {
				title: 'No Course Resource',
				description: 'Test',
				type: 'pdf',
				categories: ['test'],
				tags: ['sample'],
				url: 'https://example.com/nocourse.pdf',
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

			const resources = await t.query(api.resources.list, { courseId: testCourseId });

			expect(resources).toHaveLength(1);
			expect(resources[0].title).toBe('Course 1 Resource');
		});

		it('returns all resources when courseId not provided', async () => {
			await t.mutation(api.resources.create, {
				title: 'Resource with Course',
				description: 'Test',
				type: 'pdf',
				categories: ['test'],
				tags: ['sample'],
				url: 'https://example.com/with-course.pdf',
				author: 'Test',
				dateAdded: '2024-01-01',
				featured: false,
				downloadCount: 0,
				favoriteCount: 0,
				rating: 4.0,
				reviewCount: 0,
				difficulty: 'beginner',
				courseId: testCourseId,
				restricted: false,
			});

			await t.mutation(api.resources.create, {
				title: 'Resource without Course',
				description: 'Test',
				type: 'pdf',
				categories: ['test'],
				tags: ['sample'],
				url: 'https://example.com/without-course.pdf',
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

			const resources = await t.query(api.resources.list, {});

			expect(resources.length).toBeGreaterThanOrEqual(2);
		});
	});

	describe('featured()', () => {
		it('returns only featured resources', async () => {
			await t.mutation(api.resources.create, {
				title: 'Featured Resource',
				description: 'Test',
				type: 'pdf',
				categories: ['test'],
				tags: ['sample'],
				url: 'https://example.com/featured.pdf',
				author: 'Test',
				dateAdded: '2024-01-01',
				featured: true,
				downloadCount: 0,
				favoriteCount: 0,
				rating: 4.0,
				reviewCount: 0,
				difficulty: 'beginner',
				restricted: false,
			});

			await t.mutation(api.resources.create, {
				title: 'Not Featured Resource',
				description: 'Test',
				type: 'pdf',
				categories: ['test'],
				tags: ['sample'],
				url: 'https://example.com/not-featured.pdf',
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

			const resources = await t.query(api.resources.featured, {});

			expect(resources).toHaveLength(1);
			expect(resources[0].title).toBe('Featured Resource');
			expect(resources[0].featured).toBe(true);
		});

		it('respects limit parameter', async () => {
			// Create 5 featured resources
			for (let i = 0; i < 5; i++) {
				await t.mutation(api.resources.create, {
					title: `Featured ${i}`,
					description: 'Test',
					type: 'pdf',
					categories: ['test'],
					tags: ['sample'],
					url: `https://example.com/featured${i}.pdf`,
					author: 'Test',
					dateAdded: '2024-01-01',
					featured: true,
					downloadCount: 0,
					favoriteCount: 0,
					rating: 4.0,
					reviewCount: 0,
					difficulty: 'beginner',
					restricted: false,
				});
			}

			const resources = await t.query(api.resources.featured, { limit: 3 });

			expect(resources).toHaveLength(3);
			expect(resources.every(r => r.featured)).toBe(true);
		});

		it('returns empty array when no featured resources', async () => {
			await t.mutation(api.resources.create, {
				title: 'Not Featured',
				description: 'Test',
				type: 'pdf',
				categories: ['test'],
				tags: ['sample'],
				url: 'https://example.com/not-featured.pdf',
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

			const resources = await t.query(api.resources.featured, {});

			expect(resources).toHaveLength(0);
		});
	});

	describe('search()', () => {
		beforeEach(async () => {
			// Create resources for searching
			await t.mutation(api.resources.create, {
				title: 'Dermatology Guide',
				description: 'Comprehensive guide to skin conditions',
				type: 'pdf',
				categories: ['dermatology', 'education'],
				tags: ['medical', 'skin'],
				url: 'https://example.com/derm.pdf',
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

			await t.mutation(api.resources.create, {
				title: 'Python Tutorial',
				description: 'Learn Python programming',
				type: 'video',
				categories: ['programming', 'education'],
				tags: ['coding', 'tutorial'],
				url: 'https://example.com/python.mp4',
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

		it('searches by title', async () => {
			const resources = await t.query(api.resources.search, {
				query: 'Dermatology',
			});

			expect(resources.length).toBeGreaterThanOrEqual(1);
			expect(resources[0].title).toContain('Dermatology');
		});

		it('searches by description', async () => {
			const resources = await t.query(api.resources.search, {
				query: 'skin conditions',
			});

			expect(resources.length).toBeGreaterThanOrEqual(1);
			expect(resources[0].description).toContain('skin conditions');
		});

		it('searches by tags', async () => {
			const resources = await t.query(api.resources.search, {
				query: 'medical',
			});

			expect(resources.length).toBeGreaterThanOrEqual(1);
			expect(resources[0].tags).toContain('medical');
		});

		it('searches by categories', async () => {
			const resources = await t.query(api.resources.search, {
				query: 'programming',
			});

			expect(resources.length).toBeGreaterThanOrEqual(1);
			expect(resources[0].categories).toContain('programming');
		});

		it('is case insensitive', async () => {
			const lower = await t.query(api.resources.search, { query: 'dermatology' });
			const upper = await t.query(api.resources.search, { query: 'DERMATOLOGY' });
			const mixed = await t.query(api.resources.search, { query: 'DeRmAtOlOgY' });

			expect(lower).toHaveLength(upper.length);
			expect(lower).toHaveLength(mixed.length);
		});

		it('returns empty array for empty query', async () => {
			const resources = await t.query(api.resources.search, { query: '' });

			expect(resources).toHaveLength(0);
		});

		it('trims whitespace from query', async () => {
			const resources = await t.query(api.resources.search, {
				query: '  Dermatology  ',
			});

			expect(resources.length).toBeGreaterThanOrEqual(1);
		});

		it('respects limit parameter', async () => {
			// Create multiple resources matching "education"
			for (let i = 0; i < 5; i++) {
				await t.mutation(api.resources.create, {
					title: `Education Resource ${i}`,
					description: 'Test',
					type: 'pdf',
					categories: ['education'],
					tags: ['learning'],
					url: `https://example.com/edu${i}.pdf`,
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
			}

			const resources = await t.query(api.resources.search, {
				query: 'education',
				limit: 3,
			});

			expect(resources).toHaveLength(3);
		});

		it('returns empty array for non-matching query', async () => {
			const resources = await t.query(api.resources.search, {
				query: 'nonexistent search term xyz',
			});

			expect(resources).toHaveLength(0);
		});
	});

	describe('update()', () => {
		it('updates resource fields', async () => {
			const resourceId = await t.mutation(api.resources.create, {
				title: 'Original Title',
				description: 'Original description',
				type: 'pdf',
				categories: ['original'],
				tags: ['old'],
				url: 'https://example.com/original.pdf',
				author: 'Original Author',
				dateAdded: '2024-01-01',
				featured: false,
				downloadCount: 0,
				favoriteCount: 0,
				rating: 3.0,
				reviewCount: 5,
				difficulty: 'beginner',
				restricted: false,
			});

			const returnedId = await t.mutation(api.resources.update, {
				id: resourceId,
				title: 'Updated Title',
				description: 'Updated description',
				rating: 4.5,
				featured: true,
			});

			expect(returnedId).toBe(resourceId);

			const resource = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(resourceId);
			});

			expect(resource?.title).toBe('Updated Title');
			expect(resource?.description).toBe('Updated description');
			expect(resource?.rating).toBe(4.5);
			expect(resource?.featured).toBe(true);
			// Unchanged fields should remain
			expect(resource?.author).toBe('Original Author');
			expect(resource?.type).toBe('pdf');
		});

		it('allows partial updates', async () => {
			const resourceId = await t.mutation(api.resources.create, {
				title: 'Test Resource',
				description: 'Test description',
				type: 'pdf',
				categories: ['test'],
				tags: ['sample'],
				url: 'https://example.com/test.pdf',
				author: 'Test Author',
				dateAdded: '2024-01-01',
				featured: false,
				downloadCount: 5,
				favoriteCount: 10,
				rating: 4.0,
				reviewCount: 10,
				difficulty: 'beginner',
				restricted: false,
			});

			// Update only one field
			await t.mutation(api.resources.update, {
				id: resourceId,
				downloadCount: 15,
			});

			const resource = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(resourceId);
			});

			expect(resource?.downloadCount).toBe(15);
			expect(resource?.title).toBe('Test Resource'); // Unchanged
			expect(resource?.favoriteCount).toBe(10); // Unchanged
		});

		it('returns the resource ID', async () => {
			const resourceId = await t.mutation(api.resources.create, {
				title: 'Test',
				description: 'Test',
				type: 'pdf',
				categories: ['test'],
				tags: ['sample'],
				url: 'https://example.com/test.pdf',
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

			const returnedId = await t.mutation(api.resources.update, {
				id: resourceId,
				title: 'Updated',
			});

			expect(returnedId).toBe(resourceId);
		});
	});

	describe('remove()', () => {
		it('deletes resource', async () => {
			const resourceId = await t.mutation(api.resources.create, {
				title: 'To Delete',
				description: 'Test',
				type: 'pdf',
				categories: ['test'],
				tags: ['sample'],
				url: 'https://example.com/delete.pdf',
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

			// Verify exists
			let resource = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(resourceId);
			});
			expect(resource).toBeDefined();

			// Delete
			const returnedId = await t.mutation(api.resources.remove, {
				id: resourceId,
			});

			expect(returnedId).toBe(resourceId);

			// Verify deleted
			resource = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(resourceId);
			});
			expect(resource).toBeNull();
		});

		it('returns the resource ID', async () => {
			const resourceId = await t.mutation(api.resources.create, {
				title: 'Test',
				description: 'Test',
				type: 'pdf',
				categories: ['test'],
				tags: ['sample'],
				url: 'https://example.com/test.pdf',
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

			const returnedId = await t.mutation(api.resources.remove, {
				id: resourceId,
			});

			expect(returnedId).toBe(resourceId);
		});
	});
});
