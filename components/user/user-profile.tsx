"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function UserProfile() {
  const { user } = useAuth()
  const [editOpen, setEditOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: "Support specialist passionate about helping customers",
  })

  const handleSave = () => {
    setEditOpen(false)
  }

  if (!user) return null

  return (
    <>
      <Card className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary">
            {user.avatar || user.name.substring(0, 2).toUpperCase()}
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
            <p className="text-sm text-muted-foreground mb-2">{user.email}</p>
            <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
              {user.role.replace("-", " ")}
            </div>
          </div>

          <Button onClick={() => setEditOpen(true)}>Edit Profile</Button>
        </div>

        <div className="mt-6 pt-6 border-t">
          <p className="text-sm text-muted-foreground italic">Support specialist passionate about helping customers</p>
        </div>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Full Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full p-2 border rounded-md text-sm mt-1"
                rows={3}
              />
            </div>

            <Button onClick={handleSave} className="w-full">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
