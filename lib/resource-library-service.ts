// Resource Library Service
// This service handles the management of educational resources

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
	const convexResources = useQuery(api.resources.list, { limit });

	return {
		data: convexResources || [],
		isLoading: convexResources === undefined,
		error: null,
	};
}

export function useFeaturedResources(limit?: number) {
	const convexFeatured = useQuery(api.resources.featured, { limit });

	return {
		data: convexFeatured || [],
		isLoading: convexFeatured === undefined,
		error: null,
	};
}

export function useSearchResources(query: string, limit?: number) {
	const convexSearch = useQuery(
		api.resources.search,
		query ? { query, limit } : 'skip'
	);

	if (query) {
		return {
			data: convexSearch || [],
			isLoading: convexSearch === undefined,
			error: null,
		};
	}

	return {
		data: [],
		isLoading: false,
		error: null,
	};
}

export function useResource(id: Id<'resources'>) {
	const convexResource = useQuery(api.resources.get, { id });

	return {
		data: convexResource,
		isLoading: convexResource === undefined,
		error: null,
	};
}

// Favorites hooks
export function useUserFavorites(userId: Id<'users'>) {
	const convexFavorites = useQuery(api.favorites.listForUser, { userId });

	return {
		data: convexFavorites || [],
		isLoading: convexFavorites === undefined,
		error: null,
	};
}

export function useIsFavorited(
	userId: Id<'users'>,
	resourceId: Id<'resources'>
) {
	const convexIsFavorited = useQuery(api.favorites.isFavorited, {
		userId,
		resourceId,
	});

	return {
		data: convexIsFavorited || false,
		isLoading: convexIsFavorited === undefined,
		error: null,
	};
}

// Mutation hooks
export function useAddToFavorites() {
	const convexAdd = useMutation(api.favorites.add);

	return async (userId: Id<'users'>, resourceId: Id<'resources'>) => {
		try {
			await convexAdd({ userId, resourceId });
			return true;
		} catch (error) {
			console.error('Failed to add to favorites:', error);
			return false;
		}
	};
}

export function useRemoveFromFavorites() {
	const convexRemove = useMutation(api.favorites.remove);

	return async (userId: Id<'users'>, resourceId: Id<'resources'>) => {
		try {
			await convexRemove({ userId, resourceId });
			return true;
		} catch (error) {
			console.error('Failed to remove from favorites:', error);
			return false;
		}
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
