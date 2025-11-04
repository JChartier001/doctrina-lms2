import { Skeleton } from '@/components/ui/skeleton';

export default function RecommendationsLoading() {
	return (
		<div className="container py-10 space-y-8">
			<div className="space-y-2">
				<Skeleton className="h-10 w-72" />
				<Skeleton className="h-5 w-full max-w-xl" />
			</div>

			<div className="space-y-6">
				<Skeleton className="h-10 w-96" />

				<div className="space-y-4">
					<div className="flex justify-between items-center">
						<div className="space-y-2">
							<Skeleton className="h-8 w-64" />
							<Skeleton className="h-4 w-80" />
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{Array(8)
							.fill(0)
							.map((_, i) => (
								<div key={i} className="space-y-3">
									<Skeleton className="h-48 w-full rounded-md" />
									<Skeleton className="h-6 w-full" />
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-3/4" />
									<div className="flex justify-between pt-2">
										<Skeleton className="h-4 w-20" />
										<Skeleton className="h-4 w-20" />
									</div>
									<Skeleton className="h-9 w-full mt-2" />
								</div>
							))}
					</div>
				</div>
			</div>
		</div>
	);
}
