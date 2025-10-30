'use client';

import { useQuery } from 'convex/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { BarChart2, BookOpenIcon, CalendarIcon, GraduationCapIcon, UsersIcon } from '@/components/icons';
import { DashboardRecommendations } from '@/components/recommendation/dashboard-recommendations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useStudentAnalytics } from '@/lib/analytics-service';
import { useAuth } from '@/lib/auth';

export default function DashboardPage() {
	const { user, isLoading } = useAuth();
	console.log(user, 'user');
	const router = useRouter();

	// Convex queries
	const enrolledCourses = useQuery(api.courses.list, user ? {} : 'skip');
	const userCertificates = useQuery(
		api.certificates.listForUser,
		user?.id ? { userId: user.id as Id<'users'> } : 'skip',
	);

	// Student analytics for dashboard metrics
	const studentAnalytics = useStudentAnalytics(user?.id as Id<'users'>);

	// Show loading state while checking auth
	if (isLoading) {
		return <div className="container py-10">Loading...</div>;
	}

	return (
		<div className="container py-10">
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
				<h1 className="text-3xl font-bold">Dashboard</h1>
				<div className="flex space-x-2 mt-4 md:mt-0">
					<Button variant="outline" asChild>
						<Link href="/dashboard/progress">
							<BarChart2 className="mr-2 h-4 w-4" />
							Detailed Progress
						</Link>
					</Button>
					<Button variant="default" asChild>
						<Link href="/recommendations">View All Recommendations</Link>
					</Button>
				</div>
			</div>

			<Tabs defaultValue="overview" className="space-y-4">
				<TabsList>
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="courses">My Courses</TabsTrigger>
					<TabsTrigger value="progress">Progress</TabsTrigger>
					<TabsTrigger value="certificates">Certificates</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Courses Enrolled</CardTitle>
								<GraduationCapIcon className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{studentAnalytics.data ? studentAnalytics.data.overview.enrolledCourses : 0}
								</div>
								<p className="text-xs text-muted-foreground">
									{studentAnalytics.data
										? `${studentAnalytics.data.recentActivity.purchases} new this month`
										: 'No recent enrollments'}
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Completed Courses</CardTitle>
								<BookOpenIcon className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{studentAnalytics.data ? studentAnalytics.data.overview.completedCourses : 0}
								</div>
								<p className="text-xs text-muted-foreground">
									{studentAnalytics.data
										? `${studentAnalytics.data.recentActivity.certificates} completed this month`
										: 'No recent completions'}
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
								<CalendarIcon className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">Coming Soon {/* TODO: Add live session count query */}</div>
								<p className="text-xs text-muted-foreground">Live sessions available soon</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Community</CardTitle>
								<UsersIcon className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">Coming Soon {/* TODO: Add community/discussion analytics */}</div>
								<p className="text-xs text-muted-foreground">Community features available soon</p>
							</CardContent>
						</Card>
					</div>

					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
						<Card className="col-span-4">
							<CardHeader>
								<CardTitle>Recent Activity</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{studentAnalytics.data ? (
										// Show real activity when available
										<>
											{studentAnalytics.data.overview.enrolledCourses > 0 && (
												<div className="flex items-center">
													<div className="mr-4 h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
														<GraduationCapIcon className="h-5 w-5 text-primary" />
													</div>
													<div className="space-y-1">
														<p className="text-sm font-medium leading-none">
															{studentAnalytics.data.overview.enrolledCourses} courses enrolled
														</p>
														<p className="text-sm text-muted-foreground">
															{studentAnalytics.data.recentActivity.purchases > 0
																? `${studentAnalytics.data.recentActivity.purchases} enrolled this month`
																: 'Recent enrollment activity'}
														</p>
													</div>
												</div>
											)}
											{studentAnalytics.data.overview.completedCourses > 0 && (
												<div className="flex items-center">
													<div className="mr-4 h-9 w-9 rounded-full bg-green-100 flex items-center justify-center">
														<BookOpenIcon className="h-5 w-5 text-green-600" />
													</div>
													<div className="space-y-1">
														<p className="text-sm font-medium leading-none">
															{studentAnalytics.data.overview.completedCourses} courses completed
														</p>
														<p className="text-sm text-muted-foreground">
															{studentAnalytics.data.recentActivity.certificates > 0
																? `${studentAnalytics.data.recentActivity.certificates} completed this month`
																: 'Recent completion activity'}
														</p>
													</div>
												</div>
											)}
											{studentAnalytics.data.overview.favoriteResources > 0 && (
												<div className="flex items-center">
													<div className="mr-4 h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
														<BookOpenIcon className="h-5 w-5 text-blue-600" />
													</div>
													<div className="space-y-1">
														<p className="text-sm font-medium leading-none">
															{studentAnalytics.data.overview.favoriteResources} resources favorited
														</p>
														<p className="text-sm text-muted-foreground">Saved for later reading</p>
													</div>
												</div>
											)}
										</>
									) : (
										// Show placeholder when no data or Convex disabled
										<div className="flex items-center">
											<div className="mr-4 h-9 w-9 rounded-full bg-muted flex items-center justify-center">
												<GraduationCapIcon className="h-5 w-5 text-muted-foreground" />
											</div>
											<div className="space-y-1">
												<p className="text-sm font-medium leading-none">No recent activity</p>
												<p className="text-sm text-muted-foreground">Start your learning journey</p>
											</div>
										</div>
									)}
								</div>
							</CardContent>
						</Card>

						<Card className="col-span-3">
							<CardHeader>
								<CardTitle>Recommended Courses</CardTitle>
								<CardDescription>Based on your interests and progress</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{studentAnalytics.data ? (
										// Show enrollment status
										<>
											{studentAnalytics.data.overview.enrolledCourses > 0 ? (
												<div className="flex items-center">
													<div className="mr-4 h-9 w-9 rounded-full bg-green-100 flex items-center justify-center">
														<BookOpenIcon className="h-5 w-5 text-green-600" />
													</div>
													<div className="space-y-1">
														<p className="text-sm font-medium leading-none">
															{studentAnalytics.data.learningProgress.inProgress} in progress
														</p>
														<p className="text-sm text-muted-foreground">Continue your learning journey</p>
													</div>
												</div>
											) : (
												<div className="flex items-center">
													<div className="mr-4 h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
														<BookOpenIcon className="h-5 w-5 text-primary" />
													</div>
													<div className="space-y-1">
														<p className="text-sm font-medium leading-none">Ready to start learning</p>
														<p className="text-sm text-muted-foreground">Browse available courses</p>
													</div>
												</div>
											)}
											{studentAnalytics.data.overview.completedCourses > 0 && (
												<div className="flex items-center">
													<div className="mr-4 h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
														<GraduationCapIcon className="h-5 w-5 text-blue-600" />
													</div>
													<div className="space-y-1">
														<p className="text-sm font-medium leading-none">
															{Math.round(studentAnalytics.data.overview.completionRate)}% completion rate
														</p>
														<p className="text-sm text-muted-foreground">Great progress!</p>
													</div>
												</div>
											)}
										</>
									) : (
										// Show placeholder when no data
										<div className="flex items-center">
											<div className="mr-4 h-9 w-9 rounded-full bg-muted flex items-center justify-center">
												<BookOpenIcon className="h-5 w-5 text-muted-foreground" />
											</div>
											<div className="space-y-1">
												<p className="text-sm font-medium leading-none">Learning dashboard</p>
												<p className="text-sm text-muted-foreground">Track your progress here</p>
											</div>
										</div>
									)}
								</div>
								<Button variant="outline" className="w-full mt-4" asChild>
									<Link href="/recommendations">View All Recommendations</Link>
								</Button>
							</CardContent>
						</Card>
					</div>

					<DashboardRecommendations />
				</TabsContent>

				<TabsContent value="courses" className="space-y-4">
					<h2 className="text-2xl font-bold">My Courses</h2>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{enrolledCourses ? (
							enrolledCourses.map(course => (
								<Card key={course._id}>
									<CardHeader>
										<CardTitle>{course.title}</CardTitle>
										<CardDescription>
											{course.level || 'Beginner'} · {course.duration || '8 weeks'}
										</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="space-y-2">
											<div className="flex justify-between text-sm">
												<span>Progress</span>
												<span>0%</span> {/* TODO: Add progress tracking */}
											</div>
											<div className="h-2 bg-secondary rounded-full overflow-hidden">
												<div className="h-full bg-primary" style={{ width: '0%' }} />
											</div>
											<Button
												variant="outline"
												className="w-full mt-2"
												onClick={() => router.push(`/courses/${course._id}`)}
											>
												View Course
											</Button>
										</div>
									</CardContent>
								</Card>
							))
						) : (
							// Show empty state when no courses
							<div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
								<BookOpenIcon className="h-12 w-12 text-muted-foreground mb-4" />
								<h3 className="text-lg font-semibold mb-2">No courses yet</h3>
								<p className="text-muted-foreground mb-4">
									You haven't enrolled in any courses yet. Browse our catalog to get started!
								</p>
								<Button asChild>
									<Link href="/courses">Browse Courses</Link>
								</Button>
							</div>
						)}
					</div>
				</TabsContent>

				<TabsContent value="progress" className="space-y-4">
					<h2 className="text-2xl font-bold">Your Progress</h2>
					<Card>
						<CardHeader>
							<CardTitle>Overall Completion</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="space-y-2">
									<div className="flex justify-between text-sm">
										<span>All Courses</span>
										<span>58%</span>
									</div>
									<div className="h-2 bg-secondary rounded-full overflow-hidden">
										<div className="h-full bg-primary" style={{ width: '58%' }} />
									</div>
								</div>

								<div className="space-y-2">
									<div className="flex justify-between text-sm">
										<span>Practical Skills</span>
										<span>72%</span>
									</div>
									<div className="h-2 bg-secondary rounded-full overflow-hidden">
										<div className="h-full bg-primary" style={{ width: '72%' }} />
									</div>
								</div>

								<div className="space-y-2">
									<div className="flex justify-between text-sm">
										<span>Theoretical Knowledge</span>
										<span>65%</span>
									</div>
									<div className="h-2 bg-secondary rounded-full overflow-hidden">
										<div className="h-full bg-primary" style={{ width: '65%' }} />
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="certificates" className="space-y-4">
					<h2 className="text-2xl font-bold">Your Certificates</h2>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{userCertificates === undefined ? (
							// Loading state
							<div className="col-span-full text-center py-8 text-muted-foreground">Loading certificates...</div>
						) : userCertificates.length === 0 ? (
							// Empty state
							<Card className="col-span-full">
								<CardContent className="p-12 text-center">
									<GraduationCapIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
									<h3 className="text-lg font-medium mb-2">No certificates yet</h3>
									<p className="text-muted-foreground mb-6">
										Complete courses to earn certificates and showcase your achievements.
									</p>
									<Button onClick={() => router.push('/courses')}>
										<BookOpenIcon className="h-4 w-4 mr-2" />
										Browse Courses
									</Button>
								</CardContent>
							</Card>
						) : (
							// Display certificates
							userCertificates.map(cert => (
								<Card key={cert._id}>
									<CardHeader>
										<CardTitle>{cert.courseName}</CardTitle>
										<CardDescription>
											Issued:{' '}
											{new Date(cert.issueDate).toLocaleDateString('en-US', {
												month: 'short',
												day: 'numeric',
												year: 'numeric',
											})}
										</CardDescription>
									</CardHeader>
									<CardContent>
										<Button
											variant="outline"
											className="w-full"
											onClick={() => router.push(`/certificates/${cert._id}`)}
										>
											View Certificate
										</Button>
									</CardContent>
								</Card>
							))
						)}
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
