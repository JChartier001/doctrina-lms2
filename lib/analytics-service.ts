// Analytics Service
// This service handles analytics data using Convex

import { useFeatureFlags } from '@/providers/FeatureFlagProvider';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

export type TimeRange = '7d' | '30d' | '90d' | '1y';

// Instructor analytics hooks
export function useInstructorAnalytics(
	instructorId: Id<'users'>,
	timeRange?: TimeRange
) {
	const { isEnabled } = useFeatureFlags();

	const convexAnalytics = useQuery(
		api.analytics.getInstructorAnalytics,
		isEnabled('convex_courses') ? { instructorId, timeRange } : 'skip'
	);

	if (isEnabled('convex_courses')) {
		return {
			data: convexAnalytics,
			isLoading: convexAnalytics === undefined,
			error: null,
		};
	}

	// Fallback when Convex is disabled
	return {
		data: null,
		isLoading: false,
		error: null,
	};
}

// Platform analytics hooks (for admin)
export function usePlatformAnalytics(timeRange?: TimeRange) {
	const { isEnabled } = useFeatureFlags();

	const convexAnalytics = useQuery(
		api.analytics.getPlatformAnalytics,
		isEnabled('convex_courses') ? { timeRange } : 'skip'
	);

	if (isEnabled('convex_courses')) {
		return {
			data: convexAnalytics,
			isLoading: convexAnalytics === undefined,
			error: null,
		};
	}

	// Fallback when Convex is disabled
	return {
		data: null,
		isLoading: false,
		error: null,
	};
}

// Student analytics hooks
export function useStudentAnalytics(userId: Id<'users'>) {
	const { isEnabled } = useFeatureFlags();

	const convexAnalytics = useQuery(
		api.analytics.getStudentAnalytics,
		isEnabled('convex_courses') ? { userId } : 'skip'
	);

	if (isEnabled('convex_courses')) {
		return {
			data: convexAnalytics,
			isLoading: convexAnalytics === undefined,
			error: null,
		};
	}

	// Fallback when Convex is disabled
	return {
		data: null,
		isLoading: false,
		error: null,
	};
}

// Content analytics hooks
export function useContentAnalytics(timeRange?: TimeRange) {
	const { isEnabled } = useFeatureFlags();

	const convexAnalytics = useQuery(
		api.analytics.getContentAnalytics,
		isEnabled('convex_resources') ? { timeRange } : 'skip'
	);

	if (isEnabled('convex_resources')) {
		return {
			data: convexAnalytics,
			isLoading: convexAnalytics === undefined,
			error: null,
		};
	}

	// Fallback when Convex is disabled
	return {
		data: null,
		isLoading: false,
		error: null,
	};
}
