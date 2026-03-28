"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { ChevronDown, User, Settings, HelpCircle, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

interface UserProfileDropdownProps {
  userName?: string
  userRole?: string
  userEmail?: string
  tenantName?: string
}

export function UserProfileDropdown({
  userName = "User",
  userRole = "agent",
  userEmail,
  tenantName,
}: UserProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const { logout } = useAuth()
  const router = useRouter()

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const displayRole = userRole.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
        setShowLogoutConfirm(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false)
        setShowLogoutConfirm(false)
      }
    }
    document.addEventListener("keydown", handleEsc)
    return () => document.removeEventListener("keydown", handleEsc)
  }, [isOpen])

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev)
    setShowLogoutConfirm(false)
  }, [])

  const handleLogout = useCallback(() => {
    logout()
    router.push("/login")
  }, [logout, router])

  const handleMyProfile = useCallback(() => {
    setIsOpen(false)
    // Navigate to the settings page for the current role
    const settingsUrl =
      userRole === "super-admin"
        ? "/dashboard/super-admin/settings"
        : userRole === "tenant-admin"
          ? "/dashboard/tenant-admin/settings"
          : userRole === "customer"
            ? "/dashboard/customer/settings"
            : "/dashboard/agent/settings"
    router.push(settingsUrl)
  }, [router, userRole])

  return (
    <div className="relative">
      {/* Trigger */}
      <Button
        ref={triggerRef}
        variant="ghost"
        onClick={handleToggle}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={`User menu for ${userName}`}
        className="gap-2 px-2 sm:px-3 min-w-0 rounded-xl hover:bg-accent/50"
      >
        {/* Avatar initials */}
        <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">
          {initials}
        </div>
        <span className="hidden sm:inline text-sm truncate max-w-[100px] lg:max-w-[150px]">
          {userName}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground hidden sm:block transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </Button>

      {/* Dropdown card */}
      {isOpen && (
        <div
          ref={panelRef}
          role="menu"
          className={cn(
            "absolute right-0 top-full mt-2 w-[280px] bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden",
            "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150",
          )}
        >
          {/* Profile header */}
          <div className="px-4 py-4 bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold flex-shrink-0">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
                <p className="text-xs text-muted-foreground truncate">{displayRole}</p>
                {tenantName && (
                  <p className="text-xs text-muted-foreground/70 truncate">{tenantName}</p>
                )}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Menu items */}
          <div className="py-1">
            <button
              type="button"
              role="menuitem"
              onClick={handleMyProfile}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors"
            >
              <User className="h-[18px] w-[18px] text-muted-foreground" />
              My Profile
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false)
                handleMyProfile()
              }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors"
            >
              <Settings className="h-[18px] w-[18px] text-muted-foreground" />
              Settings
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false)
                router.push("/help")
              }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors"
            >
              <HelpCircle className="h-[18px] w-[18px] text-muted-foreground" />
              Help & Support
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Logout section */}
          <div className="py-1">
            {!showLogoutConfirm ? (
              <button
                role="menuitem"
                onClick={() => setShowLogoutConfirm(true)}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="h-[18px] w-[18px]" />
                Logout
              </button>
            ) : (
              <div
                role="alertdialog"
                className="px-4 py-3 space-y-2"
              >
                <p className="text-xs text-muted-foreground font-medium">Are you sure?</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1 h-8 text-xs"
                    onClick={handleLogout}
                  >
                    Yes, Logout
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex-1 h-8 text-xs"
                    onClick={() => setShowLogoutConfirm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
