"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

type User = {
  id: string
  name: string
  email: string
  image?: string
}

type AuthContextType = {
  user: User | null
  role: "admin" | "instructor" | "student" | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

// Mock users for demonstration
const mockUsers = {
  admin: {
    id: "1",
    name: "Admin User",
    email: "admin@doctrina.com",
    role: "admin",
    password: "password",
  },
  instructor: {
    id: "2",
    name: "Dr. Sarah Johnson",
    email: "instructor@doctrina.com",
    role: "instructor",
    password: "password",
  },
  student: {
    id: "3",
    name: "Michael Chen",
    email: "student@doctrina.com",
    role: "student",
    password: "password",
  },
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize with the admin user for demonstration purposes
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<"admin" | "instructor" | "student" | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Auto-login with admin user for demonstration
  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    const savedRole = localStorage.getItem("role")

    if (savedUser && savedRole) {
      setUser(JSON.parse(savedUser))
      setRole(savedRole as "admin" | "instructor" | "student")
    } else {
      // Auto-login as admin for demonstration
      const adminUser = {
        id: mockUsers.admin.id,
        name: mockUsers.admin.name,
        email: mockUsers.admin.email,
      }
      setUser(adminUser)
      setRole("admin")
      localStorage.setItem("user", JSON.stringify(adminUser))
      localStorage.setItem("role", "admin")
    }

    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    let foundUser = null
    let foundRole = null

    if (email === mockUsers.admin.email && password === mockUsers.admin.password) {
      foundUser = {
        id: mockUsers.admin.id,
        name: mockUsers.admin.name,
        email: mockUsers.admin.email,
      }
      foundRole = "admin"
    } else if (email === mockUsers.instructor.email && password === mockUsers.instructor.password) {
      foundUser = {
        id: mockUsers.instructor.id,
        name: mockUsers.instructor.name,
        email: mockUsers.instructor.email,
      }
      foundRole = "instructor"
    } else if (email === mockUsers.student.email && password === mockUsers.student.password) {
      foundUser = {
        id: mockUsers.student.id,
        name: mockUsers.student.name,
        email: mockUsers.student.email,
      }
      foundRole = "student"
    } else {
      setIsLoading(false)
      throw new Error("Invalid credentials")
    }

    setUser(foundUser)
    setRole(foundRole)
    localStorage.setItem("user", JSON.stringify(foundUser))
    localStorage.setItem("role", foundRole)
    setIsLoading(false)
  }

  const logout = () => {
    // For demo purposes, instead of logging out completely, we'll switch to the admin user
    const adminUser = {
      id: mockUsers.admin.id,
      name: mockUsers.admin.name,
      email: mockUsers.admin.email,
    }
    setUser(adminUser)
    setRole("admin")
    localStorage.setItem("user", JSON.stringify(adminUser))
    localStorage.setItem("role", "admin")
  }

  return <AuthContext.Provider value={{ user, role, isLoading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
