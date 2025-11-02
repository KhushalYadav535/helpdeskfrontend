"use client"

import { useState, useEffect, useCallback } from "react"

interface UseAPIOptions {
  immediate?: boolean
}

export function useAPI<T>(
  fetcher: () => Promise<{ success: boolean; data?: T; error?: string }>,
  options: UseAPIOptions = { immediate: true },
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetcher()
      if (response.success && response.data) {
        setData(response.data)
      } else {
        setError(response.error || "Unknown error")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [fetcher])

  useEffect(() => {
    if (options.immediate) {
      fetch()
    }
  }, [fetch, options.immediate])

  return { data, loading, error, refetch: fetch }
}
