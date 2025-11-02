"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useParams } from "next/navigation"
import { useState } from "react"
import { Send, Paperclip } from "lucide-react"
import { FileUpload } from "@/components/upload/file-upload"

interface Message {
  id: string
  author: string
  role: string
  text: string
  timestamp: Date
  avatar: string
  attachments?: Array<{ name: string; size: number }>
}

export default function TicketChatPage() {
  const params = useParams()
  const ticketId = params.id

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      author: "John Doe",
      role: "Customer",
      text: "I'm unable to reset my password. I've tried multiple times but keep getting an error.",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      avatar: "JD",
    },
    {
      id: "2",
      author: "Alice Johnson",
      role: "Agent",
      text: "Thank you for contacting us. I'm looking into this issue. Can you provide the exact error message you're seeing?",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      avatar: "AJ",
    },
    {
      id: "3",
      author: "John Doe",
      role: "Customer",
      text: "The error says: 'Invalid session token'. It happens on both the website and mobile app.",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      avatar: "JD",
      attachments: [{ name: "error-screenshot.png", size: 245000 }],
    },
    {
      id: "4",
      author: "Alice Johnson",
      role: "Agent",
      text: "I've identified the issue. Your session cache needs to be cleared. I'm escalating this to our technical team for a fix. In the meantime, try clearing your browser cache.",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      avatar: "AJ",
    },
  ])

  const [newMessage, setNewMessage] = useState("")
  const [showUpload, setShowUpload] = useState(false)

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        author: "You",
        role: "Agent",
        text: newMessage,
        timestamp: new Date(),
        avatar: "YO",
      }
      setMessages([...messages, message])
      setNewMessage("")
    }
  }

  const sidebarItems = [{ label: "Chat", href: `/dashboard/tickets/${ticketId}/chat` }]

  return (
    <DashboardLayout
      sidebarTitle="Ticket Discussion"
      sidebarItems={sidebarItems}
      userRole="agent"
      userName="Alice Johnson"
      notificationCount={0}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ticket {ticketId}</h1>
          <p className="text-muted-foreground mt-2">Conversation Thread</p>
        </div>

        <Card className="h-96 flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Messages</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-4 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "Agent" ? "justify-end" : "justify-start"}`}
              >
                {message.role !== "Agent" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                    {message.avatar}
                  </div>
                )}

                <div
                  className={`max-w-xs p-3 rounded-lg ${
                    message.role === "Agent" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  <p className="text-xs font-medium mb-1">
                    {message.author} • {message.role}
                  </p>
                  <p className="text-sm">{message.text}</p>
                  {message.attachments && (
                    <div className="mt-2 space-y-1">
                      {message.attachments.map((file, idx) => (
                        <p key={idx} className="text-xs opacity-70">
                          📎 {file.name} ({(file.size / 1024).toFixed(0)}KB)
                        </p>
                      ))}
                    </div>
                  )}
                  <p className="text-xs opacity-70 mt-2">{message.timestamp.toLocaleTimeString()}</p>
                </div>

                {message.role === "Agent" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                    {message.avatar}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {showUpload && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Attach Files</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload maxFiles={3} maxSize={5 * 1024 * 1024} />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => setShowUpload(!showUpload)}>
                <Paperclip className="h-4 w-4" />
              </Button>
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button onClick={handleSendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
