"use client"

import { Bell, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useState } from "react"

interface TopNavProps {
  userName?: string
  notificationCount?: number
}

export function TopNav({ userName = "User", notificationCount = 0 }: TopNavProps) {
  const [isSearchActive, setIsSearchActive] = useState(false)

  return (
    <header className="sticky top-0 z-20 bg-card border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative hidden sm:flex">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search..." className="pl-10 h-10 bg-input border-border" />
          </div>
          <Button variant="ghost" size="icon" className="sm:hidden" onClick={() => setIsSearchActive(!isSearchActive)}>
            <Search className="h-5 w-5" />
          </Button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </Button>

          {/* User Profile */}
          <Button variant="ghost" size="icon" className="gap-2">
            <User className="h-5 w-5" />
            <span className="hidden sm:inline text-sm">{userName}</span>
          </Button>
        </div>
      </div>

      {/* Mobile Search */}
      {isSearchActive && (
        <div className="sm:hidden px-4 pb-4">
          <Input type="search" placeholder="Search..." className="w-full h-10 bg-input border-border" autoFocus />
        </div>
      )}
    </header>
  )
}
