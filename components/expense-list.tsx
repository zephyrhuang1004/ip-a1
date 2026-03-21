"use client"

import { ExpenseItem } from "@/components/expense-item"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/empty-state"
import type { Expense } from "@/lib/types"

interface ExpenseListProps {
  expenses: Expense[]
  isLoading: boolean
  onEdit: (expense: Expense) => void
  onDelete: (expense: Expense) => void
  onAdd?: () => void
}

export function ExpenseList({
  expenses,
  isLoading,
  onEdit,
  onDelete,
  onAdd,
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
