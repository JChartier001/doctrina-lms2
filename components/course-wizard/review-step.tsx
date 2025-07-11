"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Check, AlertCircle, Video, FileText, ListChecks } from "lucide-react"
import type { CourseData } from "@/app/instructor/courses/wizard/page"

interface ReviewStepProps {
  courseData: CourseData
  updateCourseData: (data: Partial<CourseData>) => void
}

export function ReviewStep({ courseData, updateCourseData }: ReviewStepProps) {
  // Calculate course statistics
  const totalSections = courseData.sections.length
  const totalLessons = courseData.sections.reduce((total, section) => total + section.lessons.length, 0)

  const lessonTypes = courseData.sections.reduce(
    (acc, section) => {
      section.lessons.forEach((lesson) => {
        acc[lesson.type] = (acc[lesson.type] || 0) + 1
      })
      return acc
    },
    {} as Record<string, number>,
  )

  // Estimate duration (10 min per video, 5 min per document, 15 min per quiz)
  const estimatedDuration = courseData.sections.reduce((total, section) => {
    return (
      total +
      section.lessons.reduce((sectionTotal, lesson) => {
        switch (lesson.type) {
          case "video":
            return sectionTotal + 10
          case "document":
            return sectionTotal + 5
          case "quiz":
            return sectionTotal + 15
          default:
            return sectionTotal
        }
      }, 0)
    )
  }, 0)

  // Format duration as hours and minutes
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  // Check if all required fields are filled
  const isBasicInfoComplete = () => {
    return courseData.title.trim() !== "" && courseData.description.trim() !== "" && courseData.category.trim() !== ""
  }

  const isStructureComplete = () => {
    return (
      courseData.sections.length > 0 &&
      courseData.sections.every((section) => section.title.trim() !== "" && section.lessons.length > 0) &&
      courseData.sections.every((section) => section.lessons.every((lesson) => lesson.title.trim() !== ""))
    )
  }

  const isContentComplete = () => {
    // Check if at least some lessons have content
    const lessonsWithContent = courseData.sections.reduce((count, section) => {
      return count + section.lessons.filter((lesson) => lesson.content.trim() !== "").length
    }, 0)

    return lessonsWithContent > 0
  }

  const isPricingComplete = () => {
    return courseData.price !== undefined && courseData.price !== ""
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Review Your Course</h2>
        <p className="text-muted-foreground mb-6">
          Review your course details before publishing. Make sure all required information is complete.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <h3 className="font-medium">Title</h3>
                  <Button variant="link" className="p-0 h-auto" onClick={() => window.scrollTo(0, 0)}>
                    Edit
                  </Button>
                </div>
                <p>{courseData.title || "No title provided"}</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-medium">Description</h3>
                <p className="whitespace-pre-line">{courseData.description || "No description provided"}</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-medium">Category</h3>
                <Badge variant="secondary">{courseData.category || "Uncategorized"}</Badge>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-medium">Thumbnail</h3>
                {courseData.thumbnail ? (
                  <img
                    src={courseData.thumbnail || "/placeholder.svg"}
                    alt="Course thumbnail"
                    className="rounded-lg object-cover w-full max-h-[200px]"
                  />
                ) : (
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <p className="text-muted-foreground">No thumbnail uploaded</p>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-medium">Course Structure</h3>
                <div className="space-y-4">
                  {courseData.sections.map((section, index) => (
                    <div key={section.id} className="space-y-2">
                      <h4 className="font-medium">
                        Section {index + 1}: {section.title}
                      </h4>
                      <ul className="space-y-1 pl-6">
                        {section.lessons.map((lesson, lessonIndex) => (
                          <li key={lesson.id} className="flex items-center gap-2">
                            {lesson.type === "video" && <Video className="h-4 w-4 text-blue-500" />}
                            {lesson.type === "document" && <FileText className="h-4 w-4 text-green-500" />}
                            {lesson.type === "quiz" && <ListChecks className="h-4 w-4 text-purple-500" />}
                            <span>
                              {lessonIndex + 1}. {lesson.title}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-medium">Pricing</h3>
                <p className="text-2xl font-bold">${Number.parseFloat(courseData.price || "0").toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <p className="text-sm text-muted-foreground">Sections</p>
                    <p className="text-2xl font-bold">{totalSections}</p>
                  </div>
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <p className="text-sm text-muted-foreground">Lessons</p>
                    <p className="text-2xl font-bold">{totalLessons}</p>
                  </div>
                </div>

                <div className="bg-muted rounded-lg p-3 text-center">
                  <p className="text-sm text-muted-foreground">Estimated Duration</p>
                  <p className="text-2xl font-bold">{formatDuration(estimatedDuration)}</p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Content Breakdown</h3>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-blue-100 dark:bg-blue-900/20 rounded-lg p-2">
                      <p className="text-xs text-blue-800 dark:text-blue-300">Videos</p>
                      <p className="text-lg font-bold text-blue-800 dark:text-blue-300">{lessonTypes.video || 0}</p>
                    </div>
                    <div className="bg-green-100 dark:bg-green-900/20 rounded-lg p-2">
                      <p className="text-xs text-green-800 dark:text-green-300">Documents</p>
                      <p className="text-lg font-bold text-green-800 dark:text-green-300">
                        {lessonTypes.document || 0}
                      </p>
                    </div>
                    <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-2">
                      <p className="text-xs text-purple-800 dark:text-purple-300">Quizzes</p>
                      <p className="text-lg font-bold text-purple-800 dark:text-purple-300">{lessonTypes.quiz || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Completion Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isBasicInfoComplete() ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                    )}
                    <span>Basic Information</span>
                  </div>
                  {!isBasicInfoComplete() && (
                    <Badge variant="outline" className="text-amber-500">
                      Incomplete
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isStructureComplete() ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                    )}
                    <span>Course Structure</span>
                  </div>
                  {!isStructureComplete() && (
                    <Badge variant="outline" className="text-amber-500">
                      Incomplete
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isContentComplete() ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                    )}
                    <span>Course Content</span>
                  </div>
                  {!isContentComplete() && (
                    <Badge variant="outline" className="text-amber-500">
                      Incomplete
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isPricingComplete() ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                    )}
                    <span>Pricing</span>
                  </div>
                  {!isPricingComplete() && (
                    <Badge variant="outline" className="text-amber-500">
                      Incomplete
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Publishing Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Before publishing your course, make sure you have:</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Provided a clear and descriptive course title</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Written a comprehensive course description</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Uploaded a high-quality course thumbnail</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Organized your course into logical sections</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Added content to your lessons</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Set an appropriate price for your course</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
