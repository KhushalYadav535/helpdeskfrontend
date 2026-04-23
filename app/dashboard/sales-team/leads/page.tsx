"use client"

import { useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard/layout"
import { TrendingUp, Phone, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { API_URL, getHeaders } from "@/lib/api-helpers"

interface LeadItem {
  _id: string
  leadId: string
  type: string
  status: string
  callerName?: string
  callerPhone?: string
  createdAt: string
}

export default function SalesTeamLeadsPage() {
  const { user, token } = useAuth()
  const [leads, setLeads] = useState<LeadItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const sidebarItems = [
    { label: "Overview", href: "/dashboard/sales-team", icon: <TrendingUp className="h-5 w-5" /> },
    { label: "Sales Leads", href: "/dashboard/sales-team/leads", icon: <Phone className="h-5 w-5" /> },
  ]

  const fetchLeads = async () => {
    if (!token) return
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/leads?type=sales-lead`, {
        headers: getHeaders(true),
      })
      const result = await response.json()
      if (result.success && result.data) {
        setLeads(result.data)
      }
    } catch (error) {
      console.error("Failed to fetch sales leads:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [token])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return leads
    return leads.filter((lead) => {
      return (
        lead.leadId.toLowerCase().includes(q) ||
        (lead.callerName || "").toLowerCase().includes(q) ||
        (lead.callerPhone || "").toLowerCase().includes(q)
      )
    })
  }, [leads, search])

  return (
    <DashboardLayout
      sidebarTitle="Sales Team"
      sidebarItems={sidebarItems}
      userRole="sales-team"
      userName={user?.name || "Sales Team"}
      notificationCount={0}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sales Leads</h1>
            <p className="text-muted-foreground mt-2">View and track sales-qualified leads</p>
          </div>
          <Button variant="outline" onClick={fetchLeads} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Leads</CardTitle>
            <CardDescription>Total: {filtered.length}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Search by lead ID, caller, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {loading ? (
              <div className="text-muted-foreground py-8 text-center">Loading leads...</div>
            ) : filtered.length === 0 ? (
              <div className="text-muted-foreground py-8 text-center">No sales leads found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4">Lead ID</th>
                      <th className="text-left py-3 px-4">Caller</th>
                      <th className="text-left py-3 px-4">Phone</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((lead) => (
                      <tr key={lead._id} className="border-b border-border/60">
                        <td className="py-3 px-4 font-mono">{lead.leadId}</td>
                        <td className="py-3 px-4">{lead.callerName || "Unknown"}</td>
                        <td className="py-3 px-4">{lead.callerPhone || "N/A"}</td>
                        <td className="py-3 px-4 capitalize">{lead.status}</td>
                        <td className="py-3 px-4">{new Date(lead.createdAt).toLocaleString()}</td>
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
