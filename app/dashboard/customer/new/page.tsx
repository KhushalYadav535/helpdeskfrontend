"use client"

import type React from "react"

import { DashboardLayout } from "@/components/dashboard/layout"
import { Ticket, Plus, AlertCircle, Settings } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export default function NewTicketPage() {
  const sidebarItems = [
    { label: "My Tickets", href: "/dashboard/customer", icon: <Ticket className="h-5 w-5" /> },
    { label: "Submit Ticket", href: "/dashboard/customer/new", icon: <Plus className="h-5 w-5" /> },
    { label: "Knowledge Base", href: "/dashboard/customer/kb", icon: <AlertCircle className="h-5 w-5" /> },
    { label: "Settings", href: "/dashboard/customer/settings", icon: <Settings className="h-5 w-5" /> },
  ]

  const [formData, setFormData] = useState({
    subject: "",
    category: "general",
    priority: "medium",
    description: "",
    attachment: null as File | null,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Form submitted:", formData)
  }

  return (
    <DashboardLayout
      sidebarTitle="Customer Portal"
      sidebarItems={sidebarItems}
      userRole="customer"
      userName="John Doe"
      notificationCount={1}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Submit New Ticket</h1>
          <p className="text-muted-foreground mt-2">Create a new support request</p>
        </div>

        {/* Ticket Form */}
        <Card>
          <CardHeader>
            <CardTitle>Ticket Details</CardTitle>
            <CardDescription>Fill in the information about your issue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-sm font-medium">Subject *</label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Brief description of your issue"
                  className="mt-2"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="mt-2 w-full px-3 py-2 rounded-lg border border-border bg-input text-foreground"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="billing">Billing</option>
                    <option value="technical">Technical Support</option>
                    <option value="feature">Feature Request</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Priority *</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="mt-2 w-full px-3 py-2 rounded-lg border border-border bg-input text-foreground"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide detailed information about your issue"
                  rows={8}
                  className="mt-2 w-full px-3 py-2 rounded-lg border border-border bg-input text-foreground font-sans"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Attachment (Optional)</label>
                <div className="mt-2 flex items-center justify-center w-full px-6 py-4 border border-border rounded-lg border-dashed hover:bg-accent/5 transition-colors cursor-pointer">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Drag and drop files here or click to browse</p>
                    <input
                      type="file"
                      onChange={(e) => setFormData({ ...formData, attachment: e.target.files?.[0] || null })}
                      className="hidden"
                      id="file-upload"
                    />
                  </div>
                </div>
                {formData.attachment && (
                  <p className="text-sm text-muted-foreground mt-2">Selected: {formData.attachment.name}</p>
                )}
              </div>

              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => window.history.back()}>
                  Cancel
                </Button>
                <Button type="submit">Submit Ticket</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle>Before You Submit</CardTitle>
            <CardDescription>Check these common solutions first</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                question: "How do I reset my password?",
                answer: "Go to the login page and click 'Forgot Password' to reset your password.",
              },
              {
                question: "How do I update my billing information?",
                answer: "Visit the Settings page and navigate to Billing to update your payment method.",
              },
              {
                question: "What is your support response time?",
                answer: "We typically respond to tickets within 4 hours during business hours.",
              },
            ].map((faq) => (
              <div key={faq.question} className="border-b border-border pb-4 last:border-0 last:pb-0">
                <p className="font-medium text-sm mb-2">{faq.question}</p>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
