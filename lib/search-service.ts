// This service handles search functionality across the platform
import { debounce } from "@/lib/utils"

// Types for search results
export type SearchResultType = "course" | "program" | "instructor" | "community" | "lesson" | "resource"

export interface SearchResult {
  id: string
  title: string
  description: string
  type: SearchResultType
  url: string
  image?: string
  metadata?: Record<string, any>
}

// Mock data for search index
const searchIndex = {
  courses: [
    {
      id: "1",
      title: "Advanced Botox Techniques",
      description: "Master the art of Botox injections with advanced techniques for facial aesthetics.",
      instructor: "Dr. Sarah Johnson",
      image: "/placeholder.svg?height=100&width=200",
      students: 124,
      rating: 4.8,
      price: 199,
      tags: ["Botox", "Advanced", "Facial Aesthetics"],
      content:
        "This course covers advanced techniques for Botox injections, including facial mapping, dosage calculations, and injection techniques for optimal results.",
    },
    {
      id: "2",
      title: "Dermal Fillers Masterclass",
      description: "Comprehensive training on dermal fillers for facial rejuvenation and contouring.",
      instructor: "Dr. Michael Chen",
      image: "/placeholder.svg?height=100&width=200",
      students: 87,
      rating: 4.6,
      price: 249,
      tags: ["Fillers", "Facial Rejuvenation", "Contouring"],
      content:
        "Learn about different types of dermal fillers, their properties, and techniques for facial rejuvenation and contouring.",
    },
    {
      id: "3",
      title: "Laser Therapy Fundamentals",
      description: "Learn the principles and applications of laser therapy in aesthetic medicine.",
      instructor: "Dr. Emily Rodriguez",
      image: "/placeholder.svg?height=100&width=200",
      students: 156,
      rating: 4.7,
      price: 179,
      tags: ["Laser", "Therapy", "Aesthetics"],
      content:
        "This course covers the fundamentals of laser therapy, including laser physics, tissue interactions, and applications in aesthetic medicine.",
    },
    {
      id: "4",
      title: "Medical Aesthetics Business Management",
      description: "Learn how to build and manage a successful medical aesthetics practice.",
      instructor: "Dr. James Wilson",
      image: "/placeholder.svg?height=100&width=200",
      students: 92,
      rating: 4.5,
      price: 299,
      tags: ["Business", "Management", "Practice"],
      content:
        "This course covers business aspects of running a medical aesthetics practice, including marketing, client management, and financial planning.",
    },
    {
      id: "5",
      title: "Introduction to Medical Aesthetics",
      description: "A comprehensive introduction to the field of medical aesthetics for beginners.",
      instructor: "Dr. Sarah Johnson",
      image: "/placeholder.svg?height=100&width=200",
      students: 210,
      rating: 4.9,
      price: 149,
      tags: ["Introduction", "Basics", "Fundamentals"],
      content:
        "This course provides a comprehensive introduction to medical aesthetics, covering basic principles, common procedures, and patient assessment.",
    },
  ],
  programs: [
    {
      id: "1",
      title: "Comprehensive Medical Aesthetics",
      description:
        "A complete curriculum covering all aspects of medical aesthetics, from foundational knowledge to advanced techniques.",
      image: "/placeholder.svg?height=100&width=200",
      duration: "12 months",
      courses: 8,
      price: 2990,
      content:
        "This program provides comprehensive training in medical aesthetics, covering facial anatomy, injection techniques, laser therapy, and business management.",
    },
    {
      id: "2",
      title: "Advanced Injection Techniques",
      description:
        "Master the art of injectable treatments with this comprehensive program focused on advanced techniques for Botox and dermal fillers.",
      image: "/placeholder.svg?height=100&width=200",
      duration: "6 months",
      courses: 5,
      price: 1990,
      content:
        "This program focuses on advanced injection techniques for Botox and dermal fillers, including facial assessment, treatment planning, and injection techniques.",
    },
    {
      id: "3",
      title: "Aesthetic Laser Specialist",
      description: "Become a specialist in laser-based aesthetic treatments with this comprehensive program.",
      image: "/placeholder.svg?height=100&width=200",
      duration: "8 months",
      courses: 6,
      price: 2490,
      content:
        "This program covers all aspects of laser-based aesthetic treatments, including laser physics, safety protocols, and treatment techniques for various conditions.",
    },
  ],
  instructors: [
    {
      id: "1",
      name: "Dr. Sarah Johnson",
      title: "Board-Certified Dermatologist",
      specialization: "Dermatology",
      bio: "Board-certified dermatologist with 15+ years of experience in medical aesthetics.",
      image: "/placeholder.svg?height=100&width=100",
      courses: 5,
      students: 450,
    },
    {
      id: "2",
      name: "Dr. Michael Chen",
      title: "Facial Plastic Surgeon",
      specialization: "Plastic Surgery",
      bio: "Facial plastic surgeon specializing in non-surgical facial rejuvenation techniques.",
      image: "/placeholder.svg?height=100&width=100",
      courses: 3,
      students: 320,
    },
    {
      id: "3",
      name: "Dr. Emily Rodriguez",
      title: "Aesthetic Medicine Specialist",
      specialization: "Aesthetic Medicine",
      bio: "Specialist in laser therapy and non-invasive aesthetic procedures with 10+ years of experience.",
      image: "/placeholder.svg?height=100&width=100",
      courses: 4,
      students: 380,
    },
  ],
  communityPosts: [
    {
      id: "1",
      title: "Best practices for dermal fillers in male patients",
      content:
        "In this post, I discuss the unique considerations for using dermal fillers in male patients, including anatomical differences and aesthetic goals.",
      author: {
        name: "Dr. Sarah Johnson",
        image: "/placeholder.svg?height=40&width=40",
      },
      date: "2023-05-10T14:30:00",
      replies: 12,
      views: 156,
      tags: ["Fillers", "Male Aesthetics", "Clinical"],
    },
    {
      id: "2",
      title: "Managing patient expectations for Botox treatments",
      content:
        "This post covers strategies for effectively managing patient expectations before, during, and after Botox treatments to ensure satisfaction.",
      author: {
        name: "Dr. Michael Chen",
        image: "/placeholder.svg?height=40&width=40",
      },
      date: "2023-05-08T09:15:00",
      replies: 8,
      views: 102,
      tags: ["Botox", "Patient Care", "Business"],
    },
    {
      id: "3",
      title: "Laser therapy for acne scars: Latest research",
      content:
        "I summarize the latest research on using laser therapy for treating acne scars, including effectiveness of different laser types and treatment protocols.",
      author: {
        name: "Dr. Emily Rodriguez",
        image: "/placeholder.svg?height=40&width=40",
      },
      date: "2023-05-05T11:45:00",
      replies: 15,
      views: 189,
      tags: ["Laser", "Acne Scars", "Research"],
    },
  ],
  lessons: [
    {
      id: "1",
      title: "Facial Anatomy for Aesthetic Procedures",
      description: "Detailed overview of facial anatomy relevant to aesthetic procedures.",
      courseId: "1",
      duration: "45 min",
      type: "video",
      content:
        "This lesson covers the key anatomical structures of the face that are relevant to aesthetic procedures, including muscles, nerves, and blood vessels.",
    },
    {
      id: "2",
      title: "Botox Injection Techniques",
      description: "Step-by-step guide to Botox injection techniques for different facial areas.",
      courseId: "1",
      duration: "60 min",
      type: "video",
      content:
        "This lesson demonstrates proper Botox injection techniques for different facial areas, including the forehead, glabella, and crow's feet.",
    },
    {
      id: "3",
      title: "Dermal Filler Selection",
      description: "Guide to selecting the appropriate dermal filler for different facial areas and concerns.",
      courseId: "2",
      duration: "50 min",
      type: "video",
      content:
        "This lesson covers the properties of different dermal fillers and guidelines for selecting the appropriate filler for different facial areas and concerns.",
    },
  ],
  resources: [
    {
      id: "1",
      title: "Facial Anatomy Chart",
      description: "Detailed chart of facial anatomy for reference during aesthetic procedures.",
      courseId: "1",
      type: "pdf",
      content:
        "This resource provides a detailed chart of facial anatomy, including muscles, nerves, and blood vessels, for reference during aesthetic procedures.",
    },
    {
      id: "2",
      title: "Botox Dosage Calculator",
      description: "Tool for calculating Botox dosages based on patient characteristics and treatment areas.",
      courseId: "1",
      type: "tool",
      content:
        "This resource provides a calculator for determining appropriate Botox dosages based on patient characteristics and treatment areas.",
    },
    {
      id: "3",
      title: "Dermal Filler Comparison Guide",
      description: "Comprehensive guide comparing different dermal fillers and their properties.",
      courseId: "2",
      type: "pdf",
      content:
        "This resource provides a comprehensive comparison of different dermal fillers, including their composition, properties, and recommended uses.",
    },
  ],
}

// Function to search across all content types
export async function searchAll(query: string, filters?: { types?: SearchResultType[] }): Promise<SearchResult[]> {
  // In a real implementation, this would query a search index or database
  // For now, we'll simulate a search across our mock data

  if (!query) return []

  const normalizedQuery = query.toLowerCase()
  const results: SearchResult[] = []

  // Helper function to check if an item matches the query
  const matchesQuery = (text: string) => text.toLowerCase().includes(normalizedQuery)

  // Filter by content types if specified
  const shouldIncludeType = (type: SearchResultType) => {
    if (!filters?.types || filters.types.length === 0) return true
    return filters.types.includes(type)
  }

  // Search courses
  if (shouldIncludeType("course")) {
    searchIndex.courses.forEach((course) => {
      if (
        matchesQuery(course.title) ||
        matchesQuery(course.description) ||
        matchesQuery(course.instructor) ||
        matchesQuery(course.content) ||
        course.tags.some((tag) => matchesQuery(tag))
      ) {
        results.push({
          id: course.id,
          title: course.title,
          description: course.description,
          type: "course",
          url: `/courses/${course.id}`,
          image: course.image,
          metadata: {
            instructor: course.instructor,
            rating: course.rating,
            students: course.students,
            price: course.price,
          },
        })
      }
    })
  }

  // Search programs
  if (shouldIncludeType("program")) {
    searchIndex.programs.forEach((program) => {
      if (matchesQuery(program.title) || matchesQuery(program.description) || matchesQuery(program.content)) {
        results.push({
          id: program.id,
          title: program.title,
          description: program.description,
          type: "program",
          url: `/programs/${program.id}`,
          image: program.image,
          metadata: {
            duration: program.duration,
            courses: program.courses,
            price: program.price,
          },
        })
      }
    })
  }

  // Search instructors
  if (shouldIncludeType("instructor")) {
    searchIndex.instructors.forEach((instructor) => {
      if (
        matchesQuery(instructor.name) ||
        matchesQuery(instructor.specialization) ||
        matchesQuery(instructor.bio) ||
        matchesQuery(instructor.title)
      ) {
        results.push({
          id: instructor.id,
          title: instructor.name,
          description: instructor.bio,
          type: "instructor",
          url: `/instructors/${instructor.id}`,
          image: instructor.image,
          metadata: {
            specialization: instructor.specialization,
            title: instructor.title,
            courses: instructor.courses,
            students: instructor.students,
          },
        })
      }
    })
  }

  // Search community posts
  if (shouldIncludeType("community")) {
    searchIndex.communityPosts.forEach((post) => {
      if (matchesQuery(post.title) || matchesQuery(post.content) || post.tags.some((tag) => matchesQuery(tag))) {
        results.push({
          id: post.id,
          title: post.title,
          description: post.content.substring(0, 150) + (post.content.length > 150 ? "..." : ""),
          type: "community",
          url: `/community/topic/${post.id}`,
          metadata: {
            author: post.author.name,
            date: post.date,
            replies: post.replies,
            views: post.views,
            tags: post.tags,
          },
        })
      }
    })
  }

  // Search lessons
  if (shouldIncludeType("lesson")) {
    searchIndex.lessons.forEach((lesson) => {
      if (matchesQuery(lesson.title) || matchesQuery(lesson.description) || matchesQuery(lesson.content)) {
        results.push({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          type: "lesson",
          url: `/courses/${lesson.courseId}/learn?lesson=${lesson.id}`,
          metadata: {
            duration: lesson.duration,
            type: lesson.type,
            courseId: lesson.courseId,
          },
        })
      }
    })
  }

  // Search resources
  if (shouldIncludeType("resource")) {
    searchIndex.resources.forEach((resource) => {
      if (matchesQuery(resource.title) || matchesQuery(resource.description) || matchesQuery(resource.content)) {
        results.push({
          id: resource.id,
          title: resource.title,
          description: resource.description,
          type: "resource",
          url: `/courses/${resource.courseId}/resources/${resource.id}`,
          metadata: {
            type: resource.type,
            courseId: resource.courseId,
          },
        })
      }
    })
  }

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  return results
}

// Function to get search suggestions based on partial query
export async function getSearchSuggestions(partialQuery: string): Promise<string[]> {
  if (!partialQuery || partialQuery.length < 2) return []

  const normalizedQuery = partialQuery.toLowerCase()
  const suggestions = new Set<string>()

  // Extract potential suggestions from all content
  // Courses
  searchIndex.courses.forEach((course) => {
    if (course.title.toLowerCase().includes(normalizedQuery)) {
      suggestions.add(course.title)
    }
    course.tags.forEach((tag) => {
      if (tag.toLowerCase().includes(normalizedQuery)) {
        suggestions.add(tag)
      }
    })
  })

  // Programs
  searchIndex.programs.forEach((program) => {
    if (program.title.toLowerCase().includes(normalizedQuery)) {
      suggestions.add(program.title)
    }
  })

  // Instructors
  searchIndex.instructors.forEach((instructor) => {
    if (instructor.name.toLowerCase().includes(normalizedQuery)) {
      suggestions.add(instructor.name)
    }
    if (instructor.specialization.toLowerCase().includes(normalizedQuery)) {
      suggestions.add(instructor.specialization)
    }
  })

  // Community posts
  searchIndex.communityPosts.forEach((post) => {
    if (post.title.toLowerCase().includes(normalizedQuery)) {
      suggestions.add(post.title)
    }
    post.tags.forEach((tag) => {
      if (tag.toLowerCase().includes(normalizedQuery)) {
        suggestions.add(tag)
      }
    })
  })

  // Convert Set to Array and limit to 10 suggestions
  return Array.from(suggestions).slice(0, 10)
}

// Track popular searches
const popularSearches: Record<string, number> = {}

export function trackSearch(query: string): void {
  const normalizedQuery = query.toLowerCase().trim()
  if (normalizedQuery) {
    popularSearches[normalizedQuery] = (popularSearches[normalizedQuery] || 0) + 1
  }
}

export function getPopularSearches(limit = 5): { query: string; count: number }[] {
  return Object.entries(popularSearches)
    .map(([query, count]) => ({ query, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

// Create a debounced version of the search function for use in autocomplete
export const debouncedSearchSuggestions = debounce(getSearchSuggestions, 300)
