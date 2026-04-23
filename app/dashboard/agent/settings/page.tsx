"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { Ticket, BarChart3, TrendingUp, Settings, Save, Users, Loader2, Wrench, Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RoleGatedNumberInput } from "@/components/ui/role-gated-number-input"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { API_URL, getHeaders } from "@/lib/api-helpers"
import { toast } from "sonner"

export default function AgentSettingsPage() {
  const { user, token } = useAuth()
  const [myTickets, setMyTickets] = useState<any[]>([])
  const [tenantName, setTenantName] = useState<string>("")
  const [agentLevel, setAgentLevel] = useState<string>("agent")
  const [isSaving, setIsSaving] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const isSupervisor = agentLevel === "supervisor"
  const sidebarItems = [
    { label: "My Tickets", href: "/dashboard/agent", icon: <Ticket className="h-5 w-5" /> },
    { label: "Assigned to Me", href: "/dashboard/agent/tickets", icon: <BarChart3 className="h-5 w-5" /> },
    { label: "Service Requests", href: "/dashboard/agent/tickets/service-requests", icon: <Wrench className="h-5 w-5" /> },
    { label: "Troubleshooting", href: "/dashboard/agent/tickets/troubleshooting", icon: <Wrench className="h-5 w-5" /> },
    { label: "Create Ticket", href: "/dashboard/agent/new", icon: <Plus className="h-5 w-5" /> },
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

  // Max tickets is display-only here; Tenant Admin sets per-agent limits under Admin → Agents.
  const isMaxTicketsInvalid = false

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

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.tenantId || !token) return
      try {
        const tenantResponse = await fetch(`${API_URL}/tenants/${user.tenantId}`, {
          headers: getHeaders(true),
        })
        const tenantResult = await tenantResponse.json()
        if (tenantResult.success && tenantResult.data) {
          const tn = tenantResult.data.name || user.companyName || ""
          setTenantName(tn)
          setSettings((prev) => ({ ...prev, tenantName: tn }))
        }

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

        if (user.role === "agent") {
          const meRes = await fetch(`${API_URL}/agents/me`, { headers: getHeaders(true) })
          const meJson = await meRes.json()
          if (meJson.success && meJson.data) {
            const d = meJson.data
            setLoadError(null)
            setSettings((prev) => ({
              ...prev,
              fullName: d.name || prev.fullName,
              email: d.email || prev.email,
              phoneNumber: d.phoneNumber ?? prev.phoneNumber,
              maxTicketsPerDay: String(d.maxTicketsPerDay ?? 15),
              notificationsEnabled: d.notificationsEnabled ?? true,
              emailNotifications: d.emailNotifications ?? true,
              autoAcceptTickets: d.autoAcceptTickets ?? false,
              tenantName: d.tenantName || prev.tenantName,
            }))
            if (d.tenantName) setTenantName(d.tenantName)
          } else {
            setLoadError(meJson.error || "Could not load agent settings")
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        setTenantName(user.companyName || "")
        setSettings((prev) => ({ ...prev, tenantName: user.companyName || "" }))
      }
    }
    if (user?.tenantId) {
      void fetchData()
    }
  }, [user?.tenantId, token, user?.companyName, user?.email, user?.role])

  useEffect(() => {
    if (user) {
      setSettings((prev) => ({
        ...prev,
        fullName: user.name || "",
        email: user.email || "",
      }))
    }
  }, [user])

  const handleSave = async () => {
    if (isMaxTicketsInvalid) return
    if (!token) {
      toast.error("Failed to save settings. Please try again.")
      return
    }

    setIsSaving(true)
    try {
      if (user?.role !== "agent") {
        toast.error("Failed to save settings. Please try again.")
        return
      }

      const res = await fetch(`${API_URL}/agents/me/settings`, {
        method: "PATCH",
        headers: getHeaders(true),
        body: JSON.stringify({
          fullName: settings.fullName,
          notificationsEnabled: settings.notificationsEnabled,
          emailNotifications: settings.emailNotifications,
          autoAcceptTickets: settings.autoAcceptTickets,
          phoneNumber: settings.phoneNumber,
        }),
      })
      const json = await res.json()
      if (res.status === 403) {
        toast.error(json.error || "You do not have permission to save these settings.")
        return
      }
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Save failed")
      }
      toast.success("Settings saved successfully.", { duration: 3000 })
    } catch {
      toast.error("Failed to save settings. Please try again.", {
        duration: 4000,
        action: {
          label: "Retry",
          onClick: () => void handleSave(),
        },
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <DashboardLayout
      sidebarTitle="Support Agent"
      sidebarItems={sidebarItems}
      userRole="agent"
      userName={user?.name || "Agent"}
      userEmail={user?.email}
      tenantName={tenantName}
      notificationCount={0}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your profile and preferences</p>
        </div>

        {loadError && user?.role === "agent" && (
          <p className="text-sm text-amber-600" role="alert">
            {loadError}
          </p>
        )}

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
                disabled
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

            <RoleGatedNumberInput
              label="Max Tickets Per Day"
              role="agent"
              value={settings.maxTicketsPerDay}
              onChange={(val) => setSettings({ ...settings, maxTicketsPerDay: val })}
              min={1}
              max={999}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={() => void handleSave()} disabled={isSaving || isMaxTicketsInvalid}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
