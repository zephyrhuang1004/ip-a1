"use client"

import { useMemo } from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/constants"
import type { Expense, CategoryWithStats } from "@/lib/types"

interface DailyChartProps {
  expenses: Expense[]
  isLoading: boolean
  categories: CategoryWithStats[]
  getLabel: (slug: string) => string
  getColor: (slug: string) => string
}

export function DailyChart({
  expenses,
  isLoading,
  categories,
  getLabel,
  getColor,
}: DailyChartProps) {
  const { data, activeSlugs } = useMemo(() => {
    const days = 30
    const now = new Date()
    const map = new Map<string, Record<string, number>>()

    // Initialize last N days
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split("T")[0]
      map.set(key, {})
    }

    // Aggregate expenses by date + category
    const slugsUsed = new Set<string>()
    for (const exp of expenses) {
      const day = map.get(exp.date)
      if (day) {
        day[exp.category] = (day[exp.category] ?? 0) + exp.amount
        slugsUsed.add(exp.category)
      }
    }

    // Ensure every day has all categories (0 for missing)
    const allSlugs = [...slugsUsed]
    const rows = [...map.entries()].map(([date, cats]) => {
      const d = new Date(date + "T00:00:00")
      const row: Record<string, string | number> = {
        date: d.toLocaleDateString("en-AU", {
          day: "numeric",
          month: "short",
        }),
      }
      for (const slug of allSlugs) {
        row[slug] = cats[slug] ?? 0
      }
      return row
    })

    return { data: rows, activeSlugs: allSlugs }
  }, [expenses])

  const chartConfig = useMemo(
    () =>
      Object.fromEntries(
        activeSlugs.map((slug) => [
          slug,
          { label: getLabel(slug), color: getColor(slug) },
        ])
      ),
    [activeSlugs, getLabel, getColor]
  )

  if (isLoading) {
    return <Skeleton className="h-[240px]" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Daily Spending</CardTitle>
        <CardDescription>Last 30 days by category</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[260px] w-full">
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={8}
              axisLine={false}
              tick={{ fontSize: 9 }}
              interval="equidistantPreserveStart"
              angle={-45}
              textAnchor="end"
              height={40}
            />
            <ChartTooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const filtered = payload.filter((p: any) => p.value > 0)
                if (filtered.length === 0) return null
                return (
                  <ChartTooltipContent
                    active={active}
                    payload={filtered}
                    label={label}
                  />
                )
              }}
            />
            <ChartLegend
              content={
                <ChartLegendContent className="flex-wrap justify-center text-xs" />
              }
            />
            {activeSlugs.map((slug) => (
              <Bar
                key={slug}
                dataKey={slug}
                stackId="a"
                fill={getColor(slug)}
                shape={(props: unknown) => {
                  const {
                    x,
                    y,
                    width,
                    height,
                    fill: f,
                    payload,
                  } = props as {
                    x: number
                    y: number
                    width: number
                    height: number
                    fill: string
                    payload: Record<string, number>
                  }
                  if (!height) return <rect />
                  const nonZero = activeSlugs.filter(
                    (s) => (payload[s] ?? 0) > 0
                  )
                  const isFirst = nonZero[0] === slug
                  const isLast = nonZero[nonZero.length - 1] === slug
                  const R = 4
                  const tl = isLast ? R : 0
                  const tr = isLast ? R : 0
                  const br = isFirst ? R : 0
                  const bl = isFirst ? R : 0
                  const d = `
                    M${x + tl},${y}
                    h${width - tl - tr}
                    ${tr ? `a${tr},${tr} 0 0 1 ${tr},${tr}` : `h0 v${tr}`}
                    v${height - tr - br}
                    ${br ? `a${br},${br} 0 0 1 -${br},${br}` : `v0 h0`}
                    h-${width - bl - br}
                    ${bl ? `a${bl},${bl} 0 0 1 -${bl},-${bl}` : `h0 v0`}
                    v-${height - tl - bl}
                    ${tl ? `a${tl},${tl} 0 0 1 ${tl},-${tl}` : `v0 h0`}
                    Z
                  `
                  return <path d={d} fill={f} />
                }}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
