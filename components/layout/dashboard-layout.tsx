"use client"

import type { ReactNode } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"

interface DashboardLayoutProps {
  children: ReactNode
  role: "super-admin" | "tenant-admin" | "agent" | "customer"
  title: string
  subtitle?: string
}

export function DashboardLayout({ children, role, title, subtitle }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar role={role} />

      <div className="flex-1 flex flex-col lg:ml-64">
        <Header title={title} subtitle={subtitle} />

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
