"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { Building2, Ticket, Settings, BarChart3, Filter, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { API_URL, getHeaders } from "@/lib/api-helpers"

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

  useEffect(() => {
    const fetchTickets = async () => {
      if (!token) return

      try {
        setLoading(true)
        const response = await fetch(`${API_URL}/tickets`, {
          headers: getHeaders(true),
        })
        const result = await response.json()

        if (result.success && result.data) {
          // Sort by created date (newest first) and filter open/in-progress
          const filtered = result.data
            .filter((t: any) => t.status === "Open" || t.status === "In Progress")
            .sort(
              (a: any, b: any) =>
                new Date(b.created || b.createdAt).getTime() - new Date(a.created || a.createdAt).getTime()
            )
          setTickets(filtered)
        }
      } catch (error) {
        console.error("Error fetching tickets:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
    const interval = setInterval(fetchTickets, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [token])

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-blue-500/20 text-blue-400"
      case "In Progress":
        return "bg-purple-500/20 text-purple-400"
      case "Resolved":
        return "bg-green-500/20 text-green-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

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

        {/* Tickets Table */}
        <Card>
          <CardHeader>
            <CardTitle>Open & In-Progress Tickets</CardTitle>
            <CardDescription>Total: {tickets.length} tickets</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading tickets...</div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-8">
                <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No open tickets</h3>
                <p className="text-muted-foreground">All tickets are resolved or closed</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <div
                    key={ticket._id || ticket.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/5 transition-colors cursor-pointer"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm font-semibold text-accent">
                          {ticket.ticketId || ticket._id?.toString().substring(0, 8)}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </div>
                      <p className="font-medium">{ticket.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {(ticket.tenantId as any)?.name || "Unknown Tenant"} • Created{" "}
                        {new Date(ticket.created || ticket.createdAt).toLocaleDateString()}
                      </p>
                    </div>
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
