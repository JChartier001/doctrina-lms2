// Resource Library Service
// This service handles the management of educational resources

export type ResourceType = "pdf" | "video" | "article" | "tool" | "template" | "guide" | "research" | "case-study"

export type ResourceCategory =
  | "facial-anatomy"
  | "injection-techniques"
  | "laser-therapy"
  | "dermal-fillers"
  | "botox"
  | "chemical-peels"
  | "skincare"
  | "business"
  | "patient-care"
  | "regulations"
  | "complications"

export interface Resource {
  id: string
  title: string
  description: string
  type: ResourceType
  categories: ResourceCategory[]
  tags: string[]
  url: string
  thumbnailUrl?: string
  author: string
  dateAdded: string
  featured: boolean
  downloadCount: number
  favoriteCount: number
  rating: number
  reviewCount: number
  difficulty: "beginner" | "intermediate" | "advanced"
  duration?: string // For videos, estimated reading time, etc.
  fileSize?: string // For downloadable resources
  courseId?: string // If associated with a specific course
  restricted: boolean // If true, only available to enrolled students or premium members
}

// Mock data for resources
const mockResources: Resource[] = [
  {
    id: "1",
    title: "Comprehensive Facial Anatomy Guide",
    description:
      "A detailed guide to facial anatomy for aesthetic practitioners, including muscles, nerves, and vascular structures.",
    type: "pdf",
    categories: ["facial-anatomy"],
    tags: ["anatomy", "reference", "facial-muscles", "nerves"],
    url: "#",
    thumbnailUrl: "/placeholder.svg?height=400&width=600",
    author: "Dr. Sarah Johnson",
    dateAdded: "2023-01-15",
    featured: true,
    downloadCount: 1245,
    favoriteCount: 328,
    rating: 4.8,
    reviewCount: 156,
    difficulty: "intermediate",
    fileSize: "8.5 MB",
    restricted: false,
  },
  {
    id: "2",
    title: "Advanced Botox Injection Techniques",
    description: "Video demonstration of advanced Botox injection techniques for aesthetic practitioners.",
    type: "video",
    categories: ["injection-techniques", "botox"],
    tags: ["botox", "injection", "techniques", "advanced"],
    url: "#",
    thumbnailUrl: "/placeholder.svg?height=400&width=600",
    author: "Dr. Michael Chen",
    dateAdded: "2023-02-20",
    featured: true,
    downloadCount: 987,
    favoriteCount: 245,
    rating: 4.9,
    reviewCount: 112,
    difficulty: "advanced",
    duration: "45 minutes",
    restricted: false,
  },
  {
    id: "3",
    title: "Dermal Filler Selection Guide",
    description:
      "A comprehensive guide to selecting the appropriate dermal filler for different facial areas and concerns.",
    type: "pdf",
    categories: ["dermal-fillers"],
    tags: ["fillers", "selection", "guide", "facial-areas"],
    url: "#",
    thumbnailUrl: "/placeholder.svg?height=400&width=600",
    author: "Dr. Emily Rodriguez",
    dateAdded: "2023-03-10",
    featured: false,
    downloadCount: 856,
    favoriteCount: 198,
    rating: 4.7,
    reviewCount: 89,
    difficulty: "intermediate",
    fileSize: "5.2 MB",
    restricted: false,
  },
  {
    id: "4",
    title: "Managing Complications in Aesthetic Procedures",
    description:
      "A comprehensive guide to recognizing and managing complications in aesthetic procedures, including prevention strategies.",
    type: "guide",
    categories: ["complications", "patient-care"],
    tags: ["complications", "management", "prevention", "safety"],
    url: "#",
    thumbnailUrl: "/placeholder.svg?height=400&width=600",
    author: "Dr. James Wilson",
    dateAdded: "2023-04-05",
    featured: true,
    downloadCount: 1102,
    favoriteCount: 287,
    rating: 4.9,
    reviewCount: 134,
    difficulty: "advanced",
    fileSize: "12.8 MB",
    restricted: false,
  },
  {
    id: "5",
    title: "Laser Therapy Parameters Calculator",
    description:
      "An interactive tool for calculating laser therapy parameters based on skin type, condition, and device.",
    type: "tool",
    categories: ["laser-therapy"],
    tags: ["laser", "calculator", "parameters", "settings"],
    url: "#",
    thumbnailUrl: "/placeholder.svg?height=400&width=600",
    author: "Dr. Lisa Thompson",
    dateAdded: "2023-05-12",
    featured: false,
    downloadCount: 765,
    favoriteCount: 156,
    rating: 4.6,
    reviewCount: 78,
    difficulty: "intermediate",
    restricted: true,
  },
  {
    id: "6",
    title: "Chemical Peel Protocols",
    description: "Standardized protocols for different types of chemical peels, including pre and post-treatment care.",
    type: "template",
    categories: ["chemical-peels"],
    tags: ["chemical-peel", "protocol", "treatment", "skincare"],
    url: "#",
    thumbnailUrl: "/placeholder.svg?height=400&width=600",
    author: "Dr. Robert Kim",
    dateAdded: "2023-06-18",
    featured: false,
    downloadCount: 543,
    favoriteCount: 112,
    rating: 4.5,
    reviewCount: 67,
    difficulty: "intermediate",
    fileSize: "3.4 MB",
    restricted: false,
  },
  {
    id: "7",
    title: "Building a Successful Aesthetic Practice",
    description:
      "A comprehensive guide to building and growing a successful aesthetic practice, including marketing strategies.",
    type: "guide",
    categories: ["business"],
    tags: ["business", "marketing", "practice-management", "growth"],
    url: "#",
    thumbnailUrl: "/placeholder.svg?height=400&width=600",
    author: "Dr. Jennifer Adams",
    dateAdded: "2023-07-22",
    featured: true,
    downloadCount: 876,
    favoriteCount: 234,
    rating: 4.8,
    reviewCount: 98,
    difficulty: "intermediate",
    fileSize: "9.7 MB",
    restricted: false,
  },
  {
    id: "8",
    title: "Patient Assessment Form Template",
    description:
      "A comprehensive template for patient assessment in aesthetic medicine, including medical history and treatment goals.",
    type: "template",
    categories: ["patient-care"],
    tags: ["assessment", "template", "form", "patient"],
    url: "#",
    thumbnailUrl: "/placeholder.svg?height=400&width=600",
    author: "Dr. David Martinez",
    dateAdded: "2023-08-15",
    featured: false,
    downloadCount: 654,
    favoriteCount: 187,
    rating: 4.7,
    reviewCount: 76,
    difficulty: "beginner",
    fileSize: "2.1 MB",
    restricted: false,
  },
  {
    id: "9",
    title: "Regulatory Compliance in Aesthetic Medicine",
    description:
      "An overview of regulatory requirements for aesthetic practitioners, including licensing and documentation.",
    type: "article",
    categories: ["regulations"],
    tags: ["regulations", "compliance", "legal", "documentation"],
    url: "#",
    thumbnailUrl: "/placeholder.svg?height=400&width=600",
    author: "Dr. Michelle Lee",
    dateAdded: "2023-09-10",
    featured: false,
    downloadCount: 432,
    favoriteCount: 98,
    rating: 4.5,
    reviewCount: 54,
    difficulty: "intermediate",
    restricted: false,
  },
  {
    id: "10",
    title: "Advanced Skincare Formulations",
    description: "A detailed guide to skincare formulations and ingredients for aesthetic practitioners.",
    type: "research",
    categories: ["skincare"],
    tags: ["skincare", "formulations", "ingredients", "advanced"],
    url: "#",
    thumbnailUrl: "/placeholder.svg?height=400&width=600",
    author: "Dr. Rachel Green",
    dateAdded: "2023-10-05",
    featured: false,
    downloadCount: 543,
    favoriteCount: 132,
    rating: 4.6,
    reviewCount: 67,
    difficulty: "advanced",
    fileSize: "7.8 MB",
    restricted: true,
  },
  {
    id: "11",
    title: "Case Studies in Facial Rejuvenation",
    description: "A collection of case studies demonstrating different approaches to facial rejuvenation.",
    type: "case-study",
    categories: ["dermal-fillers", "botox", "laser-therapy"],
    tags: ["case-study", "rejuvenation", "combination-therapy"],
    url: "#",
    thumbnailUrl: "/placeholder.svg?height=400&width=600",
    author: "Dr. Thomas Brown",
    dateAdded: "2023-11-12",
    featured: true,
    downloadCount: 765,
    favoriteCount: 198,
    rating: 4.8,
    reviewCount: 87,
    difficulty: "advanced",
    fileSize: "15.3 MB",
    restricted: true,
  },
  {
    id: "12",
    title: "Injection Anatomy: Danger Zones",
    description: "A detailed guide to anatomical danger zones for injectable treatments, with emphasis on safety.",
    type: "video",
    categories: ["facial-anatomy", "injection-techniques"],
    tags: ["anatomy", "danger-zones", "safety", "injection"],
    url: "#",
    thumbnailUrl: "/placeholder.svg?height=400&width=600",
    author: "Dr. Sarah Johnson",
    dateAdded: "2023-12-08",
    featured: true,
    downloadCount: 987,
    favoriteCount: 276,
    rating: 4.9,
    reviewCount: 124,
    difficulty: "advanced",
    duration: "60 minutes",
    restricted: false,
  },
]

// User's favorite resources
const userFavorites: string[] = []

// Get all resources
export async function getAllResources(): Promise<Resource[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return [...mockResources]
}

// Get featured resources
export async function getFeaturedResources(limit = 4): Promise<Resource[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockResources.filter((resource) => resource.featured).slice(0, limit)
}

// Get resource by ID
export async function getResourceById(id: string): Promise<Resource | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))
  const resource = mockResources.find((r) => r.id === id)
  return resource || null
}

// Search resources
export async function searchResources(
  query: string,
  filters?: {
    types?: ResourceType[]
    categories?: ResourceCategory[]
    difficulty?: ("beginner" | "intermediate" | "advanced")[]
    restricted?: boolean
  },
): Promise<Resource[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const normalizedQuery = query.toLowerCase()

  return mockResources.filter((resource) => {
    // Apply search query
    const matchesQuery =
      !query ||
      resource.title.toLowerCase().includes(normalizedQuery) ||
      resource.description.toLowerCase().includes(normalizedQuery) ||
      resource.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery)) ||
      resource.author.toLowerCase().includes(normalizedQuery)

    // Apply type filter
    const matchesType = !filters?.types?.length || filters.types.includes(resource.type)

    // Apply category filter
    const matchesCategory =
      !filters?.categories?.length || resource.categories.some((category) => filters.categories?.includes(category))

    // Apply difficulty filter
    const matchesDifficulty = !filters?.difficulty?.length || filters.difficulty.includes(resource.difficulty)

    // Apply restricted filter
    const matchesRestricted = filters?.restricted === undefined || resource.restricted === filters.restricted

    return matchesQuery && matchesType && matchesCategory && matchesDifficulty && matchesRestricted
  })
}

// Get related resources
export async function getRelatedResources(resourceId: string, limit = 3): Promise<Resource[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const resource = mockResources.find((r) => r.id === resourceId)
  if (!resource) return []

  // Find resources with similar categories or tags
  const relatedResources = mockResources
    .filter((r) => r.id !== resourceId) // Exclude the current resource
    .map((r) => {
      // Calculate relevance score based on shared categories and tags
      const sharedCategories = r.categories.filter((category) => resource.categories.includes(category)).length
      const sharedTags = r.tags.filter((tag) => resource.tags.includes(tag)).length
      const relevanceScore = sharedCategories * 2 + sharedTags // Categories weighted more heavily

      return { resource: r, relevanceScore }
    })
    .filter((item) => item.relevanceScore > 0) // Only include resources with some relevance
    .sort((a, b) => b.relevanceScore - a.relevanceScore) // Sort by relevance score
    .slice(0, limit) // Limit the number of results
    .map((item) => item.resource) // Extract just the resource objects

  return relatedResources
}

// Get resources by category
export async function getResourcesByCategory(category: ResourceCategory, limit?: number): Promise<Resource[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const filteredResources = mockResources.filter((resource) => resource.categories.includes(category))
  return limit ? filteredResources.slice(0, limit) : filteredResources
}

// Get resources by type
export async function getResourcesByType(type: ResourceType, limit?: number): Promise<Resource[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const filteredResources = mockResources.filter((resource) => resource.type === type)
  return limit ? filteredResources.slice(0, limit) : filteredResources
}

// Get user's favorite resources
export async function getUserFavoriteResources(): Promise<Resource[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  return mockResources.filter((resource) => userFavorites.includes(resource.id))
}

// Add resource to favorites
export async function addResourceToFavorites(resourceId: string): Promise<boolean> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200))

  if (!userFavorites.includes(resourceId)) {
    userFavorites.push(resourceId)
    // Update the favorite count in the mock data
    const resourceIndex = mockResources.findIndex((r) => r.id === resourceId)
    if (resourceIndex !== -1) {
      mockResources[resourceIndex].favoriteCount += 1
    }
    return true
  }
  return false
}

// Remove resource from favorites
export async function removeResourceFromFavorites(resourceId: string): Promise<boolean> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200))

  const index = userFavorites.indexOf(resourceId)
  if (index !== -1) {
    userFavorites.splice(index, 1)
    // Update the favorite count in the mock data
    const resourceIndex = mockResources.findIndex((r) => r.id === resourceId)
    if (resourceIndex !== -1 && mockResources[resourceIndex].favoriteCount > 0) {
      mockResources[resourceIndex].favoriteCount -= 1
    }
    return true
  }
  return false
}

// Track resource download/view
export async function trackResourceAccess(resourceId: string): Promise<boolean> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200))

  const resourceIndex = mockResources.findIndex((r) => r.id === resourceId)
  if (resourceIndex !== -1) {
    mockResources[resourceIndex].downloadCount += 1
    return true
  }
  return false
}

// Get resource categories with counts
export async function getResourceCategories(): Promise<{ category: ResourceCategory; count: number }[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200))

  const categoryCounts: Record<ResourceCategory, number> = {
    "facial-anatomy": 0,
    "injection-techniques": 0,
    "laser-therapy": 0,
    "dermal-fillers": 0,
    botox: 0,
    "chemical-peels": 0,
    skincare: 0,
    business: 0,
    "patient-care": 0,
    regulations: 0,
    complications: 0,
  }

  // Count resources in each category
  mockResources.forEach((resource) => {
    resource.categories.forEach((category) => {
      categoryCounts[category] += 1
    })
  })

  // Convert to array format
  return Object.entries(categoryCounts).map(([category, count]) => ({
    category: category as ResourceCategory,
    count,
  }))
}

// Get resource types with counts
export async function getResourceTypes(): Promise<{ type: ResourceType; count: number }[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200))

  const typeCounts: Partial<Record<ResourceType, number>> = {}

  // Count resources of each type
  mockResources.forEach((resource) => {
    typeCounts[resource.type] = (typeCounts[resource.type] || 0) + 1
  })

  // Convert to array format
  return Object.entries(typeCounts).map(([type, count]) => ({
    type: type as ResourceType,
    count: count as number,
  }))
}

// Check if a resource is in user's favorites
export async function isResourceFavorited(resourceId: string): Promise<boolean> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100))

  return userFavorites.includes(resourceId)
}

// Get category name for display
export function getCategoryDisplayName(category: ResourceCategory): string {
  const displayNames: Record<ResourceCategory, string> = {
    "facial-anatomy": "Facial Anatomy",
    "injection-techniques": "Injection Techniques",
    "laser-therapy": "Laser Therapy",
    "dermal-fillers": "Dermal Fillers",
    botox: "Botox",
    "chemical-peels": "Chemical Peels",
    skincare: "Skincare",
    business: "Business",
    "patient-care": "Patient Care",
    regulations: "Regulations",
    complications: "Complications",
  }

  return displayNames[category] || category
}

// Get resource type name for display
export function getResourceTypeDisplayName(type: ResourceType): string {
  const displayNames: Record<ResourceType, string> = {
    pdf: "PDF Document",
    video: "Video",
    article: "Article",
    tool: "Interactive Tool",
    template: "Template",
    guide: "Guide",
    research: "Research Paper",
    "case-study": "Case Study",
  }

  return displayNames[type] || type
}

// Get resource type icon
export function getResourceTypeIcon(type: ResourceType): string {
  const icons: Record<ResourceType, string> = {
    pdf: "file-text",
    video: "video",
    article: "file-text",
    tool: "tool",
    template: "clipboard",
    guide: "book",
    research: "file-text",
    "case-study": "clipboard-list",
  }

  return icons[type] || "file"
}
