"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HomePage() {
  const { user } = useAuth()
  const router = useRouter()

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  // If already logged in, show loading while redirecting
  if (user) {
    return <div className="container py-10">Redirecting to dashboard...</div>
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <section className="flex-1 flex flex-col items-center justify-center text-center p-4 md:p-8">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">Doctrina</h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl">
          The premier educational platform for medical aesthetics professionals
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">Log In</Link>
          </Button>
        </div>
      </section>

      <section className="bg-muted py-12 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Why Choose Doctrina?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold mb-2">Expert-Led Courses</h3>
              <p className="text-muted-foreground">
                Learn from industry-leading practitioners with years of experience
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold mb-2">Comprehensive Curriculum</h3>
              <p className="text-muted-foreground">
                From fundamentals to advanced techniques, our courses cover it all
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold mb-2">Certification Programs</h3>
              <p className="text-muted-foreground">Earn industry-recognized certifications to advance your career</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
