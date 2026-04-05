"use client"

import { useMemo, useState } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart3, TrendingUp } from "lucide-react"
import { ChartToggle } from "@/components/chart-toggle"
import { formatCurrency } from "@/lib/constants"
import type { ExpenseStats } from "@/lib/types"

interface MonthlyTrendChartProps {
  stats: ExpenseStats
  isLoading: boolean
}

const chartConfig = {
  total: {
    label: "Spending",
    color: "var(--primary)",
  },
}

function formatMonthLabel(month: string): string {
  const [year, m] = month.split("-")
  const date = new Date(parseInt(year), parseInt(m) - 1)
  return date.toLocaleDateString("en-AU", { month: "short", year: "2-digit" })
}

export function MonthlyTrendChart({
  stats,
  isLoading,
}: MonthlyTrendChartProps) {
  const [chartType, setChartType] = useState<"area" | "bar">("area")

  const data = useMemo(
    () =>
      [...stats.byMonth]
        .sort((a, b) => a.month.localeCompare(b.month))
        .map((item) => ({
          month: formatMonthLabel(item.month),
          total: item.total,
        })),
    [stats.byMonth]
  )

  const average = useMemo(() => {
    if (data.length === 0) return 0
    return data.reduce((sum, d) => sum + d.total, 0) / data.length
  }, [data])

  if (isLoading) {
    return <Skeleton className="h-[340px]" />
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Trend</CardTitle>
          <CardDescription>No data to display</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Monthly Trend</CardTitle>
        <CardDescription>Spending over time</CardDescription>
        <CardAction>
          <ChartToggle
            value={chartType}
            onChange={setChartType}
            options={[
              { value: "area", icon: TrendingUp, label: "Area" },
              { value: "bar", icon: BarChart3, label: "Bar" },
            ]}
          />
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          {chartType === "area" ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--primary)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--primary)"
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ReferenceLine
                y={average}
                stroke="var(--muted-foreground)"
                strokeDasharray="4 4"
                strokeOpacity={0.5}
                label={{
                  value: `Avg ${formatCurrency(average)}`,
                  position: "insideTopRight",
                  className: "fill-muted-foreground text-xs",
                }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="var(--primary)"
                strokeWidth={2}
                fill="url(#trendGradient)"
                dot={{
                  fill: "var(--primary)",
                  stroke: "var(--primary)",
                  fillOpacity: 1,
                }}
                activeDot={{
                  r: 6,
                }}
              />
            </AreaChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ReferenceLine
                y={average}
                stroke="var(--muted-foreground)"
                strokeDasharray="4 4"
                strokeOpacity={0.5}
              />
              <Bar dataKey="total" fill="var(--primary)" radius={5} />
            </BarChart>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
