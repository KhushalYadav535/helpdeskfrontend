"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { Ticket, AlertCircle, Settings, Plus, Clock, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useMemo } from "react"
import { TicketListWithSearch } from "@/components/tickets/ticket-list-with-search"

export default function CustomerDashboard() {
  const sidebarItems = [
    { label: "My Tickets", href: "/dashboard/customer", icon: <Ticket className="h-5 w-5" /> },
    { label: "Submit Ticket", href: "/dashboard/customer/new", icon: <Plus className="h-5 w-5" /> },
    { label: "Knowledge Base", href: "/dashboard/customer/kb", icon: <AlertCircle className="h-5 w-5" /> },
    { label: "Settings", href: "/dashboard/customer/settings", icon: <Settings className="h-5 w-5" /> },
  ]

  const [myTickets] = useState([
    { id: "TKT-4001", title: "Cannot reset password", status: "In Progress", priority: "High", created: "2025-10-31", updated: "2025-10-31", responses: 3 },
    { id: "TKT-4002", title: "Billing inquiry about subscription", status: "Resolved", priority: "Medium", created: "2025-10-28", updated: "2025-10-29", responses: 2 },
    { id: "TKT-4003", title: "How to integrate API", status: "In Progress", priority: "Low", created: "2025-10-25", updated: "2025-10-31", responses: 5 },
  ])

  const ticketsForList = useMemo(() =>
    myTickets.map((t) => ({
      ticketId: t.id,
      id: t.id,
      title: t.title,
      subject: t.title,
      description: "",
      status: t.status,
      priority: t.priority,
      customer: "Me",
      created: t.created,
      createdAt: t.created,
      updated: t.updated,
      updatedAt: t.updated,
      responses: t.responses,
    })),
    [myTickets]
  )

  return (
    <DashboardLayout
      sidebarTitle="Customer Portal"
      sidebarItems={sidebarItems}
      userRole="customer"
      userName="John Doe"
      notificationCount={1}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>
            <p className="text-muted-foreground mt-2">Track and manage your support requests</p>
          </div>
          <Link href="/dashboard/customer/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </Link>
        </div>

        {/* Customer Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
              <Ticket className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myTickets.length}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open/In Progress</CardTitle>
              <AlertCircle className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {myTickets.filter((t) => t.status !== "Resolved" && t.status !== "Closed").length}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting response</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myTickets.filter((t) => t.status === "Resolved" || t.status === "Closed").length}</div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
              <Clock className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4h</div>
              <p className="text-xs text-muted-foreground">Typical</p>
            </CardContent>
          </Card>
        </div>

        {/* My Tickets – Card & List view */}
        <Card>
          <CardHeader>
            <CardTitle>My Tickets</CardTitle>
            <CardDescription>Your submitted support tickets</CardDescription>
          </CardHeader>
          <CardContent>
            <TicketListWithSearch tickets={ticketsForList} />
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
              <CardDescription>Browse common solutions</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/customer/kb">
                <Button className="w-full bg-transparent" variant="outline">
                  Visit Knowledge Base
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/customer/settings">
                <Button className="w-full bg-transparent" variant="outline">
                  Go to Settings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
