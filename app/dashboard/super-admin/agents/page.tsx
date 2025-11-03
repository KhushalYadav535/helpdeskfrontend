"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { Building2, Ticket, Settings, BarChart3, Users, Plus, MoreVertical, Edit2, Trash2, Eye } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState, useEffect, Suspense } from "react"
import { useAuth } from "@/lib/auth-context"
import { API_URL, getHeaders } from "@/lib/api-helpers"
import { useSearchParams } from "next/navigation"

function SuperAdminAgentsContent() {
  const { user, token } = useAuth()
  const searchParams = useSearchParams()
  const [agents, setAgents] = useState<any[]>([])
  const [tenants, setTenants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedTenant, setSelectedTenant] = useState<string>("")
  const [selectedAgent, setSelectedAgent] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    agentLevel: "agent",
    tenantId: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [filterTenant, setFilterTenant] = useState<string>("all")

  const sidebarItems = [
    { label: "Overview", href: "/dashboard/super-admin", icon: <BarChart3 className="h-5 w-5" /> },
    { label: "Tenants", href: "/dashboard/super-admin/tenants", icon: <Building2 className="h-5 w-5" /> },
    { label: "Agents", href: "/dashboard/super-admin/agents", icon: <Users className="h-5 w-5" /> },
    { label: "System Tickets", href: "/dashboard/super-admin/tickets", icon: <Ticket className="h-5 w-5" /> },
    { label: "Settings", href: "/dashboard/super-admin/settings", icon: <Settings className="h-5 w-5" /> },
  ]

  // Update filter from URL params
  useEffect(() => {
    const tenantParam = searchParams?.get("tenant")
    if (tenantParam) {
      setFilterTenant(tenantParam)
      // If tenant is selected from URL, pre-fill form
      setFormData((prev) => ({ ...prev, tenantId: tenantParam }))
    }
  }, [searchParams])

  // Fetch tenants and agents
  useEffect(() => {
    const fetchData = async () => {
      if (!token) return

      try {
        setLoading(true)

        // Fetch tenants
        const tenantsResponse = await fetch(`${API_URL}/tenants`, {
          headers: getHeaders(true),
        })
        const tenantsResult = await tenantsResponse.json()

        if (tenantsResult.success && tenantsResult.data) {
          setTenants(tenantsResult.data)
        }

        // Fetch all agents
        const agentsResponse = await fetch(`${API_URL}/agents`, {
          headers: getHeaders(true),
        })
        const agentsResult = await agentsResponse.json()

        if (agentsResult.success && agentsResult.data) {
          setAgents(agentsResult.data)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token])

  const handleAddAgent = () => {
    setDialogOpen(true)
    setError("")
    // Reset form but keep tenantId if it was set from URL
    if (!formData.tenantId) {
      setFormData({ name: "", email: "", password: "", agentLevel: "agent", tenantId: "" })
    }
  }

  const handleCreateAgent = async () => {
    if (!formData.name || !formData.email || !formData.password || !formData.tenantId) {
      setError("All fields are required")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setSubmitting(true)
    setError("")

    try {
      const response = await fetch(`${API_URL}/agents`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          agentLevel: formData.agentLevel,
          tenantId: formData.tenantId,
        }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to create agent")
      }

      // Refresh agents list
      const agentsResponse = await fetch(`${API_URL}/agents`, {
        headers: getHeaders(true),
      })
      const agentsResult = await agentsResponse.json()

      if (agentsResult.success && agentsResult.data) {
        setAgents(agentsResult.data)
      }

      // Close dialog and reset form
      setDialogOpen(false)
      setFormData({ name: "", email: "", password: "", agentLevel: "agent", tenantId: "" })
      setSelectedTenant("")
    } catch (err: any) {
      setError(err.message || "Failed to create agent")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteAgent = async (agentId: string) => {
    if (!confirm("Are you sure you want to delete this agent?")) return

    try {
      const response = await fetch(`${API_URL}/agents/${agentId}`, {
        method: "DELETE",
        headers: getHeaders(true),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to delete agent")
      }

      // Refresh agents list
      const agentsResponse = await fetch(`${API_URL}/agents`, {
        headers: getHeaders(true),
      })
      const agentsResult = await agentsResponse.json()

      if (agentsResult.success && agentsResult.data) {
        setAgents(agentsResult.data)
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete agent")
    }
  }

  const handleViewAgent = (agent: any) => {
    setSelectedAgent(agent)
    setViewDialogOpen(true)
  }

  const getTenantName = (tenantId: string) => {
    const tenant = tenants.find((t) => (t._id || t.id) === tenantId)
    return tenant?.name || "Unknown Tenant"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500/20 text-green-400"
      case "away":
        return "bg-yellow-500/20 text-yellow-400"
      case "offline":
        return "bg-gray-500/20 text-gray-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "supervisor":
        return "bg-purple-500/20 text-purple-400"
      case "senior-agent":
        return "bg-blue-500/20 text-blue-400"
      case "agent":
        return "bg-gray-500/20 text-gray-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  const getLevelLabel = (level: string) => {
    switch (level) {
      case "supervisor":
        return "Supervisor"
      case "senior-agent":
        return "Senior Agent"
      case "agent":
        return "Agent"
      default:
        return "Agent"
    }
  }

  const filteredAgents =
    filterTenant === "all"
      ? agents
      : agents.filter((agent) => (agent.tenantId?._id || agent.tenantId) === filterTenant)

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
            <h1 className="text-3xl font-bold tracking-tight">Agent Management</h1>
            <p className="text-muted-foreground mt-2">Manage agents across all tenants</p>
          </div>
          <Button onClick={handleAddAgent}>
            <Plus className="h-4 w-4 mr-2" />
            Add Agent
          </Button>
        </div>

        {/* Add Agent Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Agent</DialogTitle>
              <DialogDescription>Create a new agent for any tenant</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="tenant-select">Select Tenant</Label>
                <Select
                  value={formData.tenantId}
                  onValueChange={(value) => {
                    setFormData({ ...formData, tenantId: value })
                    setSelectedTenant(value)
                  }}
                >
                  <SelectTrigger id="tenant-select">
                    <SelectValue placeholder="Select a tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants.map((tenant) => (
                      <SelectItem key={tenant._id || tenant.id} value={tenant._id || tenant.id}>
                        {tenant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="agent-name">Full Name</Label>
                <Input
                  id="agent-name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agent-email">Email</Label>
                <Input
                  id="agent-email"
                  type="email"
                  placeholder="agent@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agent-password">Password</Label>
                <PasswordInput
                  id="agent-password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="agent-level">Agent Level</Label>
                <Select
                  value={formData.agentLevel}
                  onValueChange={(value) => setFormData({ ...formData, agentLevel: value })}
                >
                  <SelectTrigger id="agent-level">
                    <SelectValue placeholder="Select agent level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agent">Agent - View & work on tickets, close tickets</SelectItem>
                    <SelectItem value="senior-agent">Senior Agent - All Agent permissions + Assign tickets</SelectItem>
                    <SelectItem value="supervisor">Supervisor - All Senior Agent permissions + Track & manage agents</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={handleCreateAgent} disabled={submitting}>
                {submitting ? "Creating..." : "Create Agent"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Agent Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agent Details</DialogTitle>
              <DialogDescription>View agent information and statistics</DialogDescription>
            </DialogHeader>
            {selectedAgent && (
              <div className="space-y-4 py-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm mt-1">{selectedAgent.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm mt-1">{selectedAgent.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Tenant</Label>
                  <p className="text-sm mt-1">{getTenantName(selectedAgent.tenantId?._id || selectedAgent.tenantId)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Agent Level</Label>
                  <p className="text-sm mt-1">{getLevelLabel(selectedAgent.agentLevel || "agent")}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <p className="text-sm mt-1 capitalize">{selectedAgent.status}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Tickets Assigned</Label>
                  <p className="text-sm mt-1">{selectedAgent.ticketsAssigned || 0}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Resolved</Label>
                  <p className="text-sm mt-1">{selectedAgent.resolved || 0}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Rating</Label>
                  <p className="text-sm mt-1">{selectedAgent.satisfaction || 0} ⭐</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Filter */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Agents</CardTitle>
                <CardDescription>Total: {filteredAgents.length} agents</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={filterTenant} onValueChange={setFilterTenant}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tenants</SelectItem>
                    {tenants.map((tenant) => (
                      <SelectItem key={tenant._id || tenant.id} value={tenant._id || tenant.id}>
                        {tenant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading agents...</div>
            ) : filteredAgents.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No agents found</h3>
                <p className="text-muted-foreground mb-4">
                  {filterTenant === "all"
                    ? "Get started by adding your first agent"
                    : "No agents found for this tenant"}
                </p>
                <Button onClick={handleAddAgent}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Agent
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Tenant</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Level</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Assigned</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Resolved</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Rating</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAgents.map((agent) => (
                      <tr key={agent.id || agent._id} className="border-b border-border hover:bg-accent/5 transition-colors">
                        <td className="py-3 px-4 font-medium">{agent.name}</td>
                        <td className="py-3 px-4 text-muted-foreground">{agent.email}</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {getTenantName(agent.tenantId?._id || agent.tenantId)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium capitalize ${getLevelColor(agent.agentLevel || "agent")}`}
                          >
                            {getLevelLabel(agent.agentLevel || "agent")}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(agent.status)}`}
                          >
                            {agent.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{agent.ticketsAssigned || 0}</td>
                        <td className="py-3 px-4 text-muted-foreground">{agent.resolved || 0}</td>
                        <td className="py-3 px-4 text-muted-foreground">{agent.satisfaction || 0} ⭐</td>
                        <td className="py-3 px-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewAgent(agent)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteAgent(agent.id || agent._id)}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove
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

export default function SuperAdminAgentsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <SuperAdminAgentsContent />
    </Suspense>
  )
}

