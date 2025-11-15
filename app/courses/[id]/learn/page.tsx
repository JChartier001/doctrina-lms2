'use client';

import { RedirectToSignIn } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useState } from 'react';

import { GenerateCertificateButton } from '@/components/generate-certificate-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useAuth } from '@/lib/auth';

export default function CourseLearnPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const { user, isLoading: authLoading } = useAuth();
	const router = useRouter();
	const [currentLessonIndex, setCurrentLessonIndex] = useState(0);

	// Fetch course data with curriculum
	const courseData = useQuery(api.courses.getWithCurriculum, {
		courseId: id as Id<'courses'>,
	});

	// Fetch user progress for this course
	const progressData = useQuery(api.lessonProgress.getUserProgress, {
		courseId: id as Id<'courses'>,
	});

	// Mark lesson complete mutation
	const markComplete = useMutation(api.lessonProgress.markComplete);

	// Debug logging
	console.log('🔍 Learn Page Debug:', {
		courseId: id,
		userClerkId: user?.id,
		authLoading,
		courseDataStatus: courseData === undefined ? 'loading' : courseData === null ? 'null' : 'loaded',
		progressDataStatus: progressData === undefined ? 'loading' : progressData === null ? 'null' : 'loaded',
		progressData,
	});

	// Handle authentication redirect
	if (!user && !authLoading) {
		return <RedirectToSignIn />;
	}

	// Loading state - show skeleton
	if (authLoading || courseData === undefined || progressData === undefined) {
		return (
			<div className="container py-10">
				<Skeleton className="h-10 w-40 mb-6" />
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="lg:col-span-2 space-y-6">
						<Skeleton className="h-64 w-full" />
						<Skeleton className="h-96 w-full" />
					</div>
					<div>
						<Skeleton className="h-96 w-full" />
					</div>
				</div>
			</div>
		);
	}

	// Error state - course not found
	if (courseData === null) {
		router.push('/courses');
		return null;
	}

	// Error state - not enrolled (no progress data)
	if (progressData === null) {
		return (
			<div className="container py-10">
				<Card>
					<CardHeader>
						<CardTitle>Enrollment Required</CardTitle>
						<CardDescription>You need to enroll in this course to access the lessons.</CardDescription>
					</CardHeader>
					<CardContent>
						<Button onClick={() => router.push(`/courses/${id}`)}>Go to Course Details</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Flatten lessons from all modules for navigation
	const allLessons = courseData.curriculum.flatMap((module, modIndex) =>
		module.lessons.map((lesson, lesIndex) => ({
			...lesson,
			moduleIndex: modIndex,
			lessonIndex: lesIndex,
			moduleTitle: module.title,
			isCompleted: progressData.completedLessonIds.includes(lesson.id),
		})),
	);

	const currentLesson = allLessons[currentLessonIndex];
	const isCourseCompleted = progressData.completed === progressData.total;

	const handleNextLesson = () => {
		if (currentLessonIndex < allLessons.length - 1) {
			setCurrentLessonIndex(currentLessonIndex + 1);
		}
	};

	const handlePreviousLesson = () => {
		if (currentLessonIndex > 0) {
			setCurrentLessonIndex(currentLessonIndex - 1);
		}
	};

	const handleMarkComplete = async () => {
		if (!currentLesson) return;
		try {
			await markComplete({ lessonId: currentLesson.id as Id<'lessons'> });
		} catch (error) {
			console.error('Failed to mark lesson complete:', error);
		}
	};

	return (
		<div className="container py-10">
			<div className="mb-6">
				<Button variant="outline" onClick={() => router.push(`/courses/${id}`)}>
					<ChevronLeft className="mr-2 h-4 w-4" />
					Back to Course
				</Button>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2">
					<div className="mb-6">
						<h1 className="text-3xl font-bold mb-2">{courseData.title}</h1>
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm font-medium">Course Progress</span>
							<span className="text-sm font-medium">{Math.round(progressData.percent)}%</span>
						</div>
						<Progress value={progressData.percent} className="h-2 mb-4" />
					</div>

					<Tabs defaultValue="content" className="w-full">
						<TabsList className="mb-4">
							<TabsTrigger value="content">Lesson Content</TabsTrigger>
							<TabsTrigger value="resources">Resources</TabsTrigger>
							<TabsTrigger value="notes">My Notes</TabsTrigger>
						</TabsList>

						<TabsContent value="content" className="space-y-4">
							<Card>
								<CardHeader>
									<div className="flex items-center justify-between">
										<div>
											<CardTitle>{currentLesson?.title}</CardTitle>
											<CardDescription>
												{currentLesson?.moduleTitle} • Duration: {currentLesson?.duration}
											</CardDescription>
										</div>
										{currentLesson?.isCompleted && <CheckCircle className="h-5 w-5 text-green-600" />}
									</div>
								</CardHeader>
								<CardContent>
									{currentLesson?.type === 'video' && (
										<div className="bg-black aspect-video rounded-lg mb-6 flex items-center justify-center">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="48"
												height="48"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
												className="text-white opacity-70"
											>
												<polygon points="5 3 19 12 5 21 5 3" />
											</svg>
										</div>
									)}

									<p className="mb-4">Lesson content will be displayed here.</p>

									{!currentLesson?.isCompleted && (
										<Button onClick={handleMarkComplete} className="mb-4">
											Mark as Complete
										</Button>
									)}

									<div className="flex justify-between mt-6">
										<Button variant="outline" onClick={handlePreviousLesson} disabled={currentLessonIndex === 0}>
											<ChevronLeft className="mr-2 h-4 w-4" />
											Previous Lesson
										</Button>

										<Button onClick={handleNextLesson} disabled={currentLessonIndex === allLessons.length - 1}>
											Next Lesson
											<ChevronRight className="ml-2 h-4 w-4" />
										</Button>
									</div>
								</CardContent>
							</Card>

							{isCourseCompleted && (
								<Card className="bg-green-50 border-green-200">
									<CardHeader>
										<div className="flex items-center">
											<CheckCircle className="h-5 w-5 text-green-600 mr-2" />
											<CardTitle>Course Completed!</CardTitle>
										</div>
										<CardDescription>
											Congratulations on completing this course. You can now generate your certificate.
										</CardDescription>
									</CardHeader>
									<CardContent>
										<GenerateCertificateButton
											courseId={id}
											courseName={courseData.title}
											instructorId={courseData.instructorId}
											instructorName={courseData.instructor?.name || 'Instructor'}
										/>
									</CardContent>
								</Card>
							)}
						</TabsContent>

						<TabsContent value="resources" className="space-y-4">
							<Card>
								<CardHeader>
									<CardTitle>Lesson Resources</CardTitle>
									<CardDescription>Supplementary materials for this lesson</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										<div className="flex items-center justify-between p-3 bg-muted rounded-lg">
											<div className="flex items-center gap-3">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="24"
													height="24"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="2"
													strokeLinecap="round"
													strokeLinejoin="round"
													className="h-6 w-6 text-primary"
												>
													<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
													<polyline points="14 2 14 8 20 8" />
												</svg>
												<div>
													<p className="font-medium">Lesson Slides.pdf</p>
													<p className="text-xs text-muted-foreground">2.4 MB</p>
												</div>
											</div>
											<Button variant="ghost" size="icon">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="24"
													height="24"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="2"
													strokeLinecap="round"
													strokeLinejoin="round"
													className="h-4 w-4"
												>
													<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
													<polyline points="7 10 12 15 17 10" />
													<line x1="12" x2="12" y1="15" y2="3" />
												</svg>
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="notes" className="space-y-4">
							<Card>
								<CardHeader>
									<CardTitle>My Notes</CardTitle>
									<CardDescription>Your personal notes for this lesson</CardDescription>
								</CardHeader>
								<CardContent>
									<textarea
										className="w-full h-40 p-3 border rounded-md"
										placeholder="Type your notes here..."
									></textarea>
									<Button className="mt-4">Save Notes</Button>
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</div>

				<div>
					<Card>
						<CardHeader>
							<CardTitle>Course Content</CardTitle>
							<CardDescription>
								{allLessons.length} lessons • {progressData.completed} completed
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								{allLessons.map((lesson, index) => (
									<div
										key={lesson.id}
										className={`flex items-center p-3 rounded-lg cursor-pointer ${
											currentLessonIndex === index ? 'bg-primary/10' : 'hover:bg-muted'
										}`}
										onClick={() => setCurrentLessonIndex(index)}
									>
										<div className="shrink-0 mr-3">
											{lesson.isCompleted ? (
												<div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
													<svg
														xmlns="http://www.w3.org/2000/svg"
														width="24"
														height="24"
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														strokeWidth="2"
														strokeLinecap="round"
														strokeLinejoin="round"
														className="h-4 w-4 text-primary-foreground"
													>
														<polyline points="20 6 9 17 4 12" />
													</svg>
												</div>
											) : (
												<div className="h-6 w-6 rounded-full border flex items-center justify-center">
													<span className="text-xs">{index + 1}</span>
												</div>
											)}
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium truncate">{lesson.title}</p>
											<div className="flex items-center">
												<span className="text-xs text-muted-foreground">{lesson.duration}</span>
											</div>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
