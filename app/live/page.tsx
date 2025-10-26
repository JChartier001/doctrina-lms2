'use client';

import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/auth';
import { usePastSessions, useUpcomingSessions } from '@/lib/live-session-service';

export default function LiveSessionsPage() {
	const [date, setDate] = useState<Date | undefined>(new Date());
	const { user } = useAuth();
	const router = useRouter();

	// Get sessions from Convex hooks
	const upcomingSessionsResult = useUpcomingSessions();
	const pastSessionsResult = usePastSessions();

	const upcomingSessions = upcomingSessionsResult.data || [];
	const pastSessions = pastSessionsResult.data || [];
	// const _isLoading = upcomingSessionsResult.isLoading || pastSessionsResult.isLoading;

	useEffect(() => {
		if (!user) {
			router.push('/sign-in');
		}
	}, [user, router]);

	if (!user) {
		return null;
	}

	return (
		<div className="container py-10">
			<h1 className="text-3xl font-bold mb-6">Live Sessions</h1>

			<Tabs defaultValue="upcoming" className="w-full">
				<TabsList className="mb-4">
					<TabsTrigger value="upcoming">Upcoming Sessions</TabsTrigger>
					<TabsTrigger value="past">Past Sessions</TabsTrigger>
					<TabsTrigger value="calendar">Calendar View</TabsTrigger>
				</TabsList>

				<TabsContent value="upcoming" className="space-y-6">
					{upcomingSessions.map(session => (
						<Card key={session._id}>
							<CardHeader>
								<div className="flex items-center justify-between">
									<div>
										<CardTitle>{session.title}</CardTitle>
										<CardDescription>
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
										</CardDescription>
									</div>
									<Badge variant="outline">{session.duration} min</Badge>
								</div>
							</CardHeader>
							<CardContent>
								<div className="flex items-center gap-4 mb-4">
									{/* <Avatar className="h-10 w-10">
										<AvatarImage src={session.instructorImage || '/placeholder.svg'} alt={session.instructorName} />
										<AvatarFallback>{session.instructorName.charAt(0)}</AvatarFallback>
									</Avatar>
									<div>
										<p className="font-medium">{session.instructorName}</p>
										<p className="text-sm text-muted-foreground">{session.participants.length} attendees registered</p> */}
									{/* </div> */}
								</div>

								<p className="text-sm mb-4">{session.description}</p>

								<div className="flex gap-2">
									<Button className="flex-1" onClick={() => router.push(`/live/${session._id}`)}>
										{session.status === 'live' ? 'Join Now' : 'View Details'}
									</Button>
									<Button variant="outline" className="flex-1">
										Add to Calendar
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</TabsContent>

				<TabsContent value="past" className="space-y-6">
					{pastSessions.map(session => (
						<Card key={session._id}>
							<CardHeader>
								<div className="flex items-center justify-between">
									<div>
										<CardTitle>{session.title}</CardTitle>
										<CardDescription>
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
										</CardDescription>
									</div>
									<Badge variant="outline">{session.duration} min</Badge>
								</div>
							</CardHeader>
							<CardContent>
								<div className="flex items-center gap-4 mb-4">
									{/* <Avatar className="h-10 w-10">
										<AvatarImage src={session.instructorImage || '/placeholder.svg'} alt={session.instructorName} />
										<AvatarFallback>{session.instructorName.charAt(0)}</AvatarFallback>
									</Avatar>
									<div>
										<p className="font-medium">{session.instructorName}</p>
										<p className="text-sm text-muted-foreground">
											{session.participants.length} attendees participated
										</p>
									</div> */}
								</div>

								<p className="text-sm mb-4">{session.description}</p>

								{session.recordingUrl && (
									<Button className="w-full" onClick={() => router.push(session.recordingUrl || '#')}>
										Watch Recording
									</Button>
								)}
							</CardContent>
						</Card>
					))}
				</TabsContent>

				<TabsContent value="calendar" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Session Calendar</CardTitle>
							<CardDescription>View and manage your live session schedule</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex flex-col md:flex-row gap-6">
								<div className="md:w-1/2">
									<Calendar
										selected={date ? dayjs(date) : undefined}
										onSelect={date => setDate(date ? date.toDate() : undefined)}
										className="rounded-md border"
									/>
								</div>
								<div className="md:w-1/2">
									<h3 className="font-medium mb-4">
										Sessions on{' '}
										{date?.toLocaleDateString('en-US', {
											weekday: 'long',
											month: 'long',
											day: 'numeric',
										})}
									</h3>

									{upcomingSessions.some(
										session => new Date(session.scheduledFor).toDateString() === date?.toDateString(),
									) ? (
										upcomingSessions
											.filter(session => new Date(session.scheduledFor).toDateString() === date?.toDateString())
											.map(session => (
												<div key={session._id} className="mb-4 p-4 border rounded-lg">
													<div className="flex justify-between items-center mb-2">
														<h4 className="font-medium">{session.title}</h4>
														<Badge variant="outline">
															{new Date(session.scheduledFor).toLocaleTimeString('en-US', {
																hour: '2-digit',
																minute: '2-digit',
															})}
														</Badge>
													</div>
													{/* <p className="text-sm text-muted-foreground mb-2">Instructor: {session.instructorId.name}</p> */}
													<Button size="sm" onClick={() => router.push(`/live/${session._id}`)}>
														{session.status === 'live' ? 'Join Now' : 'View Details'}
													</Button>
												</div>
											))
									) : (
										<div className="text-center p-6 border rounded-lg border-dashed">
											<p className="text-muted-foreground">No sessions scheduled for this day</p>
										</div>
									)}
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
