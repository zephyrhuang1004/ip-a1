"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { Header } from "@/components/header"
import { StatsOverview } from "@/components/stats-overview"
import { ExpenseToolbar } from "@/components/expense-toolbar"
import { ExpenseList } from "@/components/expense-list"
import { ExpenseDialog } from "@/components/expense-dialog"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { CategoryDialog } from "@/components/category-dialog"
import { CategoryChart } from "@/components/category-chart"
import { MonthlyTrendChart } from "@/components/monthly-trend-chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useExpenses } from "@/hooks/use-expenses"
import { useStats } from "@/hooks/use-stats"
import { DEFAULT_CATEGORIES } from "@/lib/constants"
import type { Expense } from "@/lib/types"
import type { ExpenseFormData } from "@/lib/schemas"

export function ExpenseApp() {
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [monthFilter, setMonthFilter] = useState("all")

  const {
    expenses,
    isLoading,
    create,
    update,
    remove,
    refetch: refetchExpenses,
  } = useExpenses({
    category: categoryFilter === "all" ? undefined : categoryFilter,
    month: monthFilter === "all" ? undefined : monthFilter,
  })
  const { stats, isLoading: statsLoading, refetch: refetchStats } = useStats()

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Category dialog state
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)

  // Derive available months from stats
  const availableMonths = useMemo(
    () => stats.byMonth.map((m) => m.month),
    [stats.byMonth]
  )

  // Fetch all custom categories (from expenses + categories collection)
  const [customCategories, setCustomCategories] = useState<string[]>([])
  const fetchCustomCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/expenses/categories")
      if (!res.ok) return
      const data: { slug: string }[] = await res.json()
      const defaultSlugs = new Set(DEFAULT_CATEGORIES.map((c) => c.slug))
      setCustomCategories(
        data.filter((c) => !defaultSlugs.has(c.slug)).map((c) => c.slug)
      )
    } catch {
      // fall back to deriving from expenses
      const defaultSlugs = new Set(DEFAULT_CATEGORIES.map((c) => c.slug))
      const custom = new Set<string>()
      for (const exp of expenses) {
        if (!defaultSlugs.has(exp.category)) custom.add(exp.category)
      }
      setCustomCategories([...custom])
    }
  }, [expenses])

  useEffect(() => {
    fetchCustomCategories()
  }, [fetchCustomCategories])

  function handleAdd() {
    setEditingExpense(null)
    setDialogOpen(true)
  }

  function handleEdit(expense: Expense) {
    setEditingExpense(expense)
    setDialogOpen(true)
  }

  function handleDeleteRequest(expense: Expense) {
    setDeleteTarget(expense)
  }

  async function handleSubmit(data: ExpenseFormData) {
    if (editingExpense) {
      await update(String(editingExpense._id), data)
      toast.success("Expense updated")
    } else {
      await create(data)
      toast.success("Expense added")
    }
    await refetchStats()
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await remove(String(deleteTarget._id))
      toast.success("Expense deleted")
      setDeleteTarget(null)
      await refetchStats()
    } catch {
      toast.error("Failed to delete expense")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-2xl flex-col p-4 sm:p-6">
      <Header />

      <section className="mt-6">
        <StatsOverview stats={stats} isLoading={statsLoading} />
      </section>

      <Tabs defaultValue="expenses" className="mt-8 flex-1">
        <TabsList className="w-full">
          <TabsTrigger value="expenses" className="flex-1">
            Expenses
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex-1">
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="mt-4 space-y-3">
          <ExpenseToolbar
            categoryFilter={categoryFilter}
            monthFilter={monthFilter}
            onCategoryChange={setCategoryFilter}
            onMonthChange={setMonthFilter}
            onAdd={handleAdd}
            onManageCategories={() => setCategoryDialogOpen(true)}
            availableMonths={availableMonths}
            customCategories={customCategories}
          />
          <ExpenseList
            expenses={expenses}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
            onAdd={handleAdd}
          />
        </TabsContent>

        <TabsContent value="analytics" className="mt-4 space-y-6">
          <CategoryChart stats={stats} isLoading={statsLoading} />
          <MonthlyTrendChart stats={stats} isLoading={statsLoading} />
        </TabsContent>
      </Tabs>

      <ExpenseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        expense={editingExpense}
        customCategories={customCategories}
      />

      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        onChanged={async () => {
          await Promise.all([
            refetchStats(),
            refetchExpenses(),
            fetchCustomCategories(),
          ])
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete expense?"
        description={`"${deleteTarget?.title}" will be permanently deleted.`}
        isLoading={isDeleting}
      />

      <footer className="mt-auto border-t pt-4 pb-2 text-center text-[11px] text-muted-foreground">
        SpendWise &mdash; UTS 32516 Internet Programming &middot; Assignment 1
      </footer>

      <Toaster richColors position="bottom-center" />
    </div>
  )
}
