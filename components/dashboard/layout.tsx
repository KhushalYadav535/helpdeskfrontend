"use client"

import type React from "react"
import { Sidebar } from "./sidebar"
import { TopNav } from "./top-nav"

interface SidebarItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: number
}

interface DashboardLayoutProps {
  children: React.ReactNode
  sidebarItems: SidebarItem[]
  sidebarTitle: string
  userRole: string
  userName?: string
  notificationCount?: number
}

export function DashboardLayout({
  children,
  sidebarItems,
  sidebarTitle,
  userRole,
  userName,
  notificationCount,
}: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar items={sidebarItems} title={sidebarTitle} userRole={userRole} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <TopNav userName={userName} notificationCount={notificationCount} />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
