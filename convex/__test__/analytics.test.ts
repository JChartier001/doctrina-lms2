import type { GenericMutationCtx } from 'convex/server';
import { convexTest } from 'convex-test';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { api } from '../_generated/api';
import type { DataModel, Id } from '../_generated/dataModel';
import { getPlatformAnalyticsInternal } from '../analytics';
import schema from '../schema';

type TestCtx = GenericMutationCtx<DataModel>;

describe('Analytics', () => {
	let t: any;
	let instructorId: Id<'users'>;
	let studentId: Id<'users'>;
	let courseId: Id<'courses'>;
	let resourceId: Id<'resources'>;

	beforeEach(async () => {
		t = convexTest(schema);

		// Create test data
		await t.run(async (ctx: TestCtx) => {
			// Create instructor
			instructorId = await ctx.db.insert('users', {
				firstName: 'Test',
				lastName: 'Instructor',
				email: 'instructor@example.com',
				externalId: 'instructor-id',
				isInstructor: true,
				isAdmin: false,
			});

			// Create student
			studentId = await ctx.db.insert('users', {
				firstName: 'Test',
				lastName: 'Student',
				email: 'student@example.com',
				externalId: 'student-id',
				isInstructor: false,
				isAdmin: false,
			});

			// Create course
			courseId = await ctx.db.insert('courses', {
				title: 'Test Course',
				description: 'Test description',
				instructorId,
				price: 29900,
				rating: 4.5,
				reviewCount: 100,
				createdAt: Date.now(),
				updatedAt: Date.now(),
			});

			// Create resource
			resourceId = await ctx.db.insert('resources', {
				title: 'Test Resource',
				description: 'Test description',
				type: 'pdf',
				categories: ['category1', 'category2'],
				tags: ['tag1'],
				url: 'https://example.com/resource.pdf',
				author: 'Test Author',
				dateAdded: '2024-01-01',
				featured: false,
				downloadCount: 100,
				favoriteCount: 50,
				rating: 4.5,
				reviewCount: 25,
				difficulty: 'beginner',
				restricted: false,
			});
		});
	});

	describe('getInstructorAnalytics()', () => {
		it('returns analytics for instructor', async () => {
			const analytics = await t.query(api.analytics.getInstructorAnalytics, {
				instructorId,
			});

			expect(analytics).toBeDefined();
			expect(analytics.overview).toBeDefined();
			expect(analytics.courseAnalytics).toBeDefined();
			expect(analytics.enrollmentTrend).toBeDefined();
		});

		it('calculates total revenue from complete purchases', async () => {
			await t.run(async (ctx: TestCtx) => {
				const student1Id = await ctx.db.insert('users', {
					firstName: 'Student',
					lastName: 'One',
					email: 'student1@test.com',
					externalId: 'student-1',
					isInstructor: false,
					isAdmin: false,
				});

				const student2Id = await ctx.db.insert('users', {
					firstName: 'Student',
					lastName: 'Two',
					email: 'student2@test.com',
					externalId: 'student-2',
					isInstructor: false,
					isAdmin: false,
				});

				await ctx.db.insert('purchases', {
					userId: student1Id,
					courseId,
					amount: 29900,
					status: 'complete',
					createdAt: Date.now(),
				});

				await ctx.db.insert('purchases', {
					userId: student2Id,
					courseId,
					amount: 29900,
					status: 'complete',
					createdAt: Date.now(),
				});
			});

			const analytics = await t.query(api.analytics.getInstructorAnalytics, {
				instructorId,
			});

			expect(analytics.overview.totalRevenue).toBe(59800);
		});

		it('excludes incomplete purchases from revenue', async () => {
			await t.run(async (ctx: TestCtx) => {
				const student1Id = await ctx.db.insert('users', {
					firstName: 'Student',
					lastName: 'One',
					email: 'student1@test.com',
					externalId: 'student-1',
					isInstructor: false,
					isAdmin: false,
				});

				const student2Id = await ctx.db.insert('users', {
					firstName: 'Student',
					lastName: 'Two',
					email: 'student2@test.com',
					externalId: 'student-2',
					isInstructor: false,
					isAdmin: false,
				});

				await ctx.db.insert('purchases', {
					userId: student1Id,
					courseId,
					amount: 29900,
					status: 'complete',
					createdAt: Date.now(),
				});

				await ctx.db.insert('purchases', {
					userId: student2Id,
					courseId,
					amount: 29900,
					status: 'open',
					createdAt: Date.now(),
				});
			});

			const analytics = await t.query(api.analytics.getInstructorAnalytics, {
				instructorId,
			});

			expect(analytics.overview.totalRevenue).toBe(29900);
		});

		it('calculates total unique students', async () => {
			await t.run(async (ctx: TestCtx) => {
				const student1Id = await ctx.db.insert('users', {
					firstName: 'Student',
					lastName: 'One',
					email: 'student1@test.com',
					externalId: 'student-1',
					isInstructor: false,
					isAdmin: false,
				});

				const student2Id = await ctx.db.insert('users', {
					firstName: 'Student',
					lastName: 'Two',
					email: 'student2@test.com',
					externalId: 'student-2',
					isInstructor: false,
					isAdmin: false,
				});

				// Same student makes 2 purchases
				await ctx.db.insert('purchases', {
					userId: student1Id,
					courseId,
					amount: 29900,
					status: 'complete',
					createdAt: Date.now(),
				});

				await ctx.db.insert('purchases', {
					userId: student1Id,
					courseId,
					amount: 29900,
					status: 'complete',
					createdAt: Date.now(),
				});

				// Different student
				await ctx.db.insert('purchases', {
					userId: student2Id,
					courseId,
					amount: 29900,
					status: 'complete',
					createdAt: Date.now(),
				});
			});

			const analytics = await t.query(api.analytics.getInstructorAnalytics, {
				instructorId,
			});

			expect(analytics.overview.totalStudents).toBe(2);
		});

		it('filters by time range (7d)', async () => {
			const now = Date.now();
			const eightDaysAgo = now - 8 * 24 * 60 * 60 * 1000;
			const threeDaysAgo = now - 3 * 24 * 60 * 60 * 1000;

			await t.run(async (ctx: TestCtx) => {
				const student1Id = await ctx.db.insert('users', {
					firstName: 'Student',
					lastName: 'One',
					email: 'student1@test.com',
					externalId: 'student-1',
					isInstructor: false,
					isAdmin: false,
				});

				const student2Id = await ctx.db.insert('users', {
					firstName: 'Student',
					lastName: 'Two',
					email: 'student2@test.com',
					externalId: 'student-2',
					isInstructor: false,
					isAdmin: false,
				});

				// Old purchase (outside 7d)
				await ctx.db.insert('purchases', {
					userId: student1Id,
					courseId,
					amount: 29900,
					status: 'complete',
					createdAt: eightDaysAgo,
				});

				// Recent purchase (within 7d)
				await ctx.db.insert('purchases', {
					userId: student2Id,
					courseId,
					amount: 29900,
					status: 'complete',
					createdAt: threeDaysAgo,
				});
			});

			const analytics = await t.query(api.analytics.getInstructorAnalytics, {
				instructorId,
				timeRange: '7d',
			});

			expect(analytics.overview.totalRevenue).toBe(29900);
		});

		it('uses 30d as default time range', async () => {
			const now = Date.now();
			const fortyDaysAgo = now - 40 * 24 * 60 * 60 * 1000;

			await t.run(async (ctx: TestCtx) => {
				const student1Id = await ctx.db.insert('users', {
					firstName: 'Student',
					lastName: 'One',
					email: 'student1@test.com',
					externalId: 'student-1',
					isInstructor: false,
					isAdmin: false,
				});

				await ctx.db.insert('purchases', {
					userId: student1Id,
					courseId,
					amount: 29900,
					status: 'complete',
					createdAt: fortyDaysAgo,
				});
			});

			const analytics = await t.query(api.analytics.getInstructorAnalytics, {
				instructorId,
			});

			expect(analytics.overview.totalRevenue).toBe(0);
		});

		it('provides per-course analytics', async () => {
			await t.run(async (ctx: TestCtx) => {
				const student1Id = await ctx.db.insert('users', {
					firstName: 'Student',
					lastName: 'One',
					email: 'student1@test.com',
					externalId: 'student-1',
					isInstructor: false,
					isAdmin: false,
				});

				await ctx.db.insert('purchases', {
					userId: student1Id,
					courseId,
					amount: 29900,
					status: 'complete',
					createdAt: Date.now(),
				});
			});

			const analytics = await t.query(api.analytics.getInstructorAnalytics, {
				instructorId,
			});

			expect(analytics.courseAnalytics).toHaveLength(1);
			expect(analytics.courseAnalytics[0].courseId).toBe(courseId);
			expect(analytics.courseAnalytics[0].title).toBe('Test Course');
			expect(analytics.courseAnalytics[0].recentStudents).toBe(1);
		});

		it('provides enrollment trend data', async () => {
			const analytics = await t.query(api.analytics.getInstructorAnalytics, {
				instructorId,
				timeRange: '7d',
			});

			expect(analytics.enrollmentTrend).toHaveLength(7);
			expect(analytics.enrollmentTrend[0].date).toBeDefined();
			expect(analytics.enrollmentTrend[0].enrollments).toBeDefined();
			expect(analytics.enrollmentTrend[0].revenue).toBeDefined();
		});

		it('calculates average rating across courses', async () => {
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.insert('courses', {
					title: 'Course 2',
					description: 'Test',
					instructorId,
					rating: 4.0,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});
			});

			const analytics = await t.query(api.analytics.getInstructorAnalytics, {
				instructorId,
			});

			// (4.5 + 4.0) / 2 = 4.25
			expect(analytics.overview.averageRating).toBeCloseTo(4.25, 2);
		});

		it('filters by time range (90d)', async () => {
			const now = Date.now();
			const hundredDaysAgo = now - 100 * 24 * 60 * 60 * 1000;
			const fiftyDaysAgo = now - 50 * 24 * 60 * 60 * 1000;

			await t.run(async (ctx: TestCtx) => {
				const student1Id = await ctx.db.insert('users', {
					firstName: 'Student',
					lastName: 'One',
					email: 'student1@test.com',
					externalId: 'student-1',
					isInstructor: false,
					isAdmin: false,
				});

				const student2Id = await ctx.db.insert('users', {
					firstName: 'Student',
					lastName: 'Two',
					email: 'student2@test.com',
					externalId: 'student-2',
					isInstructor: false,
					isAdmin: false,
				});

				// Old purchase (outside 90d)
				await ctx.db.insert('purchases', {
					userId: student1Id,
					courseId,
					amount: 29900,
					status: 'complete',
					createdAt: hundredDaysAgo,
				});

				// Recent purchase (within 90d)
				await ctx.db.insert('purchases', {
					userId: student2Id,
					courseId,
					amount: 29900,
					status: 'complete',
					createdAt: fiftyDaysAgo,
				});
			});

			const analytics = await t.query(api.analytics.getInstructorAnalytics, {
				instructorId,
				timeRange: '90d',
			});

			expect(analytics.overview.totalRevenue).toBe(29900);
		});

		it('filters by time range (1y)', async () => {
			const now = Date.now();
			const twoYearsAgo = now - 2 * 365 * 24 * 60 * 60 * 1000;
			const sixMonthsAgo = now - 180 * 24 * 60 * 60 * 1000;

			await t.run(async (ctx: TestCtx) => {
				const student1Id = await ctx.db.insert('users', {
					firstName: 'Student',
					lastName: 'One',
					email: 'student1@test.com',
					externalId: 'student-1',
					isInstructor: false,
					isAdmin: false,
				});

				const student2Id = await ctx.db.insert('users', {
					firstName: 'Student',
					lastName: 'Two',
					email: 'student2@test.com',
					externalId: 'student-2',
					isInstructor: false,
					isAdmin: false,
				});

				// Old purchase (outside 1y)
				await ctx.db.insert('purchases', {
					userId: student1Id,
					courseId,
					amount: 29900,
					status: 'complete',
					createdAt: twoYearsAgo,
				});

				// Recent purchase (within 1y)
				await ctx.db.insert('purchases', {
					userId: student2Id,
					courseId,
					amount: 29900,
					status: 'complete',
					createdAt: sixMonthsAgo,
				});
			});

			const analytics = await t.query(api.analytics.getInstructorAnalytics, {
				instructorId,
				timeRange: '1y',
			});

			expect(analytics.overview.totalRevenue).toBe(29900);
		});

		it('returns 0 for average rating when instructor has no courses', async () => {
			// Create a new instructor with no courses
			const newInstructorId = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('users', {
					firstName: 'New',
					lastName: 'Instructor',
					email: 'new.instructor@example.com',
					externalId: 'new-instructor-id',
					isInstructor: true,
					isAdmin: false,
				});
			});

			const analytics = await t.query(api.analytics.getInstructorAnalytics, {
				instructorId: newInstructorId,
			});

			expect(analytics.overview.averageRating).toBe(0);
			expect(analytics.overview.totalCourses).toBe(0);
		});

		it('calculates average rating correctly when a course has rating of 0', async () => {
			await t.run(async (ctx: TestCtx) => {
				// Create course with rating of 0 (falsy but valid number)
				await ctx.db.insert('courses', {
					title: 'Course With Zero Rating',
					description: 'Test',
					instructorId,
					rating: 0,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});
			});

			const analytics = await t.query(api.analytics.getInstructorAnalytics, {
				instructorId,
			});

			// Original course has 4.5, new course has 0: (4.5 + 0) / 2 = 2.25
			expect(analytics.overview.averageRating).toBeCloseTo(2.25, 2);
		});

		it('handles course with undefined rating in courseAnalytics', async () => {
			await t.run(async (ctx: TestCtx) => {
				// Create course without rating field
				await ctx.db.insert('courses', {
					title: 'Course Without Rating',
					description: 'Test',
					instructorId,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});
			});

			const analytics = await t.query(api.analytics.getInstructorAnalytics, {
				instructorId,
			});

			// Should have 2 courses (original + new one without rating)
			expect(analytics.courseAnalytics.length).toBe(2);
			// Find the course without rating
			const courseWithoutRating = analytics.courseAnalytics.find(c => c.title === 'Course Without Rating');
			expect(courseWithoutRating?.rating).toBe(0);
		});
	});

	describe('getPlatformAnalytics()', () => {
		it('returns platform-wide analytics', async () => {
			const analytics = await t.query(api.analytics.getPlatformAnalytics, {});

			expect(analytics).toBeDefined();
			expect(analytics.overview).toBeDefined();
			expect(analytics.userGrowthTrend).toBeDefined();
			expect(analytics.topCourses).toBeDefined();
		});

		it('calculates total revenue', async () => {
			await t.run(async (ctx: TestCtx) => {
				const student1Id = await ctx.db.insert('users', {
					firstName: 'Student',
					lastName: 'One',
					email: 'student1@test.com',
					externalId: 'student-1',
					isInstructor: false,
					isAdmin: false,
				});

				await ctx.db.insert('purchases', {
					userId: student1Id,
					courseId,
					amount: 29900,
					status: 'complete',
					createdAt: Date.now(),
				});
			});

			const analytics = await t.query(api.analytics.getPlatformAnalytics, {});

			expect(analytics.overview.totalRevenue).toBe(29900);
		});

		it('counts total users', async () => {
			const analytics = await t.query(api.analytics.getPlatformAnalytics, {});

			// At least 2 users (instructor + student)
			expect(analytics.overview.totalUsers).toBeGreaterThanOrEqual(2);
		});

		it('counts total courses', async () => {
			const analytics = await t.query(api.analytics.getPlatformAnalytics, {});

			expect(analytics.overview.totalCourses).toBeGreaterThanOrEqual(1);
		});

		it('calculates average revenue per enrollment', async () => {
			await t.run(async (ctx: TestCtx) => {
				const student1Id = await ctx.db.insert('users', {
					firstName: 'Student',
					lastName: 'One',
					email: 'student1@test.com',
					externalId: 'student-1',
					isInstructor: false,
					isAdmin: false,
				});

				const student2Id = await ctx.db.insert('users', {
					firstName: 'Student',
					lastName: 'Two',
					email: 'student2@test.com',
					externalId: 'student-2',
					isInstructor: false,
					isAdmin: false,
				});

				await ctx.db.insert('purchases', {
					userId: student1Id,
					courseId,
					amount: 30000,
					status: 'complete',
					createdAt: Date.now(),
				});

				await ctx.db.insert('purchases', {
					userId: student2Id,
					courseId,
					amount: 20000,
					status: 'complete',
					createdAt: Date.now(),
				});
			});

			const analytics = await t.query(api.analytics.getPlatformAnalytics, {});

			expect(analytics.overview.averageRevenuePerEnrollment).toBe(25000);
		});

		it('handles zero enrollments gracefully', async () => {
			const analytics = await t.query(api.analytics.getPlatformAnalytics, {});

			expect(analytics.overview.averageRevenuePerEnrollment).toBe(0);
		});

		it('provides user growth trend', async () => {
			const analytics = await t.query(api.analytics.getPlatformAnalytics, {
				timeRange: '7d',
			});

			expect(analytics.userGrowthTrend).toHaveLength(7);
			expect(analytics.userGrowthTrend[0].date).toBeDefined();
			expect(analytics.userGrowthTrend[0].newUsers).toBeDefined();
		});

		it('ranks top courses by enrollment', async () => {
			await t.run(async (ctx: TestCtx) => {
				// 3 enrollments for our test course
				for (let i = 0; i < 3; i++) {
					const studentUserId = await ctx.db.insert('users', {
						firstName: 'Student',
						lastName: `${i}`,
						email: `student${i}@test.com`,
						externalId: `student-${i}`,
						isInstructor: false,
						isAdmin: false,
					});

					await ctx.db.insert('purchases', {
						userId: studentUserId,
						courseId,
						amount: 29900,
						status: 'complete',
						createdAt: Date.now(),
					});
				}
			});

			const analytics = await t.query(api.analytics.getPlatformAnalytics, {});

			expect(analytics.topCourses.length).toBeGreaterThan(0);
			expect(analytics.topCourses[0].enrollments).toBe(3);
		});

		it('filters out null top courses', async () => {
			const analytics = await t.query(api.analytics.getPlatformAnalytics, {});

			// No null entries
			expect(analytics.topCourses.every(c => c !== null)).toBe(true);
		});

		it('handles deleted courses in top courses', async () => {
			let deletedCourseId: Id<'courses'>;
			await t.run(async (ctx: TestCtx) => {
				const student1Id = await ctx.db.insert('users', {
					firstName: 'Student',
					lastName: 'One',
					email: 'student1@test.com',
					externalId: 'student-1',
					isInstructor: false,
					isAdmin: false,
				});

				// Create a course
				deletedCourseId = await ctx.db.insert('courses', {
					title: 'Deleted Course',
					description: 'Test',
					instructorId,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});

				// Create a purchase for it
				await ctx.db.insert('purchases', {
					userId: student1Id,
					courseId: deletedCourseId,
					amount: 29900,
					status: 'complete',
					createdAt: Date.now(),
				});

				// Delete the course
				await ctx.db.delete(deletedCourseId);
			});

			const analytics = await t.query(api.analytics.getPlatformAnalytics, {});

			// Should not throw and should filter out null
			expect(analytics.topCourses.every(c => c !== null)).toBe(true);
		});

		it('handles database errors when fetching courses for top courses list', async () => {
			// Create purchases to populate the top courses
			await t.run(async (ctx: TestCtx) => {
				const student1Id = await ctx.db.insert('users', {
					firstName: 'Student',
					lastName: 'One',
					email: 'student1@test.com',
					externalId: 'student-1',
					isInstructor: false,
					isAdmin: false,
				});

				// Create multiple purchases to ensure topCourses logic runs
				for (let i = 0; i < 3; i++) {
					await ctx.db.insert('purchases', {
						userId: student1Id,
						courseId,
						amount: 29900,
						status: 'complete',
						createdAt: Date.now(),
					});
				}
			});

			// Now run the query with mocked db.get that throws
			const analytics = await t.run(async (ctx: TestCtx) => {
				// Mock db.get to throw an error when called
				const originalGet = ctx.db.get;
				let callCount = 0;
				ctx.db.get = vi.fn(async (id: any) => {
					callCount++;
					// Throw error on first call to simulate database failure
					if (callCount === 1) {
						throw new Error('Simulated database error');
					}
					return originalGet.call(ctx.db, id);
				}) as any;

				try {
					// Call the internal helper directly with mocked context
					return await getPlatformAnalyticsInternal(ctx, '30d');
				} finally {
					// Restore original get
					ctx.db.get = originalGet;
				}
			});

			// Should handle the error gracefully and filter out the failed course
			expect(analytics.topCourses.every(c => c !== null)).toBe(true);
		});

		it('sorts top courses correctly with multiple courses', async () => {
			await t.run(async (ctx: TestCtx) => {
				// Create second course
				const course2Id = await ctx.db.insert('courses', {
					title: 'Course 2',
					description: 'Test',
					instructorId,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});

				// Course 1: 1 enrollment
				const student1Id = await ctx.db.insert('users', {
					firstName: 'Student',
					lastName: 'One',
					email: 'student1@test.com',
					externalId: 'student-1',
					isInstructor: false,
					isAdmin: false,
				});

				await ctx.db.insert('purchases', {
					userId: student1Id,
					courseId,
					amount: 29900,
					status: 'complete',
					createdAt: Date.now(),
				});

				// Course 2: 3 enrollments
				for (let i = 0; i < 3; i++) {
					const studentId = await ctx.db.insert('users', {
						firstName: 'Student',
						lastName: `${i + 2}`,
						email: `student${i + 2}@test.com`,
						externalId: `student-${i + 2}`,
						isInstructor: false,
						isAdmin: false,
					});

					await ctx.db.insert('purchases', {
						userId: studentId,
						courseId: course2Id,
						amount: 29900,
						status: 'complete',
						createdAt: Date.now(),
					});
				}
			});

			const analytics = await t.query(api.analytics.getPlatformAnalytics, {});

			// First course should be the one with more enrollments
			expect(analytics.topCourses.length).toBeGreaterThan(0);
			expect(analytics.topCourses[0].enrollments).toBe(3);
			if (analytics.topCourses.length > 1) {
				expect(analytics.topCourses[1].enrollments).toBe(1);
			}
		});

		it('filters by time range (90d)', async () => {
			const now = Date.now();
			const hundredDaysAgo = now - 100 * 24 * 60 * 60 * 1000;
			const fiftyDaysAgo = now - 50 * 24 * 60 * 60 * 1000;

			await t.run(async (ctx: TestCtx) => {
				const student1Id = await ctx.db.insert('users', {
					firstName: 'Student',
					lastName: 'One',
					email: 'student1@test.com',
					externalId: 'student-1',
					isInstructor: false,
					isAdmin: false,
				});

				const student2Id = await ctx.db.insert('users', {
					firstName: 'Student',
					lastName: 'Two',
					email: 'student2@test.com',
					externalId: 'student-2',
					isInstructor: false,
					isAdmin: false,
				});

				// Old purchase (outside 90d)
				await ctx.db.insert('purchases', {
					userId: student1Id,
					courseId,
					amount: 29900,
					status: 'complete',
					createdAt: hundredDaysAgo,
				});

				// Recent purchase (within 90d)
				await ctx.db.insert('purchases', {
					userId: student2Id,
					courseId,
					amount: 29900,
					status: 'complete',
					createdAt: fiftyDaysAgo,
				});
			});

			const analytics = await t.query(api.analytics.getPlatformAnalytics, {
				timeRange: '90d',
			});

			expect(analytics.overview.totalRevenue).toBe(29900);
		});

		it('filters by time range (1y)', async () => {
			const now = Date.now();
			const twoYearsAgo = now - 2 * 365 * 24 * 60 * 60 * 1000;
			const sixMonthsAgo = now - 180 * 24 * 60 * 60 * 1000;

			await t.run(async (ctx: TestCtx) => {
				const student1Id = await ctx.db.insert('users', {
					firstName: 'Student',
					lastName: 'One',
					email: 'student1@test.com',
					externalId: 'student-1',
					isInstructor: false,
					isAdmin: false,
				});

				const student2Id = await ctx.db.insert('users', {
					firstName: 'Student',
					lastName: 'Two',
					email: 'student2@test.com',
					externalId: 'student-2',
					isInstructor: false,
					isAdmin: false,
				});

				// Old purchase (outside 1y)
				await ctx.db.insert('purchases', {
					userId: student1Id,
					courseId,
					amount: 29900,
					status: 'complete',
					createdAt: twoYearsAgo,
				});

				// Recent purchase (within 1y)
				await ctx.db.insert('purchases', {
					userId: student2Id,
					courseId,
					amount: 29900,
					status: 'complete',
					createdAt: sixMonthsAgo,
				});
			});

			const analytics = await t.query(api.analytics.getPlatformAnalytics, {
				timeRange: '1y',
			});

			expect(analytics.overview.totalRevenue).toBe(29900);
		});
	});

	describe('getStudentAnalytics()', () => {
		it('returns student analytics', async () => {
			const analytics = await t.query(api.analytics.getStudentAnalytics, {
				userId: studentId,
			});

			expect(analytics).toBeDefined();
			expect(analytics.overview).toBeDefined();
			expect(analytics.recentActivity).toBeDefined();
			expect(analytics.learningProgress).toBeDefined();
		});

		it('counts enrolled courses', async () => {
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.insert('purchases', {
					userId: studentId,
					courseId,
					amount: 29900,
					status: 'complete',
					createdAt: Date.now(),
				});
			});

			const analytics = await t.query(api.analytics.getStudentAnalytics, {
				userId: studentId,
			});

			expect(analytics.overview.enrolledCourses).toBe(1);
		});

		it('counts completed courses by certificates', async () => {
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.insert('purchases', {
					userId: studentId,
					courseId,
					amount: 29900,
					status: 'complete',
					createdAt: Date.now(),
				});

				await ctx.db.insert('certificates', {
					userId: studentId,
					userName: 'Test Student',
					courseId,
					courseName: 'Test Course',
					instructorId,
					instructorName: 'Test Instructor',
					issueDate: new Date().toISOString(),
					verificationCode: 'TEST123',
					templateId: 'default',
				});
			});

			const analytics = await t.query(api.analytics.getStudentAnalytics, {
				userId: studentId,
			});

			expect(analytics.overview.completedCourses).toBe(1);
		});

		it('calculates completion rate', async () => {
			await t.run(async (ctx: TestCtx) => {
				// 2 enrolled courses
				await ctx.db.insert('purchases', {
					userId: studentId,
					courseId,
					amount: 29900,
					status: 'complete',
					createdAt: Date.now(),
				});

				const course2Id = await ctx.db.insert('courses', {
					title: 'Course 2',
					description: 'Test',
					instructorId,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});

				await ctx.db.insert('purchases', {
					userId: studentId,
					courseId: course2Id,
					amount: 19900,
					status: 'complete',
					createdAt: Date.now(),
				});

				// 1 certificate (50% completion)
				await ctx.db.insert('certificates', {
					userId: studentId,
					userName: 'Test Student',
					courseId,
					courseName: 'Test Course',
					instructorId,
					instructorName: 'Test Instructor',
					issueDate: new Date().toISOString(),
					verificationCode: 'TEST123',
					templateId: 'default',
				});
			});

			const analytics = await t.query(api.analytics.getStudentAnalytics, {
				userId: studentId,
			});

			expect(analytics.overview.completionRate).toBeCloseTo(50, 0);
		});

		it('handles zero enrollments gracefully', async () => {
			const analytics = await t.query(api.analytics.getStudentAnalytics, {
				userId: studentId,
			});

			expect(analytics.overview.completionRate).toBe(0);
		});

		it('counts favorite resources', async () => {
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.insert('favorites', {
					userId: studentId,
					resourceId,
					createdAt: Date.now(),
				});
			});

			const analytics = await t.query(api.analytics.getStudentAnalytics, {
				userId: studentId,
			});

			expect(analytics.overview.favoriteResources).toBe(1);
		});

		it('tracks recent activity (last 30 days)', async () => {
			const now = Date.now();
			const fortyDaysAgo = now - 40 * 24 * 60 * 60 * 1000;

			await t.run(async (ctx: TestCtx) => {
				// Recent purchase
				await ctx.db.insert('purchases', {
					userId: studentId,
					courseId,
					amount: 29900,
					status: 'complete',
					createdAt: now - 1000,
				});

				// Old purchase (outside 30d)
				await ctx.db.insert('purchases', {
					userId: studentId,
					courseId,
					amount: 29900,
					status: 'complete',
					createdAt: fortyDaysAgo,
				});
			});

			const analytics = await t.query(api.analytics.getStudentAnalytics, {
				userId: studentId,
			});

			expect(analytics.recentActivity.purchases).toBe(1);
		});

		it('calculates learning progress', async () => {
			await t.run(async (ctx: TestCtx) => {
				// 3 enrolled courses
				for (let i = 0; i < 3; i++) {
					await ctx.db.insert('purchases', {
						userId: studentId,
						courseId,
						amount: 29900,
						status: 'complete',
						createdAt: Date.now(),
					});
				}

				// 1 completed (with certificate)
				await ctx.db.insert('certificates', {
					userId: studentId,
					userName: 'Test Student',
					courseId,
					courseName: 'Test Course',
					instructorId,
					instructorName: 'Test Instructor',
					issueDate: new Date().toISOString(),
					verificationCode: 'TEST123',
					templateId: 'default',
				});
			});

			const analytics = await t.query(api.analytics.getStudentAnalytics, {
				userId: studentId,
			});

			expect(analytics.learningProgress.completed).toBe(1);
			expect(analytics.learningProgress.inProgress).toBe(2); // 3 - 1
		});
	});

	describe('getContentAnalytics()', () => {
		it('returns content analytics', async () => {
			const analytics = await t.query(api.analytics.getContentAnalytics, {});

			expect(analytics).toBeDefined();
			expect(analytics.resourceEngagement).toBeDefined();
			expect(analytics.contentTypeStats).toBeDefined();
			expect(analytics.categoryStats).toBeDefined();
		});

		it('calculates resource engagement', async () => {
			const analytics = await t.query(api.analytics.getContentAnalytics, {});

			expect(analytics.resourceEngagement.length).toBeGreaterThan(0);
			const resource = analytics.resourceEngagement[0];
			expect(resource.resourceId).toBeDefined();
			expect(resource.title).toBeDefined();
			expect(resource.engagement).toBeDefined();
		});

		it('sorts resources by engagement', async () => {
			await t.run(async (ctx: TestCtx) => {
				// Low engagement resource
				await ctx.db.insert('resources', {
					title: 'Low Engagement',
					description: 'Test',
					type: 'pdf',
					categories: ['test'],
					tags: ['test'],
					url: 'https://example.com/low.pdf',
					author: 'Test',
					dateAdded: '2024-01-01',
					featured: false,
					downloadCount: 10,
					favoriteCount: 5,
					rating: 4.0,
					reviewCount: 5,
					difficulty: 'beginner',
					restricted: false,
				});

				// High engagement resource
				await ctx.db.insert('resources', {
					title: 'High Engagement',
					description: 'Test',
					type: 'pdf',
					categories: ['test'],
					tags: ['test'],
					url: 'https://example.com/high.pdf',
					author: 'Test',
					dateAdded: '2024-01-01',
					featured: false,
					downloadCount: 500,
					favoriteCount: 200,
					rating: 4.5,
					reviewCount: 100,
					difficulty: 'intermediate',
					restricted: false,
				});
			});

			const analytics = await t.query(api.analytics.getContentAnalytics, {});

			// First item should have highest engagement
			if (analytics.resourceEngagement.length > 1) {
				expect(analytics.resourceEngagement[0].engagement).toBeGreaterThanOrEqual(
					analytics.resourceEngagement[1].engagement,
				);
			}
		});

		it('limits resource engagement to top 20', async () => {
			// Create 25 resources
			await t.run(async (ctx: TestCtx) => {
				for (let i = 0; i < 25; i++) {
					await ctx.db.insert('resources', {
						title: `Resource ${i}`,
						description: 'Test',
						type: 'pdf',
						categories: ['test'],
						tags: ['test'],
						url: `https://example.com/resource${i}.pdf`,
						author: 'Test',
						dateAdded: '2024-01-01',
						featured: false,
						downloadCount: i,
						favoriteCount: i,
						rating: 4.0,
						reviewCount: 0,
						difficulty: 'beginner',
						restricted: false,
					});
				}
			});

			const analytics = await t.query(api.analytics.getContentAnalytics, {});

			expect(analytics.resourceEngagement.length).toBeLessThanOrEqual(20);
		});

		it('tracks content type distribution', async () => {
			const analytics = await t.query(api.analytics.getContentAnalytics, {});

			expect(analytics.contentTypeStats).toBeDefined();
			expect(analytics.contentTypeStats.pdf).toBeGreaterThan(0);
		});

		it('tracks category distribution', async () => {
			const analytics = await t.query(api.analytics.getContentAnalytics, {});

			expect(analytics.categoryStats).toBeDefined();
			expect(analytics.categoryStats.category1).toBe(1);
			expect(analytics.categoryStats.category2).toBe(1);
		});

		it('counts total resources', async () => {
			const analytics = await t.query(api.analytics.getContentAnalytics, {});

			expect(analytics.totalResources).toBeGreaterThanOrEqual(1);
		});

		it('calculates average rating', async () => {
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.insert('resources', {
					title: 'Resource 2',
					description: 'Test',
					type: 'pdf',
					categories: ['test'],
					tags: ['test'],
					url: 'https://example.com/resource2.pdf',
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

			const analytics = await t.query(api.analytics.getContentAnalytics, {});

			// (4.5 + 4.0) / 2 = 4.25
			expect(analytics.averageRating).toBeCloseTo(4.25, 2);
		});

		it('accepts time range parameter (7d)', async () => {
			const analytics = await t.query(api.analytics.getContentAnalytics, {
				timeRange: '7d',
			});

			expect(analytics).toBeDefined();
			expect(analytics.resourceEngagement).toBeDefined();
		});

		it('accepts time range parameter (90d)', async () => {
			const analytics = await t.query(api.analytics.getContentAnalytics, {
				timeRange: '90d',
			});

			expect(analytics).toBeDefined();
			expect(analytics.resourceEngagement).toBeDefined();
		});

		it('accepts time range parameter (1y)', async () => {
			const analytics = await t.query(api.analytics.getContentAnalytics, {
				timeRange: '1y',
			});

			expect(analytics).toBeDefined();
			expect(analytics.resourceEngagement).toBeDefined();
		});

		it('calculates average rating correctly when a resource has rating of 0', async () => {
			await t.run(async (ctx: TestCtx) => {
				// Create resource with rating of 0 (falsy but valid number)
				await ctx.db.insert('resources', {
					title: 'Resource With Zero Rating',
					description: 'Test',
					type: 'pdf',
					categories: ['test'],
					tags: ['test'],
					url: 'https://example.com/zero-rating.pdf',
					author: 'Test',
					dateAdded: '2024-01-01',
					featured: false,
					downloadCount: 0,
					favoriteCount: 0,
					rating: 0,
					reviewCount: 0,
					difficulty: 'beginner',
					restricted: false,
				});
			});

			const analytics = await t.query(api.analytics.getContentAnalytics, {});

			// Original resource has 4.5, new resource has 0: (4.5 + 0) / 2 = 2.25
			expect(analytics.averageRating).toBeCloseTo(2.25, 2);
		});

		it('returns 0 for average rating when no resources exist', async () => {
			// Delete all resources to test empty case
			await t.run(async (ctx: TestCtx) => {
				const resources = await ctx.db.query('resources').collect();
				for (const resource of resources) {
					await ctx.db.delete(resource._id);
				}
			});

			const analytics = await t.query(api.analytics.getContentAnalytics, {});

			expect(analytics.averageRating).toBe(0);
			expect(analytics.totalResources).toBe(0);
		});
	});
});
