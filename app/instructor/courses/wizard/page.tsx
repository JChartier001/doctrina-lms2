"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, Save, Eye, CheckCircle2 } from "lucide-react"

// Import wizard steps
import { BasicInfoStep } from "@/components/course-wizard/basic-info-step"
import { StructureStep } from "@/components/course-wizard/structure-step"
import { ContentStep } from "@/components/course-wizard/content-step"
import { PricingStep } from "@/components/course-wizard/pricing-step"
import { ReviewStep } from "@/components/course-wizard/review-step"

// Define the course data structure
export interface CourseData {
  id?: string
  title: string
  description: string
  category: string
  thumbnail: string
  price: string
  sections: CourseSection[]
  visibility: string
  prerequisites: string
  certificateOption: string
  discussionOption: string
}

export interface CourseSection {
  id: string
  title: string
  lessons: CourseLesson[]
}

export interface CourseLesson {
  id: string
  title: string
  type: "video" | "document" | "quiz"
  content: string
  duration?: number
  questions?: QuizQuestion[]
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctOption: number
}

// Initial empty course data
const initialCourseData: CourseData = {
  title: "",
  description: "",
  category: "",
  thumbnail: "",
  price: "",
  sections: [
    {
      id: "section-1",
      title: "Introduction",
      lessons: [
        {
          id: "lesson-1",
          title: "Welcome to the Course",
          type: "video",
          content: "",
        },
      ],
    },
  ],
  visibility: "public",
  prerequisites: "none",
  certificateOption: "auto",
  discussionOption: "enabled",
}

export default function CourseWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [courseData, setCourseData] = useState<CourseData>(initialCourseData)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { user, role } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Define the steps
  const steps = [
    { name: "Basic Info", component: BasicInfoStep },
    { name: "Structure", component: StructureStep },
    { name: "Content", component: ContentStep },
    { name: "Pricing", component: PricingStep },
    { name: "Review", component: ReviewStep },
  ]

  // Calculate progress percentage
  const progressPercentage = ((currentStep + 1) / steps.length) * 100

  // Handle next step
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      window.scrollTo(0, 0)
    }
  }

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      window.scrollTo(0, 0)
    }
  }

  // Handle save draft
  const handleSaveDraft = async () => {
    setIsSaving(true)

    // Simulate API call to save draft
    setTimeout(() => {
      toast({
        title: "Draft saved",
        description: "Your course draft has been saved successfully.",
      })
      setIsSaving(false)
    }, 1500)
  }

  // Handle preview
  const handlePreview = () => {
    // Open preview in new tab or modal
    toast({
      title: "Preview mode",
      description: "Course preview functionality will be available soon.",
    })
  }

  // Handle publish
  const handlePublish = async () => {
    setIsLoading(true)

    // Simulate API call to publish course
    setTimeout(() => {
      toast({
        title: "Course published",
        description: "Your course has been published successfully.",
      })
      router.push("/instructor/dashboard")
      setIsLoading(false)
    }, 2000)
  }

  // Update course data
  const updateCourseData = (data: Partial<CourseData>) => {
    setCourseData((prev) => ({ ...prev, ...data }))
  }

  // Render current step component
  const CurrentStepComponent = steps[currentStep].component

  // Redirect if not instructor
  if (!user || role !== "instructor") {
    router.push("/login")
    return null
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col space-y-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Create New Course</h1>
          <p className="text-muted-foreground">Complete the steps below to create and publish your course.</p>
        </div>

        {/* Progress bar and steps */}
        <div className="space-y-4">
          <div className="flex justify-between">
            {steps.map((step, index) => (
              <button
                key={index}
                className={`flex flex-col items-center space-y-2 ${
                  index <= currentStep ? "text-primary" : "text-muted-foreground"
                }`}
                onClick={() => {
                  // Only allow navigation to completed steps or the current step
                  if (index <= currentStep) {
                    setCurrentStep(index)
                  }
                }}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                    index < currentStep
                      ? "border-primary bg-primary text-primary-foreground"
                      : index === currentStep
                        ? "border-primary text-primary"
                        : "border-muted-foreground text-muted-foreground"
                  }`}
                >
                  {index < currentStep ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
                </div>
                <span className="text-xs font-medium">{step.name}</span>
              </button>
            ))}
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Current step content */}
        <Card className="p-6">
          <CurrentStepComponent courseData={courseData} updateCourseData={updateCourseData} />
        </Card>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <div>
            {currentStep > 0 && (
              <Button variant="outline" onClick={handlePrevious} className="flex items-center gap-2">
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
            )}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save Draft"}
            </Button>
            <Button variant="outline" onClick={handlePreview} className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </Button>
            {currentStep < steps.length - 1 ? (
              <Button onClick={handleNext} className="flex items-center gap-2">
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handlePublish} disabled={isLoading} className="flex items-center gap-2">
                {isLoading ? "Publishing..." : "Publish Course"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
