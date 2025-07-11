import { ResourceDetailSkeleton } from "@/components/resource-library/resource-detail-skeleton"

export default function ResourceDetailLoading() {
  return (
    <div className="container py-8">
      <ResourceDetailSkeleton />
    </div>
  )
}
