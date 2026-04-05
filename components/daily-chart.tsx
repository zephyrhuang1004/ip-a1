"use client"

import { useMemo } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
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
  const { data, activeSlugs, maxTotal } = useMemo(() => {
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

    // Compute max daily total for Y-axis width
    const maxTotal = rows.reduce((max, row) => {
      const sum = allSlugs.reduce(
        (s, slug) => s + ((row[slug] as number) ?? 0),
        0
      )
      return Math.max(max, sum)
    }, 0)

    return { data: rows, activeSlugs: allSlugs, maxTotal }
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
          <BarChart accessibilityLayer data={data} margin={{ top: 8 }}>
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
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10 }}
              width={Math.ceil(maxTotal).toString().length * 7 + 6}
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
                  if (!height || height < 0.5) return <rect />
                  const nonZero = activeSlugs.filter(
                    (s) => (payload[s] ?? 0) > 0
                  )
                  const isFirst = nonZero[0] === slug
                  const isLast = nonZero[nonZero.length - 1] === slug
                  const R = Math.min(
                    4,
                    Math.floor(height / 2),
                    Math.floor(width / 2)
                  )
                  if (R <= 0 || width < 4) {
                    return (
                      <rect
                        x={x}
                        y={y}
                        width={width}
                        height={height}
                        fill={f}
                      />
                    )
                  }
                  const tl = isLast ? R : 0
                  const tr = isLast ? R : 0
                  const br = isFirst ? R : 0
                  const bl = isFirst ? R : 0
                  const vTop = Math.max(0, height - tr - br)
                  const vBot = Math.max(0, height - tl - bl)
                  const hTop = Math.max(0, width - tl - tr)
                  const hBot = Math.max(0, width - bl - br)
                  const d = [
                    `M${x + tl},${y}`,
                    `h${hTop}`,
                    tr ? `a${tr},${tr} 0 0 1 ${tr},${tr}` : "",
                    `v${vTop}`,
                    br ? `a${br},${br} 0 0 1 ${-br},${br}` : "",
                    `h${-hBot}`,
                    bl ? `a${bl},${bl} 0 0 1 ${-bl},${-bl}` : "",
                    `v${-vBot}`,
                    tl ? `a${tl},${tl} 0 0 1 ${tl},${-tl}` : "",
                    "Z",
                  ]
                    .filter(Boolean)
                    .join(" ")
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
