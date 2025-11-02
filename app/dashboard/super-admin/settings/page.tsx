"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { Building2, Ticket, Settings, BarChart3, Save, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"

export default function SettingsPage() {
  const { user } = useAuth()
  const sidebarItems = [
    { label: "Overview", href: "/dashboard/super-admin", icon: <BarChart3 className="h-5 w-5" /> },
    { label: "Tenants", href: "/dashboard/super-admin/tenants", icon: <Building2 className="h-5 w-5" /> },
    { label: "Agents", href: "/dashboard/super-admin/agents", icon: <Users className="h-5 w-5" /> },
    { label: "System Tickets", href: "/dashboard/super-admin/tickets", icon: <Ticket className="h-5 w-5" /> },
    { label: "Settings", href: "/dashboard/super-admin/settings", icon: <Settings className="h-5 w-5" /> },
  ]

  const [settings, setSettings] = useState({
    systemName: "Helpdesk System",
    maxTenantsPerInstance: "100",
    defaultTicketTimeout: "72",
    emailNotifications: true,
    maintenanceMode: false,
  })

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
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground mt-2">Configure global system parameters and preferences</p>
        </div>

        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>System-wide configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">System Name</label>
              <Input
                value={settings.systemName}
                onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Max Tenants Per Instance</label>
              <Input
                type="number"
                value={settings.maxTenantsPerInstance}
                onChange={(e) => setSettings({ ...settings, maxTenantsPerInstance: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Default Ticket Timeout (hours)</label>
              <Input
                type="number"
                value={settings.defaultTicketTimeout}
                onChange={(e) => setSettings({ ...settings, defaultTicketTimeout: e.target.value })}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Feature Toggles */}
        <Card>
          <CardHeader>
            <CardTitle>Feature Toggles</CardTitle>
            <CardDescription>Enable or disable system features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Send email alerts to tenants</p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                className="w-4 h-4 cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div>
                <p className="font-medium">Maintenance Mode</p>
                <p className="text-sm text-muted-foreground">Temporarily disable system access</p>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="w-4 h-4 cursor-pointer"
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
