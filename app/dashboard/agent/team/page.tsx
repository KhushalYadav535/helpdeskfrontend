"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { Ticket, BarChart3, TrendingUp, Settings, Users, MoreVertical, Edit2, UserCheck, UserX } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

export default function TeamManagementPage() {
  const { user, token } = useAuth()
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tenantName, setTenantName] = useState<string>("")
  const [myTickets, setMyTickets] = useState<any[]>([])
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<any>(null)
  const [formData, setFormData] = useState({
    status: "",
    agentLevel: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const sidebarItems = [
    { label: "My Tickets", href: "/dashboard/agent", icon: <Ticket className="h-5 w-5" />, badge: myTickets.length },
    { label: "Assigned to Me", href: "/dashboard/agent/tickets", icon: <BarChart3 className="h-5 w-5" /> },
    { label: "Performance", href: "/dashboard/agent/performance", icon: <TrendingUp className="h-5 w-5" /> },
    { label: "Team Management", href: "/dashboard/agent/team", icon: <Users className="h-5 w-5" /> },
    { label: "Settings", href: "/dashboard/agent/settings", icon: <Settings className="h-5 w-5" /> },
  ]

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.tenantId || !token) return

      try {
        setLoading(true)

        // Fetch tenant info
        try {
          const tenantResponse = await fetch(`${API_URL}/tenants/${user.tenantId}`, {
            headers: getHeaders(true),
          })
          const tenantResult = await tenantResponse.json()
          if (tenantResult.success && tenantResult.data) {
            setTenantName(tenantResult.data.name || user.companyName || "")
          }
        } catch (error) {
          console.error("Error fetching tenant:", error)
          setTenantName(user.companyName || "")
        }

        // Fetch agents
        const agentsResponse = await fetch(`${API_URL}/agents?tenantId=${user.tenantId}`, {
          headers: getHeaders(true),
        })
        const agentsResult = await agentsResponse.json()

        if (agentsResult.success && agentsResult.data) {
          // Filter out current user from the list
          const otherAgents = agentsResult.data.filter((agent: any) => agent.email !== user.email)
          setAgents(otherAgents)
        }

        // Fetch my tickets count
        const ticketsResponse = await fetch(`${API_URL}/tickets?myTickets=true`, {
          headers: getHeaders(true),
        })
        const ticketsResult = await ticketsResponse.json()

        if (ticketsResult.success && ticketsResult.data) {
          setMyTickets(ticketsResult.data)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user?.tenantId, token, user?.email, user?.companyName])

  const handleEditAgent = (agent: any) => {
    setSelectedAgent(agent)
    setFormData({
      status: agent.status || "offline",
      agentLevel: agent.agentLevel || "agent",
    })
    setEditDialogOpen(true)
    setError("")
  }

  const handleUpdateAgent = async () => {
    if (!selectedAgent) return

    setSubmitting(true)
    setError("")

    try {
      const response = await fetch(`${API_URL}/agents/${selectedAgent.id}`, {
        method: "PUT",
        headers: getHeaders(true),
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to update agent")
      }

      // Refresh agents list
      const agentsResponse = await fetch(`${API_URL}/agents?tenantId=${user.tenantId}`, {
        headers: getHeaders(true),
      })
      const agentsResult = await agentsResponse.json()

      if (agentsResult.success && agentsResult.data) {
        const otherAgents = agentsResult.data.filter((agent: any) => agent.email !== user.email)
        setAgents(otherAgents)
      }

      setEditDialogOpen(false)
      setSelectedAgent(null)
    } catch (err: any) {
      setError(err.message || "Failed to update agent")
    } finally {
      setSubmitting(false)
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
      sidebarTitle="Support Agent"
      sidebarItems={sidebarItems}
      userRole="agent"
      userName={user?.name || "Agent"}
      notificationCount={myTickets.length}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your team members' status and permissions
            {tenantName && (
              <span className="ml-2 text-sm text-accent">
                • {tenantName}
              </span>
            )}
          </p>
        </div>

        {/* Edit Agent Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Agent</DialogTitle>
              <DialogDescription>Update agent status and level</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md text-sm text-destructive">
                  {error}
                </div>
              )}

              {selectedAgent && (
                <>
                  <div>
                    <p className="text-sm font-medium mb-2">Agent: {selectedAgent.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedAgent.email}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="away">Away</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Agent Level</label>
                    <Select
                      value={formData.agentLevel}
                      onValueChange={(value) => setFormData({ ...formData, agentLevel: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select agent level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="agent">Agent - Basic permissions</SelectItem>
                        <SelectItem value="senior-agent">Senior Agent - Can resolve tickets</SelectItem>
                        <SelectItem value="supervisor" disabled>Supervisor - Only tenant admin can assign</SelectItem>
                        <SelectItem value="management" disabled>Management - Dashboard only, tenant admin assigns</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Note: Only tenant admin can assign supervisor level
                    </p>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={handleUpdateAgent} disabled={submitting}>
                {submitting ? "Updating..." : "Update Agent"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
              <Users className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{agents.length}</div>
              <p className="text-xs text-muted-foreground">In your team</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Online Agents</CardTitle>
              <UserCheck className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {agents.filter((a) => a.status === "online").length}
              </div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Senior Agents</CardTitle>
              <TrendingUp className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {agents.filter((a) => a.agentLevel === "senior-agent" || a.agentLevel === "supervisor").length}
              </div>
              <p className="text-xs text-muted-foreground">With elevated permissions</p>
            </CardContent>
          </Card>
        </div>

        {/* Agents Table */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Manage agent status and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading team members...</div>
            ) : agents.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No other agents yet</h3>
                <p className="text-muted-foreground">Other agents in your tenant will appear here</p>
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
                              <DropdownMenuItem onClick={() => handleEditAgent(agent)}>
                                <Edit2 className="h-4 w-4 mr-2" />
                                Edit
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

