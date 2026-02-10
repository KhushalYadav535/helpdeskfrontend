"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { API_URL, getHeaders } from "@/lib/api-helpers"
import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Phone, PhoneCall, Clock, Building2, Users, Ticket, Plus, BarChart3, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"

interface CallLead {
  _id: string
  leadId: string
  source: string
  status: string
  callerPhone?: string
  calledNumber?: string
  callDuration?: number
  callTranscript?: string
  callTimestamp?: string
  callRecordingUrl?: string
  tenantId?: {
    _id: string
    name?: string
  }
  metadata?: {
    [key: string]: any
  }
}

export default function SuperAdminCallHistoryPage() {
  const { user, token } = useAuth()
  const [calls, setCalls] = useState<CallLead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const sidebarItems = [
    { label: "Overview", href: "/dashboard/super-admin", icon: <BarChart3 className="h-5 w-5" /> },
    { label: "Leads", href: "/dashboard/super-admin/leads", icon: <Phone className="h-5 w-5" /> },
    { label: "Call History", href: "/dashboard/super-admin/call-history", icon: <Clock className="h-5 w-5" /> },
    { label: "Tenants", href: "/dashboard/super-admin/tenants", icon: <Building2 className="h-5 w-5" /> },
    { label: "Agents", href: "/dashboard/super-admin/agents", icon: <Users className="h-5 w-5" /> },
    { label: "System Tickets", href: "/dashboard/super-admin/tickets", icon: <Ticket className="h-5 w-5" /> },
    { label: "Create Ticket", href: "/dashboard/super-admin/new", icon: <Plus className="h-5 w-5" /> },
    { label: "Settings", href: "/dashboard/super-admin/settings", icon: <Clock className="h-5 w-5" /> },
  ]

  const fetchCalls = async () => {
    if (!token) return

    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/leads`, {
        headers: getHeaders(true),
      })

      const result = await response.json()

      if (result.success && result.data) {
        const callOnly = (result.data as CallLead[]).filter((lead) => {
          const src = (lead.source || "").toLowerCase()
          return src === "zoronal" || src === "phone" || src === "whatsapp"
        })
        setCalls(callOnly)
      }
    } catch (error) {
      console.error("Error fetching call history:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCalls()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchCalls, 30000)
    
    return () => clearInterval(interval)
  }, [token])

  const filteredCalls = calls.filter((call) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      call.leadId.toLowerCase().includes(term) ||
      call.callerPhone?.toLowerCase().includes(term) ||
      call.calledNumber?.toLowerCase().includes(term) ||
      call.callTranscript?.toLowerCase().includes(term) ||
      (call.tenantId?.name || "").toLowerCase().includes(term)
    )
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredCalls.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedCalls = filteredCalls.slice(startIndex, endIndex)

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  // Reset to page 1 when items per page changes
  useEffect(() => {
    setCurrentPage(1)
  }, [itemsPerPage])

  const formatDate = (value?: string) => {
    if (!value) return "-"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return "-"
    return date.toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Call History</h1>
            <p className="text-muted-foreground mt-2">
              View all phone call records across all tenants with basic details.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={fetchCalls}
              disabled={loading}
              title="Refresh call history"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Input
              placeholder="Search by ID, number, tenant, or transcript..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Call History ({filteredCalls.length})</CardTitle>
            <CardDescription>Via, Number, Status, Date</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading call history...</div>
            ) : filteredCalls.length === 0 ? (
              <div className="text-center py-8">
                <Phone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-1">No calls yet</h3>
                <p className="text-muted-foreground text-sm">
                  Call history will appear here once Zoronal calls are received.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b text-xs text-muted-foreground">
                    <tr className="text-left">
                      <th className="py-2 pr-4 font-medium">ID</th>
                      <th className="py-2 pr-4 font-medium">Tenant</th>
                      <th className="py-2 pr-4 font-medium">Via</th>
                      <th className="py-2 pr-4 font-medium">Number</th>
                      <th className="py-2 pr-4 font-medium">Status</th>
                      <th className="py-2 pr-4 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCalls.map((call) => (
                      <tr key={call._id} className="border-b last:border-0 hover:bg-accent/5">
                        <td className="py-2 pr-4 font-mono text-xs truncate max-w-[120px]">{call.leadId}</td>
                        <td className="py-2 pr-4">
                          {call.tenantId?.name || <span className="text-muted-foreground">Unknown</span>}
                        </td>
                        <td className="py-2 pr-4">
                          <div className="flex items-center gap-1">
                            <PhoneCall className="h-4 w-4 text-accent" />
                            <span className="capitalize">{call.source || "phone"}</span>
                          </div>
                        </td>
                        <td className="py-2 pr-4">
                          {call.callerPhone || call.calledNumber || <span className="text-muted-foreground">N/A</span>}
                        </td>
                        <td className="py-2 pr-4">
                          {call.metadata?.call_status || call.status || (
                            <span className="text-muted-foreground">Completed</span>
                          )}
                        </td>
                        <td className="py-2 pr-4 whitespace-nowrap">{formatDate(call.callTimestamp)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {filteredCalls.length > 0 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Show</span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => setItemsPerPage(Number(value))}
                  >
                    <SelectTrigger className="w-[80px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground">per page</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredCalls.length)} of {filteredCalls.length} records
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}


