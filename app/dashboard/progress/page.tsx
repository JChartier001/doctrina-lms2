'use client';

import { Award, BookOpen, Calendar, ChevronRight, Clock, Target, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { ActivityTimeline } from '@/components/activity-timeline';
import { CourseProgressCard } from '@/components/course-progress-card';
import { LearningGoals } from '@/components/learning-goals';
import { ProgressChart } from '@/components/progress-chart';
import { SkillsRadarChart } from '@/components/skills-radar-chart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/auth';

// Mock data for the dashboard
const mockData = {
	overallProgress: 68,
	totalCoursesEnrolled: 8,
	totalCoursesCompleted: 3,
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
	enrolledCourses: [
		{
			id: '1',
			title: 'Advanced Botox Techniques',
			progress: 75,
			lastAccessed: '2 hours ago',
			nextLesson: 'Case Studies',
			totalLessons: 6,
			completedLessons: 4,
			estimatedCompletion: '3 days',
			instructor: 'Dr. Sarah Johnson',
		},
		{
			id: '2',
			title: 'Facial Anatomy for Practitioners',
			progress: 90,
			lastAccessed: 'Yesterday',
			nextLesson: 'Final Assessment',
			totalLessons: 8,
			completedLessons: 7,
			estimatedCompletion: '1 day',
			instructor: 'Dr. Michael Chen',
		},
		{
			id: '3',
			title: 'Business Management for Aesthetics',
			progress: 15,
			lastAccessed: '2 days ago',
			nextLesson: 'Marketing Strategies',
			totalLessons: 10,
			completedLessons: 1,
			estimatedCompletion: '2 weeks',
			instructor: 'Emma Rodriguez',
		},
		{
			id: '4',
			title: 'Advanced Dermal Fillers',
			progress: 0,
			lastAccessed: 'Not started',
			nextLesson: 'Introduction to Dermal Fillers',
			totalLessons: 12,
			completedLessons: 0,
			estimatedCompletion: '3 weeks',
			instructor: 'Dr. James Wilson',
		},
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
	recommendations: [
		{ id: 1, title: 'Lip Augmentation Masterclass', match: '98% match' },
		{ id: 2, title: 'Advanced Client Photography', match: '85% match' },
		{ id: 3, title: 'Complication Management', match: '80% match' },
	],
};

export default function StudentProgressDashboard() {
	const { user, isLoading } = useAuth();
	const router = useRouter();
	const [activeTab, setActiveTab] = useState('overview');

	if (isLoading) {
		return <div className="container py-10">Loading...</div>;
	}

	if (!user) {
		router.push('/sign-in');
		return null;
	}

	return (
		<div className="container py-10">
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
				<div>
					<h1 className="text-3xl font-bold">Learning Progress</h1>
					<p className="text-muted-foreground">Track your educational journey and achievements</p>
				</div>
				<div className="flex items-center mt-4 md:mt-0 space-x-2">
					<Badge variant="outline" className="flex items-center">
						<Clock className="mr-1 h-3 w-3" />
						<span>{mockData.totalHoursLearned} hours learned</span>
					</Badge>
					<Badge variant="outline" className="flex items-center">
						<Award className="mr-1 h-3 w-3" />
						<span>{mockData.certificatesEarned} certificates</span>
					</Badge>
					<Badge variant="outline" className="flex items-center">
						<TrendingUp className="mr-1 h-3 w-3" />
						<span>{mockData.streakDays} day streak</span>
					</Badge>
				</div>
			</div>

			<Tabs defaultValue="overview" className="space-y-6" onValueChange={setActiveTab}>
				<TabsList className="grid grid-cols-2 md:grid-cols-4 lg:w-[600px]">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="courses">My Courses</TabsTrigger>
					<TabsTrigger value="skills">Skills & Competencies</TabsTrigger>
					<TabsTrigger value="goals">Learning Goals</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="space-y-6">
					{/* Overall Progress Card */}
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
								<Target className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{mockData.overallProgress}%</div>
								<Progress value={mockData.overallProgress} className="h-2 mt-2" />
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
									{mockData.totalCoursesCompleted}/{mockData.totalCoursesEnrolled}
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
								<div className="text-2xl font-bold">{mockData.weeklyGoalProgress}%</div>
								<Progress value={mockData.weeklyGoalProgress} className="h-2 mt-2" />
								<p className="text-xs text-muted-foreground mt-2">
									{Math.round((mockData.weeklyGoalProgress / 100) * mockData.weeklyGoal)}/{mockData.weeklyGoal} hours
									this week
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Monthly Goal</CardTitle>
								<Calendar className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{mockData.monthlyGoalProgress}%</div>
								<Progress value={mockData.monthlyGoalProgress} className="h-2 mt-2" />
								<p className="text-xs text-muted-foreground mt-2">
									{Math.round((mockData.monthlyGoalProgress / 100) * mockData.monthlyGoal)}/{mockData.monthlyGoal} hours
									this month
								</p>
							</CardContent>
						</Card>
					</div>

					{/* Progress Chart and Activity Timeline */}
					<div className="grid gap-6 md:grid-cols-7">
						<Card className="md:col-span-4">
							<CardHeader>
								<CardTitle>Learning Activity</CardTitle>
								<CardDescription>Your daily learning activity for the past week</CardDescription>
							</CardHeader>
							<CardContent>
								<ProgressChart data={mockData.weeklyActivity} />
							</CardContent>
						</Card>

						<Card className="md:col-span-3">
							<CardHeader>
								<CardTitle>Recent Activity</CardTitle>
								<CardDescription>Your latest learning activities</CardDescription>
							</CardHeader>
							<CardContent>
								<ActivityTimeline activities={mockData.recentActivity} />
							</CardContent>
						</Card>
					</div>

					{/* Course Progress and Recommendations */}
					<div className="grid gap-6 md:grid-cols-7">
						<Card className="md:col-span-4">
							<CardHeader className="flex flex-row items-center justify-between">
								<div>
									<CardTitle>Course Progress</CardTitle>
									<CardDescription>Your active courses</CardDescription>
								</div>
								<Button variant="ghost" size="sm" className="gap-1" onClick={() => setActiveTab('courses')}>
									View All <ChevronRight className="h-4 w-4" />
								</Button>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{mockData.enrolledCourses.slice(0, 2).map(course => (
										<CourseProgressCard key={course.id} course={course} />
									))}
								</div>
							</CardContent>
						</Card>

						<Card className="md:col-span-3">
							<CardHeader>
								<CardTitle>Recommended For You</CardTitle>
								<CardDescription>Based on your interests and progress</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{mockData.recommendations.map(recommendation => (
										<div key={recommendation.id} className="flex items-center">
											<div className="mr-4 h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
												<BookOpen className="h-5 w-5 text-primary" />
											</div>
											<div className="space-y-1">
												<p className="text-sm font-medium leading-none">{recommendation.title}</p>
												<p className="text-xs text-muted-foreground">{recommendation.match}</p>
											</div>
										</div>
									))}
								</div>
								<Button variant="outline" className="w-full mt-4">
									Explore More Courses
								</Button>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="courses" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>My Enrolled Courses</CardTitle>
							<CardDescription>Track your progress across all courses</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-6">
								{mockData.enrolledCourses.map(course => (
									<CourseProgressCard key={course.id} course={course} detailed />
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="skills" className="space-y-6">
					<div className="grid gap-6 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle>Skills Proficiency</CardTitle>
								<CardDescription>Your competency levels across different skills</CardDescription>
							</CardHeader>
							<CardContent className="h-[400px]">
								<SkillsRadarChart skills={mockData.skills} />
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Skill Breakdown</CardTitle>
								<CardDescription>Detailed view of your skills</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-6">
									{mockData.skills.map(skill => (
										<div key={skill.name} className="space-y-2">
											<div className="flex justify-between">
												<span className="text-sm font-medium">{skill.name}</span>
												<span className="text-sm font-medium">{skill.value}%</span>
											</div>
											<Progress value={skill.value} className="h-2" />
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="goals" className="space-y-6">
					<div className="grid gap-6 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle>Learning Goals</CardTitle>
								<CardDescription>Track your personal learning objectives</CardDescription>
							</CardHeader>
							<CardContent>
								<LearningGoals goals={mockData.learningGoals} />
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Set New Goal</CardTitle>
								<CardDescription>Create a new learning objective</CardDescription>
							</CardHeader>
							<CardContent>
								<form className="space-y-4">
									<div className="space-y-2">
										<label className="text-sm font-medium">Goal Title</label>
										<input
											type="text"
											placeholder="e.g., Complete Advanced Botox course"
											className="w-full p-2 border rounded-md"
										/>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-medium">Target Date</label>
										<input type="date" className="w-full p-2 border rounded-md" />
									</div>
									<div className="space-y-2">
										<label className="text-sm font-medium">Goal Type</label>
										<select className="w-full p-2 border rounded-md">
											<option>Course Completion</option>
											<option>Study Hours</option>
											<option>Skill Development</option>
											<option>Certification</option>
										</select>
									</div>
									<Button className="w-full">Create Goal</Button>
								</form>
							</CardContent>
						</Card>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
