"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

const validRoles = ["super-admin", "tenant-admin", "agent", "customer"]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const params = useParams()
  const { user, isAuthenticated, loading } = useAuth()
  const role = params?.role as string

  useEffect(() => {
    // Wait for auth to load
    if (loading) return

    // If not authenticated, redirect to login
    if (!isAuthenticated || !user) {
      router.push("/login")
      return
    }

    // Validate role
    if (!validRoles.includes(role)) {
      // Redirect to user's role dashboard if invalid role
      if (user.role) {
        router.push(`/dashboard/${user.role}`)
      } else {
        router.push("/login")
      }
      return
    }

    // Check if user is accessing correct role dashboard
    if (user.role !== role && user.role !== "super-admin") {
      // Super admin can access any dashboard, others should be redirected
      router.push(`/dashboard/${user.role}`)
    }
  }, [loading, isAuthenticated, user, role, router])

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated (redirect will happen)
  if (!isAuthenticated || !user) {
    return null
  }

  // Don't render if invalid role (redirect will happen)
  if (!validRoles.includes(role)) {
    return null
  }

  // Don't render if wrong role (redirect will happen)
  if (user.role !== role && user.role !== "super-admin") {
    return null
  }

  return <>{children}</>
}
