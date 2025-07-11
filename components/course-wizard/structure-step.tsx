"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { CourseData, CourseSection, CourseLesson } from "@/app/instructor/courses/wizard/page"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Video, FileText, ListChecks, GripVertical, Plus, Trash2, Edit2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"

interface StructureStepProps {
  courseData: CourseData
  updateCourseData: (data: Partial<CourseData>) => void
}

export function StructureStep({ courseData, updateCourseData }: StructureStepProps) {
  const [newSectionTitle, setNewSectionTitle] = useState("")
  const [newLessonTitle, setNewLessonTitle] = useState("")
  const [newLessonType, setNewLessonType] = useState<"video" | "document" | "quiz">("video")
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null)
  const [editingSectionTitle, setEditingSectionTitle] = useState("")
  const [editingLessonTitle, setEditingLessonTitle] = useState("")
  const [editingLessonType, setEditingLessonType] = useState<"video" | "document" | "quiz">("video")
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    courseData.sections.length > 0 ? courseData.sections[0].id : null,
  )

  // Add a new section
  const addSection = () => {
    if (!newSectionTitle.trim()) return

    const newSection: CourseSection = {
      id: `section-${Date.now()}`,
      title: newSectionTitle,
      lessons: [],
    }

    updateCourseData({
      sections: [...courseData.sections, newSection],
    })

    setNewSectionTitle("")
    setSelectedSectionId(newSection.id)
  }

  // Delete a section
  const deleteSection = (sectionId: string) => {
    const updatedSections = courseData.sections.filter((section) => section.id !== sectionId)
    updateCourseData({ sections: updatedSections })

    if (selectedSectionId === sectionId) {
      setSelectedSectionId(updatedSections.length > 0 ? updatedSections[0].id : null)
    }
  }

  // Edit a section
  const startEditingSection = (section: CourseSection) => {
    setEditingSectionId(section.id)
    setEditingSectionTitle(section.title)
  }

  const saveEditingSection = () => {
    if (!editingSectionTitle.trim() || !editingSectionId) return

    const updatedSections = courseData.sections.map((section) =>
      section.id === editingSectionId ? { ...section, title: editingSectionTitle } : section,
    )

    updateCourseData({ sections: updatedSections })
    setEditingSectionId(null)
  }

  // Add a new lesson to a section
  const addLesson = (sectionId: string) => {
    if (!newLessonTitle.trim()) return

    const newLesson: CourseLesson = {
      id: `lesson-${Date.now()}`,
      title: newLessonTitle,
      type: newLessonType,
      content: "",
    }

    const updatedSections = courseData.sections.map((section) =>
      section.id === sectionId ? { ...section, lessons: [...section.lessons, newLesson] } : section,
    )

    updateCourseData({ sections: updatedSections })
    setNewLessonTitle("")
  }

  // Delete a lesson
  const deleteLesson = (sectionId: string, lessonId: string) => {
    const updatedSections = courseData.sections.map((section) =>
      section.id === sectionId
        ? { ...section, lessons: section.lessons.filter((lesson) => lesson.id !== lessonId) }
        : section,
    )

    updateCourseData({ sections: updatedSections })
  }

  // Edit a lesson
  const startEditingLesson = (lesson: CourseLesson, sectionId: string) => {
    setEditingLessonId(lesson.id)
    setEditingLessonTitle(lesson.title)
    setEditingLessonType(lesson.type)
  }

  const saveEditingLesson = (sectionId: string) => {
    if (!editingLessonTitle.trim() || !editingLessonId) return

    const updatedSections = courseData.sections.map((section) =>
      section.id === sectionId
        ? {
            ...section,
            lessons: section.lessons.map((lesson) =>
              lesson.id === editingLessonId
                ? { ...lesson, title: editingLessonTitle, type: editingLessonType }
                : lesson,
            ),
          }
        : section,
    )

    updateCourseData({ sections: updatedSections })
    setEditingLessonId(null)
  }

  // Handle drag and drop reordering
  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const { source, destination, type } = result

    // Reordering sections
    if (type === "section") {
      const reorderedSections = Array.from(courseData.sections)
      const [removed] = reorderedSections.splice(source.index, 1)
      reorderedSections.splice(destination.index, 0, removed)

      updateCourseData({ sections: reorderedSections })
      return
    }

    // Reordering lessons within a section
    if (type === "lesson") {
      const sectionId = source.droppableId
      const section = courseData.sections.find((s) => s.id === sectionId)

      if (!section) return

      const reorderedLessons = Array.from(section.lessons)
      const [removed] = reorderedLessons.splice(source.index, 1)
      reorderedLessons.splice(destination.index, 0, removed)

      const updatedSections = courseData.sections.map((s) =>
        s.id === sectionId ? { ...s, lessons: reorderedLessons } : s,
      )

      updateCourseData({ sections: updatedSections })
    }
  }

  // Get lesson type icon
  const getLessonTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />
      case "document":
        return <FileText className="h-4 w-4" />
      case "quiz":
        return <ListChecks className="h-4 w-4" />
      default:
        return <Video className="h-4 w-4" />
    }
  }

  // Calculate total lessons and estimated duration
  const totalLessons = courseData.sections.reduce((total, section) => total + section.lessons.length, 0)

  // Estimate 10 minutes per video, 5 minutes per document, 15 minutes per quiz
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Course Structure</h2>
        <p className="text-muted-foreground mb-6">
          Organize your course into sections and lessons. Drag and drop to reorder.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Course Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <p className="text-sm text-muted-foreground">Sections</p>
                    <p className="text-2xl font-bold">{courseData.sections.length}</p>
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

                <div className="pt-4">
                  <Label htmlFor="newSection">Add New Section</Label>
                  <div className="flex mt-2">
                    <Input
                      id="newSection"
                      placeholder="Section title"
                      value={newSectionTitle}
                      onChange={(e) => setNewSectionTitle(e.target.value)}
                      className="rounded-r-none"
                    />
                    <Button onClick={addSection} disabled={!newSectionTitle.trim()} className="rounded-l-none">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:w-2/3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Course Sections</CardTitle>
            </CardHeader>
            <CardContent>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="sections" type="section">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                      {courseData.sections.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed rounded-lg">
                          <p className="text-muted-foreground">
                            No sections yet. Add your first section to get started.
                          </p>
                        </div>
                      ) : (
                        courseData.sections.map((section, index) => (
                          <Draggable key={section.id} draggableId={section.id} index={index}>
                            {(provided) => (
                              <div ref={provided.innerRef} {...provided.draggableProps} className="border rounded-lg">
                                <div className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div {...provided.dragHandleProps} className="cursor-grab">
                                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                                      </div>
                                      {editingSectionId === section.id ? (
                                        <div className="flex items-center gap-2">
                                          <Input
                                            value={editingSectionTitle}
                                            onChange={(e) => setEditingSectionTitle(e.target.value)}
                                            className="h-8"
                                          />
                                          <Button
                                            size="sm"
                                            onClick={saveEditingSection}
                                            disabled={!editingSectionTitle.trim()}
                                          >
                                            Save
                                          </Button>
                                        </div>
                                      ) : (
                                        <h3 className="font-medium">{section.title}</h3>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button variant="ghost" size="icon" onClick={() => startEditingSection(section)}>
                                        <Edit2 className="h-4 w-4" />
                                      </Button>
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <Button variant="ghost" size="icon" className="text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                          <DialogHeader>
                                            <DialogTitle>Delete Section</DialogTitle>
                                            <DialogDescription>
                                              Are you sure you want to delete the section "{section.title}"? This will
                                              also delete all lessons within this section.
                                            </DialogDescription>
                                          </DialogHeader>
                                          <DialogFooter>
                                            <Button variant="destructive" onClick={() => deleteSection(section.id)}>
                                              Delete
                                            </Button>
                                          </DialogFooter>
                                        </DialogContent>
                                      </Dialog>
                                    </div>
                                  </div>

                                  <Droppable droppableId={section.id} type="lesson">
                                    {(provided) => (
                                      <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="mt-4 space-y-2 pl-6"
                                      >
                                        {section.lessons.map((lesson, lessonIndex) => (
                                          <Draggable key={lesson.id} draggableId={lesson.id} index={lessonIndex}>
                                            {(provided) => (
                                              <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className="flex items-center justify-between p-2 bg-muted rounded-md"
                                              >
                                                <div className="flex items-center gap-2">
                                                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                                                  {getLessonTypeIcon(lesson.type)}
                                                  {editingLessonId === lesson.id ? (
                                                    <div className="flex items-center gap-2">
                                                      <Input
                                                        value={editingLessonTitle}
                                                        onChange={(e) => setEditingLessonTitle(e.target.value)}
                                                        className="h-8 w-40"
                                                      />
                                                      <Select
                                                        value={editingLessonType}
                                                        onValueChange={(value: "video" | "document" | "quiz") =>
                                                          setEditingLessonType(value)
                                                        }
                                                      >
                                                        <SelectTrigger className="h-8 w-28">
                                                          <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                          <SelectItem value="video">Video</SelectItem>
                                                          <SelectItem value="document">Document</SelectItem>
                                                          <SelectItem value="quiz">Quiz</SelectItem>
                                                        </SelectContent>
                                                      </Select>
                                                      <Button
                                                        size="sm"
                                                        onClick={() => saveEditingLesson(section.id)}
                                                        disabled={!editingLessonTitle.trim()}
                                                      >
                                                        Save
                                                      </Button>
                                                    </div>
                                                  ) : (
                                                    <span>{lesson.title}</span>
                                                  )}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                  <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() => startEditingLesson(lesson, section.id)}
                                                  >
                                                    <Edit2 className="h-3 w-3" />
                                                  </Button>
                                                  <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-destructive"
                                                    onClick={() => deleteLesson(section.id, lesson.id)}
                                                  >
                                                    <Trash2 className="h-3 w-3" />
                                                  </Button>
                                                </div>
                                              </div>
                                            )}
                                          </Draggable>
                                        ))}
                                        {provided.placeholder}
                                      </div>
                                    )}
                                  </Droppable>

                                  <div className="mt-4 pl-6">
                                    <div className="flex items-end gap-2">
                                      <div className="flex-1 space-y-1">
                                        <Label htmlFor={`newLesson-${section.id}`}>Add Lesson</Label>
                                        <Input
                                          id={`newLesson-${section.id}`}
                                          placeholder="Lesson title"
                                          value={newLessonTitle}
                                          onChange={(e) => setNewLessonTitle(e.target.value)}
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <Label htmlFor={`lessonType-${section.id}`}>Type</Label>
                                        <Select
                                          value={newLessonType}
                                          onValueChange={(value: "video" | "document" | "quiz") =>
                                            setNewLessonType(value)
                                          }
                                        >
                                          <SelectTrigger id={`lessonType-${section.id}`} className="w-28">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="video">Video</SelectItem>
                                            <SelectItem value="document">Document</SelectItem>
                                            <SelectItem value="quiz">Quiz</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <Button onClick={() => addLesson(section.id)} disabled={!newLessonTitle.trim()}>
                                        Add
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
