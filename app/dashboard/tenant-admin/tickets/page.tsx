"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { BarChart3, Users, Ticket, Settings, Filter, RefreshCw, MessageSquare, Phone, Mail } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"
import { API_URL, getHeaders } from "@/lib/api-helpers"
import { TicketDetailModal } from "@/components/tickets/ticket-detail-modal"

export default function TicketsPage() {
  const { user, token } = useAuth()
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [modalOpen, setModalOpen] = useState(false)

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

  const getSourceIcon = (source: string) => {
    switch (source?.toLowerCase()) {
      case "whatsapp":
        return <MessageSquare className="h-3 w-3" />
      case "telegram":
        return <MessageSquare className="h-3 w-3" />
      case "phone":
        return <Phone className="h-3 w-3" />
      case "email":
        return <Mail className="h-3 w-3" />
      default:
        return <MessageSquare className="h-3 w-3" />
    }
  }

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

        {/* Tickets List */}
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
            ) : tickets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No tickets yet</p>
                <p className="text-sm mt-2">Tickets from WhatsApp, Telegram, Phone, etc. will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <div
                    key={ticket._id || ticket.id || ticket.ticketId}
                    onClick={() => {
                      // Transform ticket data for modal
                      const modalTicket = {
                        id: ticket.ticketId || ticket.id || ticket._id?.toString(),
                        title: ticket.title || ticket.subject || "",
                        description: ticket.description || "",
                        status: ticket.status || "Open",
                        priority: ticket.priority || "Medium",
                        tenant: (ticket.tenantId as any)?.name || "Unknown",
                        agent: (ticket.agentId as any)?.name || ticket.agent || "Unassigned",
                        customer: ticket.customer || "Unknown",
                        created: ticket.created || ticket.createdAt || "",
                        updated: ticket.updated || ticket.updatedAt || "",
                        category: ticket.category || "general",
                        responses: ticket.responses || 0,
                        _id: ticket._id?.toString() || ticket.id,
                      }
                      setSelectedTicket(modalTicket)
                      setModalOpen(true)
                    }}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/5 transition-colors cursor-pointer"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-mono text-sm font-semibold text-accent">{ticket.ticketId || ticket.id || (ticket._id ? ticket._id.toString().substring(0,8) : "")}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                        {ticket.source && (
                          <Badge variant="outline" className="text-xs flex items-center gap-1">
                            {getSourceIcon(ticket.source)}
                            {ticket.source}
                          </Badge>
                        )}
                      </div>
                      <p className="font-medium">{ticket.title || ticket.subject}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {ticket.customer} • {(ticket.agentId as any)?.name || ticket.agent || "Unassigned"} • {new Date(ticket.created || ticket.createdAt).toLocaleDateString()}
                      </p>
                      {ticket.customerPhone && (
                        <p className="text-xs text-muted-foreground mt-1">📞 {ticket.customerPhone}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ticket Detail Modal */}
        <TicketDetailModal 
          ticket={selectedTicket} 
          open={modalOpen} 
          onOpenChange={(open) => {
            setModalOpen(open)
            if (!open) {
              // Refresh tickets when modal closes (in case ticket was closed)
              fetchTickets()
            }
          }} 
        />
      </div>
    </DashboardLayout>
  )
}
