'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import type { CourseRecommendation, PathwayRecommendation } from '@/lib/recommendation-service';

import { CourseRecommendationCard } from './course-recommendation-card';
import { PathwayRecommendationCard } from './pathway-recommendation-card';

interface RecommendationSliderProps {
	title: string;
	description?: string;
	courses?: CourseRecommendation[];
	pathways?: PathwayRecommendation[];
	showReasons?: boolean;
}

export function RecommendationSlider({
	title,
	description,
	courses,
	pathways,
	showReasons = true,
}: RecommendationSliderProps) {
	const sliderRef = useRef<HTMLDivElement>(null);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(true);

	const checkScrollability = () => {
		if (!sliderRef.current) return;

		const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
		setCanScrollLeft(scrollLeft > 0);
		setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10); // 10px threshold
	};

	const scroll = (direction: 'left' | 'right') => {
		if (!sliderRef.current) return;

		const { clientWidth } = sliderRef.current;
		const scrollAmount = clientWidth * 0.75; // Scroll 75% of the visible width

		sliderRef.current.scrollBy({
			left: direction === 'left' ? -scrollAmount : scrollAmount,
			behavior: 'smooth',
		});

		// Update scroll buttons after animation
		setTimeout(checkScrollability, 300);
	};

	return (
		<div className="space-y-4">
			<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
				<div>
					<h2 className="text-2xl font-bold">{title}</h2>
					{description && <p className="text-muted-foreground">{description}</p>}
				</div>
				<div className="flex space-x-2">
					<Button
						variant="outline"
						size="icon"
						onClick={() => scroll('left')}
						disabled={!canScrollLeft}
						aria-label="Scroll left"
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						size="icon"
						onClick={() => scroll('right')}
						disabled={!canScrollRight}
						aria-label="Scroll right"
					>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			</div>

			<div ref={sliderRef} className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide" onScroll={checkScrollability}>
				{courses &&
					courses.map(course => (
						<div key={course.id} className="min-w-[300px] max-w-[300px]">
							<CourseRecommendationCard course={course} showReason={showReasons} />
						</div>
					))}

				{pathways &&
					pathways.map(pathway => (
						<div key={pathway.id} className="min-w-[300px] max-w-[300px]">
							<PathwayRecommendationCard pathway={pathway} showReason={showReasons} />
						</div>
					))}
			</div>
		</div>
	);
}
