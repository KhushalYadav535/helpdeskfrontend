"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { Ticket, BarChart3, TrendingUp, Settings, Users, Wrench, Plus, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { TicketListWithSearch } from "@/components/tickets/ticket-list-with-search"
import { useAuth } from "@/lib/auth-context"
import { API_URL, getHeaders } from "@/lib/api-helpers"
import Link from "next/link"
import { isStrictKindTicket } from "@/lib/ticket-kind"

export default function AgentServiceRequestsPage() {
  const { user, token } = useAuth()
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tenantName, setTenantName] = useState<string>("")
  const [agentLevel, setAgentLevel] = useState<string>("agent")

  const isSupervisor = agentLevel === "supervisor"
  const sidebarItems = [
    { label: "My Tickets", href: "/dashboard/agent", icon: <Ticket className="h-5 w-5" /> },
    { label: "Assigned to Me", href: "/dashboard/agent/tickets", icon: <BarChart3 className="h-5 w-5" /> },
    { label: "Service Requests", href: "/dashboard/agent/tickets/service-requests", icon: <Wrench className="h-5 w-5" /> },
    { label: "Create Ticket", href: "/dashboard/agent/new", icon: <Plus className="h-5 w-5" /> },
    { label: "Performance", href: "/dashboard/agent/performance", icon: <TrendingUp className="h-5 w-5" /> },
    ...(isSupervisor ? [{ label: "Team Management", href: "/dashboard/agent/team", icon: <Users className="h-5 w-5" /> }] : []),
    { label: "Settings", href: "/dashboard/agent/settings", icon: <Settings className="h-5 w-5" /> },
  ]

  const fetchTickets = async () => {
    if (!user?.tenantId || !token) return
    try {
      setLoading(true)

      try {
        const tenantResponse = await fetch(`${API_URL}/tenants/${user.tenantId}`, { headers: getHeaders(true) })
        const tenantResult = await tenantResponse.json()
        if (tenantResult.success && tenantResult.data) {
          setTenantName(tenantResult.data.name || user.companyName || "")
        }
      } catch {
        setTenantName(user.companyName || "")
      }

      let currentAgent: any = null
      try {
        const agentsResponse = await fetch(`${API_URL}/agents?tenantId=${user.tenantId}`, { headers: getHeaders(true) })
        const agentsResult = await agentsResponse.json()
        if (agentsResult.success && agentsResult.data) {
          currentAgent = agentsResult.data.find((a: any) => a.email === user.email)
          if (currentAgent) {
            setAgentLevel(currentAgent.agentLevel || "agent")
          }
        }
      } catch {
        // ignore
      }

      const response = await fetch(`${API_URL}/tickets?myTickets=true&kind=service-request`, {
        headers: getHeaders(true),
      })
      const result = await response.json()

      if (result.success && result.data) {
        let assignedTickets = result.data
        if (currentAgent && user?.role === "agent") {
          const agentIds = [
            currentAgent._id?.toString?.(),
            currentAgent.userId?._id?.toString?.(),
            currentAgent.userId?.toString?.(),
          ].filter(Boolean)
          if (agentIds.length > 0) {
            assignedTickets = assignedTickets.filter((t: any) => {
              const tAgentId = (t.agentId as any)?._id?.toString?.() ?? (t.agentId as any)?.toString?.() ?? String(t.agentId || "")
              return agentIds.some((id) => id && tAgentId === id)
            })
          }
        }
        setTickets(assignedTickets.filter((ticket: any) => isStrictKindTicket(ticket, "service-request")))
      }
    } catch (error) {
      console.error("Error fetching service requests:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
    const interval = setInterval(fetchTickets, 30000)
    return () => clearInterval(interval)
  }, [user?.tenantId, token, user?.companyName])

  return (
    <DashboardLayout
      sidebarTitle="Support Agent"
      sidebarItems={sidebarItems}
      userRole="agent"
      userName={user?.name || "Agent"}
      notificationCount={0}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Service Requests</h1>
            <p className="text-muted-foreground mt-2">
              Service-request tickets assigned to you
              {tenantName && <span className="ml-2 text-sm text-accent">• {tenantName}</span>}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchTickets} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button asChild>
              <Link href="/dashboard/agent/new">Create Manual</Link>
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading service requests...</div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12">
            <Ticket className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No service requests assigned</h3>
            <p className="text-muted-foreground">Service requests will appear here once assigned to you</p>
          </div>
        ) : (
          <TicketListWithSearch tickets={tickets} onTicketUpdated={fetchTickets} />
        )}
      </div>
    </DashboardLayout>
  )
}
