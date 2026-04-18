"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { API_URL, getHeaders } from "@/lib/api-helpers"
import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Phone, PhoneCall, Clock, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"

interface CallLogRow {
  _id: string
  historyId: string
  title?: string
  description?: string
  customer?: string
  customerPhone?: string
  accountNumber?: string
  callType: string
  resolution: string
  needsReview?: boolean
  source: string
  channel: string
  language?: string
  callTimestamp?: string
  createdAt?: string
  metadata?: Record<string, unknown>
}

export default function TenantCallLogsPage() {
  const { user, token } = useAuth()
  const [calls, setCalls] = useState<CallLogRow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [selected, setSelected] = useState<CallLogRow | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const sidebarItems = [
    { label: "Overview", href: "/dashboard/tenant-admin", icon: <PhoneCall className="h-5 w-5" /> },
    { label: "Leads", href: "/dashboard/tenant-admin/leads", icon: <Phone className="h-5 w-5" /> },
    { label: "Call Logs", href: "/dashboard/tenant-admin/call-logs", icon: <Clock className="h-5 w-5" /> },
    { label: "Tickets", href: "/dashboard/tenant-admin/tickets", icon: <PhoneCall className="h-5 w-5" /> },
    { label: "Agents", href: "/dashboard/tenant-admin/agents", icon: <PhoneCall className="h-5 w-5" /> },
    { label: "Settings", href: "/dashboard/tenant-admin/settings", icon: <PhoneCall className="h-5 w-5" /> },
  ]

  const fetchCalls = async () => {
    if (!user?.tenantId || !token) return

    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/call-logs`, {
        headers: getHeaders(true),
      })

      const result = await response.json()

      if (result.success && Array.isArray(result.data)) {
        setCalls(result.data as CallLogRow[])
      }
    } catch (error) {
      console.error("Error fetching call logs:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCalls()
    const interval = setInterval(fetchCalls, 30000)
    return () => clearInterval(interval)
  }, [user?.tenantId, token])

  const filteredCalls = calls.filter((call) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      call.historyId.toLowerCase().includes(term) ||
      call.customerPhone?.toLowerCase().includes(term) ||
      call.customer?.toLowerCase().includes(term) ||
      call.description?.toLowerCase().includes(term) ||
      call.callType?.toLowerCase().includes(term)
    )
  })

  const totalPages = Math.max(1, Math.ceil(filteredCalls.length / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedCalls = filteredCalls.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  useEffect(() => {
    setCurrentPage(1)
  }, [itemsPerPage])

  const formatDate = (call: CallLogRow) => {
    const raw = call.callTimestamp || call.createdAt
    if (!raw) return "-"
    const date = new Date(raw)
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
      sidebarTitle="Tenant Admin"
      sidebarItems={sidebarItems}
      userRole="tenant-admin"
      userName={user?.name || "Admin"}
      notificationCount={0}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Call Logs</h1>
            <p className="text-muted-foreground mt-2">
              Same records as <code className="text-xs bg-muted px-1 rounded">POST /call-logs</code> — voice/IVR audit (complaints, SRs, resolved calls). Sales prospects stay under Leads.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={fetchCalls}
              disabled={loading}
              title="Refresh call logs"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Input
              placeholder="Search by ID, phone, name, type, transcript..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Call logs ({filteredCalls.length})</CardTitle>
            <CardDescription>Type, channel, resolution, and time</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading call logs...</div>
            ) : filteredCalls.length === 0 ? (
              <div className="text-center py-8">
                <Phone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-1">No call logs yet</h3>
                <p className="text-muted-foreground text-sm">
                  Records appear when your voice workflow posts to <code className="text-xs bg-muted px-1 rounded">POST /call-logs</code>.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b text-xs text-muted-foreground">
                    <tr className="text-left">
                      <th className="py-2 pr-4 font-medium">ID</th>
                      <th className="py-2 pr-4 font-medium">Type</th>
                      <th className="py-2 pr-4 font-medium">Via</th>
                      <th className="py-2 pr-4 font-medium">Customer / Number</th>
                      <th className="py-2 pr-4 font-medium">Resolution</th>
                      <th className="py-2 pr-4 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCalls.map((call) => (
                      <tr
                        key={call._id}
                        className="border-b last:border-0 hover:bg-accent/5 cursor-pointer"
                        onClick={() => {
                          setSelected(call)
                          setDetailOpen(true)
                        }}
                      >
                        <td className="py-2 pr-4 font-mono text-xs truncate max-w-[120px]">{call.historyId}</td>
                        <td className="py-2 pr-4">
                          <Badge variant="secondary" className="font-normal capitalize">
                            {call.callType || "—"}
                          </Badge>
                        </td>
                        <td className="py-2 pr-4">
                          <div className="flex items-center gap-1">
                            <PhoneCall className="h-4 w-4 text-accent shrink-0" />
                            <span className="capitalize">{call.source || "phone"}</span>
                          </div>
                        </td>
                        <td className="py-2 pr-4">
                          <span className="font-medium">{call.customer || "—"}</span>
                          <span className="text-muted-foreground block text-xs">
                            {call.customerPhone || "N/A"}
                          </span>
                        </td>
                        <td className="py-2 pr-4 capitalize">{call.resolution || "—"}</td>
                        <td className="py-2 pr-4 whitespace-nowrap">{formatDate(call)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {filteredCalls.length > 0 && (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mt-4 pt-4 border-t">
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

                <span className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredCalls.length)} of {filteredCalls.length}{" "}
                  records
                </span>

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

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-mono text-base">{selected?.historyId}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Summary</p>
                <p className="font-medium">{selected.title || "—"}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-muted-foreground text-xs">Customer</p>
                  <p>{selected.customer || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Phone</p>
                  <p>{selected.customerPhone || "—"}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{selected.callType}</Badge>
                <Badge variant="outline">{selected.resolution}</Badge>
                {selected.needsReview && <Badge variant="destructive">Needs review</Badge>}
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Transcript / description</p>
                <p className="whitespace-pre-wrap rounded-md bg-muted/50 p-3 text-xs leading-relaxed">
                  {selected.description || "—"}
                </p>
              </div>
              {selected.metadata && Object.keys(selected.metadata).length > 0 && (
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Metadata</p>
                  <pre className="text-xs bg-muted/50 p-3 rounded-md overflow-x-auto whitespace-pre-wrap break-all">
                    {JSON.stringify(selected.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
