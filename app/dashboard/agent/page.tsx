"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { Ticket, BarChart3, TrendingUp, Settings, Clock, CheckCircle2, Users } from "lucide-react"
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
  const sidebarItems = [
    { label: "My Tickets", href: "/dashboard/agent", icon: <Ticket className="h-5 w-5" />, badge: myTickets.length },
    { label: "All Tickets", href: "/dashboard/agent/tickets", icon: <BarChart3 className="h-5 w-5" /> },
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
        try {
          const agentsResponse = await fetch(`${API_URL}/agents?tenantId=${user.tenantId}`, {
            headers: getHeaders(true),
          })
          const agentsResult = await agentsResponse.json()

          if (agentsResult.success && agentsResult.data) {
            const currentAgent = agentsResult.data.find((a: any) => a.email === user.email)
            if (currentAgent) {
              setAgentLevel(currentAgent.agentLevel || "agent")
            }
          }
        } catch (error) {
          console.error("Error fetching agent level:", error)
        }

        // Fetch tickets
        const response = await fetch(`${API_URL}/tickets?myTickets=true`, {
          headers: getHeaders(true),
        })
        const result = await response.json()

        if (result.success && result.data) {
          setMyTickets(result.data)
          
          // Calculate stats
          const today = new Date().toISOString().split("T")[0]
          const resolvedToday = result.data.filter(
            (t: any) => (t.status === "Resolved" || t.status === "Closed") && t.updated && t.updated.split("T")[0] === today
          ).length

          setStats({
            assigned: result.data.length,
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
        return "bg-red-500/20 text-red-400"
      case "High":
        return "bg-orange-500/20 text-orange-400"
      case "Medium":
        return "bg-yellow-500/20 text-yellow-400"
      default:
        return "bg-green-500/20 text-green-400"
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
          <h1 className="text-3xl font-bold tracking-tight">My Tickets</h1>
          <p className="text-muted-foreground mt-2">
            Your active tickets and workload
            {tenantName && (
              <span className="ml-2 text-sm text-accent">
                • {tenantName}
              </span>
            )}
          </p>
        </div>

        {/* Agent Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assigned Today</CardTitle>
              <Ticket className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.assigned}</div>
              <p className="text-xs text-muted-foreground">
                {stats.assigned - stats.resolved} remaining
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>View All Tickets</CardTitle>
              <CardDescription>See tickets across the entire system</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/agent/tickets">
                <Button className="w-full">All Tickets</Button>
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

        {/* My Active Tickets */}
        <Card>
          <CardHeader>
            <CardTitle>My Tickets ({myTickets.length})</CardTitle>
            <CardDescription>Tickets assigned to you</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading tickets...</div>
            ) : myTickets.length === 0 ? (
              <div className="text-center py-8">
                <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No tickets assigned yet</h3>
                <p className="text-muted-foreground">You'll see tickets here once they're assigned to you</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myTickets.map((ticket) => (
                  <div
                    key={ticket._id || ticket.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/5 transition-colors cursor-pointer"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm font-semibold text-accent">
                          {ticket.ticketId || ticket.id}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </div>
                      <p className="font-medium">{ticket.title || ticket.subject}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {ticket.customer} • {ticket.created ? new Date(ticket.created).toLocaleDateString() : "N/A"}
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
      </div>
    </DashboardLayout>
  )
}
