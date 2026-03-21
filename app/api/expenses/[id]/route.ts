import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getExpensesCollection } from "@/lib/db"
import { expenseSchema } from "@/lib/schemas"

// PUT /api/expenses/[id] — update an expense
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    const body = await request.json()
    const result = expenseSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.issues },
        { status: 400 }
      )
    }

    const collection = await getExpensesCollection()
    const updated = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...result.data,
          updatedAt: new Date().toISOString(),
        },
      },
      { returnDocument: "after" }
    )

    if (!updated) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error("PUT /api/expenses/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to update expense" },
      { status: 500 }
    )
  }
}

// DELETE /api/expenses/[id] — delete an expense
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    const collection = await getExpensesCollection()
    const deleted = await collection.deleteOne({ _id: new ObjectId(id) })

    if (deleted.deletedCount === 0) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/expenses/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to delete expense" },
      { status: 500 }
    )
  }
}
