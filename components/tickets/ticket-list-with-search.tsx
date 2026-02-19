"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { TicketDetailModal } from "./ticket-detail-modal"
import { cn } from "@/lib/utils"
import { LayoutList, LayoutGrid } from "lucide-react"

interface Ticket {
  id?: string
  ticketId?: string
  _id?: string
  title?: string
  subject?: string
  description?: string
  status?: string
  priority?: string
  tenant?: string
  tenantId?: any
  agent?: string
  agentId?: any
  customer?: string
  customerEmail?: string
  created?: string
  createdAt?: string
  updated?: string
  updatedAt?: string
  category?: string
  responses?: number
}

interface TicketListProps {
  tickets: Ticket[]
  onTicketUpdated?: () => void
}

function timeAgo(dateStr: string | undefined): string {
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

function slaLabel(created: string | undefined, status: string): { text: string; isOverdue: boolean } {
  if (!created || status === "Resolved" || status === "Closed") return { text: "—", isOverdue: false }
  const createdMs = new Date(created).getTime()
  const slaHours = 4
  const dueMs = createdMs + slaHours * 3600000
  const now = Date.now()
  if (now > dueMs) {
    const overdueH = Math.round((now - dueMs) / 3600000)
    return { text: `SLA: ${overdueH}h overdue`, isOverdue: true }
  }
  const remainH = Math.max(0, Math.round((dueMs - now) / 3600000))
  return { text: `SLA: ${remainH}h remaining`, isOverdue: false }
}

export function TicketListWithSearch({ tickets, onTicketUpdated }: TicketListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid")
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const ticketId = ticket.ticketId || ticket.id || (ticket._id ? ticket._id.toString() : "")
      const title = ticket.title || ticket.subject || ""
      const customer = ticket.customer || ""
      const matchesSearch =
        title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || ticket.status === statusFilter
      const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter
      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [tickets, searchTerm, statusFilter, priorityFilter])

  const openModal = (ticket: Ticket) => {
    const ticketId = ticket.ticketId || ticket.id || (ticket._id ? ticket._id.toString() : "")
    setSelectedTicket({
      id: ticketId,
      title: ticket.title || ticket.subject || "",
      description: ticket.description || "",
      status: ticket.status || "Open",
      priority: ticket.priority || "Medium",
      tenant: (ticket.tenantId as any)?.name || ticket.tenant || "Unknown",
      agent: (ticket.agentId as any)?.name || ticket.agent || "Unassigned",
      customer: ticket.customer || "Unknown",
      created: ticket.created || ticket.createdAt || "",
      updated: ticket.updated || ticket.updatedAt || "",
      assignedAt: (ticket as any).assignedAt || "",
      category: ticket.category || "general",
      responses: ticket.responses || 0,
      _id: ticket._id?.toString() || ticket.id,
    } as any)
    setModalOpen(true)
  }

  const priorityColor: Record<string, string> = {
    Critical: "bg-red-500/90 text-white",
    High: "bg-orange-400/90 text-white",
    Medium: "bg-amber-400/90 text-white",
    Low: "bg-green-500/90 text-white",
  }
  const statusColor: Record<string, string> = {
    Open: "bg-sky-400/90 text-white",
    "In Progress": "bg-blue-400/90 text-white",
    Resolved: "bg-emerald-500/90 text-white",
    Closed: "bg-slate-300 text-slate-700",
    Overdue: "bg-red-400/90 text-white",
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          <div className="flex-1">
            <Input
              placeholder="Search by title, ID, or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40 rounded-xl">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Resolved">Resolved</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full md:w-40 rounded-xl">
              <SelectValue placeholder="Filter by Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1 border border-border rounded-xl p-1">
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
      </div>

      {filteredTickets.length === 0 ? (
        <div className="text-center py-12 rounded-2xl bg-muted/30 border border-dashed border-border">
          <p className="text-muted-foreground font-medium">No tickets found</p>
          <p className="text-sm text-muted-foreground/80 mt-1">Try adjusting your search or filters</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTickets.map((ticket, index) => {
            const ticketId = ticket.ticketId || ticket.id || (ticket._id ? ticket._id.toString() : "")
            const uniqueKey = ticket._id?.toString() || ticket.id || ticket.ticketId || `ticket-${index}`
            const created = ticket.created || ticket.createdAt || ""
            const dateCreated = created
              ? new Date(created).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
              : "—"
            return (
              <button
                type="button"
                key={uniqueKey}
                className="text-left rounded-2xl border border-border/60 bg-card p-4 shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] hover:-translate-y-0.5 hover:border-primary/20 transition-all duration-200 ease-out"
                onClick={() => openModal(ticket)}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-mono text-sm font-bold text-foreground">{ticketId}</span>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", statusColor[(ticket.status || "Open") as string] || statusColor.Open)}>
                      {ticket.status || "Open"}
                    </span>
                    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", priorityColor[(ticket.priority || "Medium") as string] || priorityColor.Medium)}>
                      {ticket.priority || "Medium"}
                    </span>
                  </div>
                </div>
                <p className="text-sm font-bold text-foreground mb-1 truncate">{ticket.title || ticket.subject || "No title"}</p>
                <p className="text-sm text-muted-foreground mb-2 truncate">{ticket.customer || "Unknown"}</p>
                <p className="text-xs text-muted-foreground">{dateCreated}</p>
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
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Ticket ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Subject</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Priority</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Time & SLA</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket, index) => {
                  const ticketId = ticket.ticketId || ticket.id || (ticket._id ? ticket._id.toString() : "")
                  const uniqueKey = ticket._id?.toString() || ticket.id || ticket.ticketId || `ticket-${index}`
                  const created = ticket.created || ticket.createdAt || ""
                  const sla = slaLabel(created, ticket.status || "Open")
                  return (
                    <tr
                      key={uniqueKey}
                      className="border-b border-border/60 hover:bg-accent/20 transition-colors cursor-pointer"
                      onClick={() => openModal(ticket)}
                    >
                      <td className="py-3 px-4 font-mono font-semibold text-foreground">{ticketId}</td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-foreground">{ticket.title || ticket.subject || "—"}</p>
                        <p className="text-xs text-muted-foreground">{(ticket.tenantId as any)?.name || "—"} • Opened {timeAgo(created)}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-foreground">{ticket.customer || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{(ticket as any).customerEmail || "No email provided"}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", priorityColor[(ticket.priority || "Medium") as string] || priorityColor.Medium)}>
                          {ticket.priority || "Medium"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", statusColor[(ticket.status || "Open") as string] || statusColor.Open)}>
                          {ticket.status || "Open"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-foreground">{timeAgo(created)}</p>
                        <p className={cn("text-xs font-medium", sla.isOverdue ? "text-red-600" : "text-green-600")}>{sla.text}</p>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <TicketDetailModal ticket={selectedTicket} open={modalOpen} onOpenChange={(open) => { setModalOpen(open); if (!open) onTicketUpdated?.(); }} onTicketUpdated={onTicketUpdated} />
    </div>
  )
}
