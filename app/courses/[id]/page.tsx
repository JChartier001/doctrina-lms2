'use client';

import { useQuery } from 'convex/react';
import { Check, Clock, MessageSquare, ShoppingCart, Users } from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useAuth } from '@/lib/auth';
import { useUserPurchases } from '@/lib/payment-service';

export default function CourseDetailPage() {
	const { user, isLoading } = useAuth();
	const router = useRouter();

	const params = useParams();
	const id = params.id as Id<'courses'>;

	// Fetch course data using real Convex query (AC-109.1.1)
	const courseData = useQuery(api.courses.getWithCurriculum, { courseId: id });

	// Fetch user purchases using Convex query (always call the hook to maintain order)
	const purchases = useUserPurchases(user?.id as Id<'users'>);

	// Check if user has already purchased this course (derived state)
	const hasPurchased =
		!isLoading && user && purchases ? purchases.some(p => p.courseId === params.id && p.status === 'complete') : false;

	// Handle loading state - Convex query returns undefined while loading (AC-109.1.6)
	if (courseData === undefined) {
		return (
			<div className="container py-10">
				<div className="flex justify-center items-center min-h-[400px]">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
						<p>Loading course details...</p>
					</div>
				</div>
			</div>
		);
	}

	// Handle error state - Convex query returns null if not found (AC-109.1.7)
	if (courseData === null) {
		return (
			<div className="container py-10">
				<div className="flex justify-center items-center min-h-[400px]">
					<div className="text-center">
						<p className="text-red-500 mb-4">Course not found</p>
						<Button onClick={() => router.push('/courses')}>Browse Courses</Button>
					</div>
				</div>
			</div>
		);
	}

	const handleEnroll = () => {
		if (hasPurchased) {
			// If already purchased, go directly to course content
			router.push(`/courses/${params.id}/learn`);
			return;
		}

		// Otherwise, redirect to checkout
		router.push(`/checkout/${params.id}`);
	};

	return (
		<div className="container py-10">
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
				<div className="lg:col-span-2">
					<div className="space-y-4">
						{courseData.tags && courseData.tags.length > 0 && (
							<div className="flex flex-wrap gap-2">
								{courseData.tags.map(tag => (
									<Badge key={tag} variant="secondary">
										{tag}
									</Badge>
								))}
							</div>
						)}

						<h1 className="text-3xl font-bold">{courseData.title}</h1>
						<p className="text-xl text-muted-foreground">{courseData.description}</p>

						<div className="grid grid-cols-3 gap-4 mt-6">
							<div className="flex flex-col items-center text-center p-3 rounded-lg bg-accent">
								<Clock className="h-5 w-5 mb-1 text-accent-foreground" />
								<span className="text-sm font-medium text-accent-foreground">{courseData.duration || 'N/A'}</span>
								<span className="text-xs text-muted-foreground">Duration</span>
							</div>
							<div className="flex flex-col items-center text-center p-3 rounded-lg bg-accent">
								<Check className="h-5 w-5 mb-1 text-accent-foreground" />
								<span className="text-sm font-medium text-accent-foreground">{courseData.lessons} Lessons</span>
								<span className="text-xs text-muted-foreground">Total</span>
							</div>
							<div className="flex flex-col items-center text-center p-3 rounded-lg bg-accent">
								<Users className="h-5 w-5 mb-1 text-accent-foreground" />
								<span className="text-sm font-medium text-accent-foreground">{courseData.students} Students</span>
								<span className="text-xs text-muted-foreground">Enrolled</span>
							</div>
						</div>

						{courseData.thumbnailUrl && (
							<Image
								src={courseData.thumbnailUrl}
								alt={courseData.title}
								width={800}
								height={400}
								className="w-full rounded-lg object-cover aspect-video mt-6"
							/>
						)}
					</div>
				</div>

				<div>
					<Card className="sticky top-20">
						<CardHeader>
							<CardTitle>Course Enrollment</CardTitle>
							<CardDescription>One-time payment for lifetime access</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-center">
								<span className="text-3xl font-bold">${courseData.price ? courseData.price.toFixed(2) : '0.00'}</span>
							</div>

							<Button className="w-full" size="lg" onClick={handleEnroll}>
								{hasPurchased ? (
									'Continue Learning'
								) : (
									<>
										<ShoppingCart className="mr-2 h-4 w-4" />
										Buy Now
									</>
								)}
							</Button>

							<p className="text-xs text-center text-muted-foreground">30-day money-back guarantee. Cancel anytime.</p>

							<Separator />

							<div className="space-y-2">
								<h3 className="font-medium">This course includes:</h3>
								<ul className="space-y-2">
									<li className="flex items-center text-sm">
										<Check className="h-4 w-4 mr-2 text-green-600" />
										{courseData.lessons} comprehensive lessons
									</li>
									<li className="flex items-center text-sm">
										<Check className="h-4 w-4 mr-2 text-green-600" />
										10+ hours of video content
									</li>
									<li className="flex items-center text-sm">
										<Check className="h-4 w-4 mr-2 text-green-600" />
										Downloadable resources and templates
									</li>
									<li className="flex items-center text-sm">
										<Check className="h-4 w-4 mr-2 text-green-600" />
										Certificate of completion
									</li>
									<li className="flex items-center text-sm">
										<Check className="h-4 w-4 mr-2 text-green-600" />
										Lifetime access
									</li>
									<li className="flex items-center text-sm">
										<MessageSquare className="h-4 w-4 mr-2 text-green-600" />
										Discussion forums
									</li>
								</ul>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			<Tabs defaultValue="overview" className="w-full">
				<TabsList className="mb-6 w-full justify-start">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="curriculum">Curriculum</TabsTrigger>
					<TabsTrigger value="instructor">Instructor</TabsTrigger>
					<TabsTrigger value="reviews">Reviews</TabsTrigger>
					<TabsTrigger value="discussions">Discussions</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="space-y-6">
					<div className="prose max-w-none">
						<h2>About This Course</h2>
						<p className="whitespace-pre-line">{courseData.description}</p>

						{courseData.whatYouWillLearn && courseData.whatYouWillLearn.length > 0 && (
							<>
								<h2>What You Will Learn</h2>
								<ul>
									{courseData.whatYouWillLearn.map((item, index) => (
										<li key={index}>{item}</li>
									))}
								</ul>
							</>
						)}

						{courseData.requirements && courseData.requirements.length > 0 && (
							<>
								<h2>Requirements</h2>
								<ul>
									{courseData.requirements.map((item, index) => (
										<li key={index}>{item}</li>
									))}
								</ul>
							</>
						)}
					</div>
				</TabsContent>

				<TabsContent value="curriculum" className="space-y-6">
					<h2 className="text-2xl font-bold mb-4">Course Curriculum</h2>

					<div className="space-y-4">
						{courseData.curriculum.map(module => (
							<Card key={module.id}>
								<CardHeader>
									<CardTitle>{module.title}</CardTitle>
									<CardDescription>
										{module.lessons.length} lessons
										{module.description && ` • ${module.description}`}
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-2">
										{module.lessons.map(lesson => (
											<div
												key={lesson.id}
												className="flex justify-between items-center p-3 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
											>
												<div className="flex items-center ">
													{lesson.type === 'video' && (
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
															className="h-4 w-4 mr-3 text-primary"
														>
															<polygon points="5 3 19 12 5 21 5 3" />
														</svg>
													)}
													{lesson.type === 'quiz' && (
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
															className="h-4 w-4 mr-3 text-primary"
														>
															<circle cx="12" cy="12" r="10" />
															<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
															<path d="M12 17h.01" />
														</svg>
													)}
													{lesson.type === 'assignment' && (
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
															className="h-4 w-4 mr-3 text-primary"
														>
															<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
															<polyline points="14 2 14 8 20 8" />
														</svg>
													)}
													<span>{lesson.title}</span>
												</div>
												<div className="flex items-center">
													<Badge variant="outline">{lesson.type}</Badge>
													<span className="ml-4 text-sm text-muted-foreground">{lesson.duration}</span>
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</TabsContent>

				<TabsContent value="instructor" className="space-y-6">
					<h2 className="text-2xl font-bold mb-4">Meet Your Instructor</h2>

					{courseData.instructor ? (
						<Card>
							<CardContent className="pt-6">
								<div className="flex flex-col md:flex-row gap-6">
									<Avatar className="h-24 w-24">
										<AvatarImage
											src={courseData.instructor.image || '/placeholder.svg'}
											alt={courseData.instructor.name}
										/>
										<AvatarFallback>{courseData.instructor.name.charAt(0)}</AvatarFallback>
									</Avatar>
									<div>
										<h3 className="text-xl font-bold">{courseData.instructor.name}</h3>
										{courseData.instructor.title && (
											<p className="text-sm text-muted-foreground mb-4">{courseData.instructor.title}</p>
										)}
										{courseData.instructor.bio && <p>{courseData.instructor.bio}</p>}
									</div>
								</div>
							</CardContent>
						</Card>
					) : (
						<Card>
							<CardContent className="pt-6">
								<p className="text-muted-foreground">Instructor information not available</p>
							</CardContent>
						</Card>
					)}
				</TabsContent>

				<TabsContent value="reviews" className="space-y-6">
					<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
						<h2 className="text-2xl font-bold">Student Reviews</h2>
						{courseData.rating && courseData.reviewCount && courseData.reviewCount > 0 && (
							<div className="flex items-center gap-2">
								<div className="flex">
									{[1, 2, 3, 4, 5].map(star => (
										<svg
											key={star}
											xmlns="http://www.w3.org/2000/svg"
											width="24"
											height="24"
											viewBox="0 0 24 24"
											fill={star <= Math.round(courseData.rating!) ? 'currentColor' : 'none'}
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											className="h-5 w-5 text-yellow-500"
										>
											<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
										</svg>
									))}
								</div>
								<span className="font-medium">{courseData.rating.toFixed(1)} out of 5</span>
								<span className="text-muted-foreground">({courseData.reviewCount} reviews)</span>
							</div>
						)}
					</div>

					<Card>
						<CardContent className="p-6">
							<p className="text-center text-muted-foreground py-8">
								{courseData.reviewCount === 0
									? 'Be the first to review this course!'
									: 'Reviews will be displayed here once the review system is implemented (EPIC-103)'}
							</p>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="discussions" className="space-y-6">
					<div className="flex justify-between items-center mb-6">
						<h2 className="text-2xl font-bold">Course Discussions</h2>
						<Button onClick={() => router.push(`/courses/${params.id}/discussions`)}>
							<MessageSquare className="mr-2 h-4 w-4" />
							View All Discussions
						</Button>
					</div>

					<Card>
						<CardContent className="p-6">
							<p className="text-center py-8">
								Join the discussion to ask questions, share insights, and connect with fellow students.
							</p>
							<div className="flex justify-center">
								<Button onClick={() => router.push(`/courses/${params.id}/discussions`)}>Go to Discussion Forum</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
