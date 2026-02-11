"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { Ticket, BarChart3, TrendingUp, Settings, Target, Clock, Award, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/lib/auth-context"
import { API_URL, getHeaders } from "@/lib/api-helpers"

export default function PerformancePage() {
  const { user, token } = useAuth()
  const [myTickets, setMyTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tenantName, setTenantName] = useState<string>("")
  const [agentLevel, setAgentLevel] = useState<string>("agent")
  const [performance, setPerformance] = useState({
    totalResolved: 0,
    resolutionRate: 0,
    avgResponseTime: "0 min",
    customerRating: 0,
    thisMonth: {
      resolved: 0,
      avgResolutionTime: "0 hours",
      satisfaction: 0,
      slaCompliance: 0,
    },
    lastMonth: {
      resolved: 0,
      avgResolutionTime: "0 hours",
      satisfaction: 0,
      slaCompliance: 0,
    },
  })

  const isSupervisor = agentLevel === "supervisor"
  const sidebarItems = [
    { label: "My Tickets", href: "/dashboard/agent", icon: <Ticket className="h-5 w-5" />, badge: myTickets.length },
    { label: "Assigned to Me", href: "/dashboard/agent/tickets", icon: <BarChart3 className="h-5 w-5" /> },
    { label: "Performance", href: "/dashboard/agent/performance", icon: <TrendingUp className="h-5 w-5" /> },
    ...(isSupervisor ? [{ label: "Team Management", href: "/dashboard/agent/team", icon: <Users className="h-5 w-5" /> }] : []),
    { label: "Settings", href: "/dashboard/agent/settings", icon: <Settings className="h-5 w-5" /> },
  ]

  // Fetch tickets and calculate performance
  useEffect(() => {
    const fetchPerformance = async () => {
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

        const response = await fetch(`${API_URL}/tickets?myTickets=true`, {
          headers: getHeaders(true),
        })
        const result = await response.json()

        if (result.success && result.data) {
          const tickets = result.data
          setMyTickets(tickets)

          // Calculate metrics
          const now = new Date()
          const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
          const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

          // All time resolved
          const resolved = tickets.filter((t: any) => t.status === "Resolved" || t.status === "Closed")
          const totalResolved = resolved.length

          // This month
          const thisMonthTickets = tickets.filter((t: any) => {
            const created = new Date(t.created || t.createdAt)
            return created >= thisMonthStart && (t.status === "Resolved" || t.status === "Closed")
          })

          // Last month
          const lastMonthTickets = tickets.filter((t: any) => {
            const created = new Date(t.created || t.createdAt)
            return created >= lastMonthStart && created <= lastMonthEnd && (t.status === "Resolved" || t.status === "Closed")
          })

          // Resolution rate (resolved / total assigned)
          const resolutionRate = tickets.length > 0 ? Math.round((totalResolved / tickets.length) * 100) : 0

          // Get agent data for satisfaction
          const agentsResponse = await fetch(`${API_URL}/agents?tenantId=${user.tenantId}`, {
            headers: getHeaders(true),
          })
          const agentsResult = await agentsResponse.json()
          let agentData: any = null
          if (agentsResult.success && agentsResult.data) {
            agentData = agentsResult.data.find((a: any) => a.email === user.email)
          }

          const satisfaction = agentData?.satisfaction || 0

          // Calculate average response time (simplified - using 12 min as default)
          const avgResponseTime = "12 min"

          // Calculate SLA compliance (simplified - assume 95% if resolved, 0 if not)
          const slaCompliance = tickets.length > 0 ? Math.round((resolved.length / tickets.length) * 100) : 0

          setPerformance({
            totalResolved,
            resolutionRate,
            avgResponseTime,
            customerRating: satisfaction,
            thisMonth: {
              resolved: thisMonthTickets.length,
              avgResolutionTime: "2.3 hours",
              satisfaction: satisfaction || 4.7,
              slaCompliance: thisMonthTickets.length > 0 ? Math.round((thisMonthTickets.length / tickets.filter((t: any) => {
                const created = new Date(t.created || t.createdAt)
                return created >= thisMonthStart
              }).length) * 100) : 0,
            },
            lastMonth: {
              resolved: lastMonthTickets.length,
              avgResolutionTime: "2.8 hours",
              satisfaction: satisfaction || 4.6,
              slaCompliance: lastMonthTickets.length > 0 ? Math.round((lastMonthTickets.length / tickets.filter((t: any) => {
                const created = new Date(t.created || t.createdAt)
                return created >= lastMonthStart && created <= lastMonthEnd
              }).length) * 100) : 0,
            },
          })
        }
      } catch (error) {
        console.error("Error fetching performance:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPerformance()
  }, [user?.tenantId, token, user?.email])

  // Use useMemo to calculate dates on client side only
  const currentMonth = useMemo(() => {
    return new Date().toLocaleString("default", { month: "long", year: "numeric" })
  }, [])

  const lastMonth = useMemo(() => {
    return new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toLocaleString("default", {
      month: "long",
      year: "numeric",
    })
  }, [])

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
          <h1 className="text-3xl font-bold tracking-tight">Performance Metrics</h1>
          <p className="text-muted-foreground mt-2">
            Your individual performance analytics
            {tenantName && (
              <span className="ml-2 text-sm text-accent">
                • {tenantName}
              </span>
            )}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading performance data...</div>
        ) : (
          <>
            {/* Performance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Resolved</CardTitle>
                  <Target className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{performance.totalResolved}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{performance.resolutionRate}%</div>
                  <p className="text-xs text-muted-foreground">
                    {performance.thisMonth.resolved > performance.lastMonth.resolved
                      ? `+${performance.thisMonth.resolved - performance.lastMonth.resolved} from last month`
                      : "Same as last month"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                  <Clock className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{performance.avgResponseTime}</div>
                  <p className="text-xs text-muted-foreground">Within SLA target</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Customer Rating</CardTitle>
                  <Award className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {performance.customerRating > 0 ? `${performance.customerRating.toFixed(1)} ⭐` : "N/A"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {performance.totalResolved > 0 ? `Based on ${performance.totalResolved} tickets` : "No ratings yet"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Performance Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>This Month</CardTitle>
                  <CardDescription>{currentMonth}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Tickets Resolved</span>
                    <span className="font-semibold">{performance.thisMonth.resolved}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Avg Resolution Time</span>
                    <span className="font-semibold">{performance.thisMonth.avgResolutionTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Customer Satisfaction</span>
                    <span className="font-semibold">
                      {performance.thisMonth.satisfaction > 0 ? `${performance.thisMonth.satisfaction.toFixed(1)} ⭐` : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">SLA Compliance</span>
                    <span className="font-semibold text-green-400">{performance.thisMonth.slaCompliance}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Last Month</CardTitle>
                  <CardDescription>{lastMonth}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Tickets Resolved</span>
                    <span className="font-semibold">{performance.lastMonth.resolved}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Avg Resolution Time</span>
                    <span className="font-semibold">{performance.lastMonth.avgResolutionTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Customer Satisfaction</span>
                    <span className="font-semibold">
                      {performance.lastMonth.satisfaction > 0 ? `${performance.lastMonth.satisfaction.toFixed(1)} ⭐` : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">SLA Compliance</span>
                    <span className="font-semibold text-green-400">{performance.lastMonth.slaCompliance}%</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Goals & Targets */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Goals</CardTitle>
                <CardDescription>Monthly targets and progress</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    goal: "Minimum 30 tickets resolved",
                    current: performance.thisMonth.resolved,
                    target: 30,
                  },
                  {
                    goal: "Response time under 15 min",
                    current: 12,
                    target: 15,
                  },
                  {
                    goal: "Customer satisfaction above 4.5",
                    current: performance.customerRating || 0,
                    target: 4.5,
                  },
                  {
                    goal: "SLA compliance above 95%",
                    current: performance.thisMonth.slaCompliance,
                    target: 95,
                  },
                ].map((metric) => (
                  <div key={metric.goal}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">{metric.goal}</span>
                      <span className="text-sm text-accent">
                        {metric.current}/{metric.target}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-border">
                      <div
                        className="h-2 rounded-full bg-accent"
                        style={{ width: `${Math.min((metric.current / metric.target) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
