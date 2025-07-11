// This is a mock service that would be replaced with actual API calls in production
// In a real implementation, this would connect to a WebRTC service like Twilio, Agora, or Daily.co

export type LiveSession = {
  id: string
  title: string
  description: string
  instructorId: string
  instructorName: string
  instructorImage: string
  scheduledFor: Date
  duration: number // in minutes
  isRecorded: boolean
  maxParticipants: number
  participants: string[] // user IDs
  status: "scheduled" | "live" | "completed" | "cancelled"
  recordingUrl?: string
}

// Mock data
const liveSessions: LiveSession[] = [
  {
    id: "1",
    title: "Q&A: Advanced Botox Applications",
    description:
      "Join Dr. Johnson for a live Q&A session on advanced Botox applications. Bring your questions and case studies for discussion.",
    instructorId: "instructor-1",
    instructorName: "Dr. Sarah Johnson",
    instructorImage: "/placeholder.svg?height=40&width=40",
    scheduledFor: new Date(Date.now() + 86400000), // tomorrow
    duration: 60,
    isRecorded: true,
    maxParticipants: 100,
    participants: ["user-1", "user-2", "user-3"],
    status: "scheduled",
  },
  {
    id: "2",
    title: "Live Demo: Facial Contouring Techniques",
    description:
      "Watch Dr. Chen demonstrate the latest facial contouring techniques using dermal fillers on a live model.",
    instructorId: "instructor-2",
    instructorName: "Dr. Michael Chen",
    instructorImage: "/placeholder.svg?height=40&width=40",
    scheduledFor: new Date(Date.now() + 172800000), // day after tomorrow
    duration: 90,
    isRecorded: true,
    maxParticipants: 150,
    participants: ["user-4", "user-5", "user-6", "user-7"],
    status: "scheduled",
  },
  {
    id: "3",
    title: "Complications Management in Aesthetic Medicine",
    description:
      "This session covered how to identify, prevent, and manage complications that may arise during aesthetic procedures.",
    instructorId: "instructor-3",
    instructorName: "Dr. Emily Rodriguez",
    instructorImage: "/placeholder.svg?height=40&width=40",
    scheduledFor: new Date(Date.now() - 345600000), // 4 days ago
    duration: 75,
    isRecorded: true,
    maxParticipants: 200,
    participants: ["user-8", "user-9", "user-10", "user-11", "user-12"],
    status: "completed",
    recordingUrl: "/recordings/session-3.mp4",
  },
  {
    id: "4",
    title: "Business Strategies for Aesthetic Practices",
    description:
      "Learn effective business strategies to grow your aesthetic practice, including marketing, patient retention, and financial management.",
    instructorId: "instructor-4",
    instructorName: "Dr. James Wilson",
    instructorImage: "/placeholder.svg?height=40&width=40",
    scheduledFor: new Date(Date.now() - 604800000), // 7 days ago
    duration: 60,
    isRecorded: true,
    maxParticipants: 120,
    participants: ["user-13", "user-14", "user-15"],
    status: "completed",
    recordingUrl: "/recordings/session-4.mp4",
  },
]

export const getLiveSessions = () => {
  return [...liveSessions]
}

export const getLiveSessionById = (id: string) => {
  return liveSessions.find((session) => session.id === id)
}

export const getUpcomingSessions = () => {
  return liveSessions.filter((session) => session.status === "scheduled")
}

export const getPastSessions = () => {
  return liveSessions.filter((session) => session.status === "completed")
}

export const createLiveSession = (session: Omit<LiveSession, "id" | "status" | "participants">) => {
  const newSession: LiveSession = {
    ...session,
    id: `session-${liveSessions.length + 1}`,
    status: "scheduled",
    participants: [],
  }
  liveSessions.push(newSession)
  return newSession
}

export const updateLiveSession = (id: string, updates: Partial<LiveSession>) => {
  const index = liveSessions.findIndex((session) => session.id === id)
  if (index !== -1) {
    liveSessions[index] = { ...liveSessions[index], ...updates }
    return liveSessions[index]
  }
  return null
}

export const deleteLiveSession = (id: string) => {
  const index = liveSessions.findIndex((session) => session.id === id)
  if (index !== -1) {
    const deleted = liveSessions.splice(index, 1)
    return deleted[0]
  }
  return null
}

export const joinSession = (sessionId: string, userId: string) => {
  const session = getLiveSessionById(sessionId)
  if (session && !session.participants.includes(userId)) {
    session.participants.push(userId)
    return true
  }
  return false
}

export const leaveSession = (sessionId: string, userId: string) => {
  const session = getLiveSessionById(sessionId)
  if (session) {
    const index = session.participants.indexOf(userId)
    if (index !== -1) {
      session.participants.splice(index, 1)
      return true
    }
  }
  return false
}

export const startSession = (sessionId: string) => {
  const session = getLiveSessionById(sessionId)
  if (session && session.status === "scheduled") {
    session.status = "live"
    return session
  }
  return null
}

export const endSession = (sessionId: string) => {
  const session = getLiveSessionById(sessionId)
  if (session && session.status === "live") {
    session.status = "completed"
    if (session.isRecorded) {
      session.recordingUrl = `/recordings/session-${session.id}.mp4`
    }
    return session
  }
  return null
}

export const cancelSession = (sessionId: string) => {
  const session = getLiveSessionById(sessionId)
  if (session && session.status === "scheduled") {
    session.status = "cancelled"
    return session
  }
  return null
}
