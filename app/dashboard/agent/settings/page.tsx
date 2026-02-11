"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { Ticket, BarChart3, TrendingUp, Settings, Save, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { API_URL, getHeaders } from "@/lib/api-helpers"

export default function AgentSettingsPage() {
  const { user, token } = useAuth()
  const [myTickets, setMyTickets] = useState<any[]>([])
  const [tenantName, setTenantName] = useState<string>("")
  const [agentLevel, setAgentLevel] = useState<string>("agent")

  const isSupervisor = agentLevel === "supervisor"
  const sidebarItems = [
    { label: "My Tickets", href: "/dashboard/agent", icon: <Ticket className="h-5 w-5" />, badge: myTickets.length },
    { label: "Assigned to Me", href: "/dashboard/agent/tickets", icon: <BarChart3 className="h-5 w-5" /> },
    { label: "Performance", href: "/dashboard/agent/performance", icon: <TrendingUp className="h-5 w-5" /> },
    ...(isSupervisor ? [{ label: "Team Management", href: "/dashboard/agent/team", icon: <Users className="h-5 w-5" /> }] : []),
    { label: "Settings", href: "/dashboard/agent/settings", icon: <Settings className="h-5 w-5" /> },
  ]

  const [settings, setSettings] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    tenantName: "",
    notificationsEnabled: true,
    emailNotifications: true,
    autoAcceptTickets: false,
    maxTicketsPerDay: "15",
  })

  // Fetch tickets count
  useEffect(() => {
    const fetchTickets = async () => {
      if (!user?.tenantId || !token) return

      try {
        const response = await fetch(`${API_URL}/tickets?myTickets=true`, {
          headers: getHeaders(true),
        })
        const result = await response.json()

        if (result.success && result.data) {
          setMyTickets(result.data)
        }
      } catch (error) {
        console.error("Error fetching tickets:", error)
      }
    }

    fetchTickets()
  }, [user?.tenantId, token])

  // Fetch tenant name and agent level
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.tenantId || !token) return

      try {
        const tenantResponse = await fetch(`${API_URL}/tenants/${user.tenantId}`, {
          headers: getHeaders(true),
        })
        const tenantResult = await tenantResponse.json()

        if (tenantResult.success && tenantResult.data) {
          const tenantName = tenantResult.data.name || user.companyName || ""
          setTenantName(tenantName)
          setSettings((prev) => ({
            ...prev,
            tenantName,
          }))
        }

        // Fetch current agent info to get agentLevel
        const agentsResponse = await fetch(`${API_URL}/agents?tenantId=${user.tenantId}`, {
          headers: getHeaders(true),
        })
        const agentsResult = await agentsResponse.json()

        if (agentsResult.success && agentsResult.data) {
          const currentAgent = agentsResult.data.find((a: any) => a.email === user.email)
          if (currentAgent) {
            setAgentLevel(currentAgent.agentLevel || "agent")
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        setTenantName(user.companyName || "")
        setSettings((prev) => ({
          ...prev,
          tenantName: user.companyName || "",
        }))
      }
    }

    if (user?.tenantId) {
      fetchData()
    }
  }, [user?.tenantId, token, user?.companyName, user?.email])

  // Load user data on mount
  useEffect(() => {
    if (user) {
      setSettings((prev) => ({
        ...prev,
        fullName: user.name || "",
        email: user.email || "",
        phoneNumber: "",
      }))
    }
  }, [user])

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
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your profile and preferences</p>
        </div>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Full Name</label>
              <Input
                value={settings.fullName}
                onChange={(e) => setSettings({ ...settings, fullName: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Phone Number</label>
              <Input
                type="tel"
                value={settings.phoneNumber}
                onChange={(e) => setSettings({ ...settings, phoneNumber: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Company / Tenant</label>
              <Input
                value={settings.tenantName || tenantName}
                disabled
                className="mt-2 bg-muted cursor-not-allowed"
                placeholder="Loading..."
              />
              <p className="text-xs text-muted-foreground mt-1">You are working for this tenant</p>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>Control how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div>
                <p className="font-medium">In-App Notifications</p>
                <p className="text-sm text-muted-foreground">Receive desktop notifications</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notificationsEnabled}
                onChange={(e) => setSettings({ ...settings, notificationsEnabled: e.target.checked })}
                className="w-4 h-4 cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive email alerts</p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                className="w-4 h-4 cursor-pointer"
              />
            </div>
          </CardContent>
        </Card>

        {/* Work Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Work Preferences</CardTitle>
            <CardDescription>Configure your work settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div>
                <p className="font-medium">Auto-Accept Tickets</p>
                <p className="text-sm text-muted-foreground">Automatically accept assigned tickets</p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoAcceptTickets}
                onChange={(e) => setSettings({ ...settings, autoAcceptTickets: e.target.checked })}
                className="w-4 h-4 cursor-pointer"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Max Tickets Per Day</label>
              <Input
                type="number"
                value={settings.maxTicketsPerDay}
                onChange={(e) => setSettings({ ...settings, maxTicketsPerDay: e.target.value })}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
