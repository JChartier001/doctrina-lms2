'use client';

import { CalendarClock, Clock, Users, Video } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VideoRoom } from '@/components/video-room';
import { useAuth } from '@/lib/auth';
import { useJoinSession, useLeaveSession, useLiveSession } from '@/lib/live-session-service';

export default function LiveSessionPage({ params }: { params: { id: string } }) {
	const [hasJoined, setHasJoined] = useState(false);
	const { user } = useAuth();
	const router = useRouter();

	// Use Convex hooks
	const sessionResult = useLiveSession(params.id); // TODO: Fix type casting
	const joinSessionFn = useJoinSession();
	const leaveSessionFn = useLeaveSession();

	const { data: session, isLoading, error } = sessionResult;

	useEffect(() => {
		if (!user) {
			router.push('/sign-in');
		}
	}, [user, router]);

	const handleJoinSession = async () => {
		if (!user || !session) return;

		const success = await joinSessionFn(session._id, user.id); // TODO: Fix type casting
		if (success) {
			setHasJoined(true);
			toast.success(`Joined session. You've joined "${session.title}"`);
		}
	};

	const handleLeaveSession = async () => {
		if (!user || !session) return;

		const success = await leaveSessionFn(session._id, user.id); // TODO: Fix type casting
		if (success) {
			setHasJoined(false);
			router.push('/live');
		}
	};

	if (!user) {
		return null;
	}

	if (!session) {
		return (
			<div className="container py-10">
				<h1 className="text-2xl font-bold mb-4">Session Not Found</h1>
				<p className="mb-4">The live session you're looking for doesn't exist or has ended.</p>
				<Button onClick={() => router.push('/live')}>Back to Live Sessions</Button>
			</div>
		);
	}

	const isInstructor = session.instructorId === user.id;

	return (
		<div className="container py-6">
			{hasJoined ? (
				<VideoRoom
					sessionId={session._id}
					userId={user.id}
					userName={user.name}
					userImage={user.image}
					isHost={isInstructor}
					onLeave={handleLeaveSession}
				/>
			) : (
				<div className="max-w-3xl mx-auto">
					<Card>
						<CardHeader>
							<CardTitle className="text-2xl">{session.title}</CardTitle>
							<CardDescription>
								Hosted by {session.instructorName} • {session.status === 'live' ? 'Live now' : 'Starting soon'}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="mb-6">{session.description}</p>

							<div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
								<div className="flex items-center">
									<CalendarClock className="mr-1 h-4 w-4" />
									{new Date(session.scheduledFor).toLocaleDateString('en-US', {
										weekday: 'long',
										month: 'long',
										day: 'numeric',
									})}{' '}
									at{' '}
									{new Date(session.scheduledFor).toLocaleTimeString('en-US', {
										hour: '2-digit',
										minute: '2-digit',
									})}
								</div>
								<div className="flex items-center">
									<Clock className="mr-1 h-4 w-4" />
									{session.duration} minutes
								</div>
								<div className="flex items-center">
									<Users className="mr-1 h-4 w-4" />
									{session.participants.length} / {session.maxParticipants} participants
								</div>
								{session.isRecorded && (
									<div className="flex items-center">
										<Video className="mr-1 h-4 w-4" />
										This session will be recorded
									</div>
								)}
							</div>

							<div className="flex justify-center">
								<Button size="lg" onClick={handleJoinSession}>
									{session.status === 'live' ? 'Join Live Session Now' : 'Join Session When It Starts'}
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
}
