import { NextRequest, NextResponse } from "next/server"
import { getExpensesCollection } from "@/lib/db"

// GET /api/expenses/stats — aggregated stats (by category + by month)
// Optional query params: ?from=YYYY-MM&to=YYYY-MM
export async function GET(request: NextRequest) {
  try {
    const collection = await getExpensesCollection()

    const { searchParams } = request.nextUrl
    const from = searchParams.get("from")
    const to = searchParams.get("to")

    // Build date range filter using lexicographic string comparison
    const dateFilter: Record<string, Record<string, string>> = {}
    if (from && /^\d{4}-\d{2}$/.test(from)) {
      dateFilter.date = { ...dateFilter.date, $gte: `${from}-01` }
    }
    if (to && /^\d{4}-\d{2}$/.test(to)) {
      const [toY, toM] = to.split("-").map(Number)
      const nextMonth =
        toM === 12
          ? `${toY + 1}-01`
          : `${toY}-${String(toM + 1).padStart(2, "0")}`
      dateFilter.date = { ...dateFilter.date, $lt: `${nextMonth}-01` }
    }

    const matchStage =
      Object.keys(dateFilter).length > 0 ? [{ $match: dateFilter }] : []

    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`

    const [byCategory, byMonth, totalResult, thisMonthResult] =
      await Promise.all([
        // Aggregate by category
        collection
          .aggregate<{ _id: string; total: number; count: number }>([
            ...matchStage,
            {
              $group: {
                _id: "$category",
                total: { $sum: "$amount" },
                count: { $sum: 1 },
              },
            },
            { $sort: { total: -1 } },
          ])
          .toArray(),

        // Aggregate by month
        collection
          .aggregate<{ _id: string; total: number }>([
            ...matchStage,
            {
              $group: {
                _id: { $substr: ["$date", 0, 7] },
                total: { $sum: "$amount" },
              },
            },
            { $sort: { _id: -1 } },
          ])
          .toArray(),

        // Total amount
        collection
          .aggregate<{
            total: number
          }>([
            ...matchStage,
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ])
          .toArray(),

        // This month amount
        collection
          .aggregate<{
            total: number
          }>([
            ...matchStage,
            { $match: { date: { $regex: `^${currentMonth}` } } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ])
          .toArray(),
      ])

    return NextResponse.json({
      byCategory: byCategory.map((item) => ({
        category: item._id,
        total: item.total,
        count: item.count,
      })),
      byMonth: byMonth.map((item) => ({
        month: item._id,
        total: item.total,
      })),
      totalAmount: totalResult[0]?.total ?? 0,
      thisMonthAmount: thisMonthResult[0]?.total ?? 0,
    })
  } catch (error) {
    console.error("GET /api/expenses/stats error:", error)
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    )
  }
}
