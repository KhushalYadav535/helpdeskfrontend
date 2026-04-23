"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { Building2, Ticket, Settings, BarChart3, Users, Wrench, RefreshCw, Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import { API_URL, getHeaders } from "@/lib/api-helpers"
import { TicketListWithSearch } from "@/components/tickets/ticket-list-with-search"
import Link from "next/link"
import { isStrictKindTicket } from "@/lib/ticket-kind"

export default function SuperAdminTroubleshootingPage() {
  const { user, token } = useAuth()
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)


  const sidebarItems = [
    { label: "Overview", href: "/dashboard/super-admin", icon: <BarChart3 className="h-5 w-5" /> },
    { label: "Tenants", href: "/dashboard/super-admin/tenants", icon: <Building2 className="h-5 w-5" /> },
    { label: "Agents", href: "/dashboard/super-admin/agents", icon: <Users className="h-5 w-5" /> },
    { label: "System Tickets", href: "/dashboard/super-admin/tickets", icon: <Ticket className="h-5 w-5" /> },
    { label: "Service Requests", href: "/dashboard/super-admin/tickets/service-requests", icon: <Wrench className="h-5 w-5" /> },
    { label: "Troubleshooting", href: "/dashboard/super-admin/tickets/troubleshooting", icon: <Wrench className="h-5 w-5" /> },
    { label: "Create Ticket", href: "/dashboard/super-admin/new", icon: <Plus className="h-5 w-5" /> },
    { label: "Settings", href: "/dashboard/super-admin/settings", icon: <Settings className="h-5 w-5" /> },
  ]

  const fetchTickets = useCallback(async () => {
    if (!token) return
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/tickets?kind=troubleshooting`, { headers: getHeaders(true) })
      const result = await response.json()
      if (result.success && result.data) {
        const sorted = (result.data as any[]).sort(
          (a: any, b: any) => new Date(b.created || b.createdAt).getTime() - new Date(a.created || a.createdAt).getTime()
        )
        setTickets(sorted.filter((ticket: any) => isStrictKindTicket(ticket, "troubleshooting")))
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
      notificationCount={0}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Troubleshooting</h1>
            <p className="text-muted-foreground mt-2">Only troubleshooting tickets are shown here</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchTickets} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button asChild>
              <Link href="/dashboard/super-admin/new">Create Manual</Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting Tickets</CardTitle>
            <CardDescription>Total: {tickets.length} tickets</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading troubleshooting tickets...</div>
            ) : (
              <TicketListWithSearch tickets={tickets} onTicketUpdated={fetchTickets} />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
