"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RecommendationSlider } from "./recommendation-slider"
import {
  getSimilarCourses,
  getRecommendationsBasedOnView,
  type CourseRecommendation,
} from "@/lib/recommendation-service"
import { Skeleton } from "@/components/ui/skeleton"

interface CourseDetailRecommendationsProps {
  courseId: string
}

export function CourseDetailRecommendations({ courseId }: CourseDetailRecommendationsProps) {
  const [similarCourses, setSimilarCourses] = useState<CourseRecommendation[]>([])
  const [viewBasedCourses, setViewBasedCourses] = useState<CourseRecommendation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadRecommendations() {
      try {
        setLoading(true)
        const [similar, viewBased] = await Promise.all([
          getSimilarCourses(courseId, 6),
          getRecommendationsBasedOnView(courseId, "course", 6),
        ])

        setSimilarCourses(similar)
        setViewBasedCourses(viewBased)
      } catch (error) {
        console.error("Error loading course recommendations:", error)
      } finally {
        setLoading(false)
      }
    }

    loadRecommendations()
  }, [courseId])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-7 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <div className="flex space-x-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-1/3">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-5 w-full mt-2" />
                  <Skeleton className="h-4 w-4/5 mt-1" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>You Might Also Like</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <RecommendationSlider
            title="Similar Courses"
            description="Courses related to what you're currently viewing"
            courses={similarCourses}
            showReasons={false}
          />

          {viewBasedCourses.length > 0 && (
            <RecommendationSlider
              title="Students Also Viewed"
              description="Popular choices among students with similar interests"
              courses={viewBasedCourses}
              showReasons={false}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
