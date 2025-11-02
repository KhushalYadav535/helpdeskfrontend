"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TicketDetailModal } from "./ticket-detail-modal"

interface Ticket {
  id: string
  title: string
  description: string
  status: string
  priority: string
  tenant: string
  agent: string
  customer: string
  created: string
  updated: string
  category: string
  responses: number
}

interface TicketListProps {
  tickets: Ticket[]
}

export function TicketListWithSearch({ tickets }: TicketListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesSearch =
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.customer.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || ticket.status === statusFilter
      const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter

      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [tickets, searchTerm, statusFilter, priorityFilter])

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setModalOpen(true)
  }

  const priorityColor = {
    Critical: "bg-red-100 text-red-800",
    High: "bg-orange-100 text-orange-800",
    Medium: "bg-yellow-100 text-yellow-800",
    Low: "bg-green-100 text-green-800",
  }

  const statusColor = {
    Open: "bg-blue-100 text-blue-800",
    "In Progress": "bg-purple-100 text-purple-800",
    Resolved: "bg-green-100 text-green-800",
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by title, ID, or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full md:w-40">
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
      </div>

      <div className="space-y-2">
        {filteredTickets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No tickets found</div>
        ) : (
          filteredTickets.map((ticket) => (
            <Button
              key={ticket.id}
              variant="outline"
              className="w-full justify-start h-auto py-3 px-4 bg-transparent"
              onClick={() => handleTicketClick(ticket)}
            >
              <div className="flex-1 text-left space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold">{ticket.id}</span>
                  <Badge className={priorityColor[ticket.priority as keyof typeof priorityColor]}>
                    {ticket.priority}
                  </Badge>
                  <Badge className={statusColor[ticket.status as keyof typeof statusColor]}>{ticket.status}</Badge>
                </div>
                <p className="text-sm">{ticket.title}</p>
                <p className="text-xs text-muted-foreground">
                  {ticket.customer} • {ticket.agent}
                </p>
              </div>
            </Button>
          ))
        )}
      </div>

      <TicketDetailModal ticket={selectedTicket} open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  )
}
