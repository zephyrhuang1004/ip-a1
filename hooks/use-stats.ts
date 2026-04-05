"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { ExpenseStats } from "@/lib/types"

const EMPTY_STATS: ExpenseStats = {
  byCategory: [],
  byMonth: [],
  totalAmount: 0,
  thisMonthAmount: 0,
}

interface UseStatsReturn {
  stats: ExpenseStats
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

interface UseStatsOptions {
  from?: string // "YYYY-MM"
  to?: string // "YYYY-MM"
}

export function useStats(options: UseStatsOptions = {}): UseStatsReturn {
  const [stats, setStats] = useState<ExpenseStats>(EMPTY_STATS)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { from, to } = options
  const hasFetched = useRef(false)

  const fetchStats = useCallback(async () => {
    try {
      if (!hasFetched.current) setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (from) params.set("from", from)
      if (to) params.set("to", to)

      const qs = params.toString()
      const res = await fetch(`/api/expenses/stats${qs ? `?${qs}` : ""}`)

      if (!res.ok) {
        throw new Error("Failed to fetch stats")
      }

      const data = await res.json()
      setStats(data)
      hasFetched.current = true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }, [from, to])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, isLoading, error, refetch: fetchStats }
}
