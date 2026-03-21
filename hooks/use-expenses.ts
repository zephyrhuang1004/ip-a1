"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { Expense } from "@/lib/types"
import type { ExpenseFormData } from "@/lib/schemas"

interface UseExpensesOptions {
  category?: string
  month?: string
}

interface UseExpensesReturn {
  expenses: Expense[]
  isLoading: boolean
  error: string | null
  create: (data: ExpenseFormData) => Promise<void>
  update: (id: string, data: ExpenseFormData) => Promise<void>
  remove: (id: string) => Promise<void>
  refetch: () => Promise<void>
}

export function useExpenses(
  options: UseExpensesOptions = {}
): UseExpensesReturn {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasFetched = useRef(false)

  const fetchExpenses = useCallback(async () => {
    try {
      // Only show skeleton on initial load, not on filter changes / refetch
      if (!hasFetched.current) {
        setIsLoading(true)
      }
      setError(null)

      const params = new URLSearchParams()
      if (options.category) params.set("category", options.category)
      if (options.month) params.set("month", options.month)

      const query = params.toString()
      const url = `/api/expenses${query ? `?${query}` : ""}`
      const res = await fetch(url)

      if (!res.ok) {
        throw new Error("Failed to fetch expenses")
      }

      const data = await res.json()
      setExpenses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsLoading(false)
      hasFetched.current = true
    }
  }, [options.category, options.month])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  const create = useCallback(
    async (data: ExpenseFormData) => {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed to create expense")
      }

      await fetchExpenses()
    },
    [fetchExpenses]
  )

  const update = useCallback(
    async (id: string, data: ExpenseFormData) => {
      const res = await fetch(`/api/expenses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed to update expense")
      }

      await fetchExpenses()
    },
    [fetchExpenses]
  )

  const remove = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed to delete expense")
      }

      await fetchExpenses()
    },
    [fetchExpenses]
  )

  return {
    expenses,
    isLoading,
    error,
    create,
    update,
    remove,
    refetch: fetchExpenses,
  }
}
