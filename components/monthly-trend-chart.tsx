"use client"

import { useState } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
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
import type { AnalyticsPeriod, ExpenseStats } from "@/lib/types"
import { PeriodSelector } from "@/components/period-selector"

interface MonthlyTrendChartProps {
  stats: ExpenseStats
  isLoading: boolean
  period: AnalyticsPeriod
  onPeriodChange: (value: AnalyticsPeriod) => void
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
  return date.toLocaleDateString("en-AU", { month: "short" })
}

export function MonthlyTrendChart({
  stats,
  isLoading,
  period,
  onPeriodChange,
}: MonthlyTrendChartProps) {
  const [chartType, setChartType] = useState<"area" | "bar">("area")
  const isDesktop = useMediaQuery("(min-width: 640px)")

  const formatLabel = (v: number) =>
    `$${v.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderLabel = (props: any) => {
    const { x, y, value, index } = props as {
      x: number
      y: number
      value: number
      index: number
    }
    const total = data.length
    const isFirst = index === 0
    const isLast = index === total - 1
    return (
      <text
        x={isFirst ? x + 14 : isLast ? x - 14 : x}
        y={isFirst ? y : isLast ? y : (y as number) - 10}
        textAnchor={isFirst ? "start" : isLast ? "end" : "middle"}
        dominantBaseline={isFirst || isLast ? "middle" : "auto"}
        className="fill-foreground text-xs"
      >
        {formatLabel(value)}
      </text>
    )
  }

  const data = [...stats.byMonth]
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((item) => ({
      month: formatMonthLabel(item.month),
      total: item.total,
    }))

  const maxTotal = data.reduce((max, d) => Math.max(max, d.total), 0)
  const yAxisWidth = Math.ceil(maxTotal).toString().length * 9 + 6

  const average =
    data.length > 0
      ? data.reduce((sum, d) => sum + d.total, 0) / data.length
      : 0

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
      <div className="px-6">
        <PeriodSelector value={period} onChange={onPeriodChange} />
      </div>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          {chartType === "area" ? (
            <AreaChart data={data} margin={{ top: 20, right: 15 }}>
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
              <XAxis
                dataKey="month"
                tickLine={false}
                tick={{ fontSize: 12 }}
                interval={data.length > 6 ? "equidistantPreserveStart" : 0}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
                width={yAxisWidth}
              />
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
              >
                {isDesktop && (
                  <LabelList dataKey="total" content={renderLabel} />
                )}
              </Area>
            </AreaChart>
          ) : (
            <BarChart data={data} margin={{ top: 20, right: 15 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tick={{ fontSize: 12 }}
                interval={data.length > 6 ? "equidistantPreserveStart" : 0}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
                width={yAxisWidth}
              />
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
              <Bar dataKey="total" fill="var(--primary)" radius={5}>
                {isDesktop && (
                  <LabelList
                    dataKey="total"
                    position="top"
                    formatter={formatLabel}
                    className="fill-foreground text-xs"
                    offset={8}
                  />
                )}
              </Bar>
            </BarChart>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
