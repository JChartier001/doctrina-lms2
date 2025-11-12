'use client';

import { Award, BookOpen, Calendar, ChevronRight, Clock, Target, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { CourseProgressCard } from '@/components/course-progress-card';
import { LearningGoals } from '@/components/learning-goals';
import { ProgressChart } from '@/components/progress-chart';
import { SkillsRadarChart } from '@/components/skills-radar-chart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/convex/_generated/api';
import type { Doc, Id } from '@/convex/_generated/dataModel';
import { useAuth } from '@/lib/auth';
import { useQueryWithStatus } from '@/lib/convex';

// Mock data for overview stats and features not yet implemented in backend
const mockOverviewData = {
	totalHoursLearned: 42,
	certificatesEarned: 2,
	streakDays: 15,
	weeklyActivity: [4, 2, 5, 3, 7, 1, 0],
	weeklyGoal: 5,
	weeklyGoalProgress: 70,
	monthlyGoal: 20,
	monthlyGoalProgress: 65,
	recentActivity: [
		{
			id: 1,
			type: 'lesson_completed',
			course: 'Advanced Botox Techniques',
			item: 'Facial Anatomy Review',
			timestamp: '2 hours ago',
		},
		{
			id: 2,
			type: 'quiz_completed',
			course: 'Advanced Botox Techniques',
			item: 'Module 3 Quiz',
			score: '85%',
			timestamp: 'Yesterday',
		},
		{
			id: 3,
			type: 'course_started',
			course: 'Business Management for Aesthetics',
			timestamp: '2 days ago',
		},
		{
			id: 4,
			type: 'certificate_earned',
			course: 'Introduction to Medical Aesthetics',
			timestamp: '1 week ago',
		},
	],
	recommendations: [
		{ id: 1, title: 'Lip Augmentation Masterclass', match: '98% match' },
		{ id: 2, title: 'Advanced Client Photography', match: '85% match' },
		{ id: 3, title: 'Complication Management', match: '80% match' },
	],
	skills: [
		{ name: 'Botox Administration', value: 85 },
		{ name: 'Facial Anatomy', value: 90 },
		{ name: 'Client Consultation', value: 75 },
		{ name: 'Dermal Fillers', value: 60 },
		{ name: 'Business Management', value: 40 },
	],
	learningGoals: [
		{
			id: 1,
			title: 'Complete Advanced Botox course',
			progress: 75,
			dueDate: 'May 15, 2023',
		},
		{
			id: 2,
			title: 'Study 10 hours this week',
			progress: 70,
			dueDate: 'May 7, 2023',
		},
		{
			id: 3,
			title: 'Practice client consultations',
			progress: 50,
			dueDate: 'May 20, 2023',
		},
	],
};

export default function StudentProgressDashboard() {
	const { user, isLoading: authLoading } = useAuth();
	const router = useRouter();
	const [_activeTab, setActiveTab] = useState('overview');

	// Use comprehensive query to consolidate data fetching
	// Benefits: Single frontend request, no component-level waterfalls, data pre-loaded
	// Trade-off: Backend performs ~6 queries per enrollment (see getMyEnrollmentsWithProgress)
	// For 4 enrollments: ~26 queries total, acceptable for typical usage
	const enrollmentsQuery = useQueryWithStatus(api.enrollments.getMyEnrollmentsWithProgress);

	if (authLoading) {
		return (
			<div className="container py-4 sm:py-6 md:py-10">
				<Skeleton className="h-8 sm:h-10 w-48 sm:w-64 mb-4" />
				<Skeleton className="h-64 sm:h-96 w-full" />
			</div>
		);
	}

	if (enrollmentsQuery.isPending) {
		return (
			<div className="container py-4 sm:py-6 md:py-10">
				<div className="flex flex-col gap-4 mb-6">
					<div>
						<h1 className="text-2xl sm:text-3xl font-bold">Learning Progress</h1>
						<p className="text-sm sm:text-base text-muted-foreground">
							Track your educational journey and achievements
						</p>
					</div>
				</div>
				<div className="space-y-4 sm:space-y-6">
					<Skeleton className="h-24 sm:h-32 w-full" />
					<Skeleton className="h-24 sm:h-32 w-full" />
					<Skeleton className="h-24 sm:h-32 w-full" />
				</div>
			</div>
		);
	}

	if (enrollmentsQuery.isError) {
		return (
			<div className="container py-4 sm:py-6 md:py-10">
				<Card>
					<CardHeader>
						<CardTitle className="text-base sm:text-lg">Error Loading Progress</CardTitle>
						<CardDescription className="text-xs sm:text-sm">
							We encountered an issue loading your course progress
						</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-xs sm:text-sm text-muted-foreground mb-4">
							{enrollmentsQuery.error?.message || 'An unexpected error occurred'}
						</p>
						<Button onClick={() => window.location.reload()} className="w-full sm:w-auto text-sm">
							Try Again
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	const enrollments = enrollmentsQuery.data || [];

	if (enrollments.length === 0) {
		return (
			<div className="container py-4 sm:py-6 md:py-10">
				<div className="flex flex-col gap-4 mb-6">
					<div>
						<h1 className="text-2xl sm:text-3xl font-bold">Learning Progress</h1>
						<p className="text-sm sm:text-base text-muted-foreground">
							Track your educational journey and achievements
						</p>
					</div>
				</div>
				<Card>
					<CardHeader>
						<CardTitle className="text-base sm:text-lg">No Courses Yet</CardTitle>
						<CardDescription className="text-xs sm:text-sm">
							Start your learning journey by browsing our course catalog
						</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-col items-center py-6 sm:py-8 px-4">
						<BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mb-3 sm:mb-4" />
						<p className="text-center text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 max-w-md">
							You haven't enrolled in any courses yet. Explore our catalog to find the perfect course for you!
						</p>
						<Link href="/courses" className="w-full sm:w-auto">
							<Button size="lg" className="w-full sm:w-auto text-sm sm:text-base">
								Browse Courses
							</Button>
						</Link>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="container py-4 sm:py-6 md:py-10">
			<div className="flex flex-col gap-4 mb-6">
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold">Learning Progress</h1>
					<p className="text-sm sm:text-base text-muted-foreground">Track your educational journey and achievements</p>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<Badge variant="outline" className="flex items-center text-xs">
						<Clock className="mr-1 h-3 w-3" />
						<span className="hidden sm:inline">{mockOverviewData.totalHoursLearned} hours</span>
						<span className="sm:hidden">{mockOverviewData.totalHoursLearned}h</span>
					</Badge>
					<Badge variant="outline" className="flex items-center text-xs">
						<Award className="mr-1 h-3 w-3" />
						<span className="hidden sm:inline">{mockOverviewData.certificatesEarned} certificates</span>
						<span className="sm:hidden">{mockOverviewData.certificatesEarned} certs</span>
					</Badge>
					<Badge variant="outline" className="flex items-center text-xs">
						<TrendingUp className="mr-1 h-3 w-3" />
						<span className="hidden sm:inline">{mockOverviewData.streakDays} day streak</span>
						<span className="sm:hidden">{mockOverviewData.streakDays}d</span>
					</Badge>
				</div>
			</div>

			<Tabs defaultValue="overview" className="space-y-4 sm:space-y-6" onValueChange={setActiveTab}>
				<TabsList className="grid w-full h-auto grid-cols-2 gap-1 p-1 sm:grid-cols-4 sm:h-10 sm:w-auto sm:gap-0 lg:w-[600px]">
					<TabsTrigger value="overview" className="text-xs sm:text-sm px-2 py-2 sm:px-4 sm:py-1.5">
						Overview
					</TabsTrigger>
					<TabsTrigger value="courses" className="text-xs sm:text-sm px-2 py-2 sm:px-4 sm:py-1.5">
						Courses
					</TabsTrigger>
					<TabsTrigger value="skills" className="text-xs sm:text-sm px-2 py-2 sm:px-4 sm:py-1.5">
						Skills
					</TabsTrigger>
					<TabsTrigger value="goals" className="text-xs sm:text-sm px-2 py-2 sm:px-4 sm:py-1.5">
						Goals
					</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="space-y-4 sm:space-y-6">
					{/* Overall Progress Cards */}
					<div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
								<Target className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{calculateOverallProgress(enrollments)}%</div>
								<Progress value={calculateOverallProgress(enrollments)} className="h-2 mt-2" />
								<p className="text-xs text-muted-foreground mt-2">Across all enrolled courses</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Courses</CardTitle>
								<BookOpen className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{countCompletedCourses(enrollments)}/{enrollments.length}
								</div>
								<p className="text-xs text-muted-foreground mt-2">Completed courses</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Weekly Goal</CardTitle>
								<Calendar className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{mockOverviewData.weeklyGoalProgress}%</div>
								<Progress value={mockOverviewData.weeklyGoalProgress} className="h-2 mt-2" />
								<p className="text-xs text-muted-foreground mt-2">
									{Math.round((mockOverviewData.weeklyGoalProgress / 100) * mockOverviewData.weeklyGoal)}/
									{mockOverviewData.weeklyGoal} hours this week
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Monthly Goal</CardTitle>
								<Calendar className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{mockOverviewData.monthlyGoalProgress}%</div>
								<Progress value={mockOverviewData.monthlyGoalProgress} className="h-2 mt-2" />
								<p className="text-xs text-muted-foreground mt-2">
									{Math.round((mockOverviewData.monthlyGoalProgress / 100) * mockOverviewData.monthlyGoal)}/
									{mockOverviewData.monthlyGoal} hours this month
								</p>
							</CardContent>
						</Card>
					</div>

					{/* Progress Chart and Activity Timeline */}
					<div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-7">
						<Card className="lg:col-span-4">
							<CardHeader>
								<CardTitle className="text-base sm:text-lg">Learning Activity</CardTitle>
								<CardDescription className="text-xs sm:text-sm">
									Your daily learning activity for the past week
								</CardDescription>
							</CardHeader>
							<CardContent className="overflow-hidden">
								<div className="w-full max-w-full overflow-x-auto">
									<ProgressChart data={mockOverviewData.weeklyActivity} />
								</div>
							</CardContent>
						</Card>

						<Card className="lg:col-span-3">
							<CardHeader>
								<CardTitle className="text-base sm:text-lg">Recent Activity</CardTitle>
								<CardDescription className="text-xs sm:text-sm">Your latest learning activities</CardDescription>
							</CardHeader>
							<CardContent>
								{/* <ActivityTimeline activities={mockOverviewData.recentActivity as Activity[]} /> */}
							</CardContent>
						</Card>
					</div>

					{/* Course Progress and Recommendations */}
					<div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-7">
						<Card className="lg:col-span-4">
							<CardHeader className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
								<div>
									<CardTitle className="text-base sm:text-lg">Course Progress</CardTitle>
									<CardDescription className="text-xs sm:text-sm">Your active courses</CardDescription>
								</div>
								<Button
									variant="ghost"
									size="sm"
									className="gap-1 self-start sm:self-auto text-xs sm:text-sm"
									onClick={() => setActiveTab('courses')}
								>
									View All <ChevronRight className="h-4 w-4" />
								</Button>
							</CardHeader>
							<CardContent>
								<div className="space-y-3 sm:space-y-4">
									{enrollments.slice(0, 2).map(enrollment => (
										<EnrollmentProgressCard key={enrollment._id} enrollment={enrollment} />
									))}
								</div>
							</CardContent>
						</Card>

						<Card className="lg:col-span-3">
							<CardHeader>
								<CardTitle className="text-base sm:text-lg">Recommended For You</CardTitle>
								<CardDescription className="text-xs sm:text-sm">Based on your interests and progress</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-3 sm:space-y-4">
									{mockOverviewData.recommendations.map(recommendation => (
										<div key={recommendation.id} className="flex items-center gap-3">
											<div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
												<BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
											</div>
											<div className="space-y-1 min-w-0">
												<p className="text-xs sm:text-sm font-medium leading-none truncate">{recommendation.title}</p>
												<p className="text-xs text-muted-foreground">{recommendation.match}</p>
											</div>
										</div>
									))}
								</div>
								<Button variant="outline" className="w-full mt-4 text-xs sm:text-sm">
									Explore More Courses
								</Button>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="courses" className="space-y-4 sm:space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="text-base sm:text-lg">My Enrolled Courses</CardTitle>
							<CardDescription className="text-xs sm:text-sm">Track your progress across all courses</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4 sm:space-y-6">
								{enrollments.map(enrollment => (
									<EnrollmentProgressCard key={enrollment._id} enrollment={enrollment} detailed />
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="skills" className="space-y-4 sm:space-y-6">
					<div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle className="text-base sm:text-lg">Skills Proficiency</CardTitle>
								<CardDescription className="text-xs sm:text-sm">
									Your competency levels across different skills
								</CardDescription>
							</CardHeader>
							<CardContent className="h-[300px] sm:h-[400px]">
								<SkillsRadarChart skills={mockOverviewData.skills} />
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="text-base sm:text-lg">Skill Breakdown</CardTitle>
								<CardDescription className="text-xs sm:text-sm">Detailed view of your skills</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4 sm:space-y-6">
									{mockOverviewData.skills.map(skill => (
										<div key={skill.name} className="space-y-1.5 sm:space-y-2">
											<div className="flex justify-between">
												<span className="text-xs sm:text-sm font-medium">{skill.name}</span>
												<span className="text-xs sm:text-sm font-medium">{skill.value}%</span>
											</div>
											<Progress value={skill.value} className="h-2" />
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="goals" className="space-y-4 sm:space-y-6">
					<div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle className="text-base sm:text-lg">Learning Goals</CardTitle>
								<CardDescription className="text-xs sm:text-sm">
									Track your personal learning objectives
								</CardDescription>
							</CardHeader>
							<CardContent>
								<LearningGoals goals={mockOverviewData.learningGoals} />
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="text-base sm:text-lg">Set New Goal</CardTitle>
								<CardDescription className="text-xs sm:text-sm">Create a new learning objective</CardDescription>
							</CardHeader>
							<CardContent>
								<form className="space-y-3 sm:space-y-4">
									<div className="space-y-1.5 sm:space-y-2">
										<label className="text-xs sm:text-sm font-medium">Goal Title</label>
										<input
											type="text"
											placeholder="e.g., Complete Advanced Botox course"
											className="w-full p-2 text-sm border rounded-md"
										/>
									</div>
									<div className="space-y-1.5 sm:space-y-2">
										<label className="text-xs sm:text-sm font-medium">Target Date</label>
										<input type="date" className="w-full p-2 text-sm border rounded-md" />
									</div>
									<div className="space-y-1.5 sm:space-y-2">
										<label className="text-xs sm:text-sm font-medium">Goal Type</label>
										<select className="w-full p-2 text-sm border rounded-md">
											<option>Course Completion</option>
											<option>Study Hours</option>
											<option>Skill Development</option>
											<option>Certification</option>
										</select>
									</div>
									<Button className="w-full text-sm">Create Goal</Button>
								</form>
							</CardContent>
						</Card>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}

/**
 * Component to display progress for a single enrollment
 * Data is pre-loaded from parent via getMyEnrollmentsWithProgress
 *
 * PERFORMANCE: This component makes no additional queries (all data passed as props).
 * The parent query performs ~6 database queries per enrollment (course, instructor, modules, lessons per module).
 * For 4 enrollments: ~26 total queries. Acceptable trade-off vs frontend waterfalls.
 *
 * See getMyEnrollmentsWithProgress JSDoc in convex/enrollments.ts for full performance analysis.
 */
function EnrollmentProgressCard({
	enrollment,
	detailed = false,
}: {
	enrollment: Doc<'enrollments'> & {
		course: Doc<'courses'> | null;
		instructor: {
			_id: Id<'users'>;
			firstName: string;
			lastName: string;
			email: string;
		} | null;
		progress: {
			percent: number;
			total: number;
			completed: number;
			completedLessonIds: string[];
		} | null;
		nextLessonId: Id<'lessons'> | null;
	};
	detailed?: boolean;
}) {
	// All data pre-loaded from parent query - no additional queries needed!
	const { course, instructor, progress, nextLessonId } = enrollment;

	// Handle failed course load
	if (!course) {
		// TODO: Integrate proper error monitoring service (e.g., Sentry, LogRocket)
		// Current limitation: console.error only logs to browser console
		// Errors go unnoticed in production - no tracking, alerting, or aggregation
		// Recommendation: Add Sentry.captureException() or similar when error tracking is set up
		console.error('Failed to load course for enrollment:', {
			enrollmentId: enrollment._id,
			courseId: enrollment.courseId,
			// Future: Send to error monitoring service
		});

		// Display error placeholder instead of silently hiding
		return (
			<Card className="border-destructive/50 bg-destructive/5">
				<CardContent className="py-4">
					<div className="flex items-center gap-3">
						<div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
							<BookOpen className="h-5 w-5 text-destructive" />
						</div>
						<div className="min-w-0 flex-1">
							<p className="text-sm font-medium text-destructive">Failed to load course</p>
							<p className="text-xs text-muted-foreground truncate">Course ID: {enrollment.courseId}</p>
						</div>
						<Button variant="outline" size="sm" onClick={() => window.location.reload()} className="text-xs shrink-0">
							Retry
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	// Build continue learning URL
	const continueUrl = nextLessonId
		? `/courses/${enrollment.courseId}/learn?lesson=${nextLessonId}`
		: `/courses/${enrollment.courseId}/learn`;

	// Get instructor name from pre-loaded data
	const instructorName = instructor ? `${instructor.firstName} ${instructor.lastName}` : 'Instructor';

	// Transform to CourseProgressCard expected format
	const courseData = {
		id: enrollment.courseId,
		title: course.title,
		progress: progress?.percent || 0,
		lastAccessed: new Date(enrollment.enrolledAt).toLocaleDateString(),
		nextLesson: nextLessonId ? 'Next lesson' : progress?.percent === 100 ? 'Course complete' : 'Start learning',
		totalLessons: progress?.total || 0,
		completedLessons: progress?.completed || 0,
		estimatedCompletion: progress?.percent === 100 ? 'Complete!' : estimateCompletion(progress?.percent || 0),
		instructor: instructorName,
		continueUrl,
	};

	return <CourseProgressCard course={courseData} detailed={detailed} />;
}

/**
 * Estimate completion time based on current progress
 */
function estimateCompletion(progressPercent: number): string {
	if (progressPercent >= 90) return '1-2 days';
	if (progressPercent >= 70) return '3-5 days';
	if (progressPercent >= 50) return '1 week';
	if (progressPercent >= 25) return '2 weeks';
	return '3+ weeks';
}

/**
 * Calculate overall progress across all enrollments
 * Returns average progress percentage
 */
function calculateOverallProgress(enrollments: Doc<'enrollments'>[]): number {
	if (enrollments.length === 0) return 0;

	const totalProgress = enrollments.reduce((sum, enrollment) => sum + enrollment.progressPercent, 0);
	return Math.round(totalProgress / enrollments.length);
}

/**
 * Count number of completed courses (100% progress)
 */
function countCompletedCourses(enrollments: Doc<'enrollments'>[]): number {
	return enrollments.filter(enrollment => enrollment.progressPercent === 100).length;
}
