"use client"

import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChartToggleOption<T extends string> {
  value: T
  icon: LucideIcon
  label: string
}

interface ChartToggleProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: ChartToggleOption<T>[]
}

export function ChartToggle<T extends string>({
  value,
  onChange,
  options,
}: ChartToggleProps<T>) {
  return (
    <div className="flex rounded-full bg-muted p-0.5">
      {options.map((opt) => {
        const Icon = opt.icon
        const isActive = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-3.5" />
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
