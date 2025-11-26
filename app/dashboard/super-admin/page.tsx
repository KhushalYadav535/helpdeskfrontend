"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { BarChart3, Users, Ticket, Settings, TrendingUp, Building2, Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { API_URL, getHeaders } from "@/lib/api-helpers"

export default function SuperAdminDashboard() {
  const { user, token } = useAuth()
  const [tenantStats, setTenantStats] = useState({
    activeTenants: 0,
    totalAgents: 0,
    totalTickets: 0,
    avgResponseTime: "N/A",
  })
  const [topTenants, setTopTenants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const sidebarItems = [
    { label: "Overview", href: "/dashboard/super-admin", icon: <BarChart3 className="h-5 w-5" /> },
    { label: "Tenants", href: "/dashboard/super-admin/tenants", icon: <Building2 className="h-5 w-5" /> },
    { label: "Agents", href: "/dashboard/super-admin/agents", icon: <Users className="h-5 w-5" /> },
    { label: "System Tickets", href: "/dashboard/super-admin/tickets", icon: <Ticket className="h-5 w-5" /> },
    { label: "Create Ticket", href: "/dashboard/super-admin/new", icon: <Plus className="h-5 w-5" /> },
    { label: "Settings", href: "/dashboard/super-admin/settings", icon: <Settings className="h-5 w-5" /> },
  ]

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return

      try {
        setLoading(true)
        
        // Fetch tenant stats
        const statsResponse = await fetch(`${API_URL}/analytics/tenant-stats`, {
          headers: getHeaders(true),
        })
        const statsResult = await statsResponse.json()

        if (statsResult.success && statsResult.data) {
          setTenantStats(statsResult.data)
        }

        // Fetch all tenants for top tenants list
        const tenantsResponse = await fetch(`${API_URL}/tenants`, {
          headers: getHeaders(true),
        })
        const tenantsResult = await tenantsResponse.json()

        if (tenantsResult.success && tenantsResult.data) {
          // Fetch ticket counts for each tenant
          const tenantsWithTickets = await Promise.all(
            tenantsResult.data.map(async (tenant: any) => {
              try {
                const ticketsResponse = await fetch(`${API_URL}/tickets?tenantId=${tenant._id || tenant.id}`, {
                  headers: getHeaders(true),
                })
                const ticketsResult = await ticketsResponse.json()
                const ticketCount = ticketsResult.success ? ticketsResult.data.length : 0

                // Fetch agent count for tenant
                const agentsResponse = await fetch(`${API_URL}/agents?tenantId=${tenant._id || tenant.id}`, {
                  headers: getHeaders(true),
                })
                const agentsResult = await agentsResponse.json()
                const agentCount = agentsResult.success ? agentsResult.data.length : 0

                return {
                  id: tenant._id || tenant.id,
                  name: tenant.name,
                  tickets: ticketCount,
                  agents: agentCount,
                  status: tenant.status || "active",
                }
              } catch (error) {
                return {
                  id: tenant._id || tenant.id,
                  name: tenant.name,
                  tickets: 0,
                  agents: 0,
                  status: tenant.status || "active",
                }
              }
            })
          )

          // Sort by ticket count and get top 3
          const sorted = tenantsWithTickets
            .sort((a, b) => b.tickets - a.tickets)
            .slice(0, 3)
          setTopTenants(sorted)
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [token])

  return (
    <DashboardLayout
      sidebarTitle="Super Admin"
      sidebarItems={sidebarItems}
      userRole="super-admin"
      userName={user?.name || "Super Admin"}
      notificationCount={0}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
          <p className="text-muted-foreground mt-2">Manage all tenants and monitor system health</p>
        </div>

        {/* System Stats */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Loading...</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-xs text-muted-foreground">Loading...</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
                <Building2 className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tenantStats.activeTenants}</div>
                <p className="text-xs text-muted-foreground">Total active tenants</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
                <Users className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tenantStats.totalAgents}</div>
                <p className="text-xs text-muted-foreground">Across all tenants</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Tickets</CardTitle>
                <Ticket className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tenantStats.totalTickets.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">All tickets in system</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
                <TrendingUp className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tenantStats.avgResponseTime}</div>
                <p className="text-xs text-muted-foreground">System average</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Actions & Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Tenant Management</CardTitle>
              <CardDescription>Add, edit, or monitor tenant accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/super-admin/tenants">
                <Button className="w-full">Manage Tenants</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure global system parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/super-admin/settings">
                <Button className="w-full">Settings</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Tenant Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Top Tenants by Activity</CardTitle>
            <CardDescription>Tenants with highest ticket volume</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading tenant data...</div>
            ) : topTenants.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No tenants yet</div>
            ) : (
              <div className="space-y-4">
                {topTenants.map((tenant) => (
                  <div
                    key={tenant.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/5 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{tenant.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {tenant.agents} agents • {tenant.tickets} tickets
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        tenant.status === "active"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      {tenant.status}
                    </span>
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
