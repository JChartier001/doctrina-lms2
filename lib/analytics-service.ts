// Analytics Service
// This service handles analytics data using Convex

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

export type TimeRange = '7d' | '30d' | '90d' | '1y';

// Instructor analytics hooks
export function useInstructorAnalytics(
	instructorId: Id<'users'>,
	timeRange?: TimeRange
) {
	const convexAnalytics = useQuery(api.analytics.getInstructorAnalytics, {
		instructorId,
		timeRange,
	});

	return {
		data: convexAnalytics,
		isLoading: convexAnalytics === undefined,
		error: null,
	};
}

// Platform analytics hooks (for admin)
export function usePlatformAnalytics(timeRange?: TimeRange) {
	const convexAnalytics = useQuery(api.analytics.getPlatformAnalytics, {
		timeRange,
	});

	return {
		data: convexAnalytics,
		isLoading: convexAnalytics === undefined,
		error: null,
	};
}

// Student analytics hooks
export function useStudentAnalytics(userId: Id<'users'>) {
	const convexAnalytics = useQuery(api.analytics.getStudentAnalytics, {
		userId,
	});

	return {
		data: convexAnalytics,
		isLoading: convexAnalytics === undefined,
		error: null,
	};
}

// Content analytics hooks
export function useContentAnalytics(timeRange?: TimeRange) {
	const convexAnalytics = useQuery(api.analytics.getContentAnalytics, {
		timeRange,
	});

	return {
		data: convexAnalytics,
		isLoading: convexAnalytics === undefined,
		error: null,
	};
}
