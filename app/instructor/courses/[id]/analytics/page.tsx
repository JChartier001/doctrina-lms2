"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/date-range-picker"
import { EnrollmentChart } from "@/components/analytics/enrollment-chart"
import { EngagementMetrics } from "@/components/analytics/engagement-metrics"
import { ContentPerformance } from "@/components/analytics/content-performance"
import { QuizAnalytics } from "@/components/analytics/quiz-analytics"
import { StudentPerformance } from "@/components/analytics/student-performance"
import { RevenueAnalytics } from "@/components/analytics/revenue-analytics"
import { Download, ArrowLeft } from "lucide-react"
import { addDays } from "date-fns"

export default function CourseAnalyticsPage({ params }: { params: { id: string } }) {
  const { user, role, isLoading } = useAuth()
  const router = useRouter()
  const [dateRange, setDateRange] = useState({
    from: addDays(new Date(), -30),
    to: new Date(),
  })
  const [courseData, setCourseData] = useState<any>(null)

  // Mock course data - in a real app, this would come from an API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCourseData({
        id: params.id,
        title: "Advanced Botox Techniques",
        enrollments: 78,
        completionRate: 68,
        averageRating: 4.7,
        totalRevenue: 7800,
        activeStudents: 52,
      })
    }, 500)
  }, [params.id])

  useEffect(() => {
    if (!isLoading && (!user || role !== "instructor")) {
      router.push("/sign-in")
    }
  }, [user, role, router, isLoading])

  if (isLoading || !courseData) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Loading...</h1>
      </div>
    )
  }

  if (!user || role !== "instructor") {
    return null
  }

  const handleExportData = () => {
    alert("Exporting analytics data as CSV...")
    // In a real app, this would trigger a download of the analytics data
  }

  return (
    <div className="container py-10">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">{courseData.title} Analytics</h1>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Student segment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Students</SelectItem>
              <SelectItem value="active">Active Students</SelectItem>
              <SelectItem value="inactive">Inactive Students</SelectItem>
              <SelectItem value="completed">Completed Course</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleExportData} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{courseData.enrollments}</div>
            <div className="text-xs text-green-500 flex items-center mt-1">+12% from previous period</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{courseData.completionRate}%</div>
            <div className="text-xs text-green-500 flex items-center mt-1">+5% from previous period</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{courseData.averageRating}/5.0</div>
            <div className="text-xs text-green-500 flex items-center mt-1">+0.2 from previous period</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${courseData.totalRevenue}</div>
            <div className="text-xs text-green-500 flex items-center mt-1">+$1,200 from previous period</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="content">Content Performance</TabsTrigger>
          <TabsTrigger value="quizzes">Quiz Analytics</TabsTrigger>
          <TabsTrigger value="students">Student Performance</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <EnrollmentChart dateRange={dateRange} courseId={params.id} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Demographics</CardTitle>
                <CardDescription>Breakdown of student backgrounds</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {/* Demographics chart would go here */}
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Demographics visualization
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Engagement Overview</CardTitle>
                <CardDescription>Key engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Average Time per Session</span>
                      <span className="font-medium">24 minutes</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: "70%" }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Video Completion Rate</span>
                      <span className="font-medium">82%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: "82%" }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Quiz Attempt Rate</span>
                      <span className="font-medium">94%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: "94%" }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Discussion Participation</span>
                      <span className="font-medium">45%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: "45%" }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <EngagementMetrics courseId={params.id} dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <ContentPerformance courseId={params.id} dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="quizzes" className="space-y-6">
          <QuizAnalytics courseId={params.id} dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <StudentPerformance courseId={params.id} dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <RevenueAnalytics courseId={params.id} dateRange={dateRange} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
