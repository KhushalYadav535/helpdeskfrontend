"use client"

import { useState, useEffect } from "react"
import { API_URL, getHeaders } from "@/lib/api-helpers"
import { useAuth } from "@/lib/auth-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDistanceToNow } from "date-fns"

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
  // Allow backend fields passthrough
  _id?: string
}

interface TicketDetailModalProps {
  ticket: Ticket | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TicketDetailModal({ ticket, open, onOpenChange }: TicketDetailModalProps) {
  const { user } = useAuth()
  const [newComment, setNewComment] = useState("")
  const [closing, setClosing] = useState(false)
  const [resolving, setResolving] = useState(false)
  const [reopening, setReopening] = useState(false)
  const [canReopen, setCanReopen] = useState(false)
  const [agentLevel, setAgentLevel] = useState<string | null>(null)
  const [comments, setComments] = useState<any[]>([])
  const [loadingComments, setLoadingComments] = useState(false)

  // Check if user can reopen tickets (admin or supervisor)
  useEffect(() => {
    const checkReopenPermission = async () => {
      if (!user) {
        setCanReopen(false)
        return
      }

      // Tenant Admin or Super Admin can always reopen
      if (user.role === "tenant-admin" || user.role === "super-admin") {
        setCanReopen(true)
        return
      }

      // For agents, check if they are supervisor
      if (user.role === "agent") {
        try {
          // Get all agents for the tenant and find the current user's agent record
          const response = await fetch(`${API_URL}/agents${user.tenantId ? `?tenantId=${user.tenantId}` : ''}`, {
            headers: getHeaders(true),
          })
          const result = await response.json()
          if (result.success && result.data && result.data.length > 0) {
            // The backend returns agents with userId populated, but we need to match by the user's id
            // Since the backend returns userId as a populated object, we need to check differently
            // For now, we'll check if the user's email matches any agent's email
            const agent = result.data.find((a: any) => {
              // Try matching by email as a fallback since userId might be populated
              return a.email === user.email
            })
            if (agent) {
              const level = agent.agentLevel || "agent"
              setAgentLevel(level)
              // Supervisor can reopen
              setCanReopen(level === "supervisor")
            }
          }
        } catch (error) {
          console.error("Error checking agent level:", error)
          setCanReopen(false)
        }
      }
    }

    checkReopenPermission()
  }, [user])

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
    Critical: "bg-red-100 text-red-800",
    High: "bg-orange-100 text-orange-800",
    Medium: "bg-yellow-100 text-yellow-800",
    Low: "bg-green-100 text-green-800",
  }

  const statusColor = {
    Open: "bg-blue-100 text-blue-800",
    "In Progress": "bg-purple-100 text-purple-800",
    Resolved: "bg-green-100 text-green-800",
    Closed: "bg-gray-200 text-gray-700",
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
      // Resolve ticket - backend will automatically set resolvedBy and resolvedAt
      // Then immediately close it
      const resolveRes = await fetch(`${API_URL}/tickets/${mongoId}`, {
        method: "PUT",
        headers: getHeaders(true),
        body: JSON.stringify({ status: "Resolved" }),
      })
      const resolveResult = await resolveRes.json()
      if (!resolveResult.success) {
        throw new Error(resolveResult.error || "Failed to resolve ticket")
      }
      
      // Automatically close the resolved ticket
      const closeRes = await fetch(`${API_URL}/tickets/${mongoId}`, {
        method: "PUT",
        headers: getHeaders(true),
        body: JSON.stringify({ status: "Closed" }),
      })
      const closeResult = await closeRes.json()
      if (!closeResult.success) {
        throw new Error(closeResult.error || "Failed to close ticket")
      }
      
      // Simple approach: refresh to reflect latest status
      window.location.reload()
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
      // Simple approach: refresh to reflect latest status
      window.location.reload()
    } catch (e: any) {
      alert(e.message || "Failed to close ticket")
    } finally {
      setClosing(false)
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{ticket.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">{ticket.title}</h3>
            <p className="text-sm text-muted-foreground">{ticket.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <p className="text-sm font-medium">{ticket.agent}</p>
            </div>
          </div>

          <Tabs defaultValue="comments" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="comments" className="space-y-4">
              <div className="space-y-4 max-h-64 overflow-y-auto">
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
                  rows={3}
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
                  <span className="font-medium">Created:</span> {ticket.created}
                </p>
                <p>
                  <span className="font-medium">Last Updated:</span> {ticket.updated}
                </p>
                <p>
                  <span className="font-medium">Responses:</span> {ticket.responses}
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="pt-2 space-y-2">
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
              // Resolved tickets: Can be closed or reopened
              <div className="flex gap-2">
                <Button
                  onClick={handleCloseTicket}
                  disabled={closing}
                  className="flex-1"
                  variant="default"
                >
                  {closing ? "Closing..." : "Close Ticket"}
                </Button>
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
            ) : (
              // Open/In Progress tickets: Can be resolved or closed
              <div className="flex gap-2">
                <Button
                  onClick={handleResolveTicket}
                  disabled={resolving}
                  className="flex-1"
                  variant="default"
                >
                  {resolving ? "Resolving..." : "Resolve Ticket"}
                </Button>
                <Button
                  onClick={handleCloseTicket}
                  disabled={closing}
                  className="flex-1"
                  variant="outline"
                >
                  {closing ? "Closing..." : "Close Ticket"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
