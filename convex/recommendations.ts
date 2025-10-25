import { v } from 'convex/values';

import { Id } from './_generated/dataModel';
import { query } from './_generated/server';

// Get personalized course recommendations for a user
export const getCourseRecommendations = query({
	args: {
		userId: v.id('users'),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, { userId, limit = 6 }) => {
		// Get user's purchase history
		const purchases = await ctx.db
			.query('purchases')
			.withIndex('by_user', q => q.eq('userId', userId))
			.collect();

		// Get user's enrolled courses (through purchases)
		const purchasedCourseIds = purchases.filter(p => p.status === 'complete').map(p => p.courseId);

		// Get all courses
		const allCourses = await ctx.db.query('courses').collect();

		// Filter out already purchased courses
		const availableCourses = allCourses.filter(course => !purchasedCourseIds.includes(course._id));

		// Simple recommendation logic:
		// 1. Prioritize courses with high ratings
		// 2. Consider courses from instructors the user has purchased from before
		// 3. Boost newer courses

		const purchasedInstructors = new Set(
			purchases
				.filter(p => p.status === 'complete')
				.map(p => {
					const course = allCourses.find(c => c._id === p.courseId);
					return course?.instructorId;
				})
				.filter(Boolean),
		);

		const recommendations = availableCourses
			.map(course => {
				let score = course.rating || 0;

				// Boost courses from familiar instructors
				if (purchasedInstructors.has(course.instructorId)) {
					score += 2;
				}

				// Boost newer courses slightly
				const daysSinceCreated = (Date.now() - course.createdAt) / (1000 * 60 * 60 * 24);
				if (daysSinceCreated < 30) {
					score += 0.5;
				}

				return {
					course,
					score,
				};
			})
			.sort((a, b) => b.score - a.score)
			.slice(0, limit)
			.map(({ course, score }) => ({
				id: course._id,
				title: course.title,
				description: course.description,
				instructor: course.instructorId, // We'll need to resolve this later
				thumbnailUrl: course.thumbnailUrl,
				rating: course.rating,
				reviewCount: course.reviewCount,
				level: course.level,
				duration: course.duration,
				price: course.price,
				relevanceScore: score,
				relevanceReason: score > (course.rating || 0) ? 'Based on your previous purchases' : 'Highly rated course',
			}));

		return recommendations;
	},
});

// Get resource recommendations for a user
export const getResourceRecommendations = query({
	args: {
		userId: v.id('users'),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, { userId, limit = 6 }) => {
		// Get user's favorite resources
		const favorites = await ctx.db
			.query('favorites')
			.withIndex('by_user_resource', q => q.eq('userId', userId))
			.collect();

		const favoriteResourceIds = favorites.map(f => f.resourceId);

		// Get user's purchased courses
		const purchases = await ctx.db
			.query('purchases')
			.withIndex('by_user', q => q.eq('userId', userId))
			.filter(q => q.eq(q.field('status'), 'complete'))
			.collect();

		const purchasedCourseIds = purchases.map(p => p.courseId);

		// Get all resources
		const allResources = await ctx.db.query('resources').collect();

		// Filter out already favorited resources
		const availableResources = allResources.filter(resource => !favoriteResourceIds.includes(resource._id));

		const recommendations = availableResources
			.map(resource => {
				let score = resource.rating || 0;

				// Boost resources from purchased courses
				if (resource.courseId && purchasedCourseIds.includes(resource.courseId)) {
					score += 3;
				}

				// Boost featured resources
				if (resource.featured) {
					score += 1;
				}

				// Boost resources with high download counts
				score += Math.min(resource.downloadCount / 100, 2);

				return {
					resource,
					score,
				};
			})
			.sort((a, b) => b.score - a.score)
			.slice(0, limit)
			.map(({ resource, score }) => ({
				id: resource._id,
				title: resource.title,
				type: resource.type,
				thumbnailUrl: resource.thumbnailUrl,
				relevanceScore: score,
				relevanceReason: score > (resource.rating || 0) + 1 ? 'Recommended for your courses' : 'Popular resource',
				resource,
			}));

		return recommendations;
	},
});

// Get pathway recommendations (combinations of courses)
export const getPathwayRecommendations = query({
	args: {
		userId: v.id('users'),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, { userId, limit = 3 }) => {
		// Get user's purchase history and skill level
		const purchases = await ctx.db
			.query('purchases')
			.withIndex('by_user', q => q.eq('userId', userId))
			.filter(q => q.eq(q.field('status'), 'complete'))
			.collect();

		const completedCourses = purchases.length;

		// Define learning pathways based on user's progress
		const pathways = [
			{
				id: 'beginner-foundation',
				title: 'Medical Aesthetics Foundation',
				description: 'Start your journey in medical aesthetics with essential knowledge and skills.',
				courseCount: 3,
				estimatedDuration: '3 months',
				thumbnailUrl: '/placeholder.svg?height=200&width=300',
				targetLevel: 'beginner',
				minCompletedCourses: 0,
				maxCompletedCourses: 2,
			},
			{
				id: 'intermediate-specialization',
				title: 'Advanced Injection Techniques',
				description: 'Master advanced injection techniques and build specialized skills.',
				courseCount: 4,
				estimatedDuration: '4 months',
				thumbnailUrl: '/placeholder.svg?height=200&width=300',
				targetLevel: 'intermediate',
				minCompletedCourses: 2,
				maxCompletedCourses: 5,
			},
			{
				id: 'advanced-mastery',
				title: 'Clinical Excellence Program',
				description: 'Achieve mastery in medical aesthetics with comprehensive clinical training.',
				courseCount: 5,
				estimatedDuration: '6 months',
				thumbnailUrl: '/placeholder.svg?height=200&width=300',
				targetLevel: 'advanced',
				minCompletedCourses: 5,
				maxCompletedCourses: 999,
			},
		];

		// Filter pathways based on user's progress
		const relevantPathways = pathways
			.filter(
				pathway => completedCourses >= pathway.minCompletedCourses && completedCourses <= pathway.maxCompletedCourses,
			)
			.map(pathway => ({
				...pathway,
				relevanceScore: 10 - Math.abs(completedCourses - pathway.minCompletedCourses),
				relevanceReason: completedCourses === 0 ? 'Perfect starting point' : 'Next step in your learning journey',
			}))
			.slice(0, limit);

		return relevantPathways;
	},
});

// Get trending/popular content
export const getTrendingContent = query({
	args: {
		limit: v.optional(v.number()),
	},
	handler: async (ctx, { limit = 10 }) => {
		// Get recent purchases and favorites to determine trending content
		const recentPurchases = await ctx.db
			.query('purchases')
			.filter(q => q.eq(q.field('status'), 'complete'))
			.collect();

		const recentFavorites = await ctx.db.query('favorites').collect();

		// Count purchases and favorites for each course/resource
		const coursePopularity = new Map<string, number>();
		const resourcePopularity = new Map<string, number>();

		recentPurchases.forEach(purchase => {
			const courseId = purchase.courseId;
			coursePopularity.set(courseId, (coursePopularity.get(courseId) || 0) + 1);
		});

		recentFavorites.forEach(favorite => {
			const resourceId = favorite.resourceId;
			resourcePopularity.set(resourceId, (resourcePopularity.get(resourceId) || 0) + 1);
		});

		// Get top trending courses
		const topCourseIds = Array.from(coursePopularity.entries())
			.sort(([, a], [, b]) => b - a)
			.slice(0, Math.floor(limit / 2))
			.map(([courseId]) => courseId);

		const trendingCourses = await Promise.all(
			topCourseIds.map(async courseId => {
				try {
					const course = await ctx.db.get(courseId as Id<'courses'>);
					return course
						? {
								id: course._id,
								title: course.title,
								type: 'course' as const,
								thumbnailUrl: course.thumbnailUrl,
								popularity: coursePopularity.get(courseId) || 0,
							}
						: null;
				} catch {
					return null;
				}
			}),
		);

		// Get top trending resources
		const topResourceIds = Array.from(resourcePopularity.entries())
			.sort(([, a], [, b]) => b - a)
			.slice(0, Math.floor(limit / 2))
			.map(([resourceId]) => resourceId);

		const trendingResources = await Promise.all(
			topResourceIds.map(async resourceId => {
				try {
					const resource = await ctx.db.get(resourceId as Id<'resources'>);
					return resource
						? {
								id: resource._id,
								title: resource.title,
								type: 'resource' as const,
								thumbnailUrl: resource.thumbnailUrl,
								popularity: resourcePopularity.get(resourceId) || 0,
							}
						: null;
				} catch {
					return null;
				}
			}),
		);

		return [...trendingCourses, ...trendingResources].filter(Boolean).slice(0, limit);
	},
});
