"use client"

import { Plus, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DEFAULT_CATEGORIES } from "@/lib/constants"

interface ExpenseToolbarProps {
  categoryFilter: string
  monthFilter: string
  onCategoryChange: (value: string) => void
  onMonthChange: (value: string) => void
  onAdd: () => void
  onManageCategories: () => void
  availableMonths: string[]
  customCategories: string[]
}

export function ExpenseToolbar({
  categoryFilter,
  monthFilter,
  onCategoryChange,
  onMonthChange,
  onAdd,
  onManageCategories,
  availableMonths,
  customCategories,
}: ExpenseToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={categoryFilter} onValueChange={onCategoryChange}>
        <SelectTrigger
          className="w-full sm:w-[160px]"
          aria-label="Filter by category"
        >
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {DEFAULT_CATEGORIES.map((cat) => (
            <SelectItem key={cat.slug} value={cat.slug}>
              {cat.label}
            </SelectItem>
          ))}
          {customCategories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={monthFilter} onValueChange={onMonthChange}>
        <SelectTrigger
          className="w-full sm:w-[140px]"
          aria-label="Filter by month"
        >
          <SelectValue placeholder="All months" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All months</SelectItem>
          {availableMonths.map((month) => (
            <SelectItem key={month} value={month}>
              {formatMonth(month)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="icon"
        onClick={onManageCategories}
        aria-label="Manage categories"
      >
        <Settings2 className="size-4" />
      </Button>

      <div className="hidden flex-1 sm:block" />

      <Button onClick={onAdd} className="w-full sm:w-auto">
        <Plus className="mr-1.5 size-4" />
        Add Expense
      </Button>
    </div>
  )
}

function formatMonth(month: string): string {
  const [year, m] = month.split("-")
  const date = new Date(parseInt(year), parseInt(m) - 1)
  return date.toLocaleDateString("en-AU", { month: "short", year: "numeric" })
}
