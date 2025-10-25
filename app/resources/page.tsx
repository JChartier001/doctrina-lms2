import type { Metadata } from 'next';
import { Suspense } from 'react';

import { ResourceLibrary } from '@/components/resource-library/resource-library';
import { ResourceLibrarySkeleton } from '@/components/resource-library/resource-library-skeleton';

export const metadata: Metadata = {
	title: 'Resource Library | Doctrina',
	description: 'Browse our comprehensive library of educational resources for medical aesthetics professionals.',
};

export default function ResourceLibraryPage() {
	return (
		<div className="container py-8">
			<div className="flex flex-col space-y-4">
				<div className="space-y-2">
					<h1 className="text-3xl font-bold tracking-tight">Resource Library</h1>
					<p className="text-muted-foreground">
						Browse our comprehensive collection of educational resources for medical aesthetics professionals.
					</p>
				</div>
				<Suspense fallback={<ResourceLibrarySkeleton />}>
					<ResourceLibrary />
				</Suspense>
			</div>
		</div>
	);
}
