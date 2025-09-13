// Recommendation Service
// This service generates personalized content recommendations for users using Convex

import { useFeatureFlags } from '@/providers/FeatureFlagProvider';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

// Types for recommendations
export interface CourseRecommendation {
	id: string;
	title: string;
	description: string;
	instructor: string;
	thumbnailUrl?: string;
	rating?: number;
	reviewCount?: number;
	level?: 'beginner' | 'intermediate' | 'advanced';
	duration?: string;
	price?: number;
	relevanceScore: number;
	relevanceReason: string;
}

export interface ResourceRecommendation {
	id: string;
	title: string;
	type: string;
	thumbnailUrl?: string;
	relevanceScore: number;
	relevanceReason: string;
	resource: any; // Using any for now to avoid import issues
}

export interface PathwayRecommendation {
	id: string;
	title: string;
	description: string;
	courseCount: number;
	estimatedDuration: string;
	thumbnailUrl?: string;
	relevanceScore: number;
	relevanceReason: string;
}

export type RecommendationType =
	| 'course'
	| 'resource'
	| 'pathway'
	| 'instructor'
	| 'community';

export interface UserInterest {
	topic: string;
	weight: number;
}

// Convex-based recommendation hooks
export function useCourseRecommendations(userId: Id<'users'>, limit?: number) {
	const { isEnabled } = useFeatureFlags();

	const convexRecommendations = useQuery(
		api.recommendations.getCourseRecommendations,
		isEnabled('convex_courses') ? { userId, limit } : 'skip'
	);

	if (isEnabled('convex_courses')) {
		return {
			data: convexRecommendations || [],
			isLoading: convexRecommendations === undefined,
			error: null,
		};
	}

	// Fallback when Convex is disabled
	return {
		data: [],
		isLoading: false,
		error: null,
	};
}

export function useResourceRecommendations(
	userId: Id<'users'>,
	limit?: number
) {
	const { isEnabled } = useFeatureFlags();

	const convexRecommendations = useQuery(
		api.recommendations.getResourceRecommendations,
		isEnabled('convex_resources') ? { userId, limit } : 'skip'
	);

	if (isEnabled('convex_resources')) {
		return {
			data: convexRecommendations || [],
			isLoading: convexRecommendations === undefined,
			error: null,
		};
	}

	// Fallback when Convex is disabled
	return {
		data: [],
		isLoading: false,
		error: null,
	};
}

export function usePathwayRecommendations(userId: Id<'users'>, limit?: number) {
	const { isEnabled } = useFeatureFlags();

	const convexRecommendations = useQuery(
		api.recommendations.getPathwayRecommendations,
		isEnabled('convex_courses') ? { userId, limit } : 'skip'
	);

	if (isEnabled('convex_courses')) {
		return {
			data: convexRecommendations || [],
			isLoading: convexRecommendations === undefined,
			error: null,
		};
	}

	// Fallback when Convex is disabled
	return {
		data: [],
		isLoading: false,
		error: null,
	};
}

export function useTrendingContent(limit?: number) {
	const { isEnabled } = useFeatureFlags();

	const convexTrending = useQuery(
		api.recommendations.getTrendingContent,
		isEnabled('convex_resources') || isEnabled('convex_courses')
			? { limit }
			: 'skip'
	);

	if (isEnabled('convex_resources') || isEnabled('convex_courses')) {
		return {
			data: convexTrending || [],
			isLoading: convexTrending === undefined,
			error: null,
		};
	}

	// Fallback when Convex is disabled
	return {
		data: [],
		isLoading: false,
		error: null,
	};
}

// Legacy functions for backward compatibility (deprecated)
export async function getPersonalizedRecommendations(userId: string): Promise<{
	courses: CourseRecommendation[];
	resources: ResourceRecommendation[];
	pathways: PathwayRecommendation[];
}> {
	console.warn(
		'getPersonalizedRecommendations is deprecated. Use individual hooks instead.'
	);
	return {
		courses: [],
		resources: [],
		pathways: [],
	};
}

export async function getRecommendedCourses(
	userId: string
): Promise<CourseRecommendation[]> {
	console.warn(
		'getRecommendedCourses is deprecated. Use useCourseRecommendations hook instead.'
	);
	return [];
}

export async function getRecommendedResources(
	userId: string
): Promise<ResourceRecommendation[]> {
	console.warn(
		'getRecommendedResources is deprecated. Use useResourceRecommendations hook instead.'
	);
	return [];
}

export async function getRecommendedPathways(
	userId: string
): Promise<PathwayRecommendation[]> {
	console.warn(
		'getRecommendedPathways is deprecated. Use usePathwayRecommendations hook instead.'
	);
	return [];
}

export async function getTrendingCourses(): Promise<CourseRecommendation[]> {
	console.warn(
		'getTrendingCourses is deprecated. Use useTrendingContent hook instead.'
	);
	return [];
}

// Additional legacy functions that components expect
export async function getSkillBasedRecommendations(
	limit = 3
): Promise<CourseRecommendation[]> {
	console.warn(
		'getSkillBasedRecommendations is deprecated. Use useCourseRecommendations hook instead.'
	);
	return [];
}

export async function getTrendingRecommendations(
	limit = 3
): Promise<CourseRecommendation[]> {
	console.warn(
		'getTrendingRecommendations is deprecated. Use useTrendingContent hook instead.'
	);
	return [];
}
