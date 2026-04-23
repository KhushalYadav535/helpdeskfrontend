"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { BarChart3, Users, Ticket, Settings, Wrench, RefreshCw, Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { API_URL, getHeaders } from "@/lib/api-helpers"
import { TicketListWithSearch } from "@/components/tickets/ticket-list-with-search"
import Link from "next/link"
import { isStrictKindTicket } from "@/lib/ticket-kind"

export default function TenantAdminTroubleshootingPage() {
  const { user, token } = useAuth()
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const openTicketCount = tickets.filter((t: any) => t.status === "Open").length

  const sidebarItems = [
    { label: "Overview", href: "/dashboard/tenant-admin", icon: <BarChart3 className="h-5 w-5" /> },
    { label: "Agents", href: "/dashboard/tenant-admin/agents", icon: <Users className="h-5 w-5" /> },
    {
      label: "Tickets",
      href: "/dashboard/tenant-admin/tickets",
      icon: <Ticket className="h-5 w-5" />,
      ...(openTicketCount > 0 ? { badge: openTicketCount } : {}),
    },
    { label: "Service Requests", href: "/dashboard/tenant-admin/tickets/service-requests", icon: <Wrench className="h-5 w-5" /> },
    { label: "Troubleshooting", href: "/dashboard/tenant-admin/tickets/troubleshooting", icon: <Wrench className="h-5 w-5" /> },
    { label: "Create Ticket", href: "/dashboard/tenant-admin/new", icon: <Plus className="h-5 w-5" /> },
    { label: "Settings", href: "/dashboard/tenant-admin/settings", icon: <Settings className="h-5 w-5" /> },
  ]

  const fetchTickets = async () => {
    if (!user?.tenantId || !token) return
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/tickets?tenantId=${user.tenantId}&kind=troubleshooting`, { headers: getHeaders(true) })
      const result = await response.json()
      if (result.success && result.data) {
        const sorted = result.data.sort(
          (a: any, b: any) => new Date(b.created || b.createdAt).getTime() - new Date(a.created || a.createdAt).getTime()
        )
        setTickets(sorted.filter((ticket: any) => isStrictKindTicket(ticket, "troubleshooting")))
      }
    } catch (error) {
      console.error("Error fetching tickets:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
    const interval = setInterval(fetchTickets, 30000)
    return () => clearInterval(interval)
  }, [user?.tenantId, token])

  return (
    <DashboardLayout
      sidebarTitle="Tenant Admin"
      sidebarItems={sidebarItems}
      userRole="tenant-admin"
      userName={user?.name || "Tenant Manager"}
      notificationCount={openTicketCount}
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
              <Link href="/dashboard/tenant-admin/new">Create Manual</Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting Tickets</CardTitle>
            <CardDescription>Total: {tickets.length} tickets</CardDescription>
          </CardHeader>
          <CardContent>
            {loading && tickets.length === 0 ? (
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
