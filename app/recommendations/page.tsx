'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

import { RecommendationSlider } from '@/components/recommendation/recommendation-slider';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/auth';
import {
	type CourseRecommendation,
	type PathwayRecommendation as _PathwayRecommendation,
	useCourseRecommendations,
	usePathwayRecommendations,
	useTrendingContent,
} from '@/lib/recommendation-service';

export default function RecommendationsPage() {
	const { user, isLoading } = useAuth();
	const router = useRouter();
	// Use Convex hooks for recommendations
	const courseRecs = useCourseRecommendations(user?.id, 12);
	const pathwayRecs = usePathwayRecommendations(user?.id, 6);
	const trendingRecs = useTrendingContent(12);

	// Get the data
	const recommendedCourses = courseRecs.data || [];
	const recommendedPathways = pathwayRecs.data || [];
	const skillBasedCourses = recommendedCourses; // For now, skill-based is same as regular recommendations

	// Map trending content to CourseRecommendation format
	const trendingCourses: CourseRecommendation[] = (trendingRecs.data || [])
		.filter(item => item.type === 'course')
		.map(item => ({
			id: item.id,
			title: item.title,
			description: `Popular course with ${item.popularity || 0} engagements`,
			instructor: 'Various Instructors', // TODO: Get from course data
			thumbnailUrl: item.thumbnailUrl,
			rating: 4.5, // TODO: Get from course data
			reviewCount: item.popularity || 0,
			level: 'intermediate' as const, // TODO: Get from course data
			duration: '8 weeks', // TODO: Get from course data
			price: 99.99, // TODO: Get from course data
			relevanceScore: item.popularity || 0,
			relevanceReason: 'Popular choice among learners',
		}));

	// Check if any data is still loading
	const isDataLoading = courseRecs.isLoading || pathwayRecs.isLoading || trendingRecs.isLoading;

	// Redirect if not logged in
	if (!isLoading && !user) {
		router.push('/sign-in');
		return null;
	}

	// Show loading state
	if (isLoading || isDataLoading) {
		return <div className="container py-10">Loading recommendations...</div>;
	}

	return (
		<div className="container py-10 space-y-8">
			<div>
				<h1 className="text-3xl font-bold mb-2">Your Recommendations</h1>
				<p className="text-muted-foreground">
					Personalized content recommendations based on your interests and learning history
				</p>
			</div>

			<Tabs defaultValue="courses" className="space-y-8">
				<TabsList>
					<TabsTrigger value="courses">Recommended Courses</TabsTrigger>
					<TabsTrigger value="pathways">Learning Pathways</TabsTrigger>
					<TabsTrigger value="skills">Skill Development</TabsTrigger>
					<TabsTrigger value="trending">Trending Content</TabsTrigger>
				</TabsList>

				<TabsContent value="courses" className="space-y-8">
					<RecommendationSlider
						title="Personalized for You"
						description="Courses tailored to your interests and learning history"
						courses={recommendedCourses.slice(0, 6)}
					/>
					<Separator />
					<RecommendationSlider
						title="Continue Your Learning Journey"
						description="Based on courses you've started or completed"
						courses={recommendedCourses.slice(6, 12)}
					/>
				</TabsContent>

				<TabsContent value="pathways" className="space-y-8">
					<RecommendationSlider
						title="Recommended Learning Pathways"
						description="Structured learning journeys to develop comprehensive expertise"
						pathways={recommendedPathways}
					/>
				</TabsContent>

				<TabsContent value="skills" className="space-y-8">
					<RecommendationSlider
						title="Advance Your Skills"
						description="Recommended courses to help you develop specific professional skills"
						courses={skillBasedCourses.slice(0, 6)}
					/>
					<Separator />
					<RecommendationSlider
						title="Fill Knowledge Gaps"
						description="Courses to strengthen areas where you may need additional learning"
						courses={skillBasedCourses.slice(6, 12)}
					/>
				</TabsContent>

				<TabsContent value="trending" className="space-y-8">
					<RecommendationSlider
						title="Trending in Your Areas"
						description="Popular courses in your areas of interest"
						courses={trendingCourses.slice(0, 6)}
					/>
					<Separator />
					<RecommendationSlider
						title="Industry Trends"
						description="Stay current with the latest developments in medical aesthetics"
						courses={trendingCourses.slice(6, 12)}
					/>
				</TabsContent>
			</Tabs>

			<div className="bg-muted p-6 rounded-lg">
				<h2 className="text-xl font-semibold mb-2">How Recommendations Work</h2>
				<p className="mb-4">
					Your recommendations are personalized based on your learning history, interests, and career goals. The more
					you interact with courses and resources, the more tailored your recommendations become.
				</p>
				<Button variant="outline" onClick={() => router.push('/settings')}>
					Customize Recommendation Settings
				</Button>
			</div>
		</div>
	);
}
