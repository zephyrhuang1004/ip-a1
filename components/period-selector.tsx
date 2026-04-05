"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { AnalyticsPeriod } from "@/lib/types"

const PERIOD_OPTIONS: readonly { value: AnalyticsPeriod; label: string }[] = [
  { value: "1m", label: "This Month" },
  { value: "3m", label: "Last 3 Months" },
  { value: "6m", label: "Last 6 Months" },
  { value: "1y", label: "Last 12 Months" },
  { value: "all", label: "All Time" },
]

interface PeriodSelectorProps {
  value: AnalyticsPeriod
  onChange: (value: AnalyticsPeriod) => void
}

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="!h-7 rounded-full border-0 bg-muted px-3 text-xs font-medium shadow-none focus-visible:ring-0">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="min-w-0">
        {PERIOD_OPTIONS.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="text-xs font-medium"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
