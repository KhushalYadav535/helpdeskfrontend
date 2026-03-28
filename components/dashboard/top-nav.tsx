"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { NotificationDropdown } from "@/components/notifications/notification-dropdown"
import { GlobalSearchBar } from "@/components/search/global-search-bar"
import { UserProfileDropdown } from "@/components/user/user-profile-dropdown"

interface TopNavProps {
  userName?: string
  userRole?: string
  userEmail?: string
  tenantName?: string
  notificationCount?: number
}

export function TopNav({
  userName = "User",
  userRole = "agent",
  userEmail,
  tenantName,
  notificationCount = 0,
}: TopNavProps) {
  const [isSearchActive, setIsSearchActive] = useState(false)

  return (
    <header className="sticky top-0 z-20 bg-card/95 backdrop-blur border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Search Bar (UIX-004) */}
        <div className="hidden sm:block">
          <GlobalSearchBar />
        </div>
        <Button variant="ghost" size="icon" className="sm:hidden" onClick={() => setIsSearchActive(!isSearchActive)}>
          <Search className="h-5 w-5" />
        </Button>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications (UIX-003) */}
          <NotificationDropdown />

          {/* User Profile (UIX-005) */}
          <UserProfileDropdown
            userName={userName}
            userRole={userRole}
            userEmail={userEmail}
            tenantName={tenantName}
          />
        </div>
      </div>

      {/* Mobile Search — same live search as desktop (UIX-004) */}
      {isSearchActive && (
        <div className="sm:hidden px-4 pb-4 border-t border-border bg-card/95">
          <GlobalSearchBar />
        </div>
      )}
    </header>
  )
}
