import { NextResponse } from "next/server"
import { getExpensesCollection } from "@/lib/db"

// GET /api/expenses/stats — aggregated stats (by category + by month)
export async function GET() {
  try {
    const collection = await getExpensesCollection()

    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`

    const [byCategory, byMonth, totalResult, thisMonthResult] =
      await Promise.all([
        // Aggregate by category
        collection
          .aggregate<{ _id: string; total: number; count: number }>([
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
          }>([{ $group: { _id: null, total: { $sum: "$amount" } } }])
          .toArray(),

        // This month amount
        collection
          .aggregate<{
            total: number
          }>([
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
