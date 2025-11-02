"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { Ticket, Plus, AlertCircle, Settings, Save } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export default function CustomerSettingsPage() {
  const sidebarItems = [
    { label: "My Tickets", href: "/dashboard/customer", icon: <Ticket className="h-5 w-5" /> },
    { label: "Submit Ticket", href: "/dashboard/customer/new", icon: <Plus className="h-5 w-5" /> },
    { label: "Knowledge Base", href: "/dashboard/customer/kb", icon: <AlertCircle className="h-5 w-5" /> },
    { label: "Settings", href: "/dashboard/customer/settings", icon: <Settings className="h-5 w-5" /> },
  ]

  const [settings, setSettings] = useState({
    fullName: "John Doe",
    email: "john@example.com",
    phoneNumber: "+1234567890",
    company: "Acme Corporation",
    emailNotifications: true,
    ticketUpdates: true,
    weeklyDigest: false,
    newsAndUpdates: true,
  })

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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your profile and preferences</p>
        </div>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your account details</CardDescription>
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
              <label className="text-sm font-medium">Company</label>
              <Input
                value={settings.company}
                onChange={(e) => setSettings({ ...settings, company: e.target.value })}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>Choose how you want to be notified</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive email notifications</p>
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
                <p className="font-medium">Ticket Updates</p>
                <p className="text-sm text-muted-foreground">Get notified when your tickets are updated</p>
              </div>
              <input
                type="checkbox"
                checked={settings.ticketUpdates}
                onChange={(e) => setSettings({ ...settings, ticketUpdates: e.target.checked })}
                className="w-4 h-4 cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div>
                <p className="font-medium">Weekly Digest</p>
                <p className="text-sm text-muted-foreground">Receive a weekly summary of your activity</p>
              </div>
              <input
                type="checkbox"
                checked={settings.weeklyDigest}
                onChange={(e) => setSettings({ ...settings, weeklyDigest: e.target.checked })}
                className="w-4 h-4 cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div>
                <p className="font-medium">News & Updates</p>
                <p className="text-sm text-muted-foreground">Learn about new features and updates</p>
              </div>
              <input
                type="checkbox"
                checked={settings.newsAndUpdates}
                onChange={(e) => setSettings({ ...settings, newsAndUpdates: e.target.checked })}
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
