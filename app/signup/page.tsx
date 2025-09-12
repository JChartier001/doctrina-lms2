"use client"

import { SignUp } from "@clerk/nextjs"
import { useAuth } from "@/lib/auth"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SignupPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) router.push("/dashboard")
  }, [user, router])

  if (user) return <div className="container py-10">Redirecting to dashboard...</div>

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <SignUp appearance={{ elements: { rootBox: "w-full max-w-md" } }} afterSignUpUrl="/dashboard" />
    </div>
  )
}
