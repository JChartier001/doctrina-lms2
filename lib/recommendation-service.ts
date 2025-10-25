// Recommendation Service
// This service generates personalized content recommendations for users using Convex

import { useQuery } from 'convex/react';

import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

import { Resource } from './resource-library-service';

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
	resource: Resource;
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

export type RecommendationType = 'course' | 'resource' | 'pathway' | 'instructor' | 'community';

export interface UserInterest {
	topic: string;
	weight: number;
}

// Convex-based recommendation hooks
export function useCourseRecommendations(userId: Id<'users'>, limit?: number) {
	const convexRecommendations = useQuery(api.recommendations.getCourseRecommendations, {
		userId,
		limit,
	});

	return {
		data: convexRecommendations || [],
		isLoading: convexRecommendations === undefined,
		error: null,
	};
}

export function useResourceRecommendations(userId: Id<'users'>, limit?: number) {
	const convexRecommendations = useQuery(api.recommendations.getResourceRecommendations, {
		userId,
		limit,
	});

	return {
		data: convexRecommendations || [],
		isLoading: convexRecommendations === undefined,
		error: null,
	};
}

export function usePathwayRecommendations(userId: Id<'users'>, limit?: number) {
	const convexRecommendations = useQuery(api.recommendations.getPathwayRecommendations, {
		userId,
		limit,
	});

	return {
		data: convexRecommendations || [],
		isLoading: convexRecommendations === undefined,
		error: null,
	};
}

export function useTrendingContent(limit?: number) {
	const convexTrending = useQuery(api.recommendations.getTrendingContent, {
		limit,
	});

	return {
		data: convexTrending || [],
		isLoading: convexTrending === undefined,
		error: null,
	};
}
