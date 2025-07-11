"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { CourseData } from "@/app/instructor/courses/wizard/page"
import { Upload } from "lucide-react"

interface BasicInfoStepProps {
  courseData: CourseData
  updateCourseData: (data: Partial<CourseData>) => void
}

// Mock categories for medical aesthetics
const categories = [
  { id: "botox", name: "Botox & Neurotoxins" },
  { id: "fillers", name: "Dermal Fillers" },
  { id: "laser", name: "Laser Treatments" },
  { id: "skincare", name: "Medical Skincare" },
  { id: "anatomy", name: "Facial Anatomy" },
  { id: "business", name: "Practice Management" },
  { id: "complications", name: "Complications Management" },
  { id: "combination", name: "Combination Therapies" },
]

export function BasicInfoStep({ courseData, updateCourseData }: BasicInfoStepProps) {
  const [thumbnailPreview, setThumbnailPreview] = useState<string>(
    courseData.thumbnail || "/placeholder.svg?height=200&width=400",
  )

  // Handle thumbnail upload
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setThumbnailPreview(result)
        updateCourseData({ thumbnail: result })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Basic Information</h2>
        <p className="text-muted-foreground mb-6">
          Provide the basic details about your course. This information will be displayed on the course listing page.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title" className="required">
            Course Title
          </Label>
          <Input
            id="title"
            placeholder="e.g., Advanced Botox Techniques for Medical Professionals"
            value={courseData.title}
            onChange={(e) => updateCourseData({ title: e.target.value })}
            required
          />
          <p className="text-xs text-muted-foreground">
            Choose a clear, specific title that accurately reflects your course content (60 characters max).
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="required">
            Course Description
          </Label>
          <Textarea
            id="description"
            placeholder="Describe what students will learn in your course..."
            value={courseData.description}
            onChange={(e) => updateCourseData({ description: e.target.value })}
            rows={6}
            required
          />
          <p className="text-xs text-muted-foreground">
            Write a compelling description that explains what your course covers and its benefits (1000 characters max).
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category" className="required">
            Category
          </Label>
          <Select value={courseData.category} onValueChange={(value) => updateCourseData({ category: value })}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Choose the category that best fits your course content.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="thumbnail" className="required">
            Course Thumbnail
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center">
              <div className="mb-4 rounded-full bg-primary/10 p-3">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-medium mb-1">Drag and drop your thumbnail image, or click to browse</p>
              <p className="text-xs text-muted-foreground mb-4">
                JPG, PNG or GIF. 16:9 aspect ratio recommended (1280×720 pixels).
              </p>
              <Button variant="outline" size="sm" onClick={() => document.getElementById("thumbnail")?.click()}>
                Choose Image
              </Button>
              <input id="thumbnail" type="file" accept="image/*" className="hidden" onChange={handleThumbnailChange} />
            </div>
            <div className="flex items-center justify-center">
              <div className="relative">
                <img
                  src={thumbnailPreview || "/placeholder.svg"}
                  alt="Course thumbnail preview"
                  className="rounded-lg object-cover w-full max-h-[200px]"
                />
                <p className="text-xs text-muted-foreground mt-2 text-center">Preview</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="prerequisites">Prerequisites</Label>
          <Select
            value={courseData.prerequisites}
            onValueChange={(value) => updateCourseData({ prerequisites: value })}
          >
            <SelectTrigger id="prerequisites">
              <SelectValue placeholder="Select prerequisites" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No prerequisites</SelectItem>
              <SelectItem value="basic">Basic knowledge of medical aesthetics</SelectItem>
              <SelectItem value="intermediate">Intermediate knowledge of medical aesthetics</SelectItem>
              <SelectItem value="advanced">Advanced knowledge of medical aesthetics</SelectItem>
              <SelectItem value="professional">Medical professional license required</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Specify any prerequisites or requirements for taking this course.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Course Settings</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="certificateOption">Certificate</Label>
              <Select
                value={courseData.certificateOption}
                onValueChange={(value) => updateCourseData({ certificateOption: value })}
              >
                <SelectTrigger id="certificateOption">
                  <SelectValue placeholder="Certificate options" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto-generate upon completion</SelectItem>
                  <SelectItem value="quiz">Require final quiz completion</SelectItem>
                  <SelectItem value="manual">Manual approval by instructor</SelectItem>
                  <SelectItem value="none">No certificate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="discussionOption">Discussion Forum</Label>
              <Select
                value={courseData.discussionOption}
                onValueChange={(value) => updateCourseData({ discussionOption: value })}
              >
                <SelectTrigger id="discussionOption">
                  <SelectValue placeholder="Discussion options" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enabled">Enabled</SelectItem>
                  <SelectItem value="moderated">Moderated</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
