"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { ActivityLog } from "@/components/activity/activity-log"
import { History } from "lucide-react"

export default function ActivityLogsPage() {
  const sidebarItems = [{ label: "Activity Logs", href: "/dashboard/activity", icon: <History className="h-5 w-5" /> }]

  const activities = [
    {
      id: "1",
      action: "Ticket Created",
      description: "TKT-1001 created by John Doe",
      user: "John Doe",
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      type: "create" as const,
    },
    {
      id: "2",
      action: "Ticket Assigned",
      description: "TKT-1001 assigned to Alice Johnson",
      user: "System",
      timestamp: new Date(Date.now() - 8 * 60 * 1000),
      type: "assignment" as const,
    },
    {
      id: "3",
      action: "Status Updated",
      description: "TKT-1001 status changed to In Progress",
      user: "Alice Johnson",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      type: "update" as const,
    },
    {
      id: "4",
      action: "Comment Added",
      description: "New comment added to TKT-1001",
      user: "Alice Johnson",
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      type: "comment" as const,
    },
    {
      id: "5",
      action: "Ticket Created",
      description: "TKT-1002 created by Jane Smith",
      user: "Jane Smith",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      type: "create" as const,
    },
    {
      id: "6",
      action: "Priority Changed",
      description: "TKT-1003 priority escalated to High",
      user: "Bob Smith",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      type: "update" as const,
    },
    {
      id: "7",
      action: "Ticket Resolved",
      description: "TKT-1004 marked as Resolved",
      user: "Carol Davis",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      type: "update" as const,
    },
    {
      id: "8",
      action: "Agent Added",
      description: "New agent David Wilson added to team",
      user: "Admin",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      type: "create" as const,
    },
  ]

  return (
    <DashboardLayout
      sidebarTitle="System Logs"
      sidebarItems={sidebarItems}
      userRole="super-admin"
      userName="Admin"
      notificationCount={0}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
          <p className="text-muted-foreground mt-2">System-wide activity and events</p>
        </div>

        <ActivityLog activities={activities} limit={100} />
      </div>
    </DashboardLayout>
  )
}
