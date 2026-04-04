"use client"

import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ExpenseItem } from "@/components/expense-item"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/empty-state"
import type { Expense } from "@/lib/types"

interface ExpenseListProps {
  expenses: Expense[]
  isLoading: boolean
  error?: string | null
  onEdit: (expense: Expense) => void
  onDelete: (expense: Expense) => void
  onAdd?: () => void
  onRetry?: () => void
}

export function ExpenseList({
  expenses,
  isLoading,
  error,
  onEdit,
  onDelete,
  onAdd,
  onRetry,
}: ExpenseListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[62px]" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10">
          <AlertCircle className="size-7 text-destructive" />
        </div>
        <h3 className="mt-4 text-sm font-semibold">
          Something went wrong
        </h3>
        <p className="mt-1 max-w-[260px] text-sm text-muted-foreground">
          Could not load your expenses. Please check your connection and try
          again.
        </p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm" className="mt-4">
            <RefreshCw className="mr-1.5 size-4" />
            Retry
          </Button>
        )}
      </div>
    )
  }

  if (expenses.length === 0) {
    return <EmptyState onAdd={onAdd} />
  }

  return (
    <div className="stagger-children space-y-2">
      {expenses.map((expense) => (
        <ExpenseItem
          key={String(expense._id)}
          expense={expense}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
