"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { Ticket, BarChart3, TrendingUp, Settings, Clock, CheckCircle2, Users, Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { API_URL, getHeaders } from "@/lib/api-helpers"

export default function AgentDashboard() {
  const { user, token } = useAuth()
  const [myTickets, setMyTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tenantName, setTenantName] = useState<string>("")
  const [agentLevel, setAgentLevel] = useState<string>("agent")
  const [stats, setStats] = useState({
    assigned: 0,
    resolved: 0,
    responseTime: "0 min",
    rating: 0,
  })

  const isSupervisor = agentLevel === "supervisor"
  const isManagement = agentLevel === "management"
  const sidebarItems = isManagement
    ? [
        { label: "Overview", href: "/dashboard/agent", icon: <BarChart3 className="h-5 w-5" /> },
        { label: "Settings", href: "/dashboard/agent/settings", icon: <Settings className="h-5 w-5" /> },
      ]
    : [
        { label: "My Tickets", href: "/dashboard/agent", icon: <Ticket className="h-5 w-5" />, badge: myTickets.length },
        { label: "Assigned to Me", href: "/dashboard/agent/tickets", icon: <BarChart3 className="h-5 w-5" /> },
        { label: "Create Ticket", href: "/dashboard/agent/new", icon: <Plus className="h-5 w-5" /> },
        { label: "Performance", href: "/dashboard/agent/performance", icon: <TrendingUp className="h-5 w-5" /> },
        ...(isSupervisor ? [{ label: "Team Management", href: "/dashboard/agent/team", icon: <Users className="h-5 w-5" /> }] : []),
        { label: "Settings", href: "/dashboard/agent/settings", icon: <Settings className="h-5 w-5" /> },
      ]

  // Fetch tenant name and tickets
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.tenantId || !token) return

      try {
        setLoading(true)
        
        // Fetch tenant info
        try {
          const tenantResponse = await fetch(`${API_URL}/tenants/${user.tenantId}`, {
            headers: getHeaders(true),
          })
          const tenantResult = await tenantResponse.json()
          if (tenantResult.success && tenantResult.data) {
            setTenantName(tenantResult.data.name || user.companyName || "")
          }
        } catch (error) {
          console.error("Error fetching tenant:", error)
          setTenantName(user.companyName || "")
        }

        // Fetch current agent info to get agentLevel
        let currentLevel = "agent"
        let currentAgent: any = null
        try {
          const agentsResponse = await fetch(`${API_URL}/agents?tenantId=${user.tenantId}`, {
            headers: getHeaders(true),
          })
          const agentsResult = await agentsResponse.json()

          if (agentsResult.success && agentsResult.data) {
            currentAgent = agentsResult.data.find((a: any) => a.email === user.email)
            if (currentAgent) {
              currentLevel = currentAgent.agentLevel || "agent"
              setAgentLevel(currentLevel)
            }
          }
        } catch (error) {
          console.error("Error fetching agent level:", error)
        }

        // For Management: fetch tenant-level tickets; for agents: fetch only assigned tickets
        const ticketsEndpoint = currentLevel === "management"
          ? `${API_URL}/tickets?tenantId=${user.tenantId}`
          : `${API_URL}/tickets?myTickets=true`
        const response = await fetch(ticketsEndpoint, {
          headers: getHeaders(true),
        })
        const result = await response.json()

        if (result.success && result.data) {
          let tickets = result.data
          // Client-side filter for agents: only show tickets assigned to current agent
          if (currentLevel !== "management" && currentAgent) {
            const agentIds = [
              currentAgent._id?.toString?.(),
              currentAgent.userId?._id?.toString?.(),
              currentAgent.userId?.toString?.(),
            ].filter(Boolean)
            if (agentIds.length > 0) {
              tickets = tickets.filter((t: any) => {
                const tAgentId = (t.agentId as any)?._id?.toString?.() ?? (t.agentId as any)?.toString?.() ?? String(t.agentId || "")
                return agentIds.some((id) => id && tAgentId === id)
              })
            }
          }
          setMyTickets(currentLevel === "management" ? [] : tickets)
          
          const today = new Date().toISOString().split("T")[0]
          const resolvedToday = tickets.filter(
            (t: any) => (t.status === "Resolved" || t.status === "Closed") && t.updated && t.updated.split("T")[0] === today
          ).length

          setStats({
            assigned: tickets.length,
            resolved: resolvedToday,
            responseTime: "12 min",
            rating: 4.8,
          })
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user?.tenantId, token, user?.companyName])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-red-500/90 text-white"
      case "High":
        return "bg-orange-400/90 text-white"
      case "Medium":
        return "bg-amber-400/90 text-white"
      case "Low":
        return "bg-green-500/90 text-white"
      default:
        return "bg-amber-400/90 text-white"
    }
  }

  return (
    <DashboardLayout
      sidebarTitle="Support Agent"
      sidebarItems={sidebarItems}
      userRole="agent"
      userName={user?.name || "Agent"}
      notificationCount={myTickets.length}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{isManagement ? "Dashboard" : "My Tickets"}</h1>
          <p className="text-muted-foreground mt-2">
            {isManagement ? "Tenant overview and metrics" : "Your active tickets and workload"}
            {tenantName && (
              <span className="ml-2 text-sm text-accent">
                • {tenantName}
              </span>
            )}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{isManagement ? "Total Tickets" : "Assigned Today"}</CardTitle>
              <Ticket className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.assigned}</div>
              <p className="text-xs text-muted-foreground">
                {isManagement ? "All tenant tickets" : `${stats.assigned - stats.resolved} remaining`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.resolved}</div>
              <p className="text-xs text-muted-foreground">Good job!</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
              <Clock className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.responseTime}</div>
              <p className="text-xs text-muted-foreground">Within SLA</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rating</CardTitle>
              <TrendingUp className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rating} ⭐</div>
              <p className="text-xs text-muted-foreground">Excellent performance</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - hidden for Management */}
        {!isManagement && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>View Assigned Tickets</CardTitle>
              <CardDescription>See all tickets assigned to you</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/agent/tickets">
                <Button className="w-full">My Assigned Tickets</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>View your performance analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/agent/performance">
                <Button className="w-full">Performance</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        )}

        {/* My Active Tickets - hidden for Management */}
        {!isManagement && (
        <Card>
          <CardHeader>
            <CardTitle>My Tickets ({myTickets.length})</CardTitle>
            <CardDescription>Tickets assigned to you</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading tickets...</div>
            ) : myTickets.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted/50 mb-4">
                  <Ticket className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No tickets assigned yet</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">You'll see tickets here once they're assigned to you</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myTickets.map((ticket) => (
                  <div
                    key={ticket._id || ticket.id}
                    className="flex items-center justify-between p-4 rounded-2xl border border-border/60 bg-card shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] hover:-translate-y-0.5 hover:border-primary/20 transition-all duration-200 ease-out cursor-pointer"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm font-semibold text-foreground">
                          {ticket.ticketId || ticket.id}
                        </span>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </div>
                      <p className="font-medium">{ticket.title || ticket.subject}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {ticket.customer} • Assigned: {ticket.assignedAt 
                          ? new Date(ticket.assignedAt).toLocaleString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ticket.updated && ticket.agentId
                          ? new Date(ticket.updated).toLocaleString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "N/A"}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {ticket.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
