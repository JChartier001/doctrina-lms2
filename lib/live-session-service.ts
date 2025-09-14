// Live Session Service
// This service handles live session management using Convex

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
	const convexSessions = useQuery(api.liveSessions.list, { status });

	return {
		data: convexSessions || [],
		isLoading: convexSessions === undefined,
		error: null,
	};
}

export function useUpcomingSessions() {
	const convexUpcoming = useQuery(api.liveSessions.upcoming, {});

	return {
		data: convexUpcoming || [],
		isLoading: convexUpcoming === undefined,
		error: null,
	};
}

export function usePastSessions() {
	const convexPast = useQuery(api.liveSessions.past, {});

	return {
		data: convexPast || [],
		isLoading: convexPast === undefined,
		error: null,
	};
}

export function useLiveSession(id: Id<'liveSessions'>) {
	const convexSession = useQuery(api.liveSessions.get, { id });

	return {
		data: convexSession,
		isLoading: convexSession === undefined,
		error: null,
	};
}

// Mutation hooks for session management
export function useJoinSession() {
	const convexJoin = useMutation(api.liveSessions.join);

	return async (sessionId: Id<'liveSessions'>, userId: Id<'users'>) => {
		try {
			await convexJoin({ sessionId, userId });
			return true;
		} catch (error) {
			console.error('Failed to join session:', error);
			return false;
		}
	};
}

export function useLeaveSession() {
	const convexLeave = useMutation(api.liveSessions.leave);

	return async (sessionId: Id<'liveSessions'>, userId: Id<'users'>) => {
		try {
			await convexLeave({ sessionId, userId });
			return true;
		} catch (error) {
			console.error('Failed to leave session:', error);
			return false;
		}
	};
}

export function useStartSession() {
	const convexStart = useMutation(api.liveSessions.start);

	return async (id: Id<'liveSessions'>) => {
		try {
			await convexStart({ id });
			return true;
		} catch (error) {
			console.error('Failed to start session:', error);
			return false;
		}
	};
}

export function useEndSession() {
	const convexEnd = useMutation(api.liveSessions.end);

	return async (id: Id<'liveSessions'>) => {
		try {
			await convexEnd({ id });
			return true;
		} catch (error) {
			console.error('Failed to end session:', error);
			return false;
		}
	};
}

export function useCancelSession() {
	const convexCancel = useMutation(api.liveSessions.cancel);

	return async (id: Id<'liveSessions'>) => {
		try {
			await convexCancel({ id });
			return true;
		} catch (error) {
			console.error('Failed to cancel session:', error);
			return false;
		}
	};
}
