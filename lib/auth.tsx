"use client"

import type React from "react"
import { createContext, useContext, useMemo } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useUser, useClerk } from "@clerk/nextjs"

type Role = "admin" | "instructor" | "student"

type User = {
  id: string
  name: string
  email: string
  image?: string
  role: Role
}

type AuthContextType = {
  user: User | null
  role: Role | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string, role: Role | string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, user: clerkUser } = useUser()
  const { signOut } = useClerk()

  const convexUser = useQuery(
    isLoaded && isSignedIn && clerkUser?.id ? api.users.getByExternalId : undefined,
    isLoaded && isSignedIn && clerkUser?.id ? { externalId: clerkUser.id } : undefined,
  ) as any

  const user: User | null = useMemo(() => {
    if (!isLoaded || !isSignedIn || !clerkUser) return null
    if (convexUser) {
      return {
        id: convexUser._id,
        name: convexUser.name,
        email: convexUser.email,
        image: convexUser.image,
        role: convexUser.role as Role,
      }
    }
    return null
  }, [isLoaded, isSignedIn, clerkUser, convexUser])

  const isLoading = !isLoaded || (isSignedIn && !convexUser)

  const login = async () => {
    if (typeof window !== "undefined") window.location.assign("/sign-in")
    return true
  }

  const signup = async () => {
    if (typeof window !== "undefined") window.location.assign("/sign-up")
    return true
  }

  const logout = () => {
    void signOut()
  }

  return (
    <AuthContext.Provider value={{ user, role: user?.role ?? null, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
