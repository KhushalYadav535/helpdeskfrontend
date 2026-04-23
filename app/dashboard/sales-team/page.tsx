"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SalesTeamDashboardPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/dashboard/sales-team/leads")
  }, [router])

  return null
}
