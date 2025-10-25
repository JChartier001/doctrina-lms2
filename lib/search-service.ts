// Search Service
// This service handles search functionality across the platform using Convex

import { useQuery } from 'convex/react';

import { api } from '@/convex/_generated/api';
// import { debounce } from '@/lib/utils';

// Types for search results
export type SearchResultType = 'course' | 'resource' | 'user';

export interface SearchResult {
	id: string;
	title: string;
	description: string;
	type: SearchResultType;
	url: string;
	image?: string;
	metadata?: Record<string, unknown>;
}

export interface SearchFilters {
	entityTypes?: SearchResultType[];
	courseFilters?: {
		level?: 'beginner' | 'intermediate' | 'advanced';
		priceRange?: {
			min?: number;
			max?: number;
		};
	};
	resourceFilters?: {
		type?: string;
		difficulty?: 'beginner' | 'intermediate' | 'advanced';
		categories?: string[];
	};
	sortBy?: 'relevance' | 'newest' | 'rating' | 'popular';
}

// Convex-based search hooks
export function useUnifiedSearch(query: string, limit?: number, entityTypes?: SearchResultType[]) {
	const convexSearch = useQuery(api.search.unifiedSearch, {
		query,
		limit,
		entityTypes,
	});

	return {
		data: convexSearch || [],
		isLoading: convexSearch === undefined,
		error: null,
	};
}

export function useAdvancedSearch(query: string, filters: SearchFilters, limit?: number, offset?: number) {
	const convexAdvancedSearch = useQuery(api.search.advancedSearch, {
		query,
		filters,
		limit,
		offset,
	});

	return {
		data: convexAdvancedSearch || { results: [], total: 0, hasMore: false },
		isLoading: convexAdvancedSearch === undefined,
		error: null,
	};
}

export function useSearchSuggestions(query: string, limit?: number) {
	const convexSuggestions = useQuery(api.search.searchSuggestions, {
		query,
		limit,
	});

	return {
		data: convexSuggestions || [],
		isLoading: convexSuggestions === undefined,
		error: null,
	};
}

// Legacy functions for backward compatibility (deprecated)
export async function searchAll(_query: string, _filters?: { types?: SearchResultType[] }): Promise<SearchResult[]> {
	console.warn('searchAll is deprecated. Use useUnifiedSearch hook instead.');
	return [];
}

export async function getSearchSuggestions(_partialQuery: string): Promise<string[]> {
	console.warn('getSearchSuggestions is deprecated. Use useSearchSuggestions hook instead.');
	return [];
}

// Track popular searches (client-side only)
const popularSearches: Record<string, number> = {};

export function trackSearch(query: string): void {
	const normalizedQuery = query.toLowerCase().trim();
	if (normalizedQuery) {
		popularSearches[normalizedQuery] = (popularSearches[normalizedQuery] || 0) + 1;
	}
}

export function getPopularSearches(limit = 5): { query: string; count: number }[] {
	return Object.entries(popularSearches)
		.map(([query, count]) => ({ query, count }))
		.sort((a, b) => b.count - a.count)
		.slice(0, limit);
}

// // Create a debounced version of the search suggestions hook
// export const debouncedSearchSuggestions = debounce((_query: string, callback: (suggestions: string[]) => void) => {
// 	// This would normally use the hook, but since it's a hook we can't call it directly
// 	// The component should handle debouncing at the hook level
// 	console.warn(
// 		'debouncedSearchSuggestions is deprecated. Use useSearchSuggestions hook with debouncing in the component.',
// 	);
// 	callback([]);
// }, 300);
