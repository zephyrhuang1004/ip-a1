"use client"

import {
  Car,
  Gamepad2,
  GraduationCap,
  Heart,
  MoreHorizontal,
  Pencil,
  Receipt,
  ShoppingBag,
  Tag,
  Trash2,
  UtensilsCrossed,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatCurrency, getCategoryLabel, getCategoryColor } from "@/lib/constants"
import type { Expense } from "@/lib/types"

interface ExpenseItemProps {
  expense: Expense
  onEdit: (expense: Expense) => void
  onDelete: (expense: Expense) => void
}

function CategoryIcon({ category }: { category: string }) {
  const iconClass = "size-4"
  switch (category) {
    case "food":
      return <UtensilsCrossed className={iconClass} />
    case "transport":
      return <Car className={iconClass} />
    case "entertainment":
      return <Gamepad2 className={iconClass} />
    case "shopping":
      return <ShoppingBag className={iconClass} />
    case "bills":
      return <Receipt className={iconClass} />
    case "health":
      return <Heart className={iconClass} />
    case "education":
      return <GraduationCap className={iconClass} />
    default:
      return <Tag className={iconClass} />
  }
}

export function ExpenseItem({ expense, onEdit, onDelete }: ExpenseItemProps) {
  const catColor = getCategoryColor(expense.category)

  return (
    <div
      className="group flex items-center gap-3 rounded-2xl border-l-[3px] border-transparent p-3 ring-1 ring-foreground/10 transition-colors duration-150 hover:bg-accent/50"
      style={{ borderLeftColor: catColor }}
    >
      <div
        className="flex size-8 shrink-0 items-center justify-center rounded-xl"
        style={{ color: catColor, backgroundColor: `color-mix(in oklch, ${catColor} 12%, transparent)` }}
      >
        <CategoryIcon category={expense.category} />
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
            {getCategoryLabel(expense.category)}
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
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(expense)}>
            <Pencil className="mr-2 size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => onDelete(expense)}
          >
            <Trash2 className="mr-2 size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
