"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { Phone, TrendingUp, Settings, Filter, Play, Clock, User, Mail, RefreshCw } from "lucide-react"
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

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder="Search by name, phone, or transcript..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
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
                <SelectTrigger className="w-full md:w-[180px]">
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
          </CardContent>
        </Card>

        {/* Leads List */}
        <Card>
          <CardHeader>
            <CardTitle>Call Leads ({filteredLeads.length})</CardTitle>
            <CardDescription>All incoming call leads from Zoronal</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading leads...</div>
            ) : filteredLeads.length === 0 ? (
              <div className="text-center py-8">
                <Phone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No leads yet</h3>
                <p className="text-muted-foreground">Leads will appear here once calls are received</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredLeads.map((lead) => (
                  <div
                    key={lead._id}
                    className="flex items-start justify-between p-4 rounded-lg border border-border hover:bg-accent/5 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedLead(lead)
                      setModalOpen(true)
                    }}
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-semibold text-accent">{lead.leadId}</span>
                        <Badge className={getTypeColor(lead.type)}>{lead.type.replace("-", " ")}</Badge>
                        <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                        {lead.ticketCreated && (
                          <Badge className="bg-green-500/20 text-green-400">Ticket Created</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{lead.callerName || "Unknown"}</span>
                        </div>
                        {lead.callerPhone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{lead.callerPhone}</span>
                          </div>
                        )}
                        {lead.callDuration && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{formatDuration(lead.callDuration)}</span>
                          </div>
                        )}
                        {lead.callTimestamp && (
                          <span className="text-muted-foreground">
                            {new Date(lead.callTimestamp).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>
                      {lead.callTranscript && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {lead.callTranscript.substring(0, 150)}...
                        </p>
                      )}
                      {lead.analysisResult && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-muted-foreground">Analysis:</span>
                          <span className="font-medium">{lead.analysisResult.intent}</span>
                          <span className="text-muted-foreground">
                            ({Math.round(lead.analysisResult.confidence * 100)}% confidence)
                          </span>
                        </div>
                      )}
                    </div>
                    {lead.callRecordingUrl && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(lead.callRecordingUrl, "_blank")
                        }}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
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

