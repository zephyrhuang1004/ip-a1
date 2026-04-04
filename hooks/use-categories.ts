"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { CategoryWithStats } from "@/lib/types"

interface UseCategoriesReturn {
  categories: CategoryWithStats[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  getLabel: (slug: string) => string
  getColor: (slug: string) => string
  getIcon: (slug: string) => string
}

const FALLBACK_COLOR = "oklch(0.62 0.02 75)"

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<CategoryWithStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mapRef = useRef(new Map<string, CategoryWithStats>())

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const res = await fetch("/api/expenses/categories")
      if (!res.ok) throw new Error("Failed to fetch categories")

      const data: CategoryWithStats[] = await res.json()
      setCategories(data)

      const map = new Map<string, CategoryWithStats>()
      for (const cat of data) {
        map.set(cat.slug, cat)
      }
      mapRef.current = map
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const getLabel = useCallback(
    (slug: string) => mapRef.current.get(slug)?.label ?? slug,
    []
  )

  const getColor = useCallback(
    (slug: string) => mapRef.current.get(slug)?.color ?? FALLBACK_COLOR,
    []
  )

  const getIcon = useCallback(
    (slug: string) => mapRef.current.get(slug)?.icon ?? "Tag",
    []
  )

  return {
    categories,
    isLoading,
    error,
    refetch: fetchCategories,
    getLabel,
    getColor,
    getIcon,
  }
}
