import { NextRequest, NextResponse } from "next/server"
import { getExpensesCollection } from "@/lib/db"
import { expenseSchema } from "@/lib/schemas"

// GET /api/expenses — list all (with optional ?category=&month= filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const category = searchParams.get("category")
    const month = searchParams.get("month") // "YYYY-MM"

    const filter: Record<string, unknown> = {}
    if (category) {
      filter.category = category
    }
    if (month) {
      filter.date = { $regex: `^${month}` }
    }

    const collection = await getExpensesCollection()
    const expenses = await collection
      .find(filter)
      .sort({ date: -1, createdAt: -1, _id: -1 })
      .toArray()

    return NextResponse.json(expenses)
  } catch (error) {
    console.error("GET /api/expenses error:", error)
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    )
  }
}

// POST /api/expenses — create a new expense
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = expenseSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.issues },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()
    const expense = {
      ...result.data,
      createdAt: now,
      updatedAt: now,
    }

    const collection = await getExpensesCollection()
    const inserted = await collection.insertOne(expense)

    return NextResponse.json(
      { _id: inserted.insertedId, ...expense },
      { status: 201 }
    )
  } catch (error) {
    console.error("POST /api/expenses error:", error)
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 }
    )
  }
}
