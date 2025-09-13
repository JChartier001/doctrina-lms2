'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RecommendationSlider } from './recommendation-slider';
import {
	useCourseRecommendations,
	usePathwayRecommendations,
	useTrendingContent,
	type CourseRecommendation,
	type PathwayRecommendation,
} from '@/lib/recommendation-service';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardRecommendations() {
	const { user } = useAuth();

	// Use Convex hooks for recommendations
	const courseRecs = useCourseRecommendations(user?.id as any, 6);
	const pathwayRecs = usePathwayRecommendations(user?.id as any, 4);
	const trendingRecs = useTrendingContent(6);

	// Combine loading states
	const isLoading =
		courseRecs.isLoading || pathwayRecs.isLoading || trendingRecs.isLoading;
	const error = courseRecs.error || pathwayRecs.error || trendingRecs.error;

	// Get the data
	const recommendedCourses = courseRecs.data || [];
	const recommendedPathways = pathwayRecs.data || [];
	const trendingCourses =
		trendingRecs.data?.filter(item => item.type === 'course') || [];

	// For now, skill-based recommendations are the same as regular recommendations
	const skillBasedCourses = recommendedCourses;

	if (error) {
		return (
			<Alert variant='destructive'>
				<AlertCircle className='h-4 w-4' />
				<AlertTitle>Error</AlertTitle>
				<AlertDescription>{error}</AlertDescription>
			</Alert>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Personalized Recommendations</CardTitle>
			</CardHeader>
			<CardContent>
				<Tabs defaultValue='foryou' className='space-y-6'>
					<TabsList>
						<TabsTrigger value='foryou'>For You</TabsTrigger>
						<TabsTrigger value='pathways'>Learning Pathways</TabsTrigger>
						<TabsTrigger value='skills'>Skill Development</TabsTrigger>
						<TabsTrigger value='trending'>Trending</TabsTrigger>
					</TabsList>

					<TabsContent value='foryou' className='space-y-6'>
						{loading ? (
							<RecommendationSkeleton />
						) : (
							<RecommendationSlider
								title='Recommended for You'
								description='Courses tailored to your interests and learning history'
								courses={recommendedCourses}
							/>
						)}
					</TabsContent>

					<TabsContent value='pathways' className='space-y-6'>
						{loading ? (
							<RecommendationSkeleton />
						) : (
							<RecommendationSlider
								title='Learning Pathways'
								description='Structured learning journeys to develop comprehensive expertise'
								pathways={recommendedPathways}
							/>
						)}
					</TabsContent>

					<TabsContent value='skills' className='space-y-6'>
						{loading ? (
							<RecommendationSkeleton />
						) : (
							<RecommendationSlider
								title='Skill Development'
								description='Courses to help you advance your professional skills'
								courses={skillBasedCourses}
							/>
						)}
					</TabsContent>

					<TabsContent value='trending' className='space-y-6'>
						{loading ? (
							<RecommendationSkeleton />
						) : (
							<RecommendationSlider
								title='Trending in Your Areas'
								description='Popular courses in your areas of interest'
								courses={trendingCourses}
							/>
						)}
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
}

function RecommendationSkeleton() {
	return (
		<div>
			<div className='space-y-4'>
				<div className='flex justify-between items-center'>
					<div className='space-y-2'>
						<Skeleton className='h-8 w-48' />
						<Skeleton className='h-4 w-64' />
					</div>
					<div className='flex space-x-2'>
						<Skeleton className='h-8 w-8 rounded-md' />
						<Skeleton className='h-8 w-8 rounded-md' />
					</div>
				</div>
				<div className='flex space-x-4 overflow-hidden'>
					{[1, 2, 3, 4].map(i => (
						<div key={i} className='min-w-[300px] max-w-[300px]'>
							<div className='border rounded-md overflow-hidden h-full flex flex-col'>
								<Skeleton className='h-[150px] w-full' />
								<div className='p-4 space-y-3'>
									<Skeleton className='h-6 w-full' />
									<Skeleton className='h-4 w-full' />
									<Skeleton className='h-4 w-3/4' />
									<div className='flex justify-between'>
										<Skeleton className='h-4 w-20' />
										<Skeleton className='h-4 w-20' />
									</div>
									<Skeleton className='h-9 w-full mt-4' />
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
