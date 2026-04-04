"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency, getCategoryLabel } from "@/lib/constants"
import type { ExpenseStats } from "@/lib/types"

interface StatsOverviewProps {
  stats: ExpenseStats
  isLoading: boolean
  error?: string | null
}

export function StatsOverview({ stats, isLoading, error }: StatsOverviewProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-[72px]" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-[52px]" />
          <Skeleton className="h-[52px]" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-3">
        <div className="px-1">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Total Spent
          </p>
          <p className="text-3xl font-bold tracking-tight tabular-nums text-muted-foreground sm:text-4xl">
            —
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Card size="sm">
            <CardContent>
              <p className="text-[11px] font-medium text-muted-foreground">This Month</p>
              <p className="text-base font-semibold text-muted-foreground">—</p>
            </CardContent>
          </Card>
          <Card size="sm">
            <CardContent>
              <p className="text-[11px] font-medium text-muted-foreground">Top Category</p>
              <p className="text-base font-semibold text-muted-foreground">—</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const topCategory = stats.byCategory[0]

  return (
    <div className="space-y-3">
      {/* Primary stat — large, not in a card */}
      <div className="px-1">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Total Spent
        </p>
        <p className="text-3xl font-bold tracking-tight tabular-nums sm:text-4xl">
          {formatCurrency(stats.totalAmount)}
        </p>
      </div>

      {/* Secondary stats — smaller, in cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card size="sm">
          <CardContent>
            <p className="text-[11px] font-medium text-muted-foreground">
              This Month
            </p>
            <p className="text-base font-semibold tabular-nums">
              {formatCurrency(stats.thisMonthAmount)}
            </p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent>
            <p className="text-[11px] font-medium text-muted-foreground">
              Top Category
            </p>
            <p className="truncate text-base font-semibold">
              {topCategory ? getCategoryLabel(topCategory.category) : "\u2014"}
            </p>
            {topCategory && (
              <p className="text-[11px] tabular-nums text-muted-foreground">
                {formatCurrency(topCategory.total)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
