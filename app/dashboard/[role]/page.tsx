"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { BarChart3, Users, Ticket, Settings, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useParams } from "next/navigation"

// Mock data - will be replaced with API calls
const dashboardConfigs: Record<string, any> = {
  "super-admin": {
    title: "Super Admin",
    sidebarItems: [
      { label: "Overview", href: "/dashboard/super-admin", icon: <BarChart3 className="h-5 w-5" /> },
      { label: "Tenants", href: "/dashboard/super-admin/tenants", icon: <Users className="h-5 w-5" /> },
      { label: "System Tickets", href: "/dashboard/super-admin/tickets", icon: <Ticket className="h-5 w-5" /> },
      { label: "Settings", href: "/dashboard/super-admin/settings", icon: <Settings className="h-5 w-5" /> },
    ],
  },
  "tenant-admin": {
    title: "Tenant Admin",
    sidebarItems: [
      { label: "Overview", href: "/dashboard/tenant-admin", icon: <BarChart3 className="h-5 w-5" /> },
      { label: "Agents", href: "/dashboard/tenant-admin/agents", icon: <Users className="h-5 w-5" /> },
      { label: "Tickets", href: "/dashboard/tenant-admin/tickets", icon: <Ticket className="h-5 w-5" /> },
      { label: "Settings", href: "/dashboard/tenant-admin/settings", icon: <Settings className="h-5 w-5" /> },
    ],
  },
  agent: {
    title: "Support Agent",
    sidebarItems: [
      { label: "My Tickets", href: "/dashboard/agent", icon: <Ticket className="h-5 w-5" />, badge: 5 },
      { label: "All Tickets", href: "/dashboard/agent/tickets", icon: <BarChart3 className="h-5 w-5" /> },
      { label: "Performance", href: "/dashboard/agent/performance", icon: <TrendingUp className="h-5 w-5" /> },
      { label: "Settings", href: "/dashboard/agent/settings", icon: <Settings className="h-5 w-5" /> },
    ],
  },
  customer: {
    title: "Customer",
    sidebarItems: [
      { label: "My Tickets", href: "/dashboard/customer", icon: <Ticket className="h-5 w-5" /> },
      { label: "Submit Ticket", href: "/dashboard/customer/new", icon: <BarChart3 className="h-5 w-5" /> },
      { label: "Knowledge Base", href: "/dashboard/customer/kb", icon: <AlertCircle className="h-5 w-5" /> },
      { label: "Settings", href: "/dashboard/customer/settings", icon: <Settings className="h-5 w-5" /> },
    ],
  },
}

export default function DashboardPage() {
  const params = useParams()
  const role = params.role as string
  const config = dashboardConfigs[role]

  if (!config) {
    return <div>Invalid role</div>
  }

  return (
    <DashboardLayout
      sidebarTitle={config.title}
      sidebarItems={config.sidebarItems}
      userRole={role}
      userName="John Doe"
      notificationCount={3}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome to {config.title}</h1>
          <p className="text-muted-foreground mt-2">Here's an overview of your helpdesk system</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">+2.5% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">847</div>
              <p className="text-xs text-muted-foreground">68.7% of total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">12.6% of total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.4h</div>
              <p className="text-xs text-muted-foreground">-0.3h from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates in your helpdesk system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 pb-4 last:pb-0 border-b last:border-0">
                  <div className="h-2 w-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Ticket #TKT-{1000 + i} has been resolved</p>
                    <p className="text-sm text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
