import { NextRequest, NextResponse } from "next/server"
import { getExpensesCollection, getCategoriesCollection } from "@/lib/db"

// GET /api/expenses/categories — list all categories with expense counts
// Merges: expense aggregation + custom categories collection
export async function GET() {
  try {
    const [expensesCol, categoriesCol] = await Promise.all([
      getExpensesCollection(),
      getCategoriesCollection(),
    ])

    const [expenseStats, customCats] = await Promise.all([
      expensesCol
        .aggregate([
          { $group: { _id: "$category", count: { $sum: 1 }, total: { $sum: "$amount" } } },
          { $sort: { total: -1 as const } },
        ])
        .toArray(),
      categoriesCol.find().toArray(),
    ])

    // Build a map: slug -> { count, total }
    const statsMap = new Map<string, { count: number; total: number }>()
    for (const r of expenseStats) {
      statsMap.set(r._id as string, { count: r.count as number, total: r.total as number })
    }

    // Add custom categories that have no expenses yet
    for (const cat of customCats) {
      const slug = cat.slug as string
      if (!statsMap.has(slug)) {
        statsMap.set(slug, { count: 0, total: 0 })
      }
    }

    const categories = [...statsMap.entries()]
      .map(([slug, data]) => ({ slug, count: data.count, total: data.total }))
      .sort((a, b) => b.total - a.total)

    return NextResponse.json(categories)
  } catch (error) {
    console.error("GET /api/expenses/categories error:", error)
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    )
  }
}

// POST /api/expenses/categories — create a new custom category
// Body: { name: string }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const name = typeof body.name === "string" ? body.name.trim().toLowerCase() : ""

    if (!name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      )
    }

    const categoriesCol = await getCategoriesCollection()

    // Check for duplicate
    const existing = await categoriesCol.findOne({ slug: name })
    if (existing) {
      return NextResponse.json(
        { error: "Category already exists" },
        { status: 409 }
      )
    }

    await categoriesCol.insertOne({
      slug: name,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({ slug: name }, { status: 201 })
  } catch (error) {
    console.error("POST /api/expenses/categories error:", error)
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    )
  }
}

// PATCH /api/expenses/categories — rename or delete a category
// Body: { action: "rename", from: string, to: string }
//    or { action: "delete", category: string }
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const [expensesCol, categoriesCol] = await Promise.all([
      getExpensesCollection(),
      getCategoriesCollection(),
    ])

    if (body.action === "rename") {
      const { from, to } = body
      if (!from || !to || typeof from !== "string" || typeof to !== "string") {
        return NextResponse.json(
          { error: "Both 'from' and 'to' are required strings" },
          { status: 400 }
        )
      }
      const slug = to.trim().toLowerCase()
      if (!slug) {
        return NextResponse.json(
          { error: "New category name cannot be empty" },
          { status: 400 }
        )
      }
      // Rename in expenses
      const result = await expensesCol.updateMany(
        { category: from },
        { $set: { category: slug, updatedAt: new Date().toISOString() } }
      )
      // Rename in categories collection (if it exists there)
      await categoriesCol.updateOne(
        { slug: from },
        { $set: { slug } }
      )
      return NextResponse.json({
        matched: result.matchedCount,
        modified: result.modifiedCount,
      })
    }

    if (body.action === "delete") {
      const { category } = body
      if (!category || typeof category !== "string") {
        return NextResponse.json(
          { error: "'category' is required" },
          { status: 400 }
        )
      }
      // Move all expenses in this category to "other"
      const result = await expensesCol.updateMany(
        { category },
        { $set: { category: "other", updatedAt: new Date().toISOString() } }
      )
      // Remove from categories collection
      await categoriesCol.deleteOne({ slug: category })
      return NextResponse.json({
        matched: result.matchedCount,
        modified: result.modifiedCount,
      })
    }

    return NextResponse.json(
      { error: "Invalid action. Use 'rename' or 'delete'." },
      { status: 400 }
    )
  } catch (error) {
    console.error("PATCH /api/expenses/categories error:", error)
    return NextResponse.json(
      { error: "Failed to update categories" },
      { status: 500 }
    )
  }
}
