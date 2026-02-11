"use client"

import { useState, useEffect, Suspense } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { API_URL, getHeaders } from "@/lib/api-helpers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ThumbsUp, ThumbsDown, MessageCircleOff, CheckCircle2, AlertCircle } from "lucide-react"

function FeedbackFormContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const ticketId = params?.ticketId as string
  const token = searchParams?.get("token")
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState<"satisfied" | "dissatisfied" | "no_response" | "">("")
  const [note, setNote] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!ticketId || !token) {
      setLoading(false)
      setError("Invalid feedback link. Please use the link from your resolution email.")
      return
    }
    setError("")
    setLoading(false)
  }, [ticketId, token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!feedback || !ticketId || !token) return
    setSubmitting(true)
    setError("")
    try {
      const res = await fetch(`${API_URL}/tickets/${ticketId}/client-feedback`, {
        method: "POST",
        headers: getHeaders(false),
        body: JSON.stringify({
          feedbackToken: token,
          feedback,
          note: note.trim() || undefined,
        }),
      })
      const result = await res.json()
      if (!result.success) {
        throw new Error(result.error || "Failed to submit feedback")
      }
      setSubmitted(true)
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    )
  }

  if (!token || !ticketId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Invalid Link
            </CardTitle>
            <CardDescription>{error || "This feedback link is invalid or expired."}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              Thank You!
            </CardTitle>
            <CardDescription>Your feedback has been submitted successfully. We appreciate your response.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">This ticket can now be closed by our support team.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Ticket Feedback</CardTitle>
          <CardDescription>
            Your support ticket has been resolved. How would you rate your experience?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="text-sm font-medium mb-2 block">Your feedback</label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={feedback === "satisfied" ? "default" : "outline"}
                  className="flex flex-col h-auto py-4 gap-1"
                  onClick={() => setFeedback("satisfied")}
                >
                  <ThumbsUp className="h-5 w-5" />
                  <span className="text-xs">Satisfied</span>
                </Button>
                <Button
                  type="button"
                  variant={feedback === "dissatisfied" ? "default" : "outline"}
                  className="flex flex-col h-auto py-4 gap-1"
                  onClick={() => setFeedback("dissatisfied")}
                >
                  <ThumbsDown className="h-5 w-5" />
                  <span className="text-xs">Dissatisfied</span>
                </Button>
                <Button
                  type="button"
                  variant={feedback === "no_response" ? "default" : "outline"}
                  className="flex flex-col h-auto py-4 gap-1"
                  onClick={() => setFeedback("no_response")}
                >
                  <MessageCircleOff className="h-5 w-5" />
                  <span className="text-xs">No Response</span>
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Additional comments (optional)</label>
              <Textarea
                placeholder="Share any additional feedback..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
            <Button type="submit" disabled={!feedback || submitting} className="w-full">
              {submitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function FeedbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    }>
      <FeedbackFormContent />
    </Suspense>
  )
}
