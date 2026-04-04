"use client"

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatCurrency } from "@/lib/constants"
import { getIconComponent } from "@/lib/category-icon-map"
import type { Expense } from "@/lib/types"

interface ExpenseItemProps {
  expense: Expense
  onEdit: (expense: Expense) => void
  onDelete: (expense: Expense) => void
  getLabel: (slug: string) => string
  getColor: (slug: string) => string
  getIcon: (slug: string) => string
}

export function ExpenseItem({
  expense,
  onEdit,
  onDelete,
  getLabel,
  getColor,
  getIcon,
}: ExpenseItemProps) {
  const catColor = getColor(expense.category)
  const catLabel = getLabel(expense.category)
  const Icon = getIconComponent(getIcon(expense.category))

  return (
    <div className="group flex items-center gap-3 rounded-2xl p-3 ring-1 ring-foreground/10 transition-colors duration-150 hover:bg-accent/50">
      <div
        className="flex size-8 shrink-0 items-center justify-center rounded-xl"
        style={{
          color: catColor,
          backgroundColor: `color-mix(in oklch, ${catColor} 12%, transparent)`,
        }}
      >
        <Icon className="size-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{expense.title}</p>
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
        <p className="truncate text-xs text-muted-foreground">
          {new Date(expense.date + "T00:00:00").toLocaleDateString("en-AU", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
          {expense.description && ` · ${expense.description}`}
        </p>
      </div>

      <p className="shrink-0 text-sm font-semibold tabular-nums">
        {formatCurrency(expense.amount)}
      </p>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="shrink-0 text-muted-foreground"
            aria-label={`Actions for ${expense.title}`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-32">
          <DropdownMenuItem onClick={() => onEdit(expense)}>
            <Pencil />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => onDelete(expense)}
          >
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
