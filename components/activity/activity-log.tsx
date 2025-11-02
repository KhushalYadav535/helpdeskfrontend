"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

interface Activity {
  id: string
  action: string
  description: string
  user: string
  timestamp: Date
  type: "create" | "update" | "delete" | "comment" | "assignment"
}

interface ActivityLogProps {
  activities: Activity[]
  limit?: number
}

export function ActivityLog({ activities, limit = 10 }: ActivityLogProps) {
  const displayActivities = activities.slice(0, limit)

  const typeColor = {
    create: "bg-green-100 text-green-800",
    update: "bg-blue-100 text-blue-800",
    delete: "bg-red-100 text-red-800",
    comment: "bg-purple-100 text-purple-800",
    assignment: "bg-orange-100 text-orange-800",
  }

  const typeIcon = {
    create: "✓",
    update: "↻",
    delete: "✕",
    comment: "💬",
    assignment: "👤",
  }

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">Activity Log</h3>
      <div className="space-y-3">
        {displayActivities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activities yet</p>
        ) : (
          displayActivities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-b-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  typeColor[activity.type]
                }`}
              >
                {typeIcon[activity.type]}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <Badge variant="outline" className="text-xs">
                    {activity.type}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{activity.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  by {activity.user} • {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
