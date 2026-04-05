"use client"

import { useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  Cell,
  Label,
  LabelList,
  Pie,
  PieChart,
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
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart3, PieChart as PieChartIcon } from "lucide-react"
import { ChartToggle } from "@/components/chart-toggle"
import { formatCurrency } from "@/lib/constants"
import type { AnalyticsPeriod, ExpenseStats } from "@/lib/types"
import { PeriodSelector } from "@/components/period-selector"

interface CategoryChartProps {
  stats: ExpenseStats
  isLoading: boolean
  getLabel: (slug: string) => string
  getColor: (slug: string) => string
  period: AnalyticsPeriod
  onPeriodChange: (value: AnalyticsPeriod) => void
}

export function CategoryChart({
  stats,
  isLoading,
  getLabel,
  getColor,
  period,
  onPeriodChange,
}: CategoryChartProps) {
  const [chartType, setChartType] = useState<"bar" | "pie">("bar")

  const data = useMemo(
    () =>
      stats.byCategory.map((item) => ({
        name: getLabel(item.category),
        value: item.total,
        count: item.count,
        fill: getColor(item.category),
      })),
    [stats.byCategory, getLabel, getColor]
  )

  const chartConfig = useMemo(
    () =>
      Object.fromEntries(
        data.map((item) => [item.name, { label: item.name, color: item.fill }])
      ),
    [data]
  )

  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data])

  if (isLoading) {
    return <Skeleton className="h-[340px]" />
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">By Category</CardTitle>
          <CardDescription>No data to display</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">By Category</CardTitle>
        <CardDescription>Spending breakdown by category</CardDescription>
        <CardAction>
          <ChartToggle
            value={chartType}
            onChange={setChartType}
            options={[
              { value: "bar", icon: BarChart3, label: "Bar" },
              { value: "pie", icon: PieChartIcon, label: "Pie" },
            ]}
          />
        </CardAction>
      </CardHeader>
      <div className="px-6">
        <PeriodSelector value={period} onChange={onPeriodChange} />
      </div>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className={
            chartType === "bar" ? "h-[280px] w-full" : "h-[320px] w-full"
          }
        >
          {chartType === "bar" ? (
            <BarChart data={data} layout="vertical" margin={{ right: 60 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={80}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" radius={5}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
                <LabelList
                  dataKey="value"
                  position="right"
                  formatter={(v: number) => formatCurrency(v)}
                  className="fill-muted-foreground text-[11px]"
                />
              </Bar>
            </BarChart>
          ) : (
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={100}
                strokeWidth={5}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-2xl font-bold"
                          >
                            {formatCurrency(total)}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy ?? 0) + 24}
                            className="fill-muted-foreground"
                          >
                            Total
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </Pie>
              <ChartLegend
                content={
                  <ChartLegendContent className="flex-wrap justify-center text-xs" />
                }
              />
            </PieChart>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
