"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  type Resource,
  getResourceTypeDisplayName,
  getCategoryDisplayName,
  addResourceToFavorites,
  removeResourceFromFavorites,
  isResourceFavorited,
} from "@/lib/resource-library-service"
import {
  FileText,
  Video,
  Book,
  PenToolIcon as Tool,
  Clipboard,
  FileSpreadsheet,
  Heart,
  Download,
  Calendar,
} from "lucide-react"

interface ResourceCardProps {
  resource: Resource
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const [favorited, setFavorited] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Check if resource is favorited on component mount
  useState(() => {
    const checkFavoriteStatus = async () => {
      const status = await isResourceFavorited(resource.id)
      setFavorited(status)
    }
    checkFavoriteStatus()
  })

  const handleToggleFavorite = async () => {
    setIsLoading(true)
    try {
      if (favorited) {
        await removeResourceFromFavorites(resource.id)
        setFavorited(false)
      } else {
        await addResourceToFavorites(resource.id)
        setFavorited(true)
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getResourceIcon = () => {
    switch (resource.type) {
      case "pdf":
        return <FileText className="h-5 w-5" />
      case "video":
        return <Video className="h-5 w-5" />
      case "article":
        return <FileText className="h-5 w-5" />
      case "tool":
        return <Tool className="h-5 w-5" />
      case "template":
        return <Clipboard className="h-5 w-5" />
      case "guide":
        return <Book className="h-5 w-5" />
      case "research":
        return <FileSpreadsheet className="h-5 w-5" />
      case "case-study":
        return <Clipboard className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="aspect-video relative">
        <img
          src={resource.thumbnailUrl || "/placeholder.svg?height=200&width=400"}
          alt={resource.title}
          className="object-cover w-full h-full"
        />
        {resource.featured && <Badge className="absolute top-2 right-2 bg-primary">Featured</Badge>}
      </div>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="flex items-center gap-1">
            {getResourceIcon()}
            <span>{getResourceTypeDisplayName(resource.type)}</span>
          </Badge>
          <Badge variant="secondary" className="capitalize">
            {resource.difficulty}
          </Badge>
        </div>
        <h3 className="font-semibold text-lg mb-1 line-clamp-2">{resource.title}</h3>
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{resource.description}</p>
        <div className="flex items-center text-xs text-muted-foreground mb-2">
          <Calendar className="h-3 w-3 mr-1" />
          <span>{new Date(resource.dateAdded).toLocaleDateString()}</span>
          <span className="mx-2">•</span>
          <Download className="h-3 w-3 mr-1" />
          <span>{resource.downloadCount} downloads</span>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {resource.categories.slice(0, 2).map((category) => (
            <Badge key={category} variant="outline" className="text-xs">
              {getCategoryDisplayName(category)}
            </Badge>
          ))}
          {resource.categories.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{resource.categories.length - 2} more
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button variant="outline" size="sm" onClick={handleToggleFavorite} disabled={isLoading}>
          <Heart className={`h-4 w-4 mr-1 ${favorited ? "fill-current text-red-500" : ""}`} />
          {favorited ? "Saved" : "Save"}
        </Button>
        <Button asChild size="sm">
          <Link href={`/resources/${resource.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
