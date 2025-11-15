import { Skeleton } from '@/components/ui/skeleton';

export function ResourceDetailSkeleton() {
	return (
		<div className="space-y-6">
			<Skeleton className="h-8 w-32" />

			<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
				<div className="md:col-span-2 space-y-6">
					<Skeleton className="h-[300px] w-full rounded-md" />

					<div className="space-y-4">
						<div className="flex gap-2">
							<Skeleton className="h-6 w-24" />
							<Skeleton className="h-6 w-24" />
						</div>

						<Skeleton className="h-10 w-3/4" />

						<div className="flex gap-2">
							<Skeleton className="h-6 w-20" />
							<Skeleton className="h-6 w-20" />
							<Skeleton className="h-6 w-20" />
						</div>

						<div className="space-y-2 mt-6">
							<div className="flex gap-2">
								<Skeleton className="h-10 w-24" />
								<Skeleton className="h-10 w-24" />
								<Skeleton className="h-10 w-24" />
							</div>

							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-2/3" />
						</div>
					</div>

					<div className="mt-8 space-y-4">
						<Skeleton className="h-8 w-48" />
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							{Array.from({ length: 3 }).map((_, i) => (
								<Skeleton key={i} className="h-[200px] w-full" />
							))}
						</div>
					</div>
				</div>

				<div className="space-y-6">
					<div className="border rounded-lg p-4 space-y-4">
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
					</div>

					<div className="border rounded-lg p-4 space-y-4">
						<Skeleton className="h-6 w-1/2" />

						<div className="space-y-3">
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-full" />
						</div>

						<Skeleton className="h-px w-full" />

						<div className="flex items-center justify-between">
							<Skeleton className="h-4 w-32" />
							<div className="flex gap-2">
								<Skeleton className="h-8 w-8 rounded-full" />
								<Skeleton className="h-8 w-8 rounded-full" />
								<Skeleton className="h-8 w-8 rounded-full" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
