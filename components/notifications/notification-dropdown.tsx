"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Bell, CheckCheck, Inbox } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { API_URL, getHeaders } from "@/lib/api-helpers"

type NotificationRow = {
  id: string
  type: "info" | "success" | "warning" | "error"
  title: string
  message: string
  read: boolean
  actionUrl?: string
  timestamp: string
}

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<NotificationRow[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/notifications?limit=10`, {
        headers: getHeaders(true),
      })
      const json = await res.json()
      if (json.success && json.data) {
        setNotifications(json.data)
        setUnreadCount(typeof json.unreadCount === "number" ? json.unreadCount : json.data.filter((n: NotificationRow) => !n.read).length)
      }
    } catch {
      setNotifications([])
      setUnreadCount(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return
    void fetchNotifications()
  }, [isOpen, fetchNotifications])

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
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false)
    }
    document.addEventListener("keydown", handleEsc)
    return () => document.removeEventListener("keydown", handleEsc)
  }, [isOpen])

  const handleMarkAllRead = async () => {
    try {
      await fetch(`${API_URL}/notifications/mark-all-read`, {
        method: "POST",
        headers: getHeaders(true),
      })
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch {
      // ignore
    }
  }

  const handleNotificationClick = async (n: NotificationRow) => {
    try {
      await fetch(`${API_URL}/notifications/${n.id}/read`, {
        method: "PATCH",
        headers: getHeaders(true),
      })
    } catch {
      // ignore
    }
    setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))
    setUnreadCount((c) => Math.max(0, c - (n.read ? 0 : 1)))
    if (n.actionUrl) {
      window.location.href = n.actionUrl
    }
    setIsOpen(false)
  }

  const getBorderColor = (type: string) => {
    switch (type) {
      case "error":
        return "border-l-red-500"
      case "warning":
        return "border-l-amber-500"
      case "success":
        return "border-l-green-500"
      case "info":
      default:
        return "border-l-blue-500"
    }
  }

  return (
    <div className="relative">
      <Button
        ref={triggerRef}
        variant="ghost"
        size="icon"
        className="relative flex-shrink-0 rounded-xl hover:bg-accent/50"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`${unreadCount} unread notifications`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-4 min-w-[1rem] px-0.5 flex items-center justify-center font-medium">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Notifications panel"
          className={cn(
            "absolute right-0 top-full mt-2 w-[360px] bg-card border border-border rounded-xl shadow-lg z-50",
            "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150",
          )}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void handleMarkAllRead()}
                className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Loading…</p>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <Inbox className="h-12 w-12 text-muted-foreground/40 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">You&apos;re all caught up!</p>
                <p className="text-xs text-muted-foreground/60 mt-1">No new notifications</p>
              </div>
            ) : (
              <div role="list">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    role="listitem"
                    onClick={() => void handleNotificationClick(notification)}
                    className={cn(
                      "flex items-start gap-3 px-4 py-3 border-b border-border/50 last:border-b-0 cursor-pointer transition-colors",
                      "border-l-4",
                      getBorderColor(notification.type),
                      !notification.read ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/50",
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className={cn(
                            "text-sm truncate",
                            !notification.read ? "font-semibold text-foreground" : "font-medium text-foreground/80",
                          )}
                        >
                          {notification.title}
                        </p>
                        {!notification.read && <span className="flex-shrink-0 w-2 h-2 rounded-full bg-primary" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.message}</p>
                      <p className="text-[11px] text-muted-foreground/60 mt-1">
                        {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="border-t border-border px-4 py-2">
              <button
                type="button"
                className="text-xs text-primary hover:text-primary/80 font-medium w-full text-center py-1 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
