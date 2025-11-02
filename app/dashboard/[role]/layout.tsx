import type React from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Dashboard | Helpdesk",
}

const validRoles = ["super-admin", "tenant-admin", "agent", "customer"]

export default function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { role: string }
}) {
  const { role } = params

  // Validate role
  if (!validRoles.includes(role)) {
    notFound()
  }

  return <>{children}</>
}
