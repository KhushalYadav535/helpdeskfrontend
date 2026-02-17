"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { Phone, TrendingUp, Settings, Play, Clock, User, Mail, RefreshCw, LayoutList, LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { API_URL, getHeaders } from "@/lib/api-helpers"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Lead {
  _id: string
  leadId: string
  source: string
  type: "sales-lead" | "service-request" | "support" | "other"
  status: string
  callerName?: string
  callerPhone?: string
  callerEmail?: string
  calledNumber?: string
  callDuration?: number
  callRecordingUrl?: string
  callTranscript?: string
  callTimestamp?: string
  analysisResult?: {
    category: string
    confidence: number
    keywords: string[]
    sentiment?: string
    intent?: string
    suggestedAction?: string
  }
  ticketId?: any
  ticketCreated?: boolean
  createdAt: string
}

export default function LeadsPage() {
  const { user, token } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid")
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const sidebarItems = [
    { label: "Overview", href: "/dashboard/tenant-admin", icon: <TrendingUp className="h-5 w-5" /> },
    { label: "Leads", href: "/dashboard/tenant-admin/leads", icon: <Phone className="h-5 w-5" /> },
    { label: "Tickets", href: "/dashboard/tenant-admin/tickets", icon: <TrendingUp className="h-5 w-5" /> },
    { label: "Agents", href: "/dashboard/tenant-admin/agents", icon: <User className="h-5 w-5" /> },
    { label: "Settings", href: "/dashboard/tenant-admin/settings", icon: <Settings className="h-5 w-5" /> },
  ]

  const [migrating, setMigrating] = useState(false)

  const fetchLeads = async () => {
    if (!user?.tenantId || !token) return

    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/leads?tenantId=${user.tenantId}`, {
        headers: getHeaders(true),
      })
      const result = await response.json()

      if (result.success && result.data) {
        setLeads(result.data)
      }
    } catch (error) {
      console.error("Error fetching leads:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchLeads, 30000)
    
    return () => clearInterval(interval)
  }, [user?.tenantId, token])

  // Auto-migrate: silently create leads from phone tickets (no click needed)
  useEffect(() => {
    if (!user?.tenantId || !token) return
    const runAutoMigrate = async () => {
      try {
        const res = await fetch(`${API_URL}/leads/migrate-from-tickets`, {
          method: "POST",
          headers: getHeaders(true),
        })
        const data = await res.json()
        if (data.success && data.migrated > 0) {
          fetchLeads()
        }
      } catch {
        // silent
      }
    }
    runAutoMigrate()
  }, [user?.tenantId, token])

  const handleMigrate = async () => {
    if (!confirm("Migrate existing phone call tickets to leads? This will create leads from all phone call tickets.")) {
      return
    }

    try {
      setMigrating(true)
      const response = await fetch(`${API_URL}/leads/migrate-from-tickets`, {
        method: "POST",
        headers: getHeaders(true),
      })
      const result = await response.json()

      if (result.success) {
        alert(`Migration completed: ${result.migrated} leads created, ${result.skipped} skipped`)
        // Refresh leads
        window.location.reload()
      } else {
        alert(result.error || "Migration failed")
      }
    } catch (error: any) {
      alert(error.message || "Migration failed")
    } finally {
      setMigrating(false)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "sales-lead":
        return "bg-blue-500/20 text-blue-400"
      case "service-request":
        return "bg-orange-500/20 text-orange-400"
      case "support":
        return "bg-green-500/20 text-green-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-500/20 text-blue-400"
      case "contacted":
        return "bg-yellow-500/20 text-yellow-400"
      case "qualified":
        return "bg-green-500/20 text-green-400"
      case "converted":
        return "bg-purple-500/20 text-purple-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      searchTerm === "" ||
      lead.callerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.callerPhone?.includes(searchTerm) ||
      lead.leadId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.callTranscript?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || lead.status === statusFilter
    const matchesType = typeFilter === "all" || lead.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A"
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const timeAgo = (dateStr: string | undefined) => {
    if (!dateStr) return "—"
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffM = Math.floor(diffMs / 60000)
    const diffH = Math.floor(diffMs / 3600000)
    const diffD = Math.floor(diffMs / 86400000)
    if (diffM < 60) return `${diffM}m ago`
    if (diffH < 24) return `${diffH}h ago`
    return `${diffD}d ago`
  }

  const handleConvertToTicket = async (leadId: string) => {
    try {
      const response = await fetch(`${API_URL}/leads/${leadId}/convert-to-ticket`, {
        method: "POST",
        headers: getHeaders(true),
      })
      const result = await response.json()

      if (result.success) {
        // Refresh leads
        window.location.reload()
      } else {
        alert(result.error || "Failed to convert lead to ticket")
      }
    } catch (error: any) {
      alert(error.message || "Failed to convert lead to ticket")
    }
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
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
            <p className="text-muted-foreground mt-2">Manage call leads and conversions</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={fetchLeads}
              disabled={loading}
              title="Refresh leads"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button
              variant="outline"
              onClick={handleMigrate}
              disabled={migrating || loading}
              title="Create leads from existing phone call tickets"
            >
              {migrating ? "Migrating..." : "Migrate from Tickets"}
            </Button>
          </div>
        </div>

        {/* Leads: Filters + List/Grid toggle */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Call Leads ({filteredLeads.length})</CardTitle>
                <CardDescription>All incoming call leads from Zoronal</CardDescription>
              </div>
              <div className="flex items-center gap-1 border border-border rounded-xl p-1 w-fit">
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  onClick={() => setViewMode("list")}
                  title="List view"
                >
                  <LayoutList className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  onClick={() => setViewMode("grid")}
                  title="Card view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder="Search by name, phone, or transcript..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 rounded-xl"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px] rounded-xl">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-[180px] rounded-xl">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="sales-lead">Sales Lead</SelectItem>
                  <SelectItem value="service-request">Service Request</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading leads...</div>
            ) : filteredLeads.length === 0 ? (
              <div className="text-center py-12 rounded-2xl bg-muted/30 border border-dashed border-border">
                <Phone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No leads yet</h3>
                <p className="text-muted-foreground">Leads will appear here once calls are received</p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLeads.map((lead, index) => {
                  const initial = (lead.callerName || "U").charAt(0).toUpperCase()
                  const colors = ["bg-violet-500", "bg-pink-500", "bg-sky-500", "bg-emerald-500"]
                  const avatarColor = colors[index % colors.length]
                  return (
                    <button
                      type="button"
                      key={lead._id}
                      className="text-left rounded-2xl border border-border/60 bg-card p-4 shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] hover:-translate-y-0.5 hover:border-primary/20 transition-all duration-200 ease-out"
                      onClick={() => {
                        setSelectedLead(lead)
                        setModalOpen(true)
                      }}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="font-mono text-sm font-bold text-foreground">{lead.leadId}</span>
                        <div className="flex gap-1.5 flex-shrink-0 flex-wrap justify-end">
                          <Badge className={getTypeColor(lead.type)}>{lead.type.replace("-", " ")}</Badge>
                          <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                          {lead.ticketCreated && (
                            <Badge className="bg-green-500/20 text-green-400 text-xs">Ticket</Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">
                        {lead.source || "Call"} • {timeAgo(lead.createdAt)}
                      </p>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 ${avatarColor}`}>
                          {initial}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">{lead.callerName || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground truncate">{lead.callerPhone || lead.callerEmail || "No contact"}</p>
                        </div>
                      </div>
                      {lead.callDuration && (
                        <p className="text-xs text-muted-foreground mb-1">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {formatDuration(lead.callDuration)}
                        </p>
                      )}
                      {lead.callTranscript && (
                        <p className="text-xs text-foreground line-clamp-2 mt-2">{lead.callTranscript.substring(0, 80)}...</p>
                      )}
                      {lead.analysisResult?.intent && (
                        <p className="text-xs text-muted-foreground mt-2">Intent: {lead.analysisResult.intent}</p>
                      )}
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-border/60 bg-card shadow-[var(--card-shadow)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Lead ID</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Subject / Source</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Customer</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeads.map((lead) => (
                        <tr
                          key={lead._id}
                          className="border-b border-border/60 hover:bg-accent/20 transition-colors cursor-pointer"
                          onClick={() => {
                            setSelectedLead(lead)
                            setModalOpen(true)
                          }}
                        >
                          <td className="py-3 px-4 font-mono font-semibold text-foreground">{lead.leadId}</td>
                          <td className="py-3 px-4">
                            <p className="font-semibold text-foreground">{lead.source || "Call"}</p>
                            <p className="text-xs text-muted-foreground">{lead.type.replace("-", " ")} • {timeAgo(lead.createdAt)}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-semibold text-foreground">{lead.callerName || "Unknown"}</p>
                            <p className="text-xs text-muted-foreground">{lead.callerPhone || lead.callerEmail || "—"}</p>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                            {lead.ticketCreated && (
                              <Badge className="ml-1 bg-green-500/20 text-green-400 text-xs">Ticket</Badge>
                            )}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">{timeAgo(lead.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lead Detail Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedLead?.leadId}</DialogTitle>
            </DialogHeader>
            {selectedLead && (
              <div className="space-y-4">
                <Tabs defaultValue="details" className="w-full">
                  <TabsList>
                    <TabsTrigger value="details">Call Details</TabsTrigger>
                    <TabsTrigger value="transcript">Transcript</TabsTrigger>
                    <TabsTrigger value="analysis">Analysis</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Caller Name</p>
                        <p className="text-sm font-medium">{selectedLead.callerName || "Unknown"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Phone Number</p>
                        <p className="text-sm font-medium">{selectedLead.callerPhone || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm font-medium">{selectedLead.callerEmail || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Called Number</p>
                        <p className="text-sm font-medium">{selectedLead.calledNumber || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Call Duration</p>
                        <p className="text-sm font-medium">{formatDuration(selectedLead.callDuration)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Call Time</p>
                        <p className="text-sm font-medium">
                          {selectedLead.callTimestamp
                            ? new Date(selectedLead.callTimestamp).toLocaleString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Type</p>
                        <Badge className={getTypeColor(selectedLead.type)}>
                          {selectedLead.type.replace("-", " ")}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Status</p>
                        <Badge className={getStatusColor(selectedLead.status)}>{selectedLead.status}</Badge>
                      </div>
                    </div>
                    {selectedLead.callRecordingUrl && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Recording</p>
                        <Button
                          variant="outline"
                          onClick={() => window.open(selectedLead.callRecordingUrl, "_blank")}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Play Recording
                        </Button>
                      </div>
                    )}
                    {!selectedLead.ticketCreated && selectedLead.type !== "sales-lead" && (
                      <div>
                        <Button
                          onClick={() => handleConvertToTicket(selectedLead._id)}
                          className="w-full"
                        >
                          Convert to Ticket
                        </Button>
                      </div>
                    )}
                    {selectedLead.ticketId && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Linked Ticket</p>
                        <Badge variant="outline">
                          {selectedLead.ticketId.ticketId || selectedLead.ticketId}
                        </Badge>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="transcript" className="space-y-4">
                    {selectedLead.callTranscript ? (
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">{selectedLead.callTranscript}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No transcript available</p>
                    )}
                  </TabsContent>

                  <TabsContent value="analysis" className="space-y-4">
                    {selectedLead.analysisResult ? (
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Category</p>
                          <p className="text-sm font-medium">{selectedLead.analysisResult.category}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Confidence</p>
                          <p className="text-sm font-medium">
                            {Math.round(selectedLead.analysisResult.confidence * 100)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Intent</p>
                          <p className="text-sm font-medium">{selectedLead.analysisResult.intent}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Sentiment</p>
                          <Badge
                            className={
                              selectedLead.analysisResult.sentiment === "positive"
                                ? "bg-green-500/20 text-green-400"
                                : selectedLead.analysisResult.sentiment === "negative"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-gray-500/20 text-gray-400"
                            }
                          >
                            {selectedLead.analysisResult.sentiment || "neutral"}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Suggested Action</p>
                          <p className="text-sm">{selectedLead.analysisResult.suggestedAction}</p>
                        </div>
                        {selectedLead.analysisResult.keywords && selectedLead.analysisResult.keywords.length > 0 && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-2">Keywords</p>
                            <div className="flex flex-wrap gap-2">
                              {selectedLead.analysisResult.keywords.map((keyword, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No analysis available</p>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

