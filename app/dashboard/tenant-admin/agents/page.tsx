"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { BarChart3, Users, Ticket, Settings, Plus, MoreVertical, Edit2, Trash2, Wrench } from "lucide-react"
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
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { API_URL, getHeaders } from "@/lib/api-helpers"

export default function AgentsPage() {
  const { user, token } = useAuth()
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    agentLevel: "agent",
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [salesUsers, setSalesUsers] = useState<any[]>([])
  const [salesDialogOpen, setSalesDialogOpen] = useState(false)
  const [salesSubmitting, setSalesSubmitting] = useState(false)
  const [salesError, setSalesError] = useState("")
  const [salesFormData, setSalesFormData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [workloadDialogOpen, setWorkloadDialogOpen] = useState(false)
  const [workloadAgent, setWorkloadAgent] = useState<any>(null)
  const [maxTicketsInput, setMaxTicketsInput] = useState("15")
  const [workloadError, setWorkloadError] = useState("")
  const [workloadSaving, setWorkloadSaving] = useState(false)
  const [accessDialogOpen, setAccessDialogOpen] = useState(false)
  const [accessSaving, setAccessSaving] = useState(false)
  const [accessError, setAccessError] = useState("")
  const [accessUser, setAccessUser] = useState<any>(null)
  const [accessSelection, setAccessSelection] = useState<string[]>([])
  const [primaryRoleSelection, setPrimaryRoleSelection] = useState<"agent" | "sales-team">("agent")

  const refreshAgents = async () => {
    const agentsResponse = await fetch(`${API_URL}/agents?tenantId=${user?.tenantId}`, {
      headers: getHeaders(true),
    })
    const agentsResult = await agentsResponse.json()
    if (agentsResult.success && agentsResult.data) {
      setAgents(agentsResult.data)
    }
  }

  const refreshSalesUsers = async () => {
    const salesResponse = await fetch(`${API_URL}/auth/users?role=sales-team`, {
      headers: getHeaders(true),
    })
    const salesResult = await salesResponse.json()
    if (salesResult.success && salesResult.data) {
      setSalesUsers(salesResult.data)
    }
  }

  const sidebarItems = [
    { label: "Overview", href: "/dashboard/tenant-admin", icon: <BarChart3 className="h-5 w-5" /> },
    { label: "Agents", href: "/dashboard/tenant-admin/agents", icon: <Users className="h-5 w-5" /> },
    { label: "Tickets", href: "/dashboard/tenant-admin/tickets", icon: <Ticket className="h-5 w-5" /> },
    { label: "Service Requests", href: "/dashboard/tenant-admin/tickets/service-requests", icon: <Wrench className="h-5 w-5" /> },
    { label: "Create Ticket", href: "/dashboard/tenant-admin/new", icon: <Plus className="h-5 w-5" /> },
    { label: "Settings", href: "/dashboard/tenant-admin/settings", icon: <Settings className="h-5 w-5" /> },
  ]

  // Fetch agents + sales users from backend
  useEffect(() => {
    const fetchTeamData = async () => {
      if (!user?.tenantId || !token) return

      try {
        setLoading(true)
        await Promise.all([refreshAgents(), refreshSalesUsers()])
      } catch (error) {
        console.error("Error fetching team data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTeamData()
  }, [user?.tenantId, token])

  const handleAddAgent = async () => {
    if (!formData.name || !formData.email || !formData.password) {
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
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to create agent")
      }

      // Refresh agents list
      await refreshAgents()

      // Close dialog and reset form
      setDialogOpen(false)
      setFormData({ name: "", email: "", password: "", agentLevel: "agent" })
    } catch (err: any) {
      setError(err.message || "Failed to create agent")
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddSalesUser = async () => {
    if (!salesFormData.name || !salesFormData.email || !salesFormData.password) {
      setSalesError("All fields are required")
      return
    }
    if (salesFormData.password.length < 6) {
      setSalesError("Password must be at least 6 characters")
      return
    }

    setSalesSubmitting(true)
    setSalesError("")
    try {
      const response = await fetch(`${API_URL}/auth/users`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify({
          ...salesFormData,
          role: "sales-team",
        }),
      })
      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || "Failed to create sales user")
      }

      await refreshSalesUsers()

      setSalesDialogOpen(false)
      setSalesFormData({ name: "", email: "", password: "" })
    } catch (err: any) {
      setSalesError(err.message || "Failed to create sales user")
    } finally {
      setSalesSubmitting(false)
    }
  }

  const openWorkloadEditor = (agent: any) => {
    setWorkloadAgent(agent)
    setMaxTicketsInput(String(agent.maxTicketsPerDay ?? 15))
    setWorkloadError("")
    setWorkloadDialogOpen(true)
  }

  const saveWorkload = async () => {
    if (!workloadAgent) return
    const n = parseInt(maxTicketsInput, 10)
    if (isNaN(n) || n < 1) {
      setWorkloadError("Max tickets must be at least 1.")
      return
    }
    if (n > 999) {
      setWorkloadError("Maximum value is 999.")
      return
    }
    setWorkloadSaving(true)
    setWorkloadError("")
    try {
      const id = workloadAgent.id || workloadAgent._id
      const res = await fetch(`${API_URL}/agents/${id}`, {
        method: "PUT",
        headers: getHeaders(true),
        body: JSON.stringify({ maxTicketsPerDay: n }),
      })
      const json = await res.json()
      if (res.status === 403) {
        setWorkloadError(json.error || "Not allowed to update this setting.")
        return
      }
      if (!json.success) {
        throw new Error(json.error || "Update failed")
      }
      await refreshAgents()
      setWorkloadDialogOpen(false)
      setWorkloadAgent(null)
    } catch (e: any) {
      setWorkloadError(e.message || "Failed to save")
    } finally {
      setWorkloadSaving(false)
    }
  }

  const handleDeleteAgent = async (agentId: string) => {
    if (!confirm("Are you sure you want to delete this agent? This action cannot be undone.")) return

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
      await refreshAgents()
    } catch (err: any) {
      alert(err.message || "Failed to delete agent")
    }
  }

  const handleConvertAgentToSalesUser = async (agent: any) => {
    const agentId = agent.id || agent._id
    if (!agentId) return
    if (!confirm(`Convert ${agent.name} to Sales Team user? They will be removed from agent list.`)) return

    try {
      const response = await fetch(`${API_URL}/agents/${agentId}/convert-to-sales-team`, {
        method: "POST",
        headers: getHeaders(true),
      })
      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || "Failed to convert agent")
      }

      await Promise.all([refreshAgents(), refreshSalesUsers()])
    } catch (err: any) {
      alert(err.message || "Failed to convert agent")
    }
  }

  const updateUserAccess = async (targetUserId: string, accessRoles: string[], primaryRole?: "agent" | "sales-team") => {
    const response = await fetch(`${API_URL}/auth/users/${targetUserId}/access`, {
      method: "PATCH",
      headers: getHeaders(true),
      body: JSON.stringify({ accessRoles, primaryRole }),
    })
    const result = await response.json()
    if (!result.success) {
      throw new Error(result.error || "Failed to update access")
    }
  }

  const openAccessEditor = (targetUser: any, fallbackRole: "agent" | "sales-team") => {
    const existing = Array.isArray(targetUser?.accessRoles) ? targetUser.accessRoles : [fallbackRole]
    const normalized = Array.from(new Set([fallbackRole, ...existing]))
    setAccessUser(targetUser)
    setAccessSelection(normalized)
    setPrimaryRoleSelection((targetUser?.role || fallbackRole) as "agent" | "sales-team")
    setAccessError("")
    setAccessDialogOpen(true)
  }

  const toggleAccess = (value: "agent" | "sales-team") => {
    setAccessSelection((prev) => {
      if (prev.includes(value)) return prev.filter((v) => v !== value)
      return [...prev, value]
    })
  }

  const saveAccessSelection = async () => {
    if (!accessUser) return
    const userId = accessUser.userId || accessUser.userId?._id || accessUser.id
    if (!userId) {
      setAccessError("Unable to identify user")
      return
    }
    if (accessSelection.length === 0) {
      setAccessError("At least one access is required")
      return
    }
    setAccessSaving(true)
    setAccessError("")
    try {
      await updateUserAccess(userId, accessSelection, primaryRoleSelection)
      await Promise.all([refreshAgents(), refreshSalesUsers()])
      setAccessDialogOpen(false)
      setAccessUser(null)
    } catch (err: any) {
      setAccessError(err.message || "Failed to update access")
    } finally {
      setAccessSaving(false)
    }
  }

  const handleGrantSalesAccessToAgent = async (agent: any) => {
    try {
      const userId = agent.userId || agent.userId?._id || agent.id
      const current = Array.isArray(agent.accessRoles) ? agent.accessRoles : ["agent"]
      const next = Array.from(new Set([...current, "sales-team"]))
      await updateUserAccess(userId, next)
      await Promise.all([refreshAgents(), refreshSalesUsers()])
    } catch (err: any) {
      alert(err.message || "Failed to grant sales access")
    }
  }

  const handleRevokeSalesAccessFromAgent = async (agent: any) => {
    try {
      const userId = agent.userId || agent.userId?._id || agent.id
      const current = Array.isArray(agent.accessRoles) ? agent.accessRoles : ["agent"]
      const next = current.filter((r: string) => r !== "sales-team")
      await updateUserAccess(userId, next)
      await Promise.all([refreshAgents(), refreshSalesUsers()])
    } catch (err: any) {
      alert(err.message || "Failed to revoke sales access")
    }
  }

  const handleGrantAgentAccessToSalesUser = async (salesUser: any) => {
    try {
      const current = Array.isArray(salesUser.accessRoles) ? salesUser.accessRoles : ["sales-team"]
      const next = Array.from(new Set([...current, "agent"]))
      await updateUserAccess(salesUser.id, next)
      await Promise.all([refreshAgents(), refreshSalesUsers()])
    } catch (err: any) {
      alert(err.message || "Failed to grant agent access")
    }
  }

  const handleRevokeAgentAccessFromSalesUser = async (salesUser: any) => {
    try {
      const current = Array.isArray(salesUser.accessRoles) ? salesUser.accessRoles : ["sales-team"]
      const next = current.filter((r: string) => r !== "agent")
      await updateUserAccess(salesUser.id, next)
      await Promise.all([refreshAgents(), refreshSalesUsers()])
    } catch (err: any) {
      alert(err.message || "Failed to revoke agent access")
    }
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
      case "management":
        return "bg-amber-500/20 text-amber-400"
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
      case "management":
        return "Management"
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

  return (
    <DashboardLayout
      sidebarTitle="Tenant Admin"
      sidebarItems={sidebarItems}
      userRole="tenant-admin"
      userName={user?.name || "Tenant Manager"}
      notificationCount={0}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agent Management</h1>
            <p className="text-muted-foreground mt-2">Manage your support team members</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setSalesDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Sales User
            </Button>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Agent
            </Button>
          </div>
        </div>

        {/* Add Agent Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Agent</DialogTitle>
              <DialogDescription>Create a new agent account for your support team</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md text-sm text-destructive">
                  {error}
                </div>
              )}
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
                    <SelectItem value="senior-agent">Senior Agent - Work on tickets, can resolve</SelectItem>
                    <SelectItem value="supervisor">Supervisor - Assign/transfer tickets, track agents</SelectItem>
                    <SelectItem value="management">Management - Dashboard only, no ticket access</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {formData.agentLevel === "agent" && "Basic agent with ticket management permissions"}
                  {formData.agentLevel === "senior-agent" && "Can assign tickets to other agents"}
                  {formData.agentLevel === "supervisor" && "Can track and manage all agents in tenant"}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={handleAddAgent} disabled={submitting}>
                {submitting ? "Creating..." : "Create Agent"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Sales Team User Dialog */}
        <Dialog open={salesDialogOpen} onOpenChange={setSalesDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Sales Team User</DialogTitle>
              <DialogDescription>Create a sales-team account under your tenant</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {salesError && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md text-sm text-destructive">
                  {salesError}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="sales-name">Full Name</Label>
                <Input
                  id="sales-name"
                  placeholder="Jane Smith"
                  value={salesFormData.name}
                  onChange={(e) => setSalesFormData({ ...salesFormData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sales-email">Email</Label>
                <Input
                  id="sales-email"
                  type="email"
                  placeholder="sales@example.com"
                  value={salesFormData.email}
                  onChange={(e) => setSalesFormData({ ...salesFormData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sales-password">Password</Label>
                <PasswordInput
                  id="sales-password"
                  placeholder="••••••••"
                  value={salesFormData.password}
                  onChange={(e) => setSalesFormData({ ...salesFormData, password: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSalesDialogOpen(false)} disabled={salesSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleAddSalesUser} disabled={salesSubmitting}>
                {salesSubmitting ? "Creating..." : "Create Sales User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Agents Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Agents</CardTitle>
            <CardDescription>Total: {agents.length} agents</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading agents...</div>
            ) : agents.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No agents yet</h3>
                <p className="text-muted-foreground mb-4">Get started by adding your first agent</p>
                <Button onClick={() => setDialogOpen(true)}>
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
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Level</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Assigned</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Resolved</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Rating</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Max/day</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agents.map((agent) => (
                      <tr key={agent.id} className="border-b border-border hover:bg-accent/5 transition-colors">
                        <td className="py-3 px-4 font-medium">{agent.name}</td>
                        <td className="py-3 px-4 text-muted-foreground">{agent.email}</td>
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
                        <td className="py-3 px-4 text-muted-foreground">{agent.maxTicketsPerDay ?? 15}</td>
                        <td className="py-3 px-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openWorkloadEditor(agent)}>
                                <Edit2 className="h-4 w-4 mr-2" />
                                Edit max tickets / day
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openAccessEditor(agent, "agent")}>
                                <Users className="h-4 w-4 mr-2" />
                                Edit Access
                              </DropdownMenuItem>
                              {(agent.accessRoles || []).includes("sales-team") ? (
                                <DropdownMenuItem onClick={() => handleRevokeSalesAccessFromAgent(agent)}>
                                  <Users className="h-4 w-4 mr-2" />
                                  Revoke Sales Access
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => handleGrantSalesAccessToAgent(agent)}>
                                  <Users className="h-4 w-4 mr-2" />
                                  Grant Sales Access
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleConvertAgentToSalesUser(agent)}>
                                <Users className="h-4 w-4 mr-2" />
                                Convert to Sales User
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleDeleteAgent(agent.id || agent._id)}
                              >
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

        {/* Sales Team Users */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Team Users</CardTitle>
            <CardDescription>Total: {salesUsers.length} users</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading sales users...</div>
            ) : salesUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No sales users yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Role</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Access</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesUsers.map((salesUser) => (
                      <tr key={salesUser.id} className="border-b border-border hover:bg-accent/5 transition-colors">
                        <td className="py-3 px-4 font-medium">{salesUser.name}</td>
                        <td className="py-3 px-4 text-muted-foreground">{salesUser.email}</td>
                        <td className="py-3 px-4 capitalize">sales-team</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              salesUser.isActive ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
                            }`}
                          >
                            {salesUser.isActive ? "active" : "inactive"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 flex-wrap">
                            {(salesUser.accessRoles || ["sales-team"]).map((role: string) => (
                              <span
                                key={`${salesUser.id}-${role}`}
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  role === "agent" ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"
                                }`}
                              >
                                {role}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="outline" size="sm" onClick={() => openAccessEditor(salesUser, "sales-team")}>
                            Edit Access
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={workloadDialogOpen} onOpenChange={setWorkloadDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Max tickets per day</DialogTitle>
              <DialogDescription>
                Set the daily ticket cap for {workloadAgent?.name || "this agent"}. Only Tenant Admins can change this value.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-2">
              {workloadError && (
                <p className="text-sm text-destructive" role="alert">
                  {workloadError}
                </p>
              )}
              <Label htmlFor="max-tickets">Max Tickets Per Day</Label>
              <Input
                id="max-tickets"
                type="number"
                min={1}
                max={999}
                value={maxTicketsInput}
                onChange={(e) => setMaxTicketsInput(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setWorkloadDialogOpen(false)} disabled={workloadSaving}>
                Cancel
              </Button>
              <Button onClick={() => void saveWorkload()} disabled={workloadSaving}>
                {workloadSaving ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={accessDialogOpen} onOpenChange={setAccessDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Access</DialogTitle>
              <DialogDescription>
                Choose which modules {accessUser?.name || "this user"} can access.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              {accessError && (
                <p className="text-sm text-destructive" role="alert">
                  {accessError}
                </p>
              )}
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={accessSelection.includes("agent")}
                  onChange={() => toggleAccess("agent")}
                />
                Ticket Module (Agent)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={accessSelection.includes("sales-team")}
                  onChange={() => toggleAccess("sales-team")}
                />
                Sales Leads Module (Sales Team)
              </label>
              <div className="space-y-2 pt-2">
                <Label htmlFor="primary-role">Primary Role</Label>
                <Select
                  value={primaryRoleSelection}
                  onValueChange={(v) => setPrimaryRoleSelection(v as "agent" | "sales-team")}
                >
                  <SelectTrigger id="primary-role">
                    <SelectValue placeholder="Select primary role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agent">Agent (primary)</SelectItem>
                    <SelectItem value="sales-team">Sales Team (primary)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAccessDialogOpen(false)} disabled={accessSaving}>
                Cancel
              </Button>
              <Button onClick={saveAccessSelection} disabled={accessSaving}>
                {accessSaving ? "Saving..." : "Save Access"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
