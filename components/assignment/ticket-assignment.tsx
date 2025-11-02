"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface Agent {
  id: number
  name: string
  status: string
}

interface TicketAssignmentProps {
  ticketId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  agents: Agent[]
  onAssign: (agentId: number, note: string) => void
}

export function TicketAssignment({ ticketId, open, onOpenChange, agents, onAssign }: TicketAssignmentProps) {
  const [selectedAgent, setSelectedAgent] = useState<string>("")
  const [note, setNote] = useState("")

  const handleAssign = () => {
    if (selectedAgent) {
      onAssign(Number.parseInt(selectedAgent), note)
      setSelectedAgent("")
      setNote("")
      onOpenChange(false)
    }
  }

  const availableAgents = agents.filter((a) => a.status !== "offline")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Ticket {ticketId}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Agent</label>
            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an agent..." />
              </SelectTrigger>
              <SelectContent>
                {availableAgents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id.toString()}>
                    {agent.name} ({agent.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Assignment Note (optional)</label>
            <Textarea
              placeholder="Add any notes for the assigned agent..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <Button onClick={handleAssign} disabled={!selectedAgent} className="w-full">
            Assign Ticket
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
