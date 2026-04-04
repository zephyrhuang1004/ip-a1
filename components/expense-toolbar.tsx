"use client"

import { Plus, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { CategoryWithStats } from "@/lib/types"

interface ExpenseToolbarProps {
  categoryFilter: string
  monthFilter: string
  onCategoryChange: (value: string) => void
  onMonthChange: (value: string) => void
  onAdd: () => void
  onManageCategories: () => void
  availableMonths: string[]
  categories: CategoryWithStats[]
}

export function ExpenseToolbar({
  categoryFilter,
  monthFilter,
  onCategoryChange,
  onMonthChange,
  onAdd,
  onManageCategories,
  availableMonths,
  categories,
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
          {categories.map((cat) => (
            <SelectItem key={cat.slug} value={cat.slug}>
              {cat.label}
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

      <Button variant="outline" onClick={onManageCategories}>
        <Tag className="size-4" />
        <span className="hidden sm:inline">Categories</span>
      </Button>

      <div className="hidden flex-1 sm:block" />

      <Button onClick={onAdd} className="w-full sm:w-auto">
        <Plus />
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
