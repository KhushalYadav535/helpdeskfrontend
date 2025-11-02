"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { Ticket, BarChart3, TrendingUp, Settings, Filter, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { TicketListWithSearch } from "@/components/tickets/ticket-list-with-search"
import { useAuth } from "@/lib/auth-context"
import { API_URL, getHeaders } from "@/lib/api-helpers"

export default function AllTicketsPage() {
  const { user, token } = useAuth()
  const [allTickets, setAllTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tenantName, setTenantName] = useState<string>("")
  const [agentLevel, setAgentLevel] = useState<string>("agent")

  const isSupervisor = agentLevel === "supervisor"
  const sidebarItems = [
    { label: "My Tickets", href: "/dashboard/agent", icon: <Ticket className="h-5 w-5" />, badge: allTickets.length },
    { label: "All Tickets", href: "/dashboard/agent/tickets", icon: <BarChart3 className="h-5 w-5" /> },
    { label: "Performance", href: "/dashboard/agent/performance", icon: <TrendingUp className="h-5 w-5" /> },
    ...(isSupervisor ? [{ label: "Team Management", href: "/dashboard/agent/team", icon: <Users className="h-5 w-5" /> }] : []),
    { label: "Settings", href: "/dashboard/agent/settings", icon: <Settings className="h-5 w-5" /> },
  ]

  // Fetch all tickets for this agent's tenant
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

        const response = await fetch(`${API_URL}/tickets`, {
          headers: getHeaders(true),
        })
        const result = await response.json()

        if (result.success && result.data) {
          setAllTickets(result.data)
        }
      } catch (error) {
        console.error("Error fetching tickets:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user?.tenantId, token, user?.companyName])

  return (
    <DashboardLayout
      sidebarTitle="Support Agent"
      sidebarItems={sidebarItems}
      userRole="agent"
      userName={user?.name || "Agent"}
      notificationCount={allTickets.length}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">All Tickets</h1>
            <p className="text-muted-foreground mt-2">
              View all tickets in your tenant
              {tenantName && (
                <span className="ml-2 text-sm text-accent">
                  • {tenantName}
                </span>
              )}
            </p>
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Tickets List */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading tickets...</div>
        ) : allTickets.length === 0 ? (
          <div className="text-center py-12">
            <Ticket className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No tickets yet</h3>
            <p className="text-muted-foreground">Tickets will appear here once created</p>
          </div>
        ) : (
          <TicketListWithSearch tickets={allTickets} />
        )}
      </div>
    </DashboardLayout>
  )
}
