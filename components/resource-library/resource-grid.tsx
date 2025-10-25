'use client';

import { ResourceCard } from '@/components/resource-library/resource-card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Resource } from '@/lib/resource-library-service';

interface ResourceGridProps {
	resources: Resource[];
	isLoading?: boolean;
	emptyMessage?: string;
}

export function ResourceGrid({
	resources,
	isLoading = false,
	emptyMessage = 'No resources found.',
}: ResourceGridProps) {
	if (isLoading) {
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{Array.from({ length: 6 }).map((_, i) => (
					<div key={i} className="rounded-lg border bg-card text-card-foreground shadow-sm">
						<div className="p-4 space-y-3">
							<Skeleton className="h-[180px] w-full rounded-md" />
							<Skeleton className="h-4 w-3/4" />
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-1/2" />
						</div>
					</div>
				))}
			</div>
		);
	}

	if (resources.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-12 text-center">
				<p className="text-muted-foreground">{emptyMessage}</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{resources.map(resource => (
				<ResourceCard key={resource.id} resource={resource} />
			))}
		</div>
	);
}
