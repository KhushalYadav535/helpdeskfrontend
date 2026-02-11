"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { API_URL, getHeaders } from "@/lib/api-helpers"

const MANAGEMENT_RESTRICTED_PATHS = ["/dashboard/agent/tickets", "/dashboard/agent/new", "/dashboard/agent/performance", "/dashboard/agent/team"]

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, token } = useAuth()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkManagementRedirect = async () => {
      if (!user || user.role !== "agent" || !pathname?.startsWith("/dashboard/agent")) {
        setChecking(false)
        return
      }

      const isRestricted = MANAGEMENT_RESTRICTED_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))
      if (!isRestricted) {
        setChecking(false)
        return
      }

      try {
        const res = await fetch(`${API_URL}/agents?tenantId=${user.tenantId}`, {
          headers: getHeaders(true),
        })
        const result = await res.json()
        if (result.success && result.data) {
          const agent = result.data.find((a: any) => a.email === user.email)
          if (agent?.agentLevel === "management") {
            router.replace("/dashboard/agent")
            return
          }
        }
      } catch (e) {
        // Allow on error
      }
      setChecking(false)
    }

    checkManagementRedirect()
  }, [user, pathname, token, router])

  if (checking && MANAGEMENT_RESTRICTED_PATHS.some((p) => pathname === p || pathname?.startsWith(p + "/"))) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return <>{children}</>
}
