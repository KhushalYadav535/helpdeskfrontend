"use client"

import { useState, useEffect } from "react"
import { API_URL, getHeaders } from "@/lib/api-helpers"
import { useAuth } from "@/lib/auth-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatDistanceToNow } from "date-fns"
import { UserPlus, ArrowRightLeft } from "lucide-react"

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
  assignedAt?: string
  category: string
  responses: number
  clientFeedback?: "satisfied" | "dissatisfied" | "no_response"
  feedbackToken?: string
  // Allow backend fields passthrough
  _id?: string
}

interface TicketDetailModalProps {
  ticket: Ticket | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onTicketUpdated?: () => void
}

export function TicketDetailModal({ ticket, open, onOpenChange, onTicketUpdated }: TicketDetailModalProps) {
  const { user } = useAuth()
  const [newComment, setNewComment] = useState("")
  const [closing, setClosing] = useState(false)
  const [resolving, setResolving] = useState(false)
  const [reopening, setReopening] = useState(false)
  const [canReopen, setCanReopen] = useState(false)
  const [canAssign, setCanAssign] = useState(false)
  const [canCloseTicket, setCanCloseTicket] = useState(false)
  const [agentLevel, setAgentLevel] = useState<string | null>(null)
  const [comments, setComments] = useState<any[]>([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [agents, setAgents] = useState<any[]>([])
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
  const [selectedAgentId, setSelectedAgentId] = useState<string>("")
  const [assigning, setAssigning] = useState(false)
  const [transferring, setTransferring] = useState(false)

  // Check if user can reopen/assign tickets (admin or supervisor)
  useEffect(() => {
    const checkPermissions = async () => {
      if (!user) {
        setCanReopen(false)
        setCanAssign(false)
        setCanCloseTicket(false)
        return
      }

      // Tenant Admin or Super Admin can reopen, assign/transfer, and close tickets
      if (user.role === "tenant-admin" || user.role === "super-admin") {
        setCanReopen(true)
        setCanAssign(true)
        setCanCloseTicket(true)
        return
      }

      // For agents: only supervisor can reopen, assign/transfer, and close tickets
      if (user.role === "agent") {
        try {
          const response = await fetch(`${API_URL}/agents${user.tenantId ? `?tenantId=${user.tenantId}` : ''}`, {
            headers: getHeaders(true),
          })
          const result = await response.json()
          if (result.success && result.data && result.data.length > 0) {
            const agent = result.data.find((a: any) => a.email === user.email)
            if (agent) {
              const level = agent.agentLevel || "agent"
              setAgentLevel(level)
              const isSupervisor = level === "supervisor"
              setCanReopen(isSupervisor)
              setCanAssign(isSupervisor)
              setCanCloseTicket(isSupervisor)
            }
          }
        } catch (error) {
          console.error("Error checking agent level:", error)
          setCanReopen(false)
          setCanAssign(false)
          setCanCloseTicket(false)
        }
      }
    }

    checkPermissions()
  }, [user])

  // Fetch agents for assign/transfer when modal opens and user can assign
  useEffect(() => {
    const fetchAgents = async () => {
      if (!open || !canAssign || !user?.tenantId) return
      try {
        const response = await fetch(`${API_URL}/agents?tenantId=${user.tenantId}`, {
          headers: getHeaders(true),
        })
        const result = await response.json()
        if (result.success && result.data) {
          // Exclude management (dashboard-only) and supervisors from assignment targets
          setAgents(result.data.filter((a: any) => a.agentLevel !== "management" && a.agentLevel !== "supervisor"))
        }
      } catch (error) {
        console.error("Error fetching agents:", error)
      }
    }
    fetchAgents()
  }, [open, canAssign, user?.tenantId])

  // Fetch comments when ticket changes
  useEffect(() => {
    const fetchComments = async () => {
      if (!ticket) {
        setComments([])
        return
      }

      const ticketId = (ticket as any)._id || ticket.id
      if (!ticketId) {
        setComments([])
        return
      }

      try {
        setLoadingComments(true)
        const response = await fetch(`${API_URL}/comments/${ticketId}`, {
          headers: getHeaders(true),
        })
        const result = await response.json()

        if (result.success && result.data) {
          // Transform backend comments to frontend format
          const transformedComments = result.data.map((comment: any) => ({
            id: comment.id,
            author: comment.author || "Unknown",
            role: comment.role || "Agent",
            text: comment.text || "",
            timestamp: new Date(comment.timestamp || comment.createdAt),
            avatar: (comment.author || "U").substring(0, 2).toUpperCase(),
          }))
          setComments(transformedComments)
        } else {
          setComments([])
        }
      } catch (error) {
        console.error("Error fetching comments:", error)
        setComments([])
      } finally {
        setLoadingComments(false)
      }
    }

    if (open && ticket) {
      fetchComments()
    }
  }, [ticket, open])

  if (!ticket) return null

  const priorityColor = {
    Critical: "bg-red-500/90 text-white",
    High: "bg-orange-400/90 text-white",
    Medium: "bg-amber-400/90 text-white",
    Low: "bg-green-500/90 text-white",
  }

  const statusColor = {
    Open: "bg-sky-400/90 text-white",
    "In Progress": "bg-blue-400/90 text-white",
    Resolved: "bg-emerald-500/90 text-white",
    Closed: "bg-slate-300 text-slate-700",
  }

  const handleResolveTicket = async () => {
    if (!ticket) return
    const mongoId = (ticket as any)._id
    if (!mongoId) {
      alert("Cannot resolve: ticket id is missing.")
      return
    }
    try {
      setResolving(true)
      const resolveRes = await fetch(`${API_URL}/tickets/${mongoId}`, {
        method: "PUT",
        headers: getHeaders(true),
        body: JSON.stringify({ status: "Resolved" }),
      })
      const resolveResult = await resolveRes.json()
      if (!resolveResult.success) {
        throw new Error(resolveResult.error || "Failed to resolve ticket")
      }
      onTicketUpdated?.()
      onOpenChange(false)
    } catch (e: any) {
      alert(e.message || "Failed to resolve ticket")
    } finally {
      setResolving(false)
    }
  }

  const handleCloseTicket = async () => {
    if (!ticket) return
    const mongoId = (ticket as any)._id
    if (!mongoId) {
      alert("Cannot close: ticket id is missing.")
      return
    }
    try {
      setClosing(true)
      const res = await fetch(`${API_URL}/tickets/${mongoId}`, {
        method: "PUT",
        headers: getHeaders(true),
        body: JSON.stringify({ status: "Closed" }),
      })
      const result = await res.json()
      if (!result.success) {
        throw new Error(result.error || "Failed to close ticket")
      }
      onTicketUpdated?.()
      onOpenChange(false)
    } catch (e: any) {
      alert(e.message || "Failed to close ticket")
    } finally {
      setClosing(false)
    }
  }

  const handleAssignTicket = async () => {
    if (!ticket || !selectedAgentId) return
    const mongoId = (ticket as any)._id
    if (!mongoId) return
    try {
      setAssigning(true)
      const res = await fetch(`${API_URL}/tickets/${mongoId}`, {
        method: "PUT",
        headers: getHeaders(true),
        body: JSON.stringify({ agentId: selectedAgentId }),
      })
      const result = await res.json()
      if (!result.success) {
        throw new Error(result.error || "Failed to assign ticket")
      }
      setAssignDialogOpen(false)
      setSelectedAgentId("")
      onTicketUpdated?.()
    } catch (e: any) {
      alert(e.message || "Failed to assign ticket")
    } finally {
      setAssigning(false)
    }
  }

  const handleTransferTicket = async () => {
    if (!ticket || !selectedAgentId) return
    const mongoId = (ticket as any)._id
    if (!mongoId) return
    try {
      setTransferring(true)
      const res = await fetch(`${API_URL}/tickets/${mongoId}/transfer`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify({ toAgentId: selectedAgentId }),
      })
      const result = await res.json()
      if (!result.success) {
        throw new Error(result.error || "Failed to transfer ticket")
      }
      setTransferDialogOpen(false)
      setSelectedAgentId("")
      onTicketUpdated?.()
    } catch (e: any) {
      alert(e.message || "Failed to transfer ticket")
    } finally {
      setTransferring(false)
    }
  }

  const handleReopenTicket = async () => {
    if (!ticket) return
    const mongoId = (ticket as any)._id
    if (!mongoId) {
      alert("Cannot reopen: ticket id is missing.")
      return
    }
    try {
      setReopening(true)
      const res = await fetch(`${API_URL}/tickets/${mongoId}`, {
        method: "PUT",
        headers: getHeaders(true),
        body: JSON.stringify({ status: "Open" }),
      })
      const result = await res.json()
      if (!result.success) {
        throw new Error(result.error || "Failed to reopen ticket")
      }
      // Simple approach: refresh to reflect latest status
      window.location.reload()
    } catch (e: any) {
      alert(e.message || "Failed to reopen ticket")
    } finally {
      setReopening(false)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !ticket) return

    const ticketId = (ticket as any)._id || ticket.id
    if (!ticketId) {
      alert("Cannot add comment: ticket ID is missing.")
      return
    }

    try {
      const response = await fetch(`${API_URL}/comments/${ticketId}`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify({ text: newComment }),
      })

      const result = await response.json()

      if (result.success && result.data) {
        // Add new comment to list
        const newCommentData = {
          id: result.data.id,
          author: result.data.author || user?.name || "You",
          role: result.data.role || "Agent",
          text: result.data.text,
          timestamp: new Date(result.data.timestamp || result.data.createdAt),
          avatar: (result.data.author || "U").substring(0, 2).toUpperCase(),
        }
        setComments([...comments, newCommentData])
        setNewComment("")
      } else {
        throw new Error(result.error || "Failed to add comment")
      }
    } catch (error: any) {
      console.error("Error adding comment:", error)
      alert(error.message || "Failed to add comment. Please try again.")
    }
  }

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!fixed !inset-0 !top-0 !left-0 !right-0 !bottom-0 !w-screen !h-screen !max-w-none !translate-x-0 !translate-y-0 !rounded-none overflow-y-auto p-4 md:p-6">
        <div className="w-full max-w-5xl mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{ticket.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg mb-1">{ticket.title}</h3>
            <p className="text-sm text-muted-foreground">{ticket.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Priority</p>
              <Badge className={`mt-1 ${priorityColor[ticket.priority as keyof typeof priorityColor]}`}>
                {ticket.priority}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge className={`mt-1 ${statusColor[ticket.status as keyof typeof statusColor]}`}>
                {ticket.status}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Customer</p>
              <p className="text-sm font-medium">{ticket.customer}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Assigned Agent</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm font-medium">{ticket.agent}</p>
                {canAssign && ticket.status !== "Closed" && (
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => { setSelectedAgentId(""); setAssignDialogOpen(true) }}>
                      <UserPlus className="h-3 w-3 mr-1" />
                      Assign
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setSelectedAgentId(""); setTransferDialogOpen(true) }}>
                      <ArrowRightLeft className="h-3 w-3 mr-1" />
                      Transfer
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="text-sm font-medium">
                {ticket.created
                  ? new Date(ticket.created).toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Assigned At</p>
              <p className="text-sm font-medium">
                {(ticket as any).assignedAt
                  ? new Date((ticket as any).assignedAt).toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ticket.agent && ticket.agent !== "Unassigned" && ticket.updated
                  ? new Date(ticket.updated).toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Not assigned"}
              </p>
            </div>
          </div>

          <Tabs defaultValue="comments" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="comments" className="space-y-3">
              <div className="space-y-3 max-h-48 overflow-y-auto min-h-20">
                {loadingComments ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Loading comments...</p>
                ) : comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No comments yet. Be the first to comment!</p>
                ) : (
                  comments.map((comment) => (
                  <div key={comment.id} className="border-l-2 border-primary pl-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold">
                          {comment.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{comment.author}</p>
                          <p className="text-xs text-muted-foreground">{comment.role}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(comment.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                    <p className="text-sm mt-2">{comment.text}</p>
                  </div>
                  ))
                )}
              </div>

              <div className="space-y-2">
                <textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full p-2 text-sm border rounded-md"
                  rows={2}
                />
                <Button onClick={handleAddComment} className="w-full">
                  Add Comment
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-2">
              <div className="text-sm space-y-2">
                <p>
                  <span className="font-medium">Category:</span> {ticket.category}
                </p>
                <p>
                  <span className="font-medium">Tenant:</span> {ticket.tenant}
                </p>
                <p>
                  <span className="font-medium">Created:</span>{" "}
                  {ticket.created
                    ? new Date(ticket.created).toLocaleString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "N/A"}
                </p>
                <p>
                  <span className="font-medium">Last Updated:</span>{" "}
                  {ticket.updated
                    ? new Date(ticket.updated).toLocaleString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "N/A"}
                </p>
                <p>
                  <span className="font-medium">Responses:</span> {ticket.responses}
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="pt-1 space-y-2">
            {ticket.status === "Closed" ? (
              // Closed tickets: Only reopen option (if permission)
              canReopen ? (
                <Button
                  onClick={handleReopenTicket}
                  disabled={reopening}
                  className="w-full"
                  variant="default"
                >
                  {reopening ? "Reopening..." : "Reopen Ticket"}
                </Button>
              ) : (
                <Button
                  disabled
                  className="w-full"
                  variant="outline"
                >
                  Ticket Closed
                </Button>
              )
            ) : ticket.status === "Resolved" ? (
              // Resolved tickets: Close requires client feedback (tenant-admin/super-admin can override)
              <div className="space-y-2">
                {!(ticket as any).clientFeedback && (
                  <div className="text-xs space-y-1">
                    {(user?.role === "tenant-admin" || user?.role === "super-admin") && (
                      <p className="text-amber-600">Awaiting client feedback. Admins can close without feedback.</p>
                    )}
                    {(ticket as any).feedbackToken && (
                      <p className="text-muted-foreground break-all">
                        Client feedback link: {typeof window !== "undefined" ? `${window.location.origin}/feedback/${(ticket as any)._id || ticket.id}?token=${(ticket as any).feedbackToken}` : ""}
                      </p>
                    )}
                  </div>
                )}
                <div className="flex gap-2">
                  {canCloseTicket && (
                    <Button
                      onClick={handleCloseTicket}
                      disabled={closing}
                      className="flex-1"
                      variant="default"
                    >
                      {closing ? "Closing..." : "Close Ticket"}
                    </Button>
                  )}
                  {canReopen && (
                    <Button
                      onClick={handleReopenTicket}
                      disabled={reopening}
                      className="flex-1"
                      variant="outline"
                    >
                      {reopening ? "Reopening..." : "Reopen Ticket"}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              // Open/In Progress tickets: Can be resolved or closed (close only for Supervisor+)
              <div className="flex gap-2">
                <Button
                  onClick={handleResolveTicket}
                  disabled={resolving}
                  className="flex-1"
                  variant="default"
                >
                  {resolving ? "Resolving..." : "Resolve Ticket"}
                </Button>
                {canCloseTicket && (
                  <Button
                    onClick={handleCloseTicket}
                    disabled={closing}
                    className="flex-1"
                    variant="outline"
                  >
                    {closing ? "Closing..." : "Close Ticket"}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Assign Dialog */}
    <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Ticket</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Agent</label>
            <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose agent..." />
              </SelectTrigger>
              <SelectContent>
                {agents.filter((a) => a.agentLevel !== "management" && a.agentLevel !== "supervisor").map((a: any) => (
                  <SelectItem key={a._id || a.id} value={(a.userId?._id || a.userId || a._id || a.id)?.toString()}>
                    {a.name || a.email} ({a.agentLevel || "agent"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAssignTicket} disabled={!selectedAgentId || assigning} className="w-full">
            {assigning ? "Assigning..." : "Assign"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    {/* Transfer Dialog */}
    <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer Ticket</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Transfer to Agent</label>
            <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose agent..." />
              </SelectTrigger>
              <SelectContent>
                {agents.filter((a) => a.agentLevel !== "management" && a.agentLevel !== "supervisor").map((a: any) => (
                  <SelectItem key={a._id || a.id} value={(a.userId?._id || a.userId || a._id || a.id)?.toString()}>
                    {a.name || a.email} ({a.agentLevel || "agent"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleTransferTicket} disabled={!selectedAgentId || transferring} className="w-full">
            {transferring ? "Transferring..." : "Transfer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}
