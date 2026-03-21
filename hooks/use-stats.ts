"use client"

import { useCallback, useEffect, useState } from "react"
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

export function useStats(): UseStatsReturn {
  const [stats, setStats] = useState<ExpenseStats>(EMPTY_STATS)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const res = await fetch("/api/expenses/stats")

      if (!res.ok) {
        throw new Error("Failed to fetch stats")
      }

      const data = await res.json()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, isLoading, error, refetch: fetchStats }
}
