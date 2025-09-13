'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
	getResourceCategories,
	type ResourceCategory,
	getCategoryDisplayName,
} from '@/lib/resource-library-service';
import { ArrowRight } from 'lucide-react';

export function ResourceCategoryList() {
	const [resourceCategories, setResourceCategories] = useState<
		{ category: ResourceCategory; count: number }[]
	>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchResourceCategories = async () => {
			setIsLoading(true);
			try {
				const categories = await getResourceCategories();
				setResourceCategories(categories);
			} catch (error) {
				console.error('Error fetching resource categories:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchResourceCategories();
	}, []);

	if (isLoading) {
		return (
			<div className='space-y-4'>
				<h2 className='text-xl font-semibold'>Browse by Category</h2>
				<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
					{Array.from({ length: 6 }).map((_, i) => (
						<Skeleton key={i} className='h-20 w-full rounded-md' />
					))}
				</div>
			</div>
		);
	}

	const categoriesWithResources = resourceCategories.filter(
		({ count }) => count > 0
	);

	if (categoriesWithResources.length === 0) {
		return null;
	}

	return (
		<div className='space-y-4'>
			<h2 className='text-xl font-semibold'>Browse by Category</h2>
			<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
				{categoriesWithResources
					.sort((a, b) => b.count - a.count)
					.slice(0, 6)
					.map(({ category, count }) => (
						<Link key={category} href={`/resources?category=${category}`}>
							<Button
								variant='outline'
								className='w-full h-full min-h-[5rem] justify-start p-4 hover:bg-accent/50 hover:text-accent-foreground'
							>
								<div className='flex flex-col items-start'>
									<span className='text-sm text-muted-foreground mb-2'>
										{count} resources
									</span>
									<span className='font-medium'>
										{getCategoryDisplayName(category)}
									</span>
								</div>
								<ArrowRight className='ml-auto h-4 w-4 text-muted-foreground' />
							</Button>
						</Link>
					))}
			</div>
		</div>
	);
}
