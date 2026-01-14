"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { BarChart3, Users, Ticket, Settings, TrendingUp, AlertCircle, Plus, Phone } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { API_URL, getHeaders } from "@/lib/api-helpers"

export default function TenantAdminDashboard() {
  const { user, token } = useAuth()
  const [ticketStats, setTicketStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    highPriority: 0,
  })
  const [agentStats, setAgentStats] = useState({
    total: 0,
    online: 0,
  })
  const [topAgents, setTopAgents] = useState<any[]>([])

  const sidebarItems = [
    { label: "Overview", href: "/dashboard/tenant-admin", icon: <BarChart3 className="h-5 w-5" /> },
    { label: "Leads", href: "/dashboard/tenant-admin/leads", icon: <Phone className="h-5 w-5" /> },
    { label: "Agents", href: "/dashboard/tenant-admin/agents", icon: <Users className="h-5 w-5" /> },
    { label: "Tickets", href: "/dashboard/tenant-admin/tickets", icon: <Ticket className="h-5 w-5" /> },
    { label: "Create Ticket", href: "/dashboard/tenant-admin/new", icon: <Plus className="h-5 w-5" /> },
    { label: "Settings", href: "/dashboard/tenant-admin/settings", icon: <Settings className="h-5 w-5" /> },
  ]

  // Fetch ticket stats and agents
  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.tenantId || !token) return

      try {
        // Fetch tickets
        const ticketsResponse = await fetch(`${API_URL}/tickets?tenantId=${user.tenantId}`, {
          headers: getHeaders(true),
        })
        const ticketsResult = await ticketsResponse.json()

        if (ticketsResult.success && ticketsResult.data) {
          const tickets = ticketsResult.data
          setTicketStats({
            total: tickets.length,
            open: tickets.filter((t: any) => t.status === "Open").length,
            inProgress: tickets.filter((t: any) => t.status === "In Progress").length,
            resolved: tickets.filter((t: any) => t.status === "Resolved" || t.status === "Closed").length,
            highPriority: tickets.filter(
              (t: any) => t.priority === "High" || t.priority === "Critical"
            ).length,
          })
        }

        // Fetch agents
        const agentsResponse = await fetch(`${API_URL}/agents?tenantId=${user.tenantId}`, {
          headers: getHeaders(true),
        })
        const agentsResult = await agentsResponse.json()

        if (agentsResult.success && agentsResult.data) {
          const agents = agentsResult.data
          setAgentStats({
            total: agents.length,
            online: agents.filter((a: any) => a.status === "online").length,
          })

          // Get top 3 agents by resolved count
          const sorted = [...agents].sort((a: any, b: any) => (b.resolved || 0) - (a.resolved || 0)).slice(0, 3)
          setTopAgents(sorted)
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
      }
    }

    fetchStats()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [user?.tenantId, token])

  return (
    <DashboardLayout
      sidebarTitle="Tenant Admin"
      sidebarItems={sidebarItems}
      userRole="tenant-admin"
      userName={user?.name || "Tenant Manager"}
      notificationCount={ticketStats.open}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tenant Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage your tenant's agents and support operations</p>
        </div>

        {/* Tenant Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
              <Users className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{agentStats.total}</div>
              <p className="text-xs text-muted-foreground">{agentStats.online} online now</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
              <Ticket className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ticketStats.open}</div>
              <p className="text-xs text-muted-foreground">
                {ticketStats.highPriority > 0 ? `${ticketStats.highPriority} high priority` : "All resolved"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <TrendingUp className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ticketStats.resolved}</div>
              <p className="text-xs text-muted-foreground">
                {ticketStats.inProgress > 0 ? `${ticketStats.inProgress} in progress` : "Total resolved"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
              <AlertCircle className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1.8h</div>
              <p className="text-xs text-muted-foreground">-0.2h from last week</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Management</CardTitle>
              <CardDescription>Manage your support team</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/tenant-admin/agents">
                <Button className="w-full">Manage Agents</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ticket Management</CardTitle>
              <CardDescription>View all tenant tickets</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/tenant-admin/tickets">
                <Button className="w-full">View Tickets</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tenant Settings</CardTitle>
              <CardDescription>Configure your tenant</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/tenant-admin/settings">
                <Button className="w-full">Settings</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Agent Performance */}
        {topAgents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Agents</CardTitle>
              <CardDescription>Based on ticket resolution rate and customer satisfaction</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topAgents.map((agent) => (
                  <div
                    key={agent.id || agent.name}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/5"
                  >
                    <div>
                      <p className="font-medium">{agent.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {agent.resolved || 0} resolved • {agent.satisfaction || 0} ⭐
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        agent.status === "online"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {agent.status || "offline"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
