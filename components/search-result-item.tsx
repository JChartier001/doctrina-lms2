import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { SearchResult } from "@/lib/search-service"
import { Book, Users, User, MessageSquare, FileText, File } from "lucide-react"
import Link from "next/link"

interface SearchResultItemProps {
  result: SearchResult
}

export function SearchResultItem({ result }: SearchResultItemProps) {
  const getIcon = () => {
    switch (result.type) {
      case "course":
        return <Book className="h-5 w-5 text-primary" />
      case "program":
        return <Users className="h-5 w-5 text-primary" />
      case "instructor":
        return <User className="h-5 w-5 text-primary" />
      case "community":
        return <MessageSquare className="h-5 w-5 text-primary" />
      case "lesson":
        return <FileText className="h-5 w-5 text-primary" />
      case "resource":
        return <File className="h-5 w-5 text-primary" />
      default:
        return <Book className="h-5 w-5 text-primary" />
    }
  }

  const getTypeLabel = () => {
    switch (result.type) {
      case "course":
        return "Course"
      case "program":
        return "Program"
      case "instructor":
        return "Instructor"
      case "community":
        return "Community Post"
      case "lesson":
        return "Lesson"
      case "resource":
        return "Resource"
      default:
        return "Result"
    }
  }

  const renderMetadata = () => {
    if (!result.metadata) return null

    switch (result.type) {
      case "course":
        return (
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center">
              <span>{result.metadata.instructor}</span>
            </div>
            <div className="flex items-center">
              <div className="flex mr-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill={star <= Math.round(result.metadata.rating) ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3 w-3 text-yellow-500"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <span>{result.metadata.rating}</span>
            </div>
            <div>
              <span>{result.metadata.students} students</span>
            </div>
            <div className="ml-auto font-bold">${result.metadata.price}</div>
          </div>
        )
      case "program":
        return (
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <div>
              <span>{result.metadata.duration}</span>
            </div>
            <div>
              <span>{result.metadata.courses} courses</span>
            </div>
            <div className="ml-auto font-bold">${result.metadata.price}</div>
          </div>
        )
      case "instructor":
        return (
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <div>
              <span>{result.metadata.title}</span>
            </div>
            <div>
              <span>{result.metadata.specialization}</span>
            </div>
            <div>
              <span>{result.metadata.courses} courses</span>
            </div>
            <div>
              <span>{result.metadata.students} students</span>
            </div>
          </div>
        )
      case "community":
        return (
          <div className="mt-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{result.metadata.author}</span>
              <span>•</span>
              <span>{new Date(result.metadata.date).toLocaleDateString()}</span>
              <span>•</span>
              <span>{result.metadata.replies} replies</span>
              <span>•</span>
              <span>{result.metadata.views} views</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {result.metadata.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )
      case "lesson":
        return (
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <div>
              <span>{result.metadata.duration}</span>
            </div>
            <div>
              <Badge variant="outline" className="capitalize">
                {result.metadata.type}
              </Badge>
            </div>
          </div>
        )
      case "resource":
        return (
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <div>
              <Badge variant="outline" className="capitalize">
                {result.metadata.type}
              </Badge>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Link href={result.url}>
      <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
        <CardContent className="p-4">
          <div className="flex gap-4">
            {result.image ? (
              <img
                src={result.image || "/placeholder.svg"}
                alt={result.title}
                className="w-[100px] h-[60px] object-cover rounded-md"
              />
            ) : result.type === "instructor" ? (
              <Avatar className="h-16 w-16">
                <AvatarImage src="/placeholder.svg?height=100&width=100" alt={result.title} />
                <AvatarFallback>{result.title.charAt(0)}</AvatarFallback>
              </Avatar>
            ) : (
              <div className="flex items-center justify-center w-[60px] h-[60px] bg-primary/10 rounded-md">
                {getIcon()}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {getTypeLabel()}
                </Badge>
              </div>
              <h3 className="font-medium mt-1">{result.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{result.description}</p>
              {renderMetadata()}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
