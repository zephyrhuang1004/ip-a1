import { NextRequest, NextResponse } from "next/server"
import { getExpensesCollection, getCategoriesCollection } from "@/lib/db"
import { SEED_CATEGORIES, COLOR_PALETTE, ICON_POOL } from "@/lib/constants"

/** Seed default categories if the collection is empty */
async function ensureSeeded(
  col: Awaited<ReturnType<typeof getCategoriesCollection>>
) {
  const count = await col.countDocuments()
  if (count > 0) return

  const now = new Date().toISOString()
  const docs = SEED_CATEGORIES.map((c, i) => ({
    ...c,
    order: i,
    createdAt: now,
  }))

  try {
    await col.insertMany(docs)
    await col.createIndex({ slug: 1 }, { unique: true })
  } catch {
    // Another request may have seeded concurrently — safe to ignore
  }
}

// GET /api/expenses/categories — list all categories with expense stats
export async function GET() {
  try {
    const [expensesCol, categoriesCol] = await Promise.all([
      getExpensesCollection(),
      getCategoriesCollection(),
    ])

    await ensureSeeded(categoriesCol)

    const [allCategories, expenseStats] = await Promise.all([
      categoriesCol.find().sort({ order: 1 }).toArray(),
      expensesCol
        .aggregate([
          {
            $group: {
              _id: "$category",
              count: { $sum: 1 },
              total: { $sum: "$amount" },
            },
          },
        ])
        .toArray(),
    ])

    const statsMap = new Map<string, { count: number; total: number }>()
    for (const r of expenseStats) {
      statsMap.set(r._id as string, {
        count: r.count as number,
        total: r.total as number,
      })
    }

    const result = allCategories.map((cat) => {
      const stats = statsMap.get(cat.slug as string) ?? { count: 0, total: 0 }
      return {
        slug: cat.slug,
        label: cat.label,
        icon: cat.icon,
        color: cat.color,
        isDefault: cat.isDefault ?? false,
        order: cat.order ?? 0,
        count: stats.count,
        total: stats.total,
      }
    })

    // Sort: "other" always last, rest by order
    result.sort((a, b) => {
      if (a.slug === "other") return 1
      if (b.slug === "other") return -1
      return a.order - b.order
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("GET /api/expenses/categories error:", error)
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    )
  }
}

// POST /api/expenses/categories — create a new custom category
// Body: { label: string }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const label = typeof body.label === "string" ? body.label.trim() : ""

    if (!label) {
      return NextResponse.json(
        { error: "Category label is required" },
        { status: 400 }
      )
    }

    const slug = label.toLowerCase().replace(/\s+/g, "-")
    const categoriesCol = await getCategoriesCollection()

    // Check for duplicate slug
    const existing = await categoriesCol.findOne({ slug })
    if (existing) {
      return NextResponse.json(
        { error: "Category already exists" },
        { status: 409 }
      )
    }

    // Use provided color or auto-assign from palette
    const totalCount = await categoriesCol.countDocuments()
    const icon = "Tag"
    const color =
      typeof body.color === "string" && body.color
        ? body.color
        : COLOR_PALETTE[totalCount % COLOR_PALETTE.length]

    const doc = {
      slug,
      label,
      icon,
      color,
      isDefault: false,
      order: totalCount,
      createdAt: new Date().toISOString(),
    }

    await categoriesCol.insertOne(doc)

    return NextResponse.json(doc, { status: 201 })
  } catch (error) {
    console.error("POST /api/expenses/categories error:", error)
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    )
  }
}

// PATCH /api/expenses/categories — rename or delete a category
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const [expensesCol, categoriesCol] = await Promise.all([
      getExpensesCollection(),
      getCategoriesCollection(),
    ])

    if (body.action === "rename") {
      const { slug, newLabel } = body
      if (
        !slug ||
        !newLabel ||
        typeof slug !== "string" ||
        typeof newLabel !== "string"
      ) {
        return NextResponse.json(
          { error: "'slug' and 'newLabel' are required strings" },
          { status: 400 }
        )
      }

      const trimmed = newLabel.trim()
      if (!trimmed) {
        return NextResponse.json(
          { error: "New label cannot be empty" },
          { status: 400 }
        )
      }

      // Update label and optionally color — slug stays stable
      const update: Record<string, string> = { label: trimmed }
      if (typeof body.newColor === "string" && body.newColor) {
        update.color = body.newColor
      }
      const result = await categoriesCol.updateOne({ slug }, { $set: update })

      if (result.matchedCount === 0) {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 404 }
        )
      }

      return NextResponse.json({ modified: result.modifiedCount })
    }

    if (body.action === "delete") {
      const { category } = body
      if (!category || typeof category !== "string") {
        return NextResponse.json(
          { error: "'category' is required" },
          { status: 400 }
        )
      }

      if (category === "other") {
        return NextResponse.json(
          { error: "Cannot delete the 'Other' category" },
          { status: 400 }
        )
      }

      // Move all expenses in this category to "other"
      const result = await expensesCol.updateMany(
        { category },
        {
          $set: {
            category: "other",
            updatedAt: new Date().toISOString(),
          },
        }
      )

      // Remove category doc
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
