"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { Building2, Ticket, Settings, BarChart3, Filter, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import { API_URL, getHeaders } from "@/lib/api-helpers"
import { TicketListWithSearch } from "@/components/tickets/ticket-list-with-search"

export default function TicketsPage() {
  const { user, token } = useAuth()
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const sidebarItems = [
    { label: "Overview", href: "/dashboard/super-admin", icon: <BarChart3 className="h-5 w-5" /> },
    { label: "Tenants", href: "/dashboard/super-admin/tenants", icon: <Building2 className="h-5 w-5" /> },
    { label: "Agents", href: "/dashboard/super-admin/agents", icon: <Users className="h-5 w-5" /> },
    { label: "System Tickets", href: "/dashboard/super-admin/tickets", icon: <Ticket className="h-5 w-5" /> },
    { label: "Settings", href: "/dashboard/super-admin/settings", icon: <Settings className="h-5 w-5" /> },
  ]

  const fetchTickets = useCallback(async () => {
    if (!token) return
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/tickets`, { headers: getHeaders(true) })
      const result = await response.json()
      if (result.success && result.data) {
        const sorted = (result.data as any[]).sort(
          (a: any, b: any) => new Date(b.created || b.createdAt).getTime() - new Date(a.created || a.createdAt).getTime()
        )
        setTickets(sorted)
      }
    } catch (error) {
      console.error("Error fetching tickets:", error)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchTickets()
    const interval = setInterval(fetchTickets, 30000)
    return () => clearInterval(interval)
  }, [fetchTickets])

  return (
    <DashboardLayout
      sidebarTitle="Super Admin"
      sidebarItems={sidebarItems}
      userRole="super-admin"
      userName={user?.name || "Super Admin"}
      notificationCount={tickets.length}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">System Tickets</h1>
            <p className="text-muted-foreground mt-2">Monitor and manage all system-level tickets</p>
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Tickets – Card & List view */}
        <Card>
          <CardHeader>
            <CardTitle>System Tickets</CardTitle>
            <CardDescription>Total: {tickets.length} tickets • Use filters for Open/In Progress</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading tickets...</div>
            ) : (
              <TicketListWithSearch tickets={tickets} onTicketUpdated={fetchTickets} />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
