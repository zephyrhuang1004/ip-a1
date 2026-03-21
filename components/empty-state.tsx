"use client"

import { Plus, Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  onAdd?: () => void
}

export function EmptyState({ onAdd }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
        <Receipt className="size-7 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-sm font-semibold">Start tracking your spending</h3>
      <p className="mt-1 max-w-[240px] text-sm text-muted-foreground">
        Add your first expense to see insights and trends.
      </p>
      {onAdd && (
        <Button onClick={onAdd} size="sm" className="mt-4">
          <Plus className="mr-1.5 size-4" />
          Add Expense
        </Button>
      )}
    </div>
  )
}
