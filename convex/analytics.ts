import { v } from 'convex/values';

import { Id } from './_generated/dataModel';
import { query } from './_generated/server';

// Dashboard analytics for instructors
export const getInstructorAnalytics = query({
	args: {
		instructorId: v.id('users'),
		timeRange: v.optional(v.union(v.literal('7d'), v.literal('30d'), v.literal('90d'), v.literal('1y'))),
	},
	handler: async (ctx, { instructorId, timeRange = '30d' }) => {
		const now = Date.now();
		let startTime: number;

		switch (timeRange) {
			case '7d':
				startTime = now - 7 * 24 * 60 * 60 * 1000;
				break;
			case '90d':
				startTime = now - 90 * 24 * 60 * 60 * 1000;
				break;
			case '1y':
				startTime = now - 365 * 24 * 60 * 60 * 1000;
				break;
			case '30d':
			default:
				startTime = now - 30 * 24 * 60 * 60 * 1000;
				break;
		}

		// Get instructor's courses
		const courses = await ctx.db
			.query('courses')
			.withIndex('by_instructor', q => q.eq('instructorId', instructorId))
			.collect();

		const courseIds = courses.map(c => c._id);

		// Get purchases for instructor's courses
		const purchases: Array<{
			_id: Id<'purchases'>;
			userId: string;
			courseId: Id<'courses'>;
			amount: number;
			status: 'open' | 'complete' | 'expired';
			createdAt: number;
		}> = [];
		for (const courseId of courseIds) {
			const coursePurchases = await ctx.db
				.query('purchases')
				.withIndex('by_course', q => q.eq('courseId', courseId))
				.collect();
			purchases.push(...coursePurchases);
		}

		// Filter by time range
		const recentPurchases = purchases.filter(p => p.createdAt >= startTime);

		// Calculate metrics
		const totalRevenue = recentPurchases.filter(p => p.status === 'complete').reduce((sum, p) => sum + p.amount, 0);

		const totalStudents = new Set(recentPurchases.filter(p => p.status === 'complete').map(p => p.userId)).size;

		const courseAnalytics = await Promise.all(
			courses.map(async course => {
				const coursePurchases = purchases.filter(p => p.courseId === course._id);
				const recentCoursePurchases = coursePurchases.filter(p => p.createdAt >= startTime);

				return {
					courseId: course._id,
					title: course.title,
					totalStudents: coursePurchases.filter(p => p.status === 'complete').length,
					recentStudents: recentCoursePurchases.filter(p => p.status === 'complete').length,
					revenue: recentCoursePurchases.filter(p => p.status === 'complete').reduce((sum, p) => sum + p.amount, 0),
					rating: course.rating || 0,
					reviewCount: course.reviewCount || 0,
				};
			}),
		);

		// Enrollment trend (daily for the time range)
		const enrollmentTrend = [];
		const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;

		for (let i = days - 1; i >= 0; i--) {
			const date = new Date(now - i * 24 * 60 * 60 * 1000);
			const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
			const dayEnd = dayStart + 24 * 60 * 60 * 1000;

			const dayPurchases = recentPurchases.filter(
				p => p.createdAt >= dayStart && p.createdAt < dayEnd && p.status === 'complete',
			);

			enrollmentTrend.push({
				date: date.toISOString().split('T')[0],
				enrollments: dayPurchases.length,
				revenue: dayPurchases.reduce((sum, p) => sum + p.amount, 0),
			});
		}

		return {
			overview: {
				totalRevenue,
				totalStudents,
				totalCourses: courses.length,
				averageRating: courses.reduce((sum, c) => sum + (c.rating || 0), 0) / courses.length,
			},
			courseAnalytics,
			enrollmentTrend,
		};
	},
});

// Platform-wide analytics (for admin)
export const getPlatformAnalytics = query({
	args: {
		timeRange: v.optional(v.union(v.literal('7d'), v.literal('30d'), v.literal('90d'), v.literal('1y'))),
	},
	handler: async (ctx, { timeRange = '30d' }) => {
		const now = Date.now();
		let startTime: number;

		switch (timeRange) {
			case '7d':
				startTime = now - 7 * 24 * 60 * 60 * 1000;
				break;
			case '90d':
				startTime = now - 90 * 24 * 60 * 60 * 1000;
				break;
			case '1y':
				startTime = now - 365 * 24 * 60 * 60 * 1000;
				break;
			case '30d':
			default:
				startTime = now - 30 * 24 * 60 * 60 * 1000;
				break;
		}

		// Get all purchases in time range
		const allPurchases = await ctx.db.query('purchases').collect();
		const recentPurchases = allPurchases.filter(p => p.createdAt >= startTime);

		// Get all users and courses
		const totalUsers = await ctx.db.query('users').collect();
		const totalCourses = await ctx.db.query('courses').collect();

		// Calculate metrics
		const totalRevenue = recentPurchases.filter(p => p.status === 'complete').reduce((sum, p) => sum + p.amount, 0);

		const totalEnrollments = recentPurchases.filter(p => p.status === 'complete').length;

		// User growth trend
		const userGrowthTrend = [];
		const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;

		for (let i = days - 1; i >= 0; i--) {
			const date = new Date(now - i * 24 * 60 * 60 * 1000);
			const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
			const dayEnd = dayStart + 24 * 60 * 60 * 1000;

			const dayPurchases = recentPurchases.filter(
				p => p.createdAt >= dayStart && p.createdAt < dayEnd && p.status === 'complete',
			);

			const dayUsers = new Set(dayPurchases.map(p => p.userId)).size;

			userGrowthTrend.push({
				date: date.toISOString().split('T')[0],
				newUsers: dayUsers,
				enrollments: dayPurchases.length,
				revenue: dayPurchases.reduce((sum, p) => sum + p.amount, 0),
			});
		}

		// Top courses by enrollment
		const courseEnrollmentMap = new Map<string, number>();
		recentPurchases
			.filter(p => p.status === 'complete')
			.forEach(p => {
				const count = courseEnrollmentMap.get(p.courseId) || 0;
				courseEnrollmentMap.set(p.courseId, count + 1);
			});

		const topCourses = await Promise.all(
			Array.from(courseEnrollmentMap.entries())
				.sort(([, a], [, b]) => b - a)
				.slice(0, 10)
				.map(async ([courseId, enrollments]) => {
					try {
						const course = await ctx.db.get(courseId as Id<'courses'>);
						return course
							? {
									courseId,
									title: course.title,
									instructor: course.instructorId,
									enrollments,
									rating: course.rating || 0,
								}
							: null;
					} catch {
						return null;
					}
				}),
		);

		return {
			overview: {
				totalRevenue,
				totalEnrollments,
				totalUsers: totalUsers.length,
				totalCourses: totalCourses.length,
				averageRevenuePerEnrollment: totalEnrollments > 0 ? totalRevenue / totalEnrollments : 0,
			},
			userGrowthTrend,
			topCourses: topCourses.filter(Boolean),
		};
	},
});

// Student performance analytics
export const getStudentAnalytics = query({
	args: {
		userId: v.id('users'),
	},
	handler: async (ctx, { userId }) => {
		// Get user's purchases
		const purchases = await ctx.db
			.query('purchases')
			.withIndex('by_user', q => q.eq('userId', userId))
			.filter(q => q.eq(q.field('status'), 'complete'))
			.collect();

		const enrolledCourses = purchases.length;

		// Get certificates earned
		const certificates = await ctx.db
			.query('certificates')
			.withIndex('by_user', q => q.eq('userId', userId))
			.collect();

		const completedCourses = certificates.length;

		// Calculate completion rate
		const completionRate = enrolledCourses > 0 ? (completedCourses / enrolledCourses) * 100 : 0;

		// Get user's favorites
		const favorites = await ctx.db
			.query('favorites')
			.withIndex('by_user_resource', q => q.eq('userId', userId))
			.collect();

		// Recent activity (purchases and certificates in last 30 days)
		const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

		const recentPurchases = purchases.filter(p => p.createdAt >= thirtyDaysAgo);
		const recentCertificates = certificates.filter(c => {
			const issueDate = new Date(c.issueDate).getTime();
			return issueDate >= thirtyDaysAgo;
		});

		return {
			overview: {
				enrolledCourses,
				completedCourses,
				completionRate,
				favoriteResources: favorites.length,
			},
			recentActivity: {
				purchases: recentPurchases.length,
				certificates: recentCertificates.length,
			},
			learningProgress: {
				inProgress: enrolledCourses - completedCourses,
				completed: completedCourses,
			},
		};
	},
});

// Content performance analytics
export const getContentAnalytics = query({
	args: {
		timeRange: v.optional(v.union(v.literal('7d'), v.literal('30d'), v.literal('90d'), v.literal('1y'))),
	},
	handler: async (ctx, { timeRange = '30d' }) => {
		const now = Date.now();
		let _startTime: number;

		switch (timeRange) {
			case '7d':
				_startTime = now - 7 * 24 * 60 * 60 * 1000;
				break;
			case '90d':
				_startTime = now - 90 * 24 * 60 * 60 * 1000;
				break;
			case '1y':
				_startTime = now - 365 * 24 * 60 * 60 * 1000;
				break;
			case '30d':
			default:
				_startTime = now - 30 * 24 * 60 * 60 * 1000;
				break;
		}

		// Get all resources and their stats
		const resources = await ctx.db.query('resources').collect();

		// Calculate engagement metrics
		const resourceEngagement = resources.map(resource => ({
			resourceId: resource._id,
			title: resource.title,
			type: resource.type,
			downloadCount: resource.downloadCount,
			favoriteCount: resource.favoriteCount,
			rating: resource.rating,
			reviewCount: resource.reviewCount,
			engagement: resource.downloadCount + resource.favoriteCount,
		}));

		// Sort by engagement
		resourceEngagement.sort((a, b) => b.engagement - a.engagement);

		// Content type distribution
		const contentTypeStats = resources.reduce(
			(acc, resource) => {
				acc[resource.type] = (acc[resource.type] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>,
		);

		// Category distribution
		const categoryStats = resources.reduce(
			(acc, resource) => {
				resource.categories.forEach(category => {
					acc[category] = (acc[category] || 0) + 1;
				});
				return acc;
			},
			{} as Record<string, number>,
		);

		return {
			resourceEngagement: resourceEngagement.slice(0, 20), // Top 20 most engaged resources
			contentTypeStats,
			categoryStats,
			totalResources: resources.length,
			averageRating: resources.reduce((sum, r) => sum + r.rating, 0) / resources.length,
		};
	},
});
