import { Suspense } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ResourceDetail } from "@/components/resource-library/resource-detail"
import { ResourceDetailSkeleton } from "@/components/resource-library/resource-detail-skeleton"
import { getResourceById } from "@/lib/resource-library-service"

interface ResourceDetailPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: ResourceDetailPageProps): Promise<Metadata> {
  const resource = await getResourceById(params.id)

  if (!resource) {
    return {
      title: "Resource Not Found | Doctrina",
      description: "The requested resource could not be found.",
    }
  }

  return {
    title: `${resource.title} | Doctrina Resource Library`,
    description: resource.description,
  }
}

export default async function ResourceDetailPage({ params }: ResourceDetailPageProps) {
  const resource = await getResourceById(params.id)

  if (!resource) {
    notFound()
  }

  return (
    <div className="container py-8">
      <Suspense fallback={<ResourceDetailSkeleton />}>
        <ResourceDetail resourceId={params.id} />
      </Suspense>
    </div>
  )
}
