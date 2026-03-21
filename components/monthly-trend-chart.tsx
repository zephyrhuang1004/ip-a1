"use client"

import { useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts"
import {
  Card,
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
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart3, TrendingUp } from "lucide-react"
import type { ExpenseStats } from "@/lib/types"

interface MonthlyTrendChartProps {
  stats: ExpenseStats
  isLoading: boolean
}

const chartConfig = {
  total: {
    label: "Spending",
    color: "var(--cat-food)",
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
  const [chartType, setChartType] = useState<"line" | "bar">("line")

  if (isLoading) {
    return <Skeleton className="h-[300px]" />
  }

  const data = stats.byMonth.map((item) => ({
    month: formatMonthLabel(item.month),
    total: item.total,
  }))

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
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base">Monthly Trend</CardTitle>
          <CardDescription>Spending over time</CardDescription>
        </div>
        <div className="flex gap-1">
          <Button
            variant={chartType === "line" ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => setChartType("line")}
            aria-label="Line chart"
          >
            <TrendingUp className="size-4" />
          </Button>
          <Button
            variant={chartType === "bar" ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => setChartType("bar")}
            aria-label="Bar chart"
          >
            <BarChart3 className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          {chartType === "line" ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="total"
                stroke="var(--cat-food)"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="total"
                fill="var(--cat-food)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
