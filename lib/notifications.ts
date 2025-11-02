export interface Notification {
  id: string
  type: "info" | "success" | "warning" | "error"
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
}

let notifications: Notification[] = []
let listeners: ((notifs: Notification[]) => void)[] = []

export function createNotification(type: Notification["type"], title: string, message: string, actionUrl?: string) {
  const notification: Notification = {
    id: Date.now().toString(),
    type,
    title,
    message,
    timestamp: new Date(),
    read: false,
    actionUrl,
  }

  notifications.unshift(notification)
  if (notifications.length > 50) {
    notifications = notifications.slice(0, 50)
  }

  listeners.forEach((listener) => listener(notifications))
  return notification
}

export function markAsRead(id: string) {
  const notif = notifications.find((n) => n.id === id)
  if (notif) {
    notif.read = true
    listeners.forEach((listener) => listener(notifications))
  }
}

export function getNotifications() {
  return notifications
}

export function subscribe(listener: (notifs: Notification[]) => void) {
  listeners.push(listener)
  return () => {
    listeners = listeners.filter((l) => l !== listener)
  }
}

export function clearNotifications() {
  notifications = []
  listeners.forEach((listener) => listener(notifications))
}
