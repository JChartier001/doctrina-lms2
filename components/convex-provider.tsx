"use client"

import type React from "react"
import { useEffect } from "react"
import { ConvexProviderWithClerk } from "convex/react-clerk"
import { useAuth as useClerkAuth } from "@clerk/nextjs"
import { convex } from "@/lib/convexClient"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"

export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  const useAuth = useClerkAuth
  const ensure = useMutation(api.users.ensureCurrentUser)
  const { isSignedIn } = useClerkAuth()

  useEffect(() => {
    if (isSignedIn) {
      ensure().catch(() => {})
    }
  }, [isSignedIn, ensure])

  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  )
}
