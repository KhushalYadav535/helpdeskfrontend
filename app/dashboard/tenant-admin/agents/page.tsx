"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { BarChart3, Users, Ticket, Settings, Plus, MoreVertical, Edit2, Trash2 } from "lucide-react"
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

  const sidebarItems = [
    { label: "Overview", href: "/dashboard/tenant-admin", icon: <BarChart3 className="h-5 w-5" /> },
    { label: "Agents", href: "/dashboard/tenant-admin/agents", icon: <Users className="h-5 w-5" /> },
    { label: "Tickets", href: "/dashboard/tenant-admin/tickets", icon: <Ticket className="h-5 w-5" /> },
    { label: "Settings", href: "/dashboard/tenant-admin/settings", icon: <Settings className="h-5 w-5" /> },
  ]

  // Fetch agents from backend
  useEffect(() => {
    const fetchAgents = async () => {
      if (!user?.tenantId || !token) return

      try {
        setLoading(true)
        const response = await fetch(`${API_URL}/agents?tenantId=${user.tenantId}`, {
          headers: getHeaders(true),
        })
        const result = await response.json()

        if (result.success && result.data) {
          setAgents(result.data)
        }
      } catch (error) {
        console.error("Error fetching agents:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAgents()
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
      const agentsResponse = await fetch(`${API_URL}/agents?tenantId=${user.tenantId}`, {
        headers: getHeaders(true),
      })
      const agentsResult = await agentsResponse.json()

      if (agentsResult.success && agentsResult.data) {
        setAgents(agentsResult.data)
      }

      // Close dialog and reset form
      setDialogOpen(false)
      setFormData({ name: "", email: "", password: "", agentLevel: "agent" })
    } catch (err: any) {
      setError(err.message || "Failed to create agent")
    } finally {
      setSubmitting(false)
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
      const agentsResponse = await fetch(`${API_URL}/agents?tenantId=${user.tenantId}`, {
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
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Agent
          </Button>
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
                    <SelectItem value="senior-agent">Senior Agent - All Agent permissions + Assign tickets</SelectItem>
                    <SelectItem value="supervisor">Supervisor - All Senior Agent permissions + Track & manage agents</SelectItem>
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
                        <td className="py-3 px-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit2 className="h-4 w-4 mr-2" />
                                Edit
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
      </div>
    </DashboardLayout>
  )
}
