"use client"

import { Suspense } from "react"
import { ResourceDetail } from "@/components/resource-library/resource-detail"
import { ResourceDetailSkeleton } from "@/components/resource-library/resource-detail-skeleton"

interface ResourceDetailPageClientProps {
  resourceId: string
}

export function ResourceDetailPageClient({ resourceId }: ResourceDetailPageClientProps) {
  return (
    <div className="container py-8">
      <Suspense fallback={<ResourceDetailSkeleton />}>
        <ResourceDetail resourceId={resourceId} />
      </Suspense>
    </div>
  )
}
