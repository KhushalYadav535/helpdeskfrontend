"use client"

import { Button } from "@/components/ui/button"
import { Bell, Search, User } from "lucide-react"
import { Input } from "@/components/ui/input"

interface HeaderProps {
  title: string
  subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between p-4 sm:p-6 max-w-full">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-4 lg:gap-6">
          {/* Search - hidden on mobile */}
          <div className="hidden md:flex items-center gap-2 bg-card rounded-lg border border-border px-3 py-2 w-56">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search..." className="border-0 bg-transparent outline-none text-sm w-full" />
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
          </Button>

          {/* User menu */}
          <Button variant="ghost" size="icon">
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
