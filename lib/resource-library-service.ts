// Resource Library Service
// This service handles the management of educational resources

import { useFeatureFlags } from '@/providers/FeatureFlagProvider';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

export type ResourceType =
	| 'pdf'
	| 'video'
	| 'article'
	| 'tool'
	| 'template'
	| 'guide'
	| 'research'
	| 'case-study';

export type ResourceCategory =
	| 'facial-anatomy'
	| 'injection-techniques'
	| 'laser-therapy'
	| 'dermal-fillers'
	| 'botox'
	| 'chemical-peels'
	| 'skincare'
	| 'business'
	| 'patient-care'
	| 'regulations'
	| 'complications';

export interface Resource {
	_id: Id<'resources'>;
	_creationTime: number;
	title: string;
	description: string;
	type: ResourceType;
	categories: ResourceCategory[];
	tags: string[];
	url: string;
	thumbnailUrl?: string;
	author: string;
	dateAdded: string;
	featured: boolean;
	downloadCount: number;
	favoriteCount: number;
	rating: number;
	reviewCount: number;
	difficulty: 'beginner' | 'intermediate' | 'advanced';
	duration?: string; // For videos, estimated reading time, etc.
	fileSize?: string; // For downloadable resources
	courseId?: Id<'courses'>; // If associated with a specific course
	restricted: boolean; // If true, only available to enrolled students or premium members
}

// Convex-based resource hooks
export function useAllResources(limit?: number) {
	const { isEnabled } = useFeatureFlags();
	const convexResources = useQuery(
		api.resources.list,
		isEnabled('convex_resources') ? { limit } : 'skip'
	);

	if (isEnabled('convex_resources')) {
		return {
			data: convexResources || [],
			isLoading: convexResources === undefined,
			error: null,
		};
	}

	// Fallback to mock implementation if Convex is disabled
	return {
		data: [],
		isLoading: false,
		error: null,
	};
}

export function useFeaturedResources(limit?: number) {
	const { isEnabled } = useFeatureFlags();
	const convexFeatured = useQuery(
		api.resources.featured,
		isEnabled('convex_resources') ? { limit } : 'skip'
	);

	if (isEnabled('convex_resources')) {
		return {
			data: convexFeatured || [],
			isLoading: convexFeatured === undefined,
			error: null,
		};
	}

	// Fallback to mock implementation if Convex is disabled
	return {
		data: [],
		isLoading: false,
		error: null,
	};
}

export function useSearchResources(query: string, limit?: number) {
	const { isEnabled } = useFeatureFlags();
	const convexSearch = useQuery(
		api.resources.search,
		isEnabled('convex_resources') && query ? { query, limit } : 'skip'
	);

	if (isEnabled('convex_resources') && query) {
		return {
			data: convexSearch || [],
			isLoading: convexSearch === undefined,
			error: null,
		};
	}

	// Fallback to mock implementation if Convex is disabled
	return {
		data: [],
		isLoading: false,
		error: null,
	};
}

export function useResource(id: Id<'resources'>) {
	const { isEnabled } = useFeatureFlags();
	const convexResource = useQuery(
		api.resources.get,
		isEnabled('convex_resources') ? { id } : 'skip'
	);

	if (isEnabled('convex_resources')) {
		return {
			data: convexResource,
			isLoading: convexResource === undefined,
			error: null,
		};
	}

	// Fallback to mock implementation if Convex is disabled
	return {
		data: null,
		isLoading: false,
		error: null,
	};
}

// Favorites hooks
export function useUserFavorites(userId: Id<'users'>) {
	const { isEnabled } = useFeatureFlags();
	const convexFavorites = useQuery(
		api.favorites.listForUser,
		isEnabled('convex_favorites') ? { userId } : 'skip'
	);

	if (isEnabled('convex_favorites')) {
		return {
			data: convexFavorites || [],
			isLoading: convexFavorites === undefined,
			error: null,
		};
	}

	// Fallback to mock implementation if Convex is disabled
	return {
		data: [],
		isLoading: false,
		error: null,
	};
}

export function useIsFavorited(
	userId: Id<'users'>,
	resourceId: Id<'resources'>
) {
	const { isEnabled } = useFeatureFlags();
	const convexIsFavorited = useQuery(
		api.favorites.isFavorited,
		isEnabled('convex_favorites') ? { userId, resourceId } : 'skip'
	);

	if (isEnabled('convex_favorites')) {
		return {
			data: convexIsFavorited || false,
			isLoading: convexIsFavorited === undefined,
			error: null,
		};
	}

	// Fallback to mock implementation if Convex is disabled
	return {
		data: false,
		isLoading: false,
		error: null,
	};
}

// Mutation hooks
export function useAddToFavorites() {
	const { isEnabled } = useFeatureFlags();
	const convexAdd = useMutation(api.favorites.add);

	return async (userId: Id<'users'>, resourceId: Id<'resources'>) => {
		if (isEnabled('convex_favorites')) {
			try {
				await convexAdd({ userId, resourceId });
				return true;
			} catch (error) {
				console.error('Failed to add to favorites:', error);
				return false;
			}
		}

		// Fallback to mock implementation if Convex is disabled
		return false;
	};
}

export function useRemoveFromFavorites() {
	const { isEnabled } = useFeatureFlags();
	const convexRemove = useMutation(api.favorites.remove);

	return async (userId: Id<'users'>, resourceId: Id<'resources'>) => {
		if (isEnabled('convex_favorites')) {
			try {
				await convexRemove({ userId, resourceId });
				return true;
			} catch (error) {
				console.error('Failed to remove from favorites:', error);
				return false;
			}
		}

		// Fallback to mock implementation if Convex is disabled
		return false;
	};
}

// Utility functions for resource display
export function getCategoryDisplayName(category: ResourceCategory): string {
	const displayNames: Record<ResourceCategory, string> = {
		'facial-anatomy': 'Facial Anatomy',
		'injection-techniques': 'Injection Techniques',
		'laser-therapy': 'Laser Therapy',
		'dermal-fillers': 'Dermal Fillers',
		botox: 'Botox',
		'chemical-peels': 'Chemical Peels',
		skincare: 'Skincare',
		business: 'Business',
		'patient-care': 'Patient Care',
		regulations: 'Regulations',
		complications: 'Complications',
	};

	return displayNames[category] || category;
}

export function getResourceTypeDisplayName(type: ResourceType): string {
	const displayNames: Record<ResourceType, string> = {
		pdf: 'PDF Document',
		video: 'Video',
		article: 'Article',
		tool: 'Interactive Tool',
		template: 'Template',
		guide: 'Guide',
		research: 'Research Paper',
		'case-study': 'Case Study',
	};

	return displayNames[type] || type;
}

export function getResourceTypeIcon(type: ResourceType): string {
	const icons: Record<ResourceType, string> = {
		pdf: 'FileText',
		video: 'PlayCircle',
		article: 'FileText',
		tool: 'Settings',
		template: 'FileTemplate',
		guide: 'BookOpen',
		research: 'Microscope',
		'case-study': 'Briefcase',
	};

	return icons[type] || 'FileText';
}

// Legacy functions for backward compatibility (deprecated)
export async function getAllResources(): Promise<Resource[]> {
	console.warn('getAllResources is deprecated. Use useAllResources hook instead.');
	return [];
}

export async function searchResources(query: string): Promise<Resource[]> {
	console.warn('searchResources is deprecated. Use useSearchResources hook instead.');
	return [];
}

export async function getResourceById(id: string): Promise<Resource | null> {
	console.warn('getResourceById is deprecated. Use useResource hook instead.');
	return null;
}

export async function getUserFavorites(userId: string): Promise<Resource[]> {
	console.warn('getUserFavorites is deprecated. Use useUserFavorites hook instead.');
	return [];
}

export async function isResourceFavorited(resourceId: string, userId: string): Promise<boolean> {
	console.warn('isResourceFavorited is deprecated. Use useIsFavorited hook instead.');
	return false;
}

export async function addResourceToFavorites(resourceId: string, userId: string): Promise<void> {
	console.warn('addResourceToFavorites is deprecated. Use useAddToFavorites hook instead.');
}

export async function removeResourceFromFavorites(resourceId: string, userId: string): Promise<void> {
	console.warn('removeResourceFromFavorites is deprecated. Use useRemoveFromFavorites hook instead.');
}

export async function getResourceCategories(): Promise<string[]> {
	console.warn('getResourceCategories is deprecated.');
	return [];
}

export async function getResourceTypes(): Promise<string[]> {
	console.warn('getResourceTypes is deprecated.');
	return [];
}

export async function getRelatedResources(resourceId: string): Promise<Resource[]> {
	console.warn('getRelatedResources is deprecated.');
	return [];
}

export async function trackResourceAccess(resourceId: string): Promise<void> {
	console.warn('trackResourceAccess is deprecated.');
}

// Additional legacy functions that components expect
export async function addToFavorites(resourceId: string, userId: string): Promise<void> {
	console.warn('addToFavorites is deprecated. Use useAddToFavorites hook instead.');
}

export async function removeFromFavorites(resourceId: string, userId: string): Promise<void> {
	console.warn('removeFromFavorites is deprecated. Use useRemoveFromFavorites hook instead.');
}
