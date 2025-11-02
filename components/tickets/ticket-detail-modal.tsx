"use client"

import { useState } from "react"
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
}

interface TicketDetailModalProps {
  ticket: Ticket | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TicketDetailModal({ ticket, open, onOpenChange }: TicketDetailModalProps) {
  const [newComment, setNewComment] = useState("")
  const [comments, setComments] = useState([
    {
      id: 1,
      author: "Alice Johnson",
      role: "Agent",
      text: "I'm looking into this issue now.",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      avatar: "AJ",
    },
  ])

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
  }

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([
        ...comments,
        {
          id: comments.length + 1,
          author: "You",
          role: "Agent",
          text: newComment,
          timestamp: new Date(),
          avatar: "YO",
        },
      ])
      setNewComment("")
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
                {comments.map((comment) => (
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
                ))}
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
