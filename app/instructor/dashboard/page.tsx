'use client';

import { useQuery } from 'convex/react';
import { BarChart2, BookOpen, Clock, DollarSign, PlusCircle, Users } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useAuth } from '@/lib/auth';

export default function InstructorDashboardPage() {
	const { user } = useAuth();
	const router = useRouter();
	// Convex query for instructor's courses
	const instructorCourses = useQuery(api.courses.list, user ? { instructorId: user.id as Id<'users'> } : 'skip');

	if (!user || !user.isInstructor) {
		return null;
	}

	return (
		<div className="container py-10">
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
				<div>
					<h1 className="text-3xl font-bold">Instructor Dashboard</h1>
					<p className="text-muted-foreground">Manage your courses and track your performance</p>
				</div>
				<Button onClick={() => router.push('/instructor/courses/wizard')} className="flex items-center gap-2">
					<PlusCircle className="h-4 w-4" />
					Create New Course
				</Button>
			</div>

			<Tabs defaultValue="overview" className="w-full">
				<TabsList className="mb-6">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="courses">My Courses</TabsTrigger>
					<TabsTrigger value="students">Students</TabsTrigger>
					<TabsTrigger value="earnings">Earnings</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						<Card>
							<CardContent className="p-6">
								<div className="flex items-center gap-4">
									<div className="rounded-full bg-primary/10 p-3">
										<BookOpen className="h-6 w-6 text-primary" />
									</div>
									<div>
										<p className="text-sm text-muted-foreground">Total Courses</p>
										<p className="text-2xl font-bold">3</p>
									</div>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="p-6">
								<div className="flex items-center gap-4">
									<div className="rounded-full bg-primary/10 p-3">
										<Users className="h-6 w-6 text-primary" />
									</div>
									<div>
										<p className="text-sm text-muted-foreground">Total Students</p>
										<p className="text-2xl font-bold">124</p>
									</div>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="p-6">
								<div className="flex items-center gap-4">
									<div className="rounded-full bg-primary/10 p-3">
										<DollarSign className="h-6 w-6 text-primary" />
									</div>
									<div>
										<p className="text-sm text-muted-foreground">Total Revenue</p>
										<p className="text-2xl font-bold">$4,320</p>
									</div>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="p-6">
								<div className="flex items-center gap-4">
									<div className="rounded-full bg-primary/10 p-3">
										<Clock className="h-6 w-6 text-primary" />
									</div>
									<div>
										<p className="text-sm text-muted-foreground">Avg. Completion</p>
										<p className="text-2xl font-bold">68%</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<Card className="md:col-span-2">
							<CardHeader>
								<CardTitle>Recent Activity</CardTitle>
								<CardDescription>Your course activity from the past 30 days</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="h-[300px] flex items-center justify-center">
									<BarChart2 className="h-16 w-16 text-muted-foreground" />
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle>Top Performing Course</CardTitle>
								<CardDescription>Based on enrollment and completion</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div className="flex items-center gap-4">
										<Image
											src="/placeholder.svg?height=100&width=100"
											alt="Course thumbnail"
											width={100}
											height={60}
											className="w-[100px] h-[60px] object-cover rounded-md"
										/>
										<div>
											<h3 className="font-medium">Advanced Botox Techniques</h3>
											<p className="text-sm text-muted-foreground">78 students enrolled</p>
										</div>
									</div>
									<div className="space-y-2">
										<div className="flex justify-between text-sm">
											<span>Completion Rate</span>
											<span className="font-medium">82%</span>
										</div>
										<div className="h-2 bg-muted rounded-full overflow-hidden">
											<div className="h-full bg-primary rounded-full" style={{ width: '82%' }}></div>
										</div>
									</div>
									<div className="space-y-2">
										<div className="flex justify-between text-sm">
											<span>Average Rating</span>
											<span className="font-medium">4.8/5</span>
										</div>
										<div className="flex">
											{[1, 2, 3, 4, 5].map(star => (
												<svg
													key={star}
													xmlns="http://www.w3.org/2000/svg"
													width="24"
													height="24"
													viewBox="0 0 24 24"
													fill={star <= 5 ? 'currentColor' : 'none'}
													stroke="currentColor"
													strokeWidth="2"
													strokeLinecap="round"
													strokeLinejoin="round"
													className="h-4 w-4 text-yellow-500"
												>
													<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
												</svg>
											))}
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="courses" className="space-y-6">
					<div className="flex justify-between items-center">
						<h2 className="text-xl font-bold">Your Courses</h2>
						<Button onClick={() => router.push('/instructor/courses/wizard')} className="flex items-center gap-2">
							<PlusCircle className="h-4 w-4" />
							Create New Course
						</Button>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{instructorCourses === undefined ? (
							// Loading state
							<>
								{[1, 2, 3].map(i => (
									<Card key={i}>
										<CardContent className="p-0">
											<Skeleton className="w-full aspect-video" />
											<div className="p-6 space-y-3">
												<Skeleton className="h-6 w-3/4" />
												<Skeleton className="h-4 w-full" />
												<Skeleton className="h-4 w-5/6" />
												<div className="flex gap-2 pt-2">
													<Skeleton className="h-10 flex-1" />
													<Skeleton className="h-10 flex-1" />
												</div>
											</div>
										</CardContent>
									</Card>
								))}
							</>
						) : instructorCourses.length === 0 ? (
							// Empty state
							<Card className="col-span-full">
								<CardContent className="p-12 text-center">
									<BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
									<h3 className="text-lg font-medium mb-2">No courses yet</h3>
									<p className="text-muted-foreground mb-6">Create your first course to start teaching and earning.</p>
									<Button onClick={() => router.push('/instructor/courses/wizard')}>
										<PlusCircle className="h-4 w-4 mr-2" />
										Create Your First Course
									</Button>
								</CardContent>
							</Card>
						) : (
							// Display courses
							instructorCourses.map(course => (
								<Card key={course._id}>
									<CardContent className="p-0">
										<Image
											src={course.thumbnailUrl || '/placeholder.svg?height=200&width=400'}
											alt="Course thumbnail"
											width={400}
											height={200}
											className="w-full aspect-video object-cover"
										/>
										<div className="p-6">
											<div className="flex justify-between items-start mb-2">
												<h3 className="font-medium">{course.title}</h3>
												<Badge>Published</Badge>
											</div>
											<p className="text-sm text-muted-foreground mb-4 line-clamp-2">{course.description}</p>
											<div className="flex justify-between text-sm mb-4">
												<span>${course.price ?? 0}</span>
												<span>{course.rating?.toFixed(1) || 'N/A'} ★</span>
											</div>
											<div className="flex gap-2">
												<Button
													variant="outline"
													className="flex-1"
													onClick={() => router.push(`/instructor/courses/${course._id}/edit`)}
												>
													Edit
												</Button>
												<Button
													className="flex-1"
													onClick={() => router.push(`/instructor/courses/${course._id}/analytics`)}
												>
													Analytics
												</Button>
											</div>
										</div>
									</CardContent>
								</Card>
							))
						)}
					</div>
				</TabsContent>

				<TabsContent value="students" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Student Enrollments</CardTitle>
							<CardDescription>Students enrolled in your courses</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{[1, 2, 3, 4, 5].map(i => (
									<div key={i} className="flex items-center justify-between p-2 hover:bg-muted rounded-lg">
										<div className="flex items-center gap-4">
											<Avatar>
												<AvatarImage src={`/placeholder.svg?height=40&width=40&text=${i}`} />
												<AvatarFallback>S{i}</AvatarFallback>
											</Avatar>
											<div>
												<p className="font-medium">Student Name {i}</p>
												<p className="text-sm text-muted-foreground">student{i}@example.com</p>
											</div>
										</div>
										<div className="text-right">
											<p className="font-medium">Advanced Botox Techniques</p>
											<p className="text-sm text-muted-foreground">Enrolled on {new Date().toLocaleDateString()}</p>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="earnings" className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<Card>
							<CardContent className="p-6">
								<div className="flex items-center gap-4">
									<div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
										<DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
									</div>
									<div>
										<p className="text-sm text-muted-foreground">Total Earnings</p>
										<p className="text-2xl font-bold">$4,320</p>
									</div>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="p-6">
								<div className="flex items-center gap-4">
									<div className="rounded-full bg-blue-100 dark:bg-blue-900/20 p-3">
										<DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
									</div>
									<div>
										<p className="text-sm text-muted-foreground">This Month</p>
										<p className="text-2xl font-bold">$1,250</p>
									</div>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="p-6">
								<div className="flex items-center gap-4">
									<div className="rounded-full bg-amber-100 dark:bg-amber-900/20 p-3">
										<DollarSign className="h-6 w-6 text-amber-600 dark:text-amber-400" />
									</div>
									<div>
										<p className="text-sm text-muted-foreground">Pending Payout</p>
										<p className="text-2xl font-bold">$750</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					<Card>
						<CardHeader>
							<CardTitle>Earnings by Course</CardTitle>
							<CardDescription>Revenue breakdown by course</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="space-y-2">
									<div className="flex justify-between">
										<span className="font-medium">Advanced Botox Techniques</span>
										<span className="font-medium">$2,450</span>
									</div>
									<div className="h-2 bg-muted rounded-full overflow-hidden">
										<div className="h-full bg-primary rounded-full" style={{ width: '60%' }}></div>
									</div>
								</div>
								<div className="space-y-2">
									<div className="flex justify-between">
										<span className="font-medium">Dermal Fillers Masterclass</span>
										<span className="font-medium">$1,870</span>
									</div>
									<div className="h-2 bg-muted rounded-full overflow-hidden">
										<div className="h-full bg-primary rounded-full" style={{ width: '40%' }}></div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
