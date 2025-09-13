"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"

export default function NewCoursePage() {
  const router = useRouter()
  const { user, role } = useAuth()

  useEffect(() => {
    if (!user || role !== "instructor") {
      router.push("/sign-in")
      return
    }

    // Redirect to the new course wizard
    router.push("/instructor/courses/wizard")
  }, [user, role, router])

  return (
    <div className="container py-10">
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold mb-4">Redirecting to Course Wizard...</h1>
        <p className="text-muted-foreground">Please wait while we redirect you to our new course creation wizard.</p>
      </div>
    </div>
  )
}
