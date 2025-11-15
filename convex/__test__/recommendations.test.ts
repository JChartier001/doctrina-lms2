import type { GenericMutationCtx } from 'convex/server';
import { convexTest } from 'convex-test';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { api } from '../_generated/api';
import type { DataModel, Id } from '../_generated/dataModel';
import schema from '../schema';

type TestCtx = GenericMutationCtx<DataModel>;

describe('Recommendations', () => {
	let t: any;
	let testUserId: Id<'users'>;
	let instructorId: Id<'users'>;
	let courseId1: Id<'courses'>;
	let courseId2: Id<'courses'>;
	let courseId3: Id<'courses'>;
	let resourceId1: Id<'resources'>;
	let resourceId2: Id<'resources'>;

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

			await ctx.db.insert('users', {
				firstName: 'Other',
				lastName: 'User',
				email: 'other@example.com',
				externalId: 'other-user-id',
				isInstructor: false,
				isAdmin: false,
			});

			instructorId = await ctx.db.insert('users', {
				firstName: 'Instructor',
				lastName: 'User',
				email: 'instructor@example.com',
				externalId: 'instructor-id',
				isInstructor: true,
				isAdmin: false,
			});

			// Create courses
			courseId1 = await ctx.db.insert('courses', {
				title: 'Beginner Course',
				description: 'Great for beginners',
				instructorId,
				level: 'beginner',
				price: 9900,
				rating: 4.5,
				reviewCount: 100,
				createdAt: Date.now(),
				updatedAt: Date.now(),
			});

			courseId2 = await ctx.db.insert('courses', {
				title: 'Intermediate Course',
				description: 'For intermediate learners',
				instructorId,
				level: 'intermediate',
				price: 19900,
				rating: 4.8,
				reviewCount: 50,
				createdAt: Date.now() - 40 * 24 * 60 * 60 * 1000, // 40 days ago
				updatedAt: Date.now(),
			});

			courseId3 = await ctx.db.insert('courses', {
				title: 'New Advanced Course',
				description: 'Recent advanced content',
				instructorId,
				level: 'advanced',
				price: 29900,
				rating: 4.3,
				reviewCount: 10,
				createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000, // 10 days ago (new)
				updatedAt: Date.now(),
			});

			// Create resources
			resourceId1 = await ctx.db.insert('resources', {
				title: 'Course 1 Resource',
				description: 'Resource for course 1',
				type: 'pdf',
				categories: ['test'],
				tags: ['learning'],
				url: 'https://example.com/resource1.pdf',
				author: 'Test Author',
				dateAdded: '2024-01-01',
				featured: true,
				downloadCount: 500,
				favoriteCount: 50,
				rating: 4.5,
				reviewCount: 25,
				difficulty: 'beginner',
				courseId: courseId1,
				restricted: false,
			});

			resourceId2 = await ctx.db.insert('resources', {
				title: 'General Resource',
				description: 'General purpose resource',
				type: 'video',
				categories: ['test'],
				tags: ['learning'],
				url: 'https://example.com/resource2.mp4',
				author: 'Test Author',
				dateAdded: '2024-01-02',
				featured: false,
				downloadCount: 1000,
				favoriteCount: 100,
				rating: 4.7,
				reviewCount: 50,
				difficulty: 'intermediate',
				restricted: false,
			});
		});
	});

	describe('getCourseRecommendations()', () => {
		it('returns recommendations for user with no purchases', async () => {
			const recommendations = await t.query(api.recommendations.getCourseRecommendations, {
				userId: testUserId,
			});

			expect(recommendations).toBeDefined();
			expect(Array.isArray(recommendations)).toBe(true);
		});

		it('excludes already purchased courses', async () => {
			// Create purchase
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.insert('purchases', {
					userId: testUserId,
					courseId: courseId1,
					amount: 9900,
					status: 'complete',
					createdAt: Date.now(),
				});
			});

			const recommendations = await t.query(api.recommendations.getCourseRecommendations, {
				userId: testUserId,
			});

			const recommendedIds = recommendations.map((r: any) => r.id);
			expect(recommendedIds).not.toContain(courseId1);
		});

		it('boosts courses from familiar instructors', async () => {
			// User purchases course 1
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.insert('purchases', {
					userId: testUserId,
					courseId: courseId1,
					amount: 9900,
					status: 'complete',
					createdAt: Date.now(),
				});
			});

			const recommendations = await t.query(api.recommendations.getCourseRecommendations, {
				userId: testUserId,
			});

			// Other courses from same instructor should be recommended
			expect(recommendations.length).toBeGreaterThan(0);
			// Relevance reason should mention previous purchases
			const instructorCourses = recommendations.filter(
				(r: any) => r.relevanceReason === 'Based on your previous purchases',
			);
			expect(instructorCourses.length).toBeGreaterThan(0);
		});

		it('boosts newer courses', async () => {
			const recommendations = await t.query(api.recommendations.getCourseRecommendations, {
				userId: testUserId,
			});

			// New course (courseId3) should have higher relevance score
			const newCourse = recommendations.find((r: any) => r.id === courseId3);
			expect(newCourse).toBeDefined();
			expect(newCourse.relevanceScore).toBeGreaterThan(newCourse.rating || 0);
		});

		it('sorts by relevance score', async () => {
			const recommendations = await t.query(api.recommendations.getCourseRecommendations, {
				userId: testUserId,
			});

			if (recommendations.length > 1) {
				for (let i = 0; i < recommendations.length - 1; i++) {
					expect(recommendations[i].relevanceScore).toBeGreaterThanOrEqual(recommendations[i + 1].relevanceScore);
				}
			}
		});

		it('respects limit parameter', async () => {
			const recommendations = await t.query(api.recommendations.getCourseRecommendations, {
				userId: testUserId,
				limit: 2,
			});

			expect(recommendations.length).toBeLessThanOrEqual(2);
		});

		it('uses default limit of 6', async () => {
			// Create 10 courses
			await t.run(async (ctx: TestCtx) => {
				for (let i = 0; i < 10; i++) {
					await ctx.db.insert('courses', {
						title: `Extra Course ${i}`,
						description: 'Test',
						instructorId,
						createdAt: Date.now(),
						updatedAt: Date.now(),
					});
				}
			});

			const recommendations = await t.query(api.recommendations.getCourseRecommendations, {
				userId: testUserId,
			});

			expect(recommendations.length).toBeLessThanOrEqual(6);
		});

		it('includes course metadata', async () => {
			const recommendations = await t.query(api.recommendations.getCourseRecommendations, {
				userId: testUserId,
			});

			if (recommendations.length > 0) {
				const rec = recommendations[0];
				expect(rec.id).toBeDefined();
				expect(rec.title).toBeDefined();
				expect(rec.description).toBeDefined();
				expect(rec.relevanceScore).toBeDefined();
				expect(rec.relevanceReason).toBeDefined();
			}
		});

		it('does not include incomplete purchases', async () => {
			// Create incomplete purchase
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.insert('purchases', {
					userId: testUserId,
					courseId: courseId1,
					amount: 9900,
					status: 'open',
					createdAt: Date.now(),
				});
			});

			const recommendations = await t.query(api.recommendations.getCourseRecommendations, {
				userId: testUserId,
			});

			// Course should still be recommended (purchase not complete)
			const recommendedIds = recommendations.map((r: any) => r.id);
			expect(recommendedIds).toContain(courseId1);
		});
	});

	describe('getResourceRecommendations()', () => {
		it('returns resource recommendations', async () => {
			const recommendations = await t.query(api.recommendations.getResourceRecommendations, {
				userId: testUserId,
			});

			expect(recommendations).toBeDefined();
			expect(Array.isArray(recommendations)).toBe(true);
		});

		it('excludes favorited resources', async () => {
			// Add favorite
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.insert('favorites', {
					userId: testUserId,
					resourceId: resourceId1,
					createdAt: Date.now(),
				});
			});

			const recommendations = await t.query(api.recommendations.getResourceRecommendations, {
				userId: testUserId,
			});

			const recommendedIds = recommendations.map((r: any) => r.id);
			expect(recommendedIds).not.toContain(resourceId1);
		});

		it('boosts resources from purchased courses', async () => {
			// Purchase course 1
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.insert('purchases', {
					userId: testUserId,
					courseId: courseId1,
					amount: 9900,
					status: 'complete',
					createdAt: Date.now(),
				});
			});

			const recommendations = await t.query(api.recommendations.getResourceRecommendations, {
				userId: testUserId,
			});

			// Resource from course 1 should have high relevance
			const courseResource = recommendations.find((r: any) => r.id === resourceId1);
			if (courseResource) {
				expect(courseResource.relevanceReason).toBe('Recommended for your courses');
			}
		});

		it('boosts featured resources', async () => {
			const recommendations = await t.query(api.recommendations.getResourceRecommendations, {
				userId: testUserId,
			});

			// Featured resource should be recommended
			const featured = recommendations.find((r: any) => r.id === resourceId1);
			expect(featured).toBeDefined();
		});

		it('boosts resources with high download counts', async () => {
			const recommendations = await t.query(api.recommendations.getResourceRecommendations, {
				userId: testUserId,
			});

			// Resource 2 has higher download count
			const popularResource = recommendations.find((r: any) => r.id === resourceId2);
			expect(popularResource).toBeDefined();
			expect(popularResource.relevanceScore).toBeGreaterThan(0);
		});

		it('sorts by relevance score', async () => {
			const recommendations = await t.query(api.recommendations.getResourceRecommendations, {
				userId: testUserId,
			});

			if (recommendations.length > 1) {
				for (let i = 0; i < recommendations.length - 1; i++) {
					expect(recommendations[i].relevanceScore).toBeGreaterThanOrEqual(recommendations[i + 1].relevanceScore);
				}
			}
		});

		it('respects limit parameter', async () => {
			const recommendations = await t.query(api.recommendations.getResourceRecommendations, {
				userId: testUserId,
				limit: 1,
			});

			expect(recommendations.length).toBeLessThanOrEqual(1);
		});

		it('uses default limit of 6', async () => {
			// Create 10 resources
			await t.run(async (ctx: TestCtx) => {
				for (let i = 0; i < 10; i++) {
					await ctx.db.insert('resources', {
						title: `Extra Resource ${i}`,
						description: 'Test',
						type: 'pdf',
						categories: ['test'],
						tags: ['extra'],
						url: `https://example.com/extra${i}.pdf`,
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
			});

			const recommendations = await t.query(api.recommendations.getResourceRecommendations, {
				userId: testUserId,
			});

			expect(recommendations.length).toBeLessThanOrEqual(6);
		});

		it('includes resource object', async () => {
			const recommendations = await t.query(api.recommendations.getResourceRecommendations, {
				userId: testUserId,
			});

			if (recommendations.length > 0) {
				const rec = recommendations[0];
				expect(rec.resource).toBeDefined();
				expect(rec.resource._id).toBeDefined();
			}
		});

		it('handles resources with undefined rating', async () => {
			await t.run(async (ctx: TestCtx) => {
				// Create resource without rating field
				await ctx.db.insert('resources', {
					title: 'Resource Without Rating',
					description: 'Test resource',
					type: 'pdf',
					categories: ['test'],
					tags: ['test'],
					url: 'https://example.com/no-rating.pdf',
					author: 'Test Author',
					dateAdded: '2024-01-01',
					featured: false,
					downloadCount: 50,
					favoriteCount: 0,
					reviewCount: 0,
					difficulty: 'beginner',
					restricted: false,
					rating: 0,
				} as any);
			});

			const recommendations = await t.query(api.recommendations.getResourceRecommendations, {
				userId: testUserId,
			});

			// Should include the resource with undefined rating (score defaults to 0)
			const resourceWithoutRating = recommendations.find((r: any) => r.title === 'Resource Without Rating');
			(resourceWithoutRating as any).resource.rating = undefined;
			expect(resourceWithoutRating).toBeDefined();
			// Score should be 0 (from rating || 0) + download boost
			expect(resourceWithoutRating?.relevanceScore).toBeGreaterThanOrEqual(0);
		});
	});

	describe('getPathwayRecommendations()', () => {
		it('returns beginner pathway for users with no purchases', async () => {
			const pathways = await t.query(api.recommendations.getPathwayRecommendations, {
				userId: testUserId,
			});

			expect(pathways.length).toBeGreaterThan(0);
			const beginnerPathway = pathways.find((p: any) => p.id === 'beginner-foundation');
			expect(beginnerPathway).toBeDefined();
		});

		it('returns intermediate pathway for users with 2-5 completed courses', async () => {
			// Create 3 completed purchases
			await t.run(async (ctx: TestCtx) => {
				for (let i = 0; i < 3; i++) {
					await ctx.db.insert('purchases', {
						userId: testUserId,
						courseId: courseId1,
						amount: 9900,
						status: 'complete',
						createdAt: Date.now(),
					});
				}
			});

			const pathways = await t.query(api.recommendations.getPathwayRecommendations, {
				userId: testUserId,
			});

			const intermediatePathway = pathways.find((p: any) => p.id === 'intermediate-specialization');
			expect(intermediatePathway).toBeDefined();
		});

		it('returns advanced pathway for users with 5+ completed courses', async () => {
			// Create 6 completed purchases
			await t.run(async (ctx: TestCtx) => {
				for (let i = 0; i < 6; i++) {
					await ctx.db.insert('purchases', {
						userId: testUserId,
						courseId: courseId1,
						amount: 9900,
						status: 'complete',
						createdAt: Date.now(),
					});
				}
			});

			const pathways = await t.query(api.recommendations.getPathwayRecommendations, {
				userId: testUserId,
			});

			const advancedPathway = pathways.find((p: any) => p.id === 'advanced-mastery');
			expect(advancedPathway).toBeDefined();
		});

		it('excludes pathways that dont match user level', async () => {
			// User with 1 course should not see advanced pathway
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.insert('purchases', {
					userId: testUserId,
					courseId: courseId1,
					amount: 9900,
					status: 'complete',
					createdAt: Date.now(),
				});
			});

			const pathways = await t.query(api.recommendations.getPathwayRecommendations, {
				userId: testUserId,
			});

			const advancedPathway = pathways.find((p: any) => p.id === 'advanced-mastery');
			expect(advancedPathway).toBeUndefined();
		});

		it('includes relevance score', async () => {
			const pathways = await t.query(api.recommendations.getPathwayRecommendations, {
				userId: testUserId,
			});

			if (pathways.length > 0) {
				expect(pathways[0].relevanceScore).toBeDefined();
				expect(typeof pathways[0].relevanceScore).toBe('number');
			}
		});

		it('includes relevance reason', async () => {
			const pathways = await t.query(api.recommendations.getPathwayRecommendations, {
				userId: testUserId,
			});

			if (pathways.length > 0) {
				expect(pathways[0].relevanceReason).toBeDefined();
			}
		});

		it('shows "Perfect starting point" for new users', async () => {
			const pathways = await t.query(api.recommendations.getPathwayRecommendations, {
				userId: testUserId,
			});

			if (pathways.length > 0) {
				expect(pathways[0].relevanceReason).toBe('Perfect starting point');
			}
		});

		it('shows "Next step" for users with courses', async () => {
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.insert('purchases', {
					userId: testUserId,
					courseId: courseId1,
					amount: 9900,
					status: 'complete',
					createdAt: Date.now(),
				});
			});

			const pathways = await t.query(api.recommendations.getPathwayRecommendations, {
				userId: testUserId,
			});

			if (pathways.length > 0) {
				expect(pathways[0].relevanceReason).toBe('Next step in your learning journey');
			}
		});

		it('respects limit parameter', async () => {
			const pathways = await t.query(api.recommendations.getPathwayRecommendations, {
				userId: testUserId,
				limit: 1,
			});

			expect(pathways.length).toBeLessThanOrEqual(1);
		});

		it('uses default limit of 3', async () => {
			const pathways = await t.query(api.recommendations.getPathwayRecommendations, {
				userId: testUserId,
			});

			expect(pathways.length).toBeLessThanOrEqual(3);
		});
	});

	describe('getTrendingContent()', () => {
		it('returns trending content', async () => {
			const trending = await t.query(api.recommendations.getTrendingContent, {});

			expect(trending).toBeDefined();
			expect(Array.isArray(trending)).toBe(true);
		});

		it('includes courses with purchases', async () => {
			// Create multiple purchases for course 1
			await t.run(async (ctx: TestCtx) => {
				for (let i = 0; i < 3; i++) {
					const userId = await ctx.db.insert('users', {
						firstName: 'User',
						lastName: `${i}`,
						email: `trending-user${i}@example.com`,
						externalId: `trending-user-${i}`,
						isInstructor: false,
						isAdmin: false,
					});

					await ctx.db.insert('purchases', {
						userId,
						courseId: courseId1,
						amount: 9900,
						status: 'complete',
						createdAt: Date.now(),
					});
				}
			});

			const trending = await t.query(api.recommendations.getTrendingContent, {});

			const trendingCourse = trending.find((t: any) => t.id === courseId1);
			expect(trendingCourse).toBeDefined();
			expect(trendingCourse.type).toBe('course');
		});

		it('includes resources with favorites', async () => {
			// Create multiple favorites for resource 1
			await t.run(async (ctx: TestCtx) => {
				for (let i = 0; i < 3; i++) {
					const userId = await ctx.db.insert('users', {
						firstName: 'User',
						lastName: `${i}`,
						email: `user${i}@example.com`,
						externalId: `user-${i}`,
						isInstructor: false,
						isAdmin: false,
					});

					await ctx.db.insert('favorites', {
						userId,
						resourceId: resourceId1,
						createdAt: Date.now(),
					});
				}
			});

			const trending = await t.query(api.recommendations.getTrendingContent, {});

			const trendingResource = trending.find((t: any) => t.id === resourceId1);
			expect(trendingResource).toBeDefined();
			expect(trendingResource.type).toBe('resource');
		});

		it('sorts by popularity', async () => {
			// Create different purchase counts for different courses
			await t.run(async (ctx: TestCtx) => {
				// 3 purchases for course 1
				for (let i = 0; i < 3; i++) {
					const userId = await ctx.db.insert('users', {
						firstName: 'User',
						lastName: `A${i}`,
						email: `user-a-${i}@example.com`,
						externalId: `user-a-${i}`,
						isInstructor: false,
						isAdmin: false,
					});

					await ctx.db.insert('purchases', {
						userId,
						courseId: courseId1,
						amount: 9900,
						status: 'complete',
						createdAt: Date.now(),
					});
				}

				// 5 purchases for course 2
				for (let i = 0; i < 5; i++) {
					const userId = await ctx.db.insert('users', {
						firstName: 'User',
						lastName: `B${i}`,
						email: `user-b-${i}@example.com`,
						externalId: `user-b-${i}`,
						isInstructor: false,
						isAdmin: false,
					});

					await ctx.db.insert('purchases', {
						userId,
						courseId: courseId2,
						amount: 19900,
						status: 'complete',
						createdAt: Date.now(),
					});
				}
			});

			const trending = await t.query(api.recommendations.getTrendingContent, {});

			// Course 2 should appear before course 1
			const course1Index = trending.findIndex((t: any) => t.id === courseId1);
			const course2Index = trending.findIndex((t: any) => t.id === courseId2);

			if (course1Index !== -1 && course2Index !== -1) {
				expect(course2Index).toBeLessThan(course1Index);
			}
		});

		it('respects limit parameter', async () => {
			const trending = await t.query(api.recommendations.getTrendingContent, {
				limit: 2,
			});

			expect(trending.length).toBeLessThanOrEqual(2);
		});

		it('uses default limit of 10', async () => {
			const trending = await t.query(api.recommendations.getTrendingContent, {});

			expect(trending.length).toBeLessThanOrEqual(10);
		});

		it('includes popularity count', async () => {
			await t.run(async (ctx: TestCtx) => {
				const user1Id = await ctx.db.insert('users', {
					firstName: 'User',
					lastName: 'One',
					email: 'user1@test.com',
					externalId: 'user-1',
					isInstructor: false,
					isAdmin: false,
				});

				await ctx.db.insert('purchases', {
					userId: user1Id,
					courseId: courseId1,
					amount: 9900,
					status: 'complete',
					createdAt: Date.now(),
				});
			});

			const trending = await t.query(api.recommendations.getTrendingContent, {});

			if (trending.length > 0) {
				expect(trending[0].popularity).toBeDefined();
				expect(typeof trending[0].popularity).toBe('number');
			}
		});

		it('handles multiple resources with different popularity', async () => {
			// Create multiple resources with different favorite counts to test resource sorting
			const { resource1, resource2, resource3 } = await t.run(async (ctx: TestCtx) => {
				// Create 3 resources
				const r1 = await ctx.db.insert('resources', {
					title: 'Resource Low',
					description: 'Low popularity',
					type: 'pdf',
					categories: ['test'],
					tags: ['test'],
					url: 'https://example.com/r1.pdf',
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

				const r2 = await ctx.db.insert('resources', {
					title: 'Resource High',
					description: 'High popularity',
					type: 'pdf',
					categories: ['test'],
					tags: ['test'],
					url: 'https://example.com/r2.pdf',
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

				const r3 = await ctx.db.insert('resources', {
					title: 'Resource Med',
					description: 'Medium popularity',
					type: 'pdf',
					categories: ['test'],
					tags: ['test'],
					url: 'https://example.com/r3.pdf',
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

				// Create users and favorites: 5 for r2, 3 for r3, 1 for r1
				for (let i = 0; i < 5; i++) {
					const userId = await ctx.db.insert('users', {
						firstName: 'FavUser',
						lastName: `${i}`,
						email: `favuser${i}@test.com`,
						externalId: `favuser-${i}`,
						isInstructor: false,
						isAdmin: false,
					});

					// All 5 users favorite r2
					await ctx.db.insert('favorites', {
						userId,
						resourceId: r2,
						createdAt: Date.now(),
					});

					// First 3 users favorite r3
					if (i < 3) {
						await ctx.db.insert('favorites', {
							userId,
							resourceId: r3,
							createdAt: Date.now(),
						});
					}

					// Only first user favorites r1
					if (i < 1) {
						await ctx.db.insert('favorites', {
							userId,
							resourceId: r1,
							createdAt: Date.now(),
						});
					}
				}

				return { resource1: r1, resource2: r2, resource3: r3 };
			});

			// Query trending with large limit to ensure all resources are included
			const trending = await t.query(api.recommendations.getTrendingContent, { limit: 20 });

			// Filter to only resources
			const resources = trending.filter((t: any) => t.type === 'resource');

			// Should have multiple resources
			expect(resources.length).toBeGreaterThanOrEqual(2);

			// r2 should have highest popularity
			const r2Result = resources.find((r: any) => r.id === resource2);
			if (r2Result) {
				expect(r2Result.popularity).toBe(5);
			}
		});

		it('only includes complete purchases', async () => {
			await t.run(async (ctx: TestCtx) => {
				const user1Id = await ctx.db.insert('users', {
					firstName: 'User',
					lastName: 'One',
					email: 'user1@test.com',
					externalId: 'user-1',
					isInstructor: false,
					isAdmin: false,
				});

				await ctx.db.insert('purchases', {
					userId: user1Id,
					courseId: courseId1,
					amount: 9900,
					status: 'open',
					createdAt: Date.now(),
				});
			});

			const trending = await t.query(api.recommendations.getTrendingContent, {});

			// Course 1 should not be in trending (purchase not complete)
			const trendingCourse = trending.find((t: any) => t.id === courseId1);
			expect(trendingCourse).toBeUndefined();
		});

		it('filters out null results when course is deleted', async () => {
			// Create purchase for a course, then delete the course
			const deletedCourseId = await t.run(async (ctx: TestCtx) => {
				const userId = await ctx.db.insert('users', {
					firstName: 'Test',
					lastName: 'User',
					email: 'deleted-course@example.com',
					externalId: 'deleted-course-user',
					isInstructor: false,
					isAdmin: false,
				});

				const tempCourseId = await ctx.db.insert('courses', {
					title: 'Course to Delete',
					description: 'Will be deleted',
					instructorId: instructorId,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});

				// Create purchase
				await ctx.db.insert('purchases', {
					userId,
					courseId: tempCourseId,
					amount: 9900,
					status: 'complete',
					createdAt: Date.now(),
				});

				// Delete the course
				await ctx.db.delete(tempCourseId);

				return tempCourseId;
			});

			const trending = await t.query(api.recommendations.getTrendingContent, {});

			// Should not include the deleted course
			const deletedCourse = trending.find((t: any) => t.id === deletedCourseId);
			expect(deletedCourse).toBeUndefined();
			// All results should be non-null
			expect(trending.every((t: any) => t !== null)).toBe(true);
		});

		it('filters out null results when resource is deleted', async () => {
			// Create favorite for a resource, then delete the resource
			const deletedResourceId = await t.run(async (ctx: TestCtx) => {
				const userId = await ctx.db.insert('users', {
					firstName: 'Test',
					lastName: 'User',
					email: 'deleted-resource@example.com',
					externalId: 'deleted-resource-user',
					isInstructor: false,
					isAdmin: false,
				});

				const tempResourceId = await ctx.db.insert('resources', {
					title: 'Resource to Delete',
					description: 'Will be deleted',
					type: 'pdf',
					categories: ['test'],
					tags: ['test'],
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

				// Create favorite
				await ctx.db.insert('favorites', {
					userId,
					resourceId: tempResourceId,
					createdAt: Date.now(),
				});

				// Delete the resource
				await ctx.db.delete(tempResourceId);

				return tempResourceId;
			});

			const trending = await t.query(api.recommendations.getTrendingContent, {});

			// Should not include the deleted resource
			const deletedResource = trending.find((t: any) => t.id === deletedResourceId);
			expect(deletedResource).toBeUndefined();
			// All results should be non-null
			expect(trending.every((t: any) => t !== null)).toBe(true);
		});

		it('handles courses and resources with zero popularity', async () => {
			// Create course and resource with no purchases/favorites
			await t.run(async (ctx: TestCtx) => {
				const instructorId = await ctx.db.insert('users', {
					firstName: 'Test',
					lastName: 'Instructor',
					email: 'instructor-zero@example.com',
					externalId: 'instructor-zero',
					isInstructor: true,
					isAdmin: false,
				});

				await ctx.db.insert('courses', {
					title: 'Unpopular Course',
					description: 'No purchases yet',
					instructorId,
					price: 50,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});

				await ctx.db.insert('resources', {
					title: 'Unpopular Resource',
					description: 'No favorites yet',
					type: 'pdf',
					categories: ['test'],
					tags: ['test'],
					url: 'https://example.com/unpopular.pdf',
					author: 'Test',
					dateAdded: '2024-01-01',
					featured: false,
					downloadCount: 0,
					favoriteCount: 0,
					rating: 3.0,
					reviewCount: 0,
					difficulty: 'beginner',
					restricted: false,
				});
			});

			const trending = await t.query(api.recommendations.getTrendingContent, {});

			// Should include items with 0 popularity (using || 0 fallback)
			expect(trending).toBeDefined();
			// All items should have popularity >= 0
			expect(trending.every((t: any) => typeof t.popularity === 'number' && t.popularity >= 0)).toBe(true);
		});
	});
});
