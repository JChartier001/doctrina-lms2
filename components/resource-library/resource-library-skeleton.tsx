import { Skeleton } from '@/components/ui/skeleton';

export function ResourceLibrarySkeleton() {
	return (
		<div className="space-y-6">
			<div className="flex flex-col md:flex-row gap-4">
				<Skeleton className="h-10 w-full" />
				<Skeleton className="h-10 w-24" />
			</div>

			<div className="flex flex-col md:flex-row gap-6">
				<div className="hidden md:block w-64 space-y-6">
					<Skeleton className="h-[400px] w-full" />
				</div>

				<div className="flex-1 space-y-6">
					<Skeleton className="h-10 w-full" />

					<div className="space-y-6">
						<div className="space-y-4">
							<Skeleton className="h-8 w-48" />
							<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
								{Array.from({ length: 4 }).map((_, i) => (
									<Skeleton key={i} className="h-[180px] w-full" />
								))}
							</div>
						</div>

						<div className="space-y-4">
							<Skeleton className="h-8 w-48" />
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
								{Array.from({ length: 4 }).map((_, i) => (
									<Skeleton key={i} className="h-20 w-full" />
								))}
							</div>
						</div>

						<div className="space-y-4">
							<Skeleton className="h-8 w-48" />
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								{Array.from({ length: 6 }).map((_, i) => (
									<Skeleton key={i} className="h-20 w-full" />
								))}
							</div>
						</div>

						<div className="space-y-4">
							<Skeleton className="h-8 w-48" />
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								{Array.from({ length: 6 }).map((_, i) => (
									<Skeleton key={i} className="h-[300px] w-full" />
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
