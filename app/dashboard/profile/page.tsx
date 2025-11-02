"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { useAuth } from "@/lib/auth-context"
import { UserProfile } from "@/components/user/user-profile"
import { ActivityLog } from "@/components/activity/activity-log"
import { User, Settings } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ProfilePage() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Please log in to view your profile</p>
      </div>
    )
  }

  const sidebarItems = [
    { label: "Profile", href: "/dashboard/profile", icon: <User className="h-5 w-5" /> },
    { label: "Settings", href: "/dashboard/profile/settings", icon: <Settings className="h-5 w-5" /> },
  ]

  const activities = [
    {
      id: "1",
      action: "Ticket Updated",
      description: "Updated ticket TKT-1001 status to In Progress",
      user: "You",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      type: "update" as const,
    },
    {
      id: "2",
      action: "Comment Added",
      description: "Added comment to TKT-1002",
      user: "You",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      type: "comment" as const,
    },
    {
      id: "3",
      action: "Ticket Assigned",
      description: "Assigned TKT-1003 to Carol Davis",
      user: "You",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      type: "assignment" as const,
    },
  ]

  return (
    <DashboardLayout
      sidebarTitle="My Account"
      sidebarItems={sidebarItems}
      userRole={user.role}
      userName={user.name}
      notificationCount={0}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground mt-2">View and manage your account information</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <UserProfile />
          </TabsContent>

          <TabsContent value="activity">
            <ActivityLog activities={activities} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
