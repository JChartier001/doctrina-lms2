"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getFeaturedResources, type Resource } from "@/lib/resource-library-service"
import { ArrowRight } from "lucide-react"

export function FeaturedResources() {
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedResources = async () => {
      setIsLoading(true)
      try {
        const featuredResources = await getFeaturedResources(4)
        setResources(featuredResources)
      } catch (error) {
        console.error("Error fetching featured resources:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeaturedResources()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Featured Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-[120px] w-full rounded-md" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (resources.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Featured Resources</h2>
        <Button variant="link" asChild>
          <Link href="/resources?tab=featured" className="flex items-center">
            View all <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {resources.map((resource) => (
          <Link key={resource.id} href={`/resources/${resource.id}`}>
            <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-video relative">
                <img
                  src={resource.thumbnailUrl || "/placeholder.svg?height=200&width=400"}
                  alt={resource.title}
                  className="object-cover w-full h-full"
                />
                <Badge className="absolute top-2 right-2 bg-primary">Featured</Badge>
              </div>
              <CardContent className="p-4">
                <Badge variant="outline" className="mb-2">
                  {resource.type}
                </Badge>
                <h3 className="font-semibold mb-1 line-clamp-2">{resource.title}</h3>
                <p className="text-muted-foreground text-sm line-clamp-2">{resource.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
