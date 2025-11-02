"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  TicketIcon,
  Settings,
  LogOut,
  Menu,
  X,
  Building2,
  MessageSquare,
  BarChart3,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  role: "super-admin" | "tenant-admin" | "agent" | "customer"
}

const navigationByRole = {
  "super-admin": [
    { label: "Dashboard", href: "/dashboard/super-admin", icon: LayoutDashboard },
    { label: "Tenants", href: "/dashboard/super-admin/tenants", icon: Building2 },
    { label: "Users", href: "/dashboard/super-admin/users", icon: Users },
    { label: "Analytics", href: "/dashboard/super-admin/analytics", icon: BarChart3 },
    { label: "Settings", href: "/dashboard/super-admin/settings", icon: Settings },
  ],
  "tenant-admin": [
    { label: "Dashboard", href: "/dashboard/tenant-admin", icon: LayoutDashboard },
    { label: "Agents", href: "/dashboard/tenant-admin/agents", icon: Users },
    { label: "Tickets", href: "/dashboard/tenant-admin/tickets", icon: TicketIcon },
    { label: "Analytics", href: "/dashboard/tenant-admin/analytics", icon: BarChart3 },
    { label: "Settings", href: "/dashboard/tenant-admin/settings", icon: Settings },
  ],
  agent: [
    { label: "Dashboard", href: "/dashboard/agent", icon: LayoutDashboard },
    { label: "My Tickets", href: "/dashboard/agent/tickets", icon: TicketIcon },
    { label: "Messages", href: "/dashboard/agent/messages", icon: MessageSquare },
    { label: "Profile", href: "/dashboard/agent/profile", icon: Users },
  ],
  customer: [
    { label: "Dashboard", href: "/dashboard/customer", icon: LayoutDashboard },
    { label: "My Tickets", href: "/dashboard/customer/tickets", icon: TicketIcon },
    { label: "Messages", href: "/dashboard/customer/messages", icon: MessageSquare },
    { label: "Help", href: "/dashboard/customer/help", icon: Users },
  ],
}

export function Sidebar({ role }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const navigation = navigationByRole[role]

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-40"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X /> : <Menu />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 z-30 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <h1 className="text-xl font-bold text-sidebar-foreground">Helpdesk</h1>
          <p className="text-xs text-sidebar-accent mt-1 capitalize">{role.replace("-", " ")}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href.split("/").slice(0, -1).join("/")) || pathname === item.href
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-destructive/20 hover:text-destructive"
            onClick={() => {
              localStorage.removeItem("user")
              localStorage.removeItem("token")
              localStorage.removeItem("userRole")
              window.location.href = "/"
            }}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
