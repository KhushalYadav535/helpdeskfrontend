"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { Menu, X, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SidebarItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: number
}

interface SidebarProps {
  items: SidebarItem[]
  title: string
  userRole: string
}

const LIGHT_NAV_GRADIENTS = [
  "from-blue-500 to-cyan-400",
  "from-violet-500 to-purple-400",
  "from-teal-500 to-emerald-400",
  "from-emerald-500 to-green-500",
  "from-indigo-600 to-violet-500",
]

export function Sidebar({ items, title, userRole }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { resolvedTheme } = useTheme()
  const isLight = resolvedTheme === "light"

  const handleLogout = () => {
    localStorage.removeItem("userRole")
    window.location.href = "/"
  }

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="bg-card border border-border">
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 z-40 lg:relative lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Title - TICKLY-style */}
          <div className="p-6 border-b border-sidebar-border min-w-0">
            <h1 className="text-xl font-bold text-sidebar-foreground truncate tracking-tight" title={title}>{title}</h1>
            <p className="text-sm text-sidebar-foreground/70 capitalize truncate mt-0.5" title={userRole}>{userRole}</p>
          </div>

          {/* Navigation Items - TICKLY-style gradient cards in light mode */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {items.map((item, index) => {
              const isActive = pathname === item.href
              const gradient = isLight ? LIGHT_NAV_GRADIENTS[index % LIGHT_NAV_GRADIENTS.length] : null
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ease-out relative group",
                    isLight && gradient
                      ? isActive
                        ? `bg-gradient-to-r ${gradient} text-white shadow-md ring-2 ring-white/20`
                        : `bg-gradient-to-r ${gradient} text-white/90 hover:text-white hover:shadow-md hover:scale-[1.02] active:scale-[0.98]`
                      : isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/20",
                  )}
                >
                  <span className="[&_svg]:size-5 shrink-0">{item.icon}</span>
                  <span className="flex-1 text-sm font-medium truncate min-w-0">{item.label}</span>
                  {item.badge != null && (
                    <span className={cn(
                      "shrink-0 text-xs font-medium rounded-full min-w-5 h-5 flex items-center justify-center",
                      isLight ? "bg-white/25 text-white" : "bg-red-500 text-white",
                    )}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Logout - in light mode use subtle style, TICKLY-style */}
          <div className="p-4 border-t border-sidebar-border">
            <Button
              onClick={handleLogout}
              variant="outline"
              className={cn(
                "w-full justify-start gap-2 rounded-xl",
                isLight
                  ? "border-sidebar-border text-sidebar-foreground hover:bg-white/50 bg-white/80 shadow-sm"
                  : "border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent/20 bg-transparent",
              )}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
