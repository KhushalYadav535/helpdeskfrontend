"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { Building2, Ticket, Settings, BarChart3, Plus, MoreVertical, Edit2, Trash2, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { API_URL, getHeaders } from "@/lib/api-helpers"

export default function TenantsPage() {
  const { user, token } = useAuth()
  const [tenants, setTenants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    adminName: "",
    adminPassword: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const sidebarItems = [
    { label: "Overview", href: "/dashboard/super-admin", icon: <BarChart3 className="h-5 w-5" /> },
    { label: "Tenants", href: "/dashboard/super-admin/tenants", icon: <Building2 className="h-5 w-5" /> },
    { label: "Agents", href: "/dashboard/super-admin/agents", icon: <Users className="h-5 w-5" /> },
    { label: "System Tickets", href: "/dashboard/super-admin/tickets", icon: <Ticket className="h-5 w-5" /> },
    { label: "Settings", href: "/dashboard/super-admin/settings", icon: <Settings className="h-5 w-5" /> },
  ]

  useEffect(() => {
    const fetchTenants = async () => {
      if (!token) return

      try {
        setLoading(true)
        const response = await fetch(`${API_URL}/tenants`, {
          headers: getHeaders(true),
        })
        const result = await response.json()

        if (result.success && result.data) {
          // Fetch agent and customer counts for each tenant
          const tenantsWithCounts = await Promise.all(
            result.data.map(async (tenant: any) => {
              try {
                // Fetch agents count
                const agentsResponse = await fetch(`${API_URL}/agents?tenantId=${tenant._id || tenant.id}`, {
                  headers: getHeaders(true),
                })
                const agentsResult = await agentsResponse.json()
                const agentsCount = agentsResult.success ? agentsResult.data.length : 0

                // Fetch customers count (if we have a customers endpoint)
                // For now, we'll use tickets as a proxy for activity
                const ticketsResponse = await fetch(`${API_URL}/tickets?tenantId=${tenant._id || tenant.id}`, {
                  headers: getHeaders(true),
                })
                const ticketsResult = await ticketsResponse.json()
                const customersCount = ticketsResult.success
                  ? new Set(ticketsResult.data.map((t: any) => t.customerEmail || t.customer)).size
                  : 0

                return {
                  id: tenant._id || tenant.id,
                  name: tenant.name,
                  email: tenant.email,
                  agents: agentsCount,
                  customers: customersCount,
                  status: tenant.status || "active",
                  joinDate: tenant.joinDate
                    ? new Date(tenant.joinDate).toISOString().split("T")[0]
                    : tenant.createdAt
                    ? new Date(tenant.createdAt).toISOString().split("T")[0]
                    : "",
                  webhookToken: tenant.webhookToken,
                }
              } catch (error) {
                return {
                  id: tenant._id || tenant.id,
                  name: tenant.name,
                  email: tenant.email,
                  agents: 0,
                  customers: 0,
                  status: tenant.status || "active",
                  joinDate: tenant.joinDate
                    ? new Date(tenant.joinDate).toISOString().split("T")[0]
                    : tenant.createdAt
                    ? new Date(tenant.createdAt).toISOString().split("T")[0]
                    : "",
                  webhookToken: tenant.webhookToken,
                }
              }
            })
          )

          setTenants(tenantsWithCounts)
        }
      } catch (error) {
        console.error("Error fetching tenants:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTenants()
  }, [token])

  const handleCreateTenant = async () => {
    if (!formData.name || !formData.email) {
      setError("Tenant name and email are required")
      return
    }

    if (formData.adminName && formData.adminPassword && formData.adminPassword.length < 6) {
      setError("Admin password must be at least 6 characters")
      return
    }

    if (formData.adminName && !formData.adminPassword) {
      setError("Admin password is required if creating admin user")
      return
    }

    setSubmitting(true)
    setError("")

    try {
      const response = await fetch(`${API_URL}/tenants`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          adminName: formData.adminName || undefined,
          adminPassword: formData.adminPassword || undefined,
        }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to create tenant")
      }

      // Refresh tenants list
      const tenantsResponse = await fetch(`${API_URL}/tenants`, {
        headers: getHeaders(true),
      })
      const tenantsResult = await tenantsResponse.json()

      if (tenantsResult.success && tenantsResult.data) {
        // Fetch agent and customer counts for each tenant
        const tenantsWithCounts = await Promise.all(
          tenantsResult.data.map(async (tenant: any) => {
            try {
              const agentsResponse = await fetch(`${API_URL}/agents?tenantId=${tenant._id || tenant.id}`, {
                headers: getHeaders(true),
              })
              const agentsResult = await agentsResponse.json()
              const agentsCount = agentsResult.success ? agentsResult.data.length : 0

              const ticketsResponse = await fetch(`${API_URL}/tickets?tenantId=${tenant._id || tenant.id}`, {
                headers: getHeaders(true),
              })
              const ticketsResult = await ticketsResponse.json()
              const customersCount = ticketsResult.success
                ? new Set(ticketsResult.data.map((t: any) => t.customerEmail || t.customer)).size
                : 0

              return {
                id: tenant._id || tenant.id,
                name: tenant.name,
                email: tenant.email,
                agents: agentsCount,
                customers: customersCount,
                status: tenant.status || "active",
                joinDate: tenant.joinDate
                  ? new Date(tenant.joinDate).toISOString().split("T")[0]
                  : tenant.createdAt
                  ? new Date(tenant.createdAt).toISOString().split("T")[0]
                  : "",
                webhookToken: tenant.webhookToken,
              }
            } catch (error) {
              return {
                id: tenant._id || tenant.id,
                name: tenant.name,
                email: tenant.email,
                agents: 0,
                customers: 0,
                status: tenant.status || "active",
                joinDate: tenant.joinDate
                  ? new Date(tenant.joinDate).toISOString().split("T")[0]
                  : tenant.createdAt
                  ? new Date(tenant.createdAt).toISOString().split("T")[0]
                  : "",
                webhookToken: tenant.webhookToken,
              }
            }
          })
        )

        setTenants(tenantsWithCounts)
      }

      // Close dialog and reset form
      setDialogOpen(false)
      setFormData({ name: "", email: "", adminName: "", adminPassword: "" })
    } catch (err: any) {
      setError(err.message || "Failed to create tenant")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteTenant = async (tenantId: string) => {
    if (!confirm("Are you sure you want to delete this tenant? This will delete all agents, users, and tickets associated with this tenant. This action cannot be undone.")) return

    try {
      const response = await fetch(`${API_URL}/tenants/${tenantId}`, {
        method: "DELETE",
        headers: getHeaders(true),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to delete tenant")
      }

      // Refresh tenants list
      const tenantsResponse = await fetch(`${API_URL}/tenants`, {
        headers: getHeaders(true),
      })
      const tenantsResult = await tenantsResponse.json()

      if (tenantsResult.success && tenantsResult.data) {
        // Fetch agent and customer counts for each tenant
        const tenantsWithCounts = await Promise.all(
          tenantsResult.data.map(async (tenant: any) => {
            try {
              const agentsResponse = await fetch(`${API_URL}/agents?tenantId=${tenant._id || tenant.id}`, {
                headers: getHeaders(true),
              })
              const agentsResult = await agentsResponse.json()
              const agentsCount = agentsResult.success ? agentsResult.data.length : 0

              const ticketsResponse = await fetch(`${API_URL}/tickets?tenantId=${tenant._id || tenant.id}`, {
                headers: getHeaders(true),
              })
              const ticketsResult = await ticketsResponse.json()
              const customersCount = ticketsResult.success
                ? new Set(ticketsResult.data.map((t: any) => t.customerEmail || t.customer)).size
                : 0

              return {
                id: tenant._id || tenant.id,
                name: tenant.name,
                email: tenant.email,
                agents: agentsCount,
                customers: customersCount,
                status: tenant.status || "active",
                joinDate: tenant.joinDate
                  ? new Date(tenant.joinDate).toISOString().split("T")[0]
                  : tenant.createdAt
                  ? new Date(tenant.createdAt).toISOString().split("T")[0]
                  : "",
                webhookToken: tenant.webhookToken,
              }
            } catch (error) {
              return {
                id: tenant._id || tenant.id,
                name: tenant.name,
                email: tenant.email,
                agents: 0,
                customers: 0,
                status: tenant.status || "active",
                joinDate: tenant.joinDate
                  ? new Date(tenant.joinDate).toISOString().split("T")[0]
                  : tenant.createdAt
                  ? new Date(tenant.createdAt).toISOString().split("T")[0]
                  : "",
                webhookToken: tenant.webhookToken,
              }
            }
          })
        )

        setTenants(tenantsWithCounts)
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete tenant")
    }
  }

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tenant Management</h1>
            <p className="text-muted-foreground mt-2">Manage all customer tenants in the system</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Tenant
          </Button>
        </div>

        {/* Create Tenant Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Tenant</DialogTitle>
              <DialogDescription>Create a new tenant organization</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="tenant-name">Tenant Name</Label>
                <Input
                  id="tenant-name"
                  placeholder="Company Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tenant-email">Contact Email</Label>
                <Input
                  id="tenant-email"
                  type="email"
                  placeholder="admin@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-name">Admin Name (Optional)</Label>
                <Input
                  id="admin-name"
                  placeholder="Admin Full Name"
                  value={formData.adminName}
                  onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Create a tenant-admin user account for this tenant
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password">Admin Password (Optional)</Label>
                <PasswordInput
                  id="admin-password"
                  placeholder="••••••••"
                  value={formData.adminPassword}
                  onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 6 characters. Required if admin name is provided.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={handleCreateTenant} disabled={submitting}>
                {submitting ? "Creating..." : "Create Tenant"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Tenants List */}
        <Card>
          <CardHeader>
            <CardTitle>Active Tenants</CardTitle>
            <CardDescription>Total: {tenants.length} tenants</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading tenants...</div>
            ) : tenants.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No tenants yet</h3>
                <p className="text-muted-foreground">Tenants will appear here once created</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Tenant Name</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Contact Email</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Agents</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Customers</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Webhook Token</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Joined</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenants.map((tenant) => (
                    <tr key={tenant.id} className="border-b border-border hover:bg-accent/5 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium">{tenant.name}</div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{tenant.email}</td>
                      <td className="py-3 px-4 text-muted-foreground">{tenant.agents}</td>
                      <td className="py-3 px-4 text-muted-foreground">{tenant.customers}</td>
                      <td className="py-3 px-4">
                        {(tenant as any).webhookToken ? (
                          <code className="text-xs bg-background px-2 py-1 rounded border border-border">
                            {(tenant as any).webhookToken.substring(0, 20)}...
                          </code>
                        ) : (
                          <span className="text-xs text-muted-foreground">Not set</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{tenant.joinDate}</td>
                      <td className="py-3 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <a href={`/dashboard/super-admin/agents?tenant=${tenant.id}`} className="flex items-center">
                                <Users className="h-4 w-4 mr-2" />
                                View Agents
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeleteTenant(tenant.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
