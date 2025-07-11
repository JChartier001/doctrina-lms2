// Recommendation Service
// This service generates personalized content recommendations for users

import type { Resource } from "./resource-library-service"

// Types for recommendations
export interface CourseRecommendation {
  id: string
  title: string
  description: string
  instructor: string
  thumbnailUrl: string
  rating: number
  reviewCount: number
  level: "beginner" | "intermediate" | "advanced"
  duration: string
  price: number
  relevanceScore: number
  relevanceReason: string
}

export interface ResourceRecommendation {
  id: string
  title: string
  type: string
  thumbnailUrl: string
  relevanceScore: number
  relevanceReason: string
  resource: Resource
}

export interface PathwayRecommendation {
  id: string
  title: string
  description: string
  courseCount: number
  estimatedDuration: string
  thumbnailUrl: string
  relevanceScore: number
  relevanceReason: string
}

export type RecommendationType = "course" | "resource" | "pathway" | "instructor" | "community"

export interface UserInterest {
  topic: string
  weight: number
}

export interface UserProfile {
  interests: UserInterest[]
  completedCourseIds: string[]
  inProgressCourseIds: string[]
  viewedResourceIds: string[]
  savedResourceIds: string[]
  preferredContentTypes: string[]
  skillLevels: Record<string, "beginner" | "intermediate" | "advanced">
  recentSearches: string[]
  careerId?: string
}

// Mock user profile for demonstration
const mockUserProfile: UserProfile = {
  interests: [
    { topic: "facial-anatomy", weight: 0.9 },
    { topic: "injection-techniques", weight: 0.8 },
    { topic: "botox", weight: 0.7 },
    { topic: "dermal-fillers", weight: 0.6 },
    { topic: "business", weight: 0.4 },
  ],
  completedCourseIds: ["c1", "c2", "c5"],
  inProgressCourseIds: ["c3", "c8"],
  viewedResourceIds: ["1", "4", "7", "12"],
  savedResourceIds: ["1", "12"],
  preferredContentTypes: ["video", "interactive"],
  skillLevels: {
    "facial-anatomy": "intermediate",
    "injection-techniques": "intermediate",
    botox: "advanced",
    "dermal-fillers": "beginner",
    business: "beginner",
  },
  recentSearches: ["facial nerves", "lip augmentation", "complication management"],
  careerId: "aesthetic-physician",
}

// Mock courses data
const mockCourses: CourseRecommendation[] = [
  {
    id: "c1",
    title: "Facial Anatomy Fundamentals",
    description: "A comprehensive guide to facial anatomy for aesthetic practitioners.",
    instructor: "Dr. Sarah Johnson",
    thumbnailUrl: "/placeholder.svg?height=400&width=600",
    rating: 4.8,
    reviewCount: 156,
    level: "beginner",
    duration: "12 hours",
    price: 199,
    relevanceScore: 0.95,
    relevanceReason: "Based on your interest in facial anatomy",
  },
  {
    id: "c2",
    title: "Advanced Botox Techniques",
    description: "Master advanced Botox injection techniques for optimal results.",
    instructor: "Dr. Michael Chen",
    thumbnailUrl: "/placeholder.svg?height=400&width=600",
    rating: 4.9,
    reviewCount: 112,
    level: "advanced",
    duration: "8 hours",
    price: 249,
    relevanceScore: 0.9,
    relevanceReason: "Matches your advanced skill level in Botox",
  },
  {
    id: "c3",
    title: "Dermal Filler Masterclass",
    description: "Comprehensive training in dermal filler applications for facial enhancement.",
    instructor: "Dr. Emily Rodriguez",
    thumbnailUrl: "/placeholder.svg?height=400&width=600",
    rating: 4.7,
    reviewCount: 98,
    level: "intermediate",
    duration: "15 hours",
    price: 299,
    relevanceScore: 0.85,
    relevanceReason: "Complementary to your dermal filler skill development",
  },
  {
    id: "c4",
    title: "Complication Management in Aesthetics",
    description: "Learn to identify, prevent, and manage complications in aesthetic procedures.",
    instructor: "Dr. James Wilson",
    thumbnailUrl: "/placeholder.svg?height=400&width=600",
    rating: 4.9,
    reviewCount: 134,
    level: "advanced",
    duration: "10 hours",
    price: 349,
    relevanceScore: 0.8,
    relevanceReason: "Essential knowledge for injection specialists",
  },
  {
    id: "c5",
    title: "Business Fundamentals for Aesthetic Practitioners",
    description: "Build and grow a successful aesthetic practice with proven business strategies.",
    instructor: "Dr. Jennifer Adams",
    thumbnailUrl: "/placeholder.svg?height=400&width=600",
    rating: 4.6,
    reviewCount: 87,
    level: "beginner",
    duration: "8 hours",
    price: 199,
    relevanceScore: 0.75,
    relevanceReason: "Matches your interest in business development",
  },
  {
    id: "c6",
    title: "Laser Therapy Essentials",
    description: "Fundamental principles and applications of laser therapy in aesthetics.",
    instructor: "Dr. Lisa Thompson",
    thumbnailUrl: "/placeholder.svg?height=400&width=600",
    rating: 4.5,
    reviewCount: 76,
    level: "beginner",
    duration: "6 hours",
    price: 149,
    relevanceScore: 0.7,
    relevanceReason: "Expands your aesthetic treatment knowledge",
  },
  {
    id: "c7",
    title: "Chemical Peel Protocols",
    description: "Comprehensive training in chemical peel procedures and protocols.",
    instructor: "Dr. Robert Kim",
    thumbnailUrl: "/placeholder.svg?height=400&width=600",
    rating: 4.7,
    reviewCount: 92,
    level: "intermediate",
    duration: "7 hours",
    price: 179,
    relevanceScore: 0.65,
    relevanceReason: "Complementary to your injection skills",
  },
  {
    id: "c8",
    title: "Advanced Facial Assessment",
    description: "Learn to perform comprehensive facial assessment for personalized treatment planning.",
    instructor: "Dr. Sarah Johnson",
    thumbnailUrl: "/placeholder.svg?height=400&width=600",
    rating: 4.8,
    reviewCount: 108,
    level: "advanced",
    duration: "9 hours",
    price: 279,
    relevanceScore: 0.95,
    relevanceReason: "Builds on your facial anatomy knowledge",
  },
  {
    id: "c9",
    title: "Injectable Rhinoplasty Techniques",
    description: "Master non-surgical rhinoplasty using advanced injection techniques.",
    instructor: "Dr. Michael Chen",
    thumbnailUrl: "/placeholder.svg?height=400&width=600",
    rating: 4.9,
    reviewCount: 87,
    level: "advanced",
    duration: "6 hours",
    price: 329,
    relevanceScore: 0.85,
    relevanceReason: "Advanced application of your injection skills",
  },
  {
    id: "c10",
    title: "Patient Psychology in Aesthetics",
    description: "Understanding psychological aspects of aesthetic medicine for better patient outcomes.",
    instructor: "Dr. Rachel Green",
    thumbnailUrl: "/placeholder.svg?height=400&width=600",
    rating: 4.6,
    reviewCount: 64,
    level: "intermediate",
    duration: "5 hours",
    price: 149,
    relevanceScore: 0.7,
    relevanceReason: "Essential for patient-centered aesthetic practice",
  },
]

// Mock learning pathways
const mockPathways: PathwayRecommendation[] = [
  {
    id: "p1",
    title: "Advanced Injector Certification",
    description: "Comprehensive pathway to become a certified advanced injector.",
    courseCount: 5,
    estimatedDuration: "50 hours",
    thumbnailUrl: "/placeholder.svg?height=400&width=600",
    relevanceScore: 0.9,
    relevanceReason: "Aligns with your focus on injection techniques",
  },
  {
    id: "p2",
    title: "Facial Aesthetics Specialist",
    description: "Become a specialist in comprehensive facial aesthetic treatments.",
    courseCount: 6,
    estimatedDuration: "60 hours",
    thumbnailUrl: "/placeholder.svg?height=400&width=600",
    relevanceScore: 0.85,
    relevanceReason: "Builds on your facial anatomy knowledge",
  },
  {
    id: "p3",
    title: "Aesthetic Practice Builder",
    description: "Launch and grow a successful aesthetic practice from the ground up.",
    courseCount: 4,
    estimatedDuration: "30 hours",
    thumbnailUrl: "/placeholder.svg?height=400&width=600",
    relevanceScore: 0.7,
    relevanceReason: "Matches your interest in business development",
  },
  {
    id: "p4",
    title: "Combined Treatment Specialist",
    description: "Master the art of combining different aesthetic treatments for optimal results.",
    courseCount: 5,
    estimatedDuration: "45 hours",
    thumbnailUrl: "/placeholder.svg?height=400&width=600",
    relevanceScore: 0.8,
    relevanceReason: "Next step in your aesthetic education journey",
  },
]

// Get user profile
export async function getUserProfile(): Promise<UserProfile> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))
  return { ...mockUserProfile }
}

// Update user profile
export async function updateUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Update the mock profile
  Object.assign(mockUserProfile, profile)

  return { ...mockUserProfile }
}

// Get personalized course recommendations
export async function getRecommendedCourses(limit = 4): Promise<CourseRecommendation[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // In a real implementation, this would use ML algorithms to analyze user behavior
  // and recommend relevant courses based on interests, history, etc.

  // For demo purposes, sort by relevance score and return top N
  return [...mockCourses].sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, limit)
}

// Get recommended learning pathways
export async function getRecommendedPathways(limit = 3): Promise<PathwayRecommendation[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 400))

  // Return sorted pathways
  return [...mockPathways].sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, limit)
}

// Get courses similar to a specific course
export async function getSimilarCourses(courseId: string, limit = 3): Promise<CourseRecommendation[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 400))

  // For demo, filter out the specified course and return others
  return mockCourses
    .filter((course) => course.id !== courseId)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit)
}

// Get "because you viewed X" recommendations
export async function getRecommendationsBasedOnView(
  itemId: string,
  itemType: "course" | "resource",
  limit = 3,
): Promise<CourseRecommendation[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 400))

  // For demo, return a subset of courses with modified relevance reasons
  return mockCourses.slice(0, limit).map((course) => ({
    ...course,
    relevanceReason: `Because you viewed ${itemType} "${mockCourses.find((c) => c.id === itemId)?.title || "this item"}"`,
  }))
}

// Get recommendations based on user's skill goals
export async function getSkillBasedRecommendations(limit = 3): Promise<CourseRecommendation[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 400))

  // Use the user's skill levels to recommend courses that help advance skills
  // For demo, return a subset of courses with skill-related relevance reasons
  return mockCourses.slice(2, 2 + limit).map((course) => ({
    ...course,
    relevanceReason: "Helps you advance your skills in " + course.title.split(" ")[0],
  }))
}

// Get trending or popular courses in user's interest areas
export async function getTrendingRecommendations(limit = 3): Promise<CourseRecommendation[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 400))

  // For demo, return a subset of courses with trending-related relevance reasons
  return mockCourses.slice(5, 5 + limit).map((course) => ({
    ...course,
    relevanceReason: "Trending in " + mockUserProfile.interests[0].topic.replace("-", " "),
  }))
}

// Log user interaction to improve recommendations
export async function logUserInteraction(
  interactionType: "view" | "complete" | "save" | "search",
  itemType: RecommendationType,
  itemId: string,
): Promise<void> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200))

  // In a real implementation, this would store the interaction for later analysis
  console.log(`Logged user interaction: ${interactionType} ${itemType} ${itemId}`)

  // For demo, update the mock user profile based on the interaction
  if (interactionType === "view" && itemType === "resource") {
    if (!mockUserProfile.viewedResourceIds.includes(itemId)) {
      mockUserProfile.viewedResourceIds.push(itemId)
    }
  } else if (interactionType === "save" && itemType === "resource") {
    if (!mockUserProfile.savedResourceIds.includes(itemId)) {
      mockUserProfile.savedResourceIds.push(itemId)
    }
  } else if (interactionType === "complete" && itemType === "course") {
    if (!mockUserProfile.completedCourseIds.includes(itemId)) {
      mockUserProfile.completedCourseIds.push(itemId)
      // Remove from in-progress if it's there
      const inProgressIndex = mockUserProfile.inProgressCourseIds.indexOf(itemId)
      if (inProgressIndex > -1) {
        mockUserProfile.inProgressCourseIds.splice(inProgressIndex, 1)
      }
    }
  } else if (interactionType === "view" && itemType === "course") {
    if (!mockUserProfile.inProgressCourseIds.includes(itemId) && !mockUserProfile.completedCourseIds.includes(itemId)) {
      mockUserProfile.inProgressCourseIds.push(itemId)
    }
  } else if (interactionType === "search") {
    // Add to recent searches, keeping only the 5 most recent
    mockUserProfile.recentSearches = [itemId, ...mockUserProfile.recentSearches.slice(0, 4)]
  }
}
