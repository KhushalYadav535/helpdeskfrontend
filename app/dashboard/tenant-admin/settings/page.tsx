"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { BarChart3, Users, Ticket, Settings, Save, Copy, RefreshCw, Link2, MessageSquare, Phone, Mail } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"
import { API_URL, getHeaders } from "@/lib/api-helpers"

export default function SettingsPage() {
  const { user, token } = useAuth()
  const [webhookToken, setWebhookToken] = useState<string>("")
  const [baseUrl, setBaseUrl] = useState<string>("")
  const [copied, setCopied] = useState<string>("")

  const sidebarItems = [
    { label: "Overview", href: "/dashboard/tenant-admin", icon: <BarChart3 className="h-5 w-5" /> },
    { label: "Agents", href: "/dashboard/tenant-admin/agents", icon: <Users className="h-5 w-5" /> },
    { label: "Tickets", href: "/dashboard/tenant-admin/tickets", icon: <Ticket className="h-5 w-5" /> },
    { label: "Settings", href: "/dashboard/tenant-admin/settings", icon: <Settings className="h-5 w-5" /> },
  ]

  const [settings, setSettings] = useState({
    tenantName: "Acme Corp",
    supportEmail: "support@acmecorp.com",
    maxAgents: "20",
    ticketTimeout: "48",
    autoAssign: true,
    emailAlerts: true,
  })

  // Load tenant data and webhook token
  useEffect(() => {
    // Get backend base URL (use API_URL origin, not frontend origin)
    try {
      const backendOrigin = new URL(API_URL).origin
      setBaseUrl(backendOrigin)
    } catch {
      // Fallback: strip trailing /api if present
      const fallback = (API_URL || "").replace(/\/api$/, "")
      setBaseUrl(fallback)
    }
    
    // Fetch tenant info to populate settings
    const fetchTenantInfo = async () => {
      if (!user?.tenantId || !token) return
      
      try {
        const response = await fetch(`${API_URL}/tenants/${user.tenantId}`, {
          headers: getHeaders(true),
        })
        const result = await response.json()
        
        if (result.success && result.data) {
          const tenant = result.data
          
          // Update settings with real tenant data
          setSettings({
            tenantName: tenant.name || "",
            supportEmail: tenant.email || "",
            maxAgents: tenant.maxAgents?.toString() || "20",
            ticketTimeout: tenant.ticketTimeout?.toString() || "48",
            autoAssign: tenant.autoAssign !== false,
            emailAlerts: tenant.emailAlerts !== false,
          })
          
          // Set webhook token
          if (tenant?.webhookToken) {
            setWebhookToken(tenant.webhookToken)
          } else {
            // Generate token if not exists (for new tenants)
            const newToken = `wh_tenant_${user.tenantId}_${Date.now().toString(36)}`
            setWebhookToken(newToken)
          }
        }
      } catch (error) {
        console.error("Error fetching tenant info:", error)
        // Fallback token
        const fallbackToken = `wh_tenant_${user.tenantId}_${Date.now().toString(36)}`
        setWebhookToken(fallbackToken)
      }
    }
    
    fetchTenantInfo()
  }, [user?.tenantId, token])

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(""), 2000)
  }

  const generateWebhookUrls = () => {
    if (!webhookToken) return []
    
    const baseWebhookUrl = `${baseUrl}/api/webhooks/tenant/${webhookToken}`
    
    return [
      {
        name: "Universal Webhook",
        url: `${baseWebhookUrl}`,
        description: "Works for all channels",
        icon: <Link2 className="h-4 w-4" />,
      },
      {
        name: "WhatsApp",
        url: `${baseWebhookUrl}/whatsapp`,
        description: "For WhatsApp Business messages",
        icon: <MessageSquare className="h-4 w-4" />,
      },
      {
        name: "Telegram",
        url: `${baseWebhookUrl}/telegram`,
        description: "For Telegram bot messages",
        icon: <MessageSquare className="h-4 w-4" />,
      },
      {
        name: "Phone",
        url: `${baseWebhookUrl}/phone`,
        description: "For voice calls",
        icon: <Phone className="h-4 w-4" />,
      },
      {
        name: "Contact Form",
        url: `${baseWebhookUrl}/contact-form`,
        description: "For website contact forms",
        icon: <Mail className="h-4 w-4" />,
      },
      {
        name: "Chatbot",
        url: `${baseWebhookUrl}/chatbot`,
        description: "For website chatbots",
        icon: <MessageSquare className="h-4 w-4" />,
      },
    ]
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tenant Settings</h1>
          <p className="text-muted-foreground mt-2">Configure your tenant's preferences and features</p>
        </div>

        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Basic tenant configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Tenant Name</label>
              <Input
                value={settings.tenantName}
                onChange={(e) => setSettings({ ...settings, tenantName: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Support Email</label>
              <Input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Max Agents Allowed</label>
              <Input
                type="number"
                value={settings.maxAgents}
                onChange={(e) => setSettings({ ...settings, maxAgents: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Ticket Timeout (hours)</label>
              <Input
                type="number"
                value={settings.ticketTimeout}
                onChange={(e) => setSettings({ ...settings, ticketTimeout: e.target.value })}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Feature Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Feature Settings</CardTitle>
            <CardDescription>Configure tenant-specific features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div>
                <p className="font-medium">Auto-Assign Tickets</p>
                <p className="text-sm text-muted-foreground">Automatically assign new tickets to agents</p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoAssign}
                onChange={(e) => setSettings({ ...settings, autoAssign: e.target.checked })}
                className="w-4 h-4 cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div>
                <p className="font-medium">Email Alerts</p>
                <p className="text-sm text-muted-foreground">Send email notifications to agents</p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailAlerts}
                onChange={(e) => setSettings({ ...settings, emailAlerts: e.target.checked })}
                className="w-4 h-4 cursor-pointer"
              />
            </div>
          </CardContent>
        </Card>

        {/* Webhook URLs - Ye Section Tenant Admin ko Milega */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Webhook URLs</CardTitle>
                <CardDescription>
                  Use these URLs to receive tickets from WhatsApp, Telegram, Phone, Contact Forms, etc.
                  <br />
                  <span className="text-xs text-muted-foreground mt-1 block">
                    Ye URLs aapke tenant-specific hain. Inhe external services (Twilio, Telegram, etc.) mein configure karein.
                  </span>
                </CardDescription>
              </div>
              {webhookToken && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newToken = `wh_tenant_${user?.tenantId}_${Date.now().toString(36)}`
                    setWebhookToken(newToken)
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate Token
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {webhookToken ? (
              <>
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Your Webhook Token</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(webhookToken, "token")}
                    >
                      {copied === "token" ? "✓ Copied" : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <code className="text-xs bg-background px-3 py-2 rounded border border-border block break-all">
                    {webhookToken}
                  </code>
                  <p className="text-xs text-muted-foreground mt-2">
                    Keep this token secret. Share only with trusted services.
                  </p>
                </div>

                <div className="space-y-3">
                  {generateWebhookUrls().map((webhook, index) => (
                    <div
                      key={index}
                      className="p-4 border border-border rounded-lg hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {webhook.icon}
                            <span className="font-medium text-sm">{webhook.name}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{webhook.description}</p>
                          <code className="text-xs bg-background px-3 py-2 rounded border border-border block break-all">
                            {webhook.url}
                          </code>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(webhook.url, `url-${index}`)}
                        >
                          {copied === `url-${index}` ? (
                            <span className="text-xs">✓</span>
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm font-medium mb-2">💡 Usage Instructions:</p>
                  <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Copy the webhook URL for your channel (WhatsApp, Telegram, etc.)</li>
                    <li>Paste it in your external service (Twilio, Telegram Bot, etc.)</li>
                    <li>Tickets automatically create honge jab message aayega</li>
                    <li>Tenant automatically detect hoga token se</li>
                  </ol>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p>Loading webhook URLs...</p>
              </div>
            )}
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
