'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	CalendarIcon,
	GraduationCapIcon,
	UsersIcon,
	BookOpenIcon,
	BarChart2,
} from '@/components/icons';
import { DashboardRecommendations } from '@/components/recommendation/dashboard-recommendations';
import { useFeatureFlags } from '@/providers/FeatureFlagProvider';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import Link from 'next/link';

export default function DashboardPage() {
	const { user, isLoading } = useAuth();
	const router = useRouter();
	const { isEnabled } = useFeatureFlags();

	// Convex queries
	const enrolledCourses = useQuery(
		api.courses.list,
		isEnabled('convex_courses') && user ? {} : 'skip'
	);

	// Show loading state while checking auth
	if (isLoading) {
		return <div className='container py-10'>Loading...</div>;
	}

	return (
		<div className='container py-10'>
			<div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-6'>
				<h1 className='text-3xl font-bold'>Dashboard</h1>
				<div className='flex space-x-2 mt-4 md:mt-0'>
					<Button variant='outline' asChild>
						<Link href='/dashboard/progress'>
							<BarChart2 className='mr-2 h-4 w-4' />
							Detailed Progress
						</Link>
					</Button>
					<Button variant='default' asChild>
						<Link href='/recommendations'>View All Recommendations</Link>
					</Button>
				</div>
			</div>

			<Tabs defaultValue='overview' className='space-y-4'>
				<TabsList>
					<TabsTrigger value='overview'>Overview</TabsTrigger>
					<TabsTrigger value='courses'>My Courses</TabsTrigger>
					<TabsTrigger value='progress'>Progress</TabsTrigger>
					<TabsTrigger value='certificates'>Certificates</TabsTrigger>
				</TabsList>

				<TabsContent value='overview' className='space-y-4'>
					<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
						<Card>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-sm font-medium'>
									Courses Enrolled
								</CardTitle>
								<GraduationCapIcon className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>12</div>
								<p className='text-xs text-muted-foreground'>
									+2 from last month
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-sm font-medium'>
									Completed Courses
								</CardTitle>
								<BookOpenIcon className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>7</div>
								<p className='text-xs text-muted-foreground'>
									+1 from last month
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-sm font-medium'>
									Upcoming Sessions
								</CardTitle>
								<CalendarIcon className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>3</div>
								<p className='text-xs text-muted-foreground'>
									Next: Tomorrow, 2:00 PM
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-sm font-medium'>Community</CardTitle>
								<UsersIcon className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>+573</div>
								<p className='text-xs text-muted-foreground'>
									5 new discussions today
								</p>
							</CardContent>
						</Card>
					</div>

					<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
						<Card className='col-span-4'>
							<CardHeader>
								<CardTitle>Recent Activity</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='space-y-4'>
									{[1, 2, 3].map(i => (
										<div key={i} className='flex items-center'>
											<div className='mr-4 h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center'>
												<GraduationCapIcon className='h-5 w-5 text-primary' />
											</div>
											<div className='space-y-1'>
												<p className='text-sm font-medium leading-none'>
													Completed Module {i} in Advanced Injection Techniques
												</p>
												<p className='text-sm text-muted-foreground'>
													{i} day{i > 1 ? 's' : ''} ago
												</p>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						<Card className='col-span-3'>
							<CardHeader>
								<CardTitle>Recommended Courses</CardTitle>
								<CardDescription>
									Based on your interests and progress
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='space-y-4'>
									{[
										'Facial Anatomy Masterclass',
										'Business Management for Aesthetics',
										'Advanced Dermal Fillers',
									].map((course, i) => (
										<div key={i} className='flex items-center'>
											<div className='mr-4 h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center'>
												<BookOpenIcon className='h-5 w-5 text-primary' />
											</div>
											<div className='space-y-1'>
												<p className='text-sm font-medium leading-none'>
													{course}
												</p>
												<p className='text-sm text-muted-foreground'>
													{['Beginner', 'Intermediate', 'Advanced'][i]} ·{' '}
													{[4, 6, 8][i]} hours
												</p>
											</div>
										</div>
									))}
								</div>
								<Button variant='outline' className='w-full mt-4' asChild>
									<Link href='/recommendations'>View All Recommendations</Link>
								</Button>
							</CardContent>
						</Card>
					</div>

					<DashboardRecommendations />
				</TabsContent>

				<TabsContent value='courses' className='space-y-4'>
					<h2 className='text-2xl font-bold'>My Courses</h2>
					<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
						{isEnabled('convex_courses') && enrolledCourses
							? enrolledCourses.map(course => (
									<Card key={course._id}>
										<CardHeader>
											<CardTitle>{course.title}</CardTitle>
											<CardDescription>
												{course.level || 'Beginner'} ·{' '}
												{course.duration || '8 weeks'}
											</CardDescription>
										</CardHeader>
										<CardContent>
											<div className='space-y-2'>
												<div className='flex justify-between text-sm'>
													<span>Progress</span>
													<span>0%</span> {/* TODO: Add progress tracking */}
												</div>
												<div className='h-2 bg-secondary rounded-full overflow-hidden'>
													<div
														className='h-full bg-primary'
														style={{ width: '0%' }}
													/>
												</div>
												<Button
													variant='outline'
													className='w-full mt-2'
													onClick={() => router.push(`/courses/${course._id}`)}
												>
													View Course
												</Button>
											</div>
										</CardContent>
									</Card>
								))
							: // Fallback to mock data when Convex is disabled
								[
									'Introduction to Medical Aesthetics',
									'Advanced Injection Techniques',
									'Facial Anatomy for Practitioners',
								].map((course, i) => (
									<Card key={i}>
										<CardHeader>
											<CardTitle>{course}</CardTitle>
											<CardDescription>
												{['Beginner', 'Advanced', 'Intermediate'][i]} ·{' '}
												{[10, 15, 12][i]} hours
											</CardDescription>
										</CardHeader>
										<CardContent>
											<div className='space-y-2'>
												<div className='flex justify-between text-sm'>
													<span>Progress</span>
													<span>{[75, 45, 90][i]}%</span>
												</div>
												<div className='h-2 bg-secondary rounded-full overflow-hidden'>
													<div
														className='h-full bg-primary'
														style={{ width: `${[75, 45, 90][i]}%` }}
													/>
												</div>
												<Button variant='outline' className='w-full mt-2'>
													Continue
												</Button>
											</div>
										</CardContent>
									</Card>
								))}
					</div>
				</TabsContent>

				<TabsContent value='progress' className='space-y-4'>
					<h2 className='text-2xl font-bold'>Your Progress</h2>
					<Card>
						<CardHeader>
							<CardTitle>Overall Completion</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='space-y-4'>
								<div className='space-y-2'>
									<div className='flex justify-between text-sm'>
										<span>All Courses</span>
										<span>58%</span>
									</div>
									<div className='h-2 bg-secondary rounded-full overflow-hidden'>
										<div
											className='h-full bg-primary'
											style={{ width: '58%' }}
										/>
									</div>
								</div>

								<div className='space-y-2'>
									<div className='flex justify-between text-sm'>
										<span>Practical Skills</span>
										<span>72%</span>
									</div>
									<div className='h-2 bg-secondary rounded-full overflow-hidden'>
										<div
											className='h-full bg-primary'
											style={{ width: '72%' }}
										/>
									</div>
								</div>

								<div className='space-y-2'>
									<div className='flex justify-between text-sm'>
										<span>Theoretical Knowledge</span>
										<span>65%</span>
									</div>
									<div className='h-2 bg-secondary rounded-full overflow-hidden'>
										<div
											className='h-full bg-primary'
											style={{ width: '65%' }}
										/>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value='certificates' className='space-y-4'>
					<h2 className='text-2xl font-bold'>Your Certificates</h2>
					<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
						{[
							'Basic Injection Techniques',
							'Medical Aesthetics Fundamentals',
						].map((cert, i) => (
							<Card key={i}>
								<CardHeader>
									<CardTitle>{cert}</CardTitle>
									<CardDescription>
										Issued: {['Jan 15, 2023', 'Mar 22, 2023'][i]}
									</CardDescription>
								</CardHeader>
								<CardContent>
									<Button variant='outline' className='w-full'>
										View Certificate
									</Button>
								</CardContent>
							</Card>
						))}
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
