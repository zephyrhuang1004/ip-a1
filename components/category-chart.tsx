"use client"

import { useState } from "react"
import { Bar, BarChart, Cell, Pie, PieChart, XAxis, YAxis } from "recharts"
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
import { BarChart3, PieChart as PieChartIcon } from "lucide-react"
import type { ExpenseStats } from "@/lib/types"

interface CategoryChartProps {
  stats: ExpenseStats
  isLoading: boolean
  getLabel: (slug: string) => string
  getColor: (slug: string) => string
}

export function CategoryChart({
  stats,
  isLoading,
  getLabel,
  getColor,
}: CategoryChartProps) {
  const [chartType, setChartType] = useState<"bar" | "pie">("bar")

  if (isLoading) {
    return <Skeleton className="h-[300px]" />
  }

  const data = stats.byCategory.map((item) => ({
    name: getLabel(item.category),
    value: item.total,
    fill: getColor(item.category),
  }))

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

  const chartConfig = Object.fromEntries(
    data.map((item) => [item.name, { label: item.name, color: item.fill }])
  )

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base">By Category</CardTitle>
          <CardDescription>Spending breakdown by category</CardDescription>
        </div>
        <div className="flex gap-1">
          <Button
            variant={chartType === "bar" ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => setChartType("bar")}
            aria-label="Bar chart"
          >
            <BarChart3 className="size-4" />
          </Button>
          <Button
            variant={chartType === "pie" ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => setChartType("pie")}
            aria-label="Pie chart"
          >
            <PieChartIcon className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          {chartType === "bar" ? (
            <BarChart data={data} layout="vertical">
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                tick={{ fontSize: 12 }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
