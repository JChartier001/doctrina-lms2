import { v } from 'convex/values';

import dayjs from '../lib/dayjs';
import { query } from './_generated/server';

// Unified search across courses and resources
export const unifiedSearch = query({
	args: {
		query: v.string(),
		limit: v.optional(v.number()),
		entityTypes: v.optional(v.array(v.union(v.literal('course'), v.literal('resource'), v.literal('user')))),
	},
	handler: async (ctx, { query: searchQuery, limit = 20, entityTypes }) => {
		const normalizedQuery = searchQuery.toLowerCase().trim();
		if (!normalizedQuery) return [];

		const results = [];

		// Search courses if not filtered or if courses are included
		if (!entityTypes || entityTypes.includes('course')) {
			const courses = await ctx.db.query('courses').collect();

			const courseResults = courses
				.filter(
					course =>
						course.title.toLowerCase().includes(normalizedQuery) ||
						course.description.toLowerCase().includes(normalizedQuery),
				)
				.slice(0, Math.floor(limit / 3)) // Distribute limit across entity types
				.map(course => ({
					id: course._id,
					title: course.title,
					description: course.description,
					type: 'course' as const,
					url: `/courses/${course._id}`,
					image: course.thumbnailUrl,
					metadata: {
						level: course.level,
						price: course.price,
						rating: course.rating,
						reviewCount: course.reviewCount,
					},
				}));

			results.push(...courseResults);
		}

		// Search resources if not filtered or if resources are included
		if (!entityTypes || entityTypes.includes('resource')) {
			const resources = await ctx.db.query('resources').collect();

			const resourceResults = resources
				.filter(
					resource =>
						resource.title.toLowerCase().includes(normalizedQuery) ||
						resource.description.toLowerCase().includes(normalizedQuery) ||
						resource.tags.some(tag => tag.toLowerCase().includes(normalizedQuery)) ||
						resource.categories.some(cat => cat.toLowerCase().includes(normalizedQuery)),
				)
				.slice(0, Math.floor(limit / 3))
				.map(resource => ({
					id: resource._id,
					title: resource.title,
					description: resource.description,
					type: 'resource' as const,
					url: `/resources/${resource._id}`,
					image: resource.thumbnailUrl,
					metadata: {
						type: resource.type,
						difficulty: resource.difficulty,
						downloadCount: resource.downloadCount,
						rating: resource.rating,
					},
				}));

			results.push(...resourceResults);
		}

		// Search users if not filtered or if users are included
		if (!entityTypes || entityTypes.includes('user')) {
			const users = await ctx.db.query('users').collect();

			const userResults = users
				.filter(
					user =>
						user.firstName?.toLowerCase().includes(normalizedQuery) ||
						user.lastName?.toLowerCase().includes(normalizedQuery) ||
						user.email?.toLowerCase().includes(normalizedQuery),
				)
				.slice(0, Math.floor(limit / 3))
				.map(user => ({
					id: user._id,
					title: `${user.firstName} ${user.lastName}`,
					description: `${user.email}`,
					type: 'user' as const,
					url: `/profile/${user._id}`,
					image: user.image,
					metadata: {
						role: user.isAdmin ? 'admin' : user.isInstructor ? 'instructor' : 'student',
						email: user.email,
					},
				}));

			results.push(...userResults);
		}

		// Sort by relevance (simple: prefer exact matches, then substring matches)
		return results
			.sort((a, b) => {
				const aExact = a.title.toLowerCase().includes(normalizedQuery);
				const bExact = b.title.toLowerCase().includes(normalizedQuery);
				if (aExact && !bExact) return -1;
				if (!aExact && bExact) return 1;
				return 0;
			})
			.slice(0, limit);
	},
});

// Advanced search with filters
export const advancedSearch = query({
	args: {
		query: v.string(),
		filters: v.object({
			entityTypes: v.optional(v.array(v.union(v.literal('course'), v.literal('resource'), v.literal('user')))),
			courseFilters: v.optional(
				v.object({
					level: v.optional(v.union(v.literal('beginner'), v.literal('intermediate'), v.literal('advanced'))),
					priceRange: v.optional(
						v.object({
							min: v.optional(v.number()),
							max: v.optional(v.number()),
						}),
					),
				}),
			),
			resourceFilters: v.optional(
				v.object({
					type: v.optional(v.string()),
					difficulty: v.optional(v.union(v.literal('beginner'), v.literal('intermediate'), v.literal('advanced'))),
					categories: v.optional(v.array(v.string())),
				}),
			),
			sortBy: v.optional(
				v.union(v.literal('relevance'), v.literal('newest'), v.literal('rating'), v.literal('popular')),
			),
		}),
		limit: v.optional(v.number()),
		offset: v.optional(v.number()),
	},
	handler: async (ctx, { query: searchQuery, filters, limit = 20, offset = 0 }) => {
		const normalizedQuery = searchQuery.toLowerCase().trim();
		const allResults = [];

		// Search courses
		if (!filters.entityTypes || filters.entityTypes.includes('course')) {
			const courses = await ctx.db.query('courses').collect();

			let courseResults = courses.filter(
				course =>
					course.title.toLowerCase().includes(normalizedQuery) ||
					course.description.toLowerCase().includes(normalizedQuery),
			);

			// Apply course filters
			if (filters.courseFilters) {
				if (filters.courseFilters.level) {
					courseResults = courseResults.filter(c => c.level === filters.courseFilters!.level);
				}
				if (filters.courseFilters.priceRange) {
					const { min, max } = filters.courseFilters.priceRange;
					courseResults = courseResults.filter(
						c => (!min || (c.price && c.price >= min)) && (!max || (c.price && c.price <= max)),
					);
				}
			}

			// Get enrollment counts for courses
			const enrollmentCounts = new Map<string, number>();
			for (const course of courseResults) {
				const enrollments = await ctx.db
					.query('enrollments')
					.withIndex('by_course', q => q.eq('courseId', course._id))
					.collect();
				enrollmentCounts.set(course._id, enrollments.length);
			}

			const formattedCourses = courseResults.map(course => ({
				id: course._id,
				title: course.title,
				description: course.description,
				type: 'course' as const,
				url: `/courses/${course._id}`,
				image: course.thumbnailUrl,
				metadata: {
					level: course.level,
					price: course.price,
					rating: course.rating,
					reviewCount: course.reviewCount,
					students: enrollmentCounts.get(course._id) || 0,
					createdAt: course.createdAt,
				},
			}));

			allResults.push(...formattedCourses);
		}

		// Search resources
		if (!filters.entityTypes || filters.entityTypes.includes('resource')) {
			const resources = await ctx.db.query('resources').collect();

			let resourceResults = resources.filter(
				resource =>
					resource.title.toLowerCase().includes(normalizedQuery) ||
					resource.description.toLowerCase().includes(normalizedQuery) ||
					resource.tags.some(tag => tag.toLowerCase().includes(normalizedQuery)) ||
					resource.categories.some(cat => cat.toLowerCase().includes(normalizedQuery)),
			);

			// Apply resource filters
			if (filters.resourceFilters) {
				if (filters.resourceFilters.type) {
					resourceResults = resourceResults.filter(r => r.type === filters.resourceFilters!.type);
				}
				if (filters.resourceFilters.difficulty) {
					resourceResults = resourceResults.filter(r => r.difficulty === filters.resourceFilters!.difficulty);
				}
				if (filters.resourceFilters.categories && filters.resourceFilters.categories.length > 0) {
					resourceResults = resourceResults.filter(r =>
						filters.resourceFilters!.categories!.some(cat => r.categories.includes(cat)),
					);
				}
			}

			// Get favorites count for resources (engagement metric alongside downloads)
			const favoritesCounts = new Map<string, number>();
			for (const resource of resourceResults) {
				const favorites = await ctx.db
					.query('favorites')
					.withIndex('by_resource', q => q.eq('resourceId', resource._id))
					.collect();
				favoritesCounts.set(resource._id, favorites.length);
			}

			const formattedResources = resourceResults.map(resource => ({
				id: resource._id,
				title: resource.title,
				description: resource.description,
				type: 'resource' as const,
				url: `/resources/${resource._id}`,
				image: resource.thumbnailUrl,
				metadata: {
					type: resource.type,
					difficulty: resource.difficulty,
					downloadCount: resource.downloadCount,
					favorites: favoritesCounts.get(resource._id) || 0,
					rating: resource.rating,
					createdAt: resource.dateAdded,
				},
			}));

			allResults.push(...formattedResources);
		}

		// Sort results
		switch (filters.sortBy) {
			case 'newest':
				allResults.sort((a, b) => {
					const dateB = dayjs(b.metadata.createdAt);
					const dateA = dayjs(a.metadata.createdAt);
					return dateB.valueOf() - dateA.valueOf();
				});
				break;
			case 'rating':
				allResults.sort((a, b) => (b.metadata.rating || 0) - (a.metadata.rating || 0));
				break;
			case 'popular':
				allResults.sort((a, b) => {
					const calculatePopularity = (item: typeof a): number => {
						const rating = Number(item.metadata.rating) || 0;

						// For resources: combine downloads, favorites, and rating quality
						if ('downloadCount' in item.metadata && 'favorites' in item.metadata) {
							const downloads = Number(item.metadata.downloadCount) || 0;
							const favorites = Number(item.metadata.favorites) || 0;
							// Weighted: downloads (40%) + favorites (40%) + rating boost (20%)
							// Favorites weight slightly higher as they show intentional engagement
							const baseEngagement = downloads * 0.6 + favorites * 0.8;
							const ratingBoost = (rating / 5) * 0.2;
							return baseEngagement * (1 + ratingBoost);
						}

						// For courses: combine students with rating and review engagement
						if ('students' in item.metadata) {
							const students = Number(item.metadata.students) || 0;
							const reviews = Number(item.metadata.reviewCount) || 0;
							// Weighted: students (primary) + review engagement boost + rating multiplier
							return students * (1 + (rating / 5) * 0.3) + reviews * 2;
						}

						return 0;
					};

					return calculatePopularity(b) - calculatePopularity(a);
				});
				break;
			case 'relevance':
			default:
				// Sort by relevance (exact matches first)
				allResults.sort((a, b) => {
					const aExact = a.title.toLowerCase().includes(normalizedQuery);
					const bExact = b.title.toLowerCase().includes(normalizedQuery);
					if (aExact && !bExact) return -1;
					if (!aExact && bExact) return 1;
					return 0;
				});
				break;
		}

		// Apply pagination
		const paginatedResults = allResults.slice(offset, offset + limit);

		return {
			results: paginatedResults,
			total: allResults.length,
			hasMore: offset + limit < allResults.length,
		};
	},
});

// Search suggestions/autocomplete
export const searchSuggestions = query({
	args: {
		query: v.string(),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, { query: searchQuery, limit = 10 }) => {
		const normalizedQuery = searchQuery.toLowerCase().trim();
		if (!normalizedQuery || normalizedQuery.length < 2) return [];

		const suggestions = new Set<string>();

		// Get suggestions from courses
		const courses = await ctx.db.query('courses').collect();
		courses.forEach(course => {
			if (course.title.toLowerCase().includes(normalizedQuery)) {
				suggestions.add(course.title);
			}
		});

		// Get suggestions from resources
		const resources = await ctx.db.query('resources').collect();
		resources.forEach(resource => {
			if (resource.title.toLowerCase().includes(normalizedQuery)) {
				suggestions.add(resource.title);
			}
			resource.tags.forEach(tag => {
				if (tag.toLowerCase().includes(normalizedQuery)) {
					suggestions.add(tag);
				}
			});
		});

		// Get suggestions from users
		const users = await ctx.db.query('users').collect();
		users.forEach(user => {
			const fullName = `${user.firstName} ${user.lastName}`;
			if (fullName.toLowerCase().includes(normalizedQuery)) {
				suggestions.add(fullName);
			}
		});

		return Array.from(suggestions).slice(0, limit);
	},
});
