"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell } from "lucide-react"
import * as notificationLib from "@/lib/notifications"
import { formatDistanceToNow } from "date-fns"

interface NotificationCenterProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NotificationCenter({ open, onOpenChange }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<notificationLib.Notification[]>([])

  useEffect(() => {
    const unsubscribe = notificationLib.subscribe((notifs) => {
      setNotifications(notifs)
    })

    return unsubscribe
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkAsRead = (id: string) => {
    notificationLib.markAsRead(id)
  }

  const typeColor = {
    info: "bg-blue-100 text-blue-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
  }

  return (
    <>
      <Button variant="outline" size="icon" onClick={() => onOpenChange(true)} className="relative">
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Notifications</DialogTitle>
          </DialogHeader>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No notifications</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-md border cursor-pointer hover:bg-muted/50 ${
                    !notification.read ? "bg-primary/5 border-primary/20" : ""
                  }`}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={typeColor[notification.type as keyof typeof typeColor]}>
                          {notification.type}
                        </Badge>
                        {!notification.read && <span className="w-2 h-2 bg-primary rounded-full" />}
                      </div>
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(notification.timestamp, {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => notificationLib.clearNotifications()}
            >
              Clear All
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
