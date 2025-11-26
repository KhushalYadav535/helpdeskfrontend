"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/layout"
import { BarChart3, Users, Ticket, Settings, Building2, Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { API_URL, getHeaders } from "@/lib/api-helpers"

export default function SuperAdminNewTicketPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [tenants, setTenants] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [agents, setAgents] = useState<any[]>([])
  const [selectedTenantId, setSelectedTenantId] = useState("")
  const [useExistingCustomer, setUseExistingCustomer] = useState(false)

  const sidebarItems = [
    { label: "Overview", href: "/dashboard/super-admin", icon: <BarChart3 className="h-5 w-5" /> },
    { label: "Tenants", href: "/dashboard/super-admin/tenants", icon: <Building2 className="h-5 w-5" /> },
    { label: "Agents", href: "/dashboard/super-admin/agents", icon: <Users className="h-5 w-5" /> },
    { label: "System Tickets", href: "/dashboard/super-admin/tickets", icon: <Ticket className="h-5 w-5" /> },
    { label: "Create Ticket", href: "/dashboard/super-admin/new", icon: <Plus className="h-5 w-5" /> },
    { label: "Settings", href: "/dashboard/super-admin/settings", icon: <Settings className="h-5 w-5" /> },
  ]

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    existingCustomerId: "",
    agentId: "",
    subject: "",
    category: "general",
    priority: "medium",
    description: "",
  })

  // Fetch tenants
  useEffect(() => {
    const fetchTenants = async () => {
      if (!token) return

      try {
        const response = await fetch(`${API_URL}/tenants`, {
          headers: getHeaders(true),
        })
        const result = await response.json()
        if (result.success && result.data) {
          setTenants(result.data)
        }
      } catch (error) {
        console.error("Error fetching tenants:", error)
      }
    }

    fetchTenants()
  }, [token])

  // Fetch customers and agents when tenant is selected
  useEffect(() => {
    const fetchData = async () => {
      if (!token || !selectedTenantId) {
        setCustomers([])
        setAgents([])
        return
      }

      try {
        // Fetch customers
        const customersResponse = await fetch(`${API_URL}/customers?tenantId=${selectedTenantId}`, {
          headers: getHeaders(true),
        })
        const customersResult = await customersResponse.json()
        if (customersResult.success && customersResult.data) {
          setCustomers(customersResult.data)
        }

        // Fetch agents
        const agentsResponse = await fetch(`${API_URL}/agents?tenantId=${selectedTenantId}`, {
          headers: getHeaders(true),
        })
        const agentsResult = await agentsResponse.json()
        if (agentsResult.success && agentsResult.data) {
          setAgents(agentsResult.data)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [token, selectedTenantId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!selectedTenantId) {
      setError("Please select a tenant")
      return
    }

    setLoading(true)

    try {
      // Prepare ticket data
      let customerData: any = {}
      
      if (useExistingCustomer && formData.existingCustomerId) {
        const selectedCustomer = customers.find(c => (c._id || c.id) === formData.existingCustomerId)
        if (selectedCustomer) {
          customerData = {
            customerId: selectedCustomer._id || selectedCustomer.id,
            customer: selectedCustomer.name,
            customerEmail: selectedCustomer.email,
            customerPhone: selectedCustomer.phone || "",
          }
        }
      } else {
        // New walk-in customer
        customerData = {
          customer: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
        }
      }

      const ticketData: any = {
        title: formData.subject,
        description: formData.description,
        category: formData.category,
        priority: formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1),
        tenantId: selectedTenantId,
        source: "walk-in",
        channel: "walk-in",
        ...customerData,
      }

      // Add agent assignment if selected
      if (formData.agentId) {
        ticketData.agentId = formData.agentId
      }

      const response = await fetch(`${API_URL}/tickets`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify(ticketData),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push("/dashboard/super-admin/tickets")
        }, 1500)
      } else {
        setError(result.error || "Failed to create ticket")
      }
    } catch (err: any) {
      setError(err.message || "Failed to create ticket")
    } finally {
      setLoading(false)
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Manual Ticket</h1>
          <p className="text-muted-foreground mt-2">Create a ticket for a walk-in customer</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-md text-green-400">
            Ticket created successfully! Redirecting...
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-md text-destructive">
            {error}
          </div>
        )}

        {/* Ticket Form */}
        <Card>
          <CardHeader>
            <CardTitle>Ticket Details</CardTitle>
            <CardDescription>Fill in the information to create a new ticket</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tenant Selection */}
              <div>
                <Label htmlFor="tenantId">Select Tenant *</Label>
                <select
                  id="tenantId"
                  value={selectedTenantId}
                  onChange={(e) => {
                    setSelectedTenantId(e.target.value)
                    setFormData({ ...formData, existingCustomerId: "", agentId: "" })
                  }}
                  className="mt-2 w-full px-3 py-2 rounded-lg border border-border bg-input text-foreground"
                  required
                >
                  <option value="">Select a tenant</option>
                  {tenants.map((tenant) => (
                    <option key={tenant._id || tenant.id} value={tenant._id || tenant.id}>
                      {tenant.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer Selection */}
              {selectedTenantId && (
                <div className="space-y-4 p-4 bg-accent/5 rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="useExisting"
                      checked={useExistingCustomer}
                      onChange={(e) => setUseExistingCustomer(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="useExisting" className="font-medium cursor-pointer">
                      Use existing customer
                    </Label>
                  </div>

                  {useExistingCustomer ? (
                    <div>
                      <Label htmlFor="existingCustomer">Select Customer *</Label>
                      <select
                        id="existingCustomer"
                        value={formData.existingCustomerId}
                        onChange={(e) => setFormData({ ...formData, existingCustomerId: e.target.value })}
                        className="mt-2 w-full px-3 py-2 rounded-lg border border-border bg-input text-foreground"
                        required={useExistingCustomer}
                        disabled={!selectedTenantId}
                      >
                        <option value="">Select a customer</option>
                        {customers.map((customer) => (
                          <option key={customer._id || customer.id} value={customer._id || customer.id}>
                            {customer.name} ({customer.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="customerName">Customer Name *</Label>
                        <Input
                          id="customerName"
                          value={formData.customerName}
                          onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                          placeholder="Enter customer name"
                          className="mt-2"
                          required={!useExistingCustomer}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="customerEmail">Email *</Label>
                          <Input
                            id="customerEmail"
                            type="email"
                            value={formData.customerEmail}
                            onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                            placeholder="customer@example.com"
                            className="mt-2"
                            required={!useExistingCustomer}
                          />
                        </div>
                        <div>
                          <Label htmlFor="customerPhone">Phone</Label>
                          <Input
                            id="customerPhone"
                            type="tel"
                            value={formData.customerPhone}
                            onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                            placeholder="+1234567890"
                            className="mt-2"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Agent Assignment */}
              {selectedTenantId && agents.length > 0 && (
                <div>
                  <Label htmlFor="agentId">Assign to Agent (Optional)</Label>
                  <select
                    id="agentId"
                    value={formData.agentId}
                    onChange={(e) => setFormData({ ...formData, agentId: e.target.value })}
                    className="mt-2 w-full px-3 py-2 rounded-lg border border-border bg-input text-foreground"
                  >
                    <option value="">Auto-assign (leave unassigned)</option>
                    {agents.map((agent) => (
                      <option key={agent._id || agent.id} value={agent._id || agent.id}>
                        {agent.name} ({agent.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Ticket Information */}
              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Brief description of the issue"
                  className="mt-2"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="mt-2 w-full px-3 py-2 rounded-lg border border-border bg-input text-foreground"
                    required
                  >
                    <option value="general">General Inquiry</option>
                    <option value="account">Account</option>
                    <option value="billing">Billing</option>
                    <option value="technical">Technical Support</option>
                    <option value="feature">Feature Request</option>
                    <option value="bug">Bug Report</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="priority">Priority *</Label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="mt-2 w-full px-3 py-2 rounded-lg border border-border bg-input text-foreground"
                    required
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide detailed information about the issue"
                  rows={8}
                  className="mt-2 w-full px-3 py-2 rounded-lg border border-border bg-input text-foreground font-sans"
                  required
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading || !selectedTenantId}>
                  {loading ? "Creating..." : "Create Ticket"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

