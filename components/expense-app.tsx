"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { Header } from "@/components/header"
import { StatsOverview } from "@/components/stats-overview"
import { ExpenseToolbar } from "@/components/expense-toolbar"
import { ExpenseList } from "@/components/expense-list"
import { ExpenseDialog } from "@/components/expense-dialog"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { CategoryDialog } from "@/components/category-dialog"
import { ExpenseDetailDialog } from "@/components/expense-detail-dialog"
import { CategoryChart } from "@/components/category-chart"
import { MonthlyTrendChart } from "@/components/monthly-trend-chart"
import { DailyChart } from "@/components/daily-chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useExpenses } from "@/hooks/use-expenses"
import { useStats } from "@/hooks/use-stats"
import { useCategories } from "@/hooks/use-categories"
import type { Expense } from "@/lib/types"
import type { ExpenseFormData } from "@/lib/schemas"

export function ExpenseApp() {
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [monthFilter, setMonthFilter] = useState("all")

  const {
    expenses,
    isLoading,
    error: expensesError,
    create,
    update,
    remove,
    refetch: refetchExpenses,
  } = useExpenses({
    category: categoryFilter === "all" ? undefined : categoryFilter,
    month: monthFilter === "all" ? undefined : monthFilter,
  })

  const {
    stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useStats()

  const {
    categories,
    refetch: refetchCategories,
    getLabel,
    getColor,
    getIcon,
  } = useCategories()

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  // Detail view state
  const [viewingExpense, setViewingExpense] = useState<Expense | null>(null)

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
    await Promise.all([refetchStats(), refetchCategories()])
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await remove(String(deleteTarget._id))
      toast.success("Expense deleted")
      setDeleteTarget(null)
      await Promise.all([refetchStats(), refetchCategories()])
    } catch {
      toast.error("Failed to delete expense")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-svh max-w-4xl flex-col p-4 sm:p-6">
      <Header />

      <section className="mt-6">
        <StatsOverview
          stats={stats}
          isLoading={statsLoading}
          error={statsError}
          getLabel={getLabel}
        />
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
            categories={categories}
          />
          <ExpenseList
            expenses={expenses}
            isLoading={isLoading}
            error={expensesError}
            onView={setViewingExpense}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
            onAdd={handleAdd}
            onRetry={refetchExpenses}
            getLabel={getLabel}
            getColor={getColor}
            getIcon={getIcon}
          />
        </TabsContent>

        <TabsContent value="analytics" className="mt-4 space-y-4">
          <DailyChart
            expenses={expenses}
            isLoading={isLoading}
            categories={categories}
            getLabel={getLabel}
            getColor={getColor}
          />
          <CategoryChart
            stats={stats}
            isLoading={statsLoading}
            getLabel={getLabel}
            getColor={getColor}
          />
          <MonthlyTrendChart stats={stats} isLoading={statsLoading} />
        </TabsContent>
      </Tabs>

      <ExpenseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        expense={editingExpense}
        categories={categories}
      />

      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        onChanged={async () => {
          setCategoryFilter("all")
          await Promise.all([
            refetchStats(),
            refetchExpenses(),
            refetchCategories(),
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

      <ExpenseDetailDialog
        open={!!viewingExpense}
        onOpenChange={(open) => {
          if (!open) setViewingExpense(null)
        }}
        expense={viewingExpense}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
        getLabel={getLabel}
        getColor={getColor}
        getIcon={getIcon}
      />

      <footer className="mt-auto pt-8 pb-2 text-center text-[11px] text-muted-foreground">
        SpendWise &mdash; UTS 32516 Internet Programming &middot; Assignment 1
      </footer>

      <Toaster richColors position="bottom-center" />
    </main>
  )
}
