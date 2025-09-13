"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { RecommendationSlider } from "@/components/recommendation/recommendation-slider"
import {
  getRecommendedCourses,
  getRecommendedPathways,
  getSkillBasedRecommendations,
  getTrendingRecommendations,
  type CourseRecommendation,
  type PathwayRecommendation,
} from "@/lib/recommendation-service"

export default function RecommendationsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [recommendedCourses, setRecommendedCourses] = useState<CourseRecommendation[]>([])
  const [recommendedPathways, setRecommendedPathways] = useState<PathwayRecommendation[]>([])
  const [skillBasedCourses, setSkillBasedCourses] = useState<CourseRecommendation[]>([])
  const [trendingCourses, setTrendingCourses] = useState<CourseRecommendation[]>([])

  useEffect(() => {
    async function loadRecommendations() {
      try {
        setLoading(true)
        const [courses, pathways, skillBased, trending] = await Promise.all([
          getRecommendedCourses(12),
          getRecommendedPathways(6),
          getSkillBasedRecommendations(12),
          getTrendingRecommendations(12),
        ])

        setRecommendedCourses(courses)
        setRecommendedPathways(pathways)
        setSkillBasedCourses(skillBased)
        setTrendingCourses(trending)
      } catch (error) {
        console.error("Error loading recommendations:", error)
      } finally {
        setLoading(false)
      }
    }

    if (!isLoading && user) {
      loadRecommendations()
    }
  }, [isLoading, user])

  // Redirect if not logged in
  if (!isLoading && !user) {
    router.push("/sign-in")
    return null
  }

  // Show loading state
  if (isLoading || loading) {
    return <div className="container py-10">Loading recommendations...</div>
  }

  return (
    <div className="container py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Your Recommendations</h1>
        <p className="text-muted-foreground">
          Personalized content recommendations based on your interests and learning history
        </p>
      </div>

      <Tabs defaultValue="courses" className="space-y-8">
        <TabsList>
          <TabsTrigger value="courses">Recommended Courses</TabsTrigger>
          <TabsTrigger value="pathways">Learning Pathways</TabsTrigger>
          <TabsTrigger value="skills">Skill Development</TabsTrigger>
          <TabsTrigger value="trending">Trending Content</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-8">
          <RecommendationSlider
            title="Personalized for You"
            description="Courses tailored to your interests and learning history"
            courses={recommendedCourses.slice(0, 6)}
          />
          <Separator />
          <RecommendationSlider
            title="Continue Your Learning Journey"
            description="Based on courses you've started or completed"
            courses={recommendedCourses.slice(6, 12)}
          />
        </TabsContent>

        <TabsContent value="pathways" className="space-y-8">
          <RecommendationSlider
            title="Recommended Learning Pathways"
            description="Structured learning journeys to develop comprehensive expertise"
            pathways={recommendedPathways}
          />
        </TabsContent>

        <TabsContent value="skills" className="space-y-8">
          <RecommendationSlider
            title="Advance Your Skills"
            description="Recommended courses to help you develop specific professional skills"
            courses={skillBasedCourses.slice(0, 6)}
          />
          <Separator />
          <RecommendationSlider
            title="Fill Knowledge Gaps"
            description="Courses to strengthen areas where you may need additional learning"
            courses={skillBasedCourses.slice(6, 12)}
          />
        </TabsContent>

        <TabsContent value="trending" className="space-y-8">
          <RecommendationSlider
            title="Trending in Your Areas"
            description="Popular courses in your areas of interest"
            courses={trendingCourses.slice(0, 6)}
          />
          <Separator />
          <RecommendationSlider
            title="Industry Trends"
            description="Stay current with the latest developments in medical aesthetics"
            courses={trendingCourses.slice(6, 12)}
          />
        </TabsContent>
      </Tabs>

      <div className="bg-muted p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">How Recommendations Work</h2>
        <p className="mb-4">
          Your recommendations are personalized based on your learning history, interests, and career goals. The more
          you interact with courses and resources, the more tailored your recommendations become.
        </p>
        <Button variant="outline" onClick={() => router.push("/settings")}>
          Customize Recommendation Settings
        </Button>
      </div>
    </div>
  )
}
