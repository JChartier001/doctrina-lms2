// Live Session Service
// This service handles live session management using Convex

import { useFeatureFlags } from '@/providers/FeatureFlagProvider';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

export type LiveSession = {
	_id: Id<'liveSessions'>;
	_creationTime: number;
	title: string;
	description: string;
	instructorId: Id<'users'>;
	scheduledFor: number;
	duration: number;
	isRecorded: boolean;
	maxParticipants: number;
	status: 'scheduled' | 'live' | 'completed' | 'cancelled';
	recordingUrl?: string;
};

// Convex-based live session hooks
export function useAllLiveSessions(
	status?: 'scheduled' | 'live' | 'completed' | 'cancelled'
) {
	const { isEnabled } = useFeatureFlags();
	const convexSessions = useQuery(
		api.liveSessions.list,
		isEnabled('convex_live_sessions') ? { status } : 'skip'
	);

	if (isEnabled('convex_live_sessions')) {
		return {
			data: convexSessions || [],
			isLoading: convexSessions === undefined,
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

export function useUpcomingSessions() {
	const { isEnabled } = useFeatureFlags();
	const convexUpcoming = useQuery(
		api.liveSessions.upcoming,
		isEnabled('convex_live_sessions') ? {} : 'skip'
	);

	if (isEnabled('convex_live_sessions')) {
		return {
			data: convexUpcoming || [],
			isLoading: convexUpcoming === undefined,
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

export function usePastSessions() {
	const { isEnabled } = useFeatureFlags();
	const convexPast = useQuery(
		api.liveSessions.past,
		isEnabled('convex_live_sessions') ? {} : 'skip'
	);

	if (isEnabled('convex_live_sessions')) {
		return {
			data: convexPast || [],
			isLoading: convexPast === undefined,
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

export function useLiveSession(id: Id<'liveSessions'>) {
	const { isEnabled } = useFeatureFlags();
	const convexSession = useQuery(
		api.liveSessions.get,
		isEnabled('convex_live_sessions') ? { id } : 'skip'
	);

	if (isEnabled('convex_live_sessions')) {
		return {
			data: convexSession,
			isLoading: convexSession === undefined,
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

// Mutation hooks for session management
export function useJoinSession() {
	const { isEnabled } = useFeatureFlags();
	const convexJoin = useMutation(api.liveSessions.join);

	return async (sessionId: Id<'liveSessions'>, userId: Id<'users'>) => {
		if (isEnabled('convex_live_sessions')) {
			try {
				await convexJoin({ sessionId, userId });
				return true;
			} catch (error) {
				console.error('Failed to join session:', error);
				return false;
			}
		}

		// Fallback to mock implementation if Convex is disabled
		return false;
	};
}

export function useLeaveSession() {
	const { isEnabled } = useFeatureFlags();
	const convexLeave = useMutation(api.liveSessions.leave);

	return async (sessionId: Id<'liveSessions'>, userId: Id<'users'>) => {
		if (isEnabled('convex_live_sessions')) {
			try {
				await convexLeave({ sessionId, userId });
				return true;
			} catch (error) {
				console.error('Failed to leave session:', error);
				return false;
			}
		}

		// Fallback to mock implementation if Convex is disabled
		return false;
	};
}

export function useStartSession() {
	const { isEnabled } = useFeatureFlags();
	const convexStart = useMutation(api.liveSessions.start);

	return async (id: Id<'liveSessions'>) => {
		if (isEnabled('convex_live_sessions')) {
			try {
				await convexStart({ id });
				return true;
			} catch (error) {
				console.error('Failed to start session:', error);
				return false;
			}
		}

		// Fallback to mock implementation if Convex is disabled
		return false;
	};
}

export function useEndSession() {
	const { isEnabled } = useFeatureFlags();
	const convexEnd = useMutation(api.liveSessions.end);

	return async (id: Id<'liveSessions'>) => {
		if (isEnabled('convex_live_sessions')) {
			try {
				await convexEnd({ id });
				return true;
			} catch (error) {
				console.error('Failed to end session:', error);
				return false;
			}
		}

		// Fallback to mock implementation if Convex is disabled
		return false;
	};
}

export function useCancelSession() {
	const { isEnabled } = useFeatureFlags();
	const convexCancel = useMutation(api.liveSessions.cancel);

	return async (id: Id<'liveSessions'>) => {
		if (isEnabled('convex_live_sessions')) {
			try {
				await convexCancel({ id });
				return true;
			} catch (error) {
				console.error('Failed to cancel session:', error);
				return false;
			}
		}

		// Fallback to mock implementation if Convex is disabled
		return false;
	};
}
