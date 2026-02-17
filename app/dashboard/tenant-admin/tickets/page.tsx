"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { BarChart3, Users, Ticket, Settings, Filter, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { API_URL, getHeaders } from "@/lib/api-helpers"
import { TicketListWithSearch } from "@/components/tickets/ticket-list-with-search"

export default function TicketsPage() {
  const { user, token } = useAuth()
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  const sidebarItems = [
    { label: "Overview", href: "/dashboard/tenant-admin", icon: <BarChart3 className="h-5 w-5" /> },
    { label: "Agents", href: "/dashboard/tenant-admin/agents", icon: <Users className="h-5 w-5" /> },
    { label: "Tickets", href: "/dashboard/tenant-admin/tickets", icon: <Ticket className="h-5 w-5" /> },
    { label: "Settings", href: "/dashboard/tenant-admin/settings", icon: <Settings className="h-5 w-5" /> },
  ]

  // Fetch tickets from API
  const fetchTickets = async () => {
    if (!user?.tenantId || !token) return
    
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/tickets?tenantId=${user.tenantId}`, {
        headers: getHeaders(true),
      })
      const result = await response.json()
      
      if (result.success && result.data) {
        // Sort by created date (newest first)
        const sorted = result.data.sort((a: any, b: any) => 
          new Date(b.created || b.createdAt).getTime() - new Date(a.created || a.createdAt).getTime()
        )
        setTickets(sorted)
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error("Error fetching tickets:", error)
    } finally {
      setLoading(false)
    }
  }

  // Load tickets on mount
  useEffect(() => {
    fetchTickets()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchTickets, 30000)
    
    return () => clearInterval(interval)
  }, [user?.tenantId, token])

  return (
    <DashboardLayout
      sidebarTitle="Tenant Admin"
      sidebarItems={sidebarItems}
      userRole="tenant-admin"
      userName={user?.name || "Tenant Manager"}
      notificationCount={tickets.filter((t: any) => t.status === "Open").length}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ticket Management</h1>
            <p className="text-muted-foreground mt-2">
              View and manage all tickets for your tenant
              {lastUpdate && (
                <span className="text-xs ml-2">
                  • Last updated: {lastUpdate.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchTickets} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Tickets List - Card & List view */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Tickets</CardTitle>
                <CardDescription>
                  Total: {tickets.length} tickets
                  {tickets.filter((t: any) => t.status === "Open").length > 0 && (
                    <span className="ml-2 text-orange-500">
                      • {tickets.filter((t: any) => t.status === "Open").length} Open
                    </span>
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading && tickets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                Loading tickets...
              </div>
            ) : (
              <TicketListWithSearch tickets={tickets} onTicketUpdated={fetchTickets} />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
