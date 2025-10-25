'use client';

import { ArrowRight, BookOpen, Clock } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import type { PathwayRecommendation } from '@/lib/recommendation-service';

interface PathwayRecommendationCardProps {
	pathway: PathwayRecommendation;
	showReason?: boolean;
}

export function PathwayRecommendationCard({ pathway, showReason = true }: PathwayRecommendationCardProps) {
	return (
		<Card className="overflow-hidden h-full flex flex-col">
			<div className="aspect-video relative">
				<img
					src={pathway.thumbnailUrl || '/placeholder.svg?height=200&width=400'}
					alt={pathway.title}
					className="object-cover w-full h-full"
				/>
			</div>
			<CardContent className="p-4 flex-grow">
				<h3 className="font-semibold text-lg mb-1 line-clamp-2">{pathway.title}</h3>
				<p className="text-sm text-muted-foreground mb-3 line-clamp-2">{pathway.description}</p>
				<div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
					<div className="flex items-center">
						<BookOpen className="h-4 w-4 mr-1" />
						<span>{pathway.courseCount} courses</span>
					</div>
					<div className="flex items-center">
						<Clock className="h-4 w-4 mr-1" />
						<span>{pathway.estimatedDuration}</span>
					</div>
				</div>
				{showReason && pathway.relevanceReason && (
					<div className="mt-3 text-xs bg-muted p-2 rounded-md">
						<span className="font-medium">Recommended:</span> {pathway.relevanceReason}
					</div>
				)}
			</CardContent>
			<CardFooter className="p-4 pt-0 mt-auto">
				<Button asChild className="w-full">
					<Link href={`/pathways/${pathway.id}`}>
						View Pathway <ArrowRight className="ml-2 h-4 w-4" />
					</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}
