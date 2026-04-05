"use client"

import { Pencil, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/constants"
import { getIconComponent } from "@/lib/category-icon-map"
import type { Expense } from "@/lib/types"

interface ExpenseDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense: Expense | null
  onEdit: (expense: Expense) => void
  onDelete: (expense: Expense) => void
  getLabel: (slug: string) => string
  getColor: (slug: string) => string
  getIcon: (slug: string) => string
}

export function ExpenseDetailDialog({
  open,
  onOpenChange,
  expense,
  onEdit,
  onDelete,
  getLabel,
  getColor,
  getIcon,
}: ExpenseDetailDialogProps) {
  if (!expense) return null

  const catColor = getColor(expense.category)
  const catLabel = getLabel(expense.category)
  const Icon = getIconComponent(getIcon(expense.category))

  const dateStr = new Date(expense.date + "T00:00:00").toLocaleDateString(
    "en-AU",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" }
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-left">{expense.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="flex size-8 items-center justify-center rounded-xl"
                style={{
                  color: catColor,
                  backgroundColor: `color-mix(in oklch, ${catColor} 12%, transparent)`,
                }}
              >
                <Icon className="size-4" />
              </div>
              <Badge
                variant="secondary"
                style={{
                  color: catColor,
                  backgroundColor: `color-mix(in oklch, ${catColor} 10%, transparent)`,
                }}
              >
                {catLabel}
              </Badge>
            </div>
            <p className="text-2xl font-bold tabular-nums">
              {formatCurrency(expense.amount)}
            </p>
          </div>

          <Separator />

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span>{dateStr}</span>
            </div>
            {expense.description && (
              <div className="flex justify-between gap-4">
                <span className="shrink-0 text-muted-foreground">Note</span>
                <span className="text-right">{expense.description}</span>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                onOpenChange(false)
                onEdit(expense)
              }}
            >
              <Pencil />
              Edit
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => {
                onOpenChange(false)
                onDelete(expense)
              }}
            >
              <Trash2 />
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
