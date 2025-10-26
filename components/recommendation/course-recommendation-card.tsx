'use client';

import { ArrowRight, Clock, GraduationCap, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import type { CourseRecommendation } from '@/lib/recommendation-service';

interface CourseRecommendationCardProps {
	course: CourseRecommendation;
	showReason?: boolean;
}

export function CourseRecommendationCard({ course, showReason = true }: CourseRecommendationCardProps) {
	return (
		<Card className="overflow-hidden h-full flex flex-col">
			<div className="aspect-video relative">
				<Image
					src={course.thumbnailUrl || '/placeholder.svg?height=200&width=400'}
					alt={course.title}
					className="object-cover w-full h-full"
				/>
				<Badge className={`absolute top-2 right-2 ${course.level === 'advanced' ? 'bg-primary' : ''}`}>
					{course.level.charAt(0).toUpperCase() + course.level.slice(1)}
				</Badge>
			</div>
			<CardContent className="p-4 flex-grow">
				<h3 className="font-semibold text-lg mb-1 line-clamp-2">{course.title}</h3>
				<p className="text-sm text-muted-foreground mb-3 line-clamp-2">{course.description}</p>
				<div className="flex items-center text-sm mb-2">
					<Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
					<span className="font-medium">{course.rating}</span>
					<span className="text-muted-foreground ml-1">({course.reviewCount} reviews)</span>
				</div>
				<div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
					<div className="flex items-center">
						<Clock className="h-4 w-4 mr-1" />
						<span>{course.duration}</span>
					</div>
					<div className="flex items-center">
						<GraduationCap className="h-4 w-4 mr-1" />
						<span>{course.instructor}</span>
					</div>
				</div>
				{showReason && course.relevanceReason && (
					<div className="mt-3 text-xs bg-muted p-2 rounded-md">
						<span className="font-medium">Recommended:</span> {course.relevanceReason}
					</div>
				)}
			</CardContent>
			<CardFooter className="p-4 pt-0 mt-auto">
				<Button asChild className="w-full">
					<Link href={`/courses/${course.id}`}>
						View Course <ArrowRight className="ml-2 h-4 w-4" />
					</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}
