"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, Pencil, Plus, Trash2, X } from "lucide-react"
import { formatCurrency, CUSTOM_COLORS } from "@/lib/constants"
import { getIconComponent } from "@/lib/category-icon-map"
import type { CategoryWithStats } from "@/lib/types"

interface CategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onChanged: () => void
}

export function CategoryDialog({
  open,
  onOpenChange,
  onChanged,
}: CategoryDialogProps) {
  const [categories, setCategories] = useState<CategoryWithStats[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [editingSlug, setEditingSlug] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [editColor, setEditColor] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryColor, setNewCategoryColor] = useState<string>(
    CUSTOM_COLORS[0].value
  )
  const [addError, setAddError] = useState("")
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const hasFetched = useRef(false)

  const fetchCategories = useCallback(async () => {
    if (!hasFetched.current) setIsLoading(true)
    try {
      const res = await fetch("/api/expenses/categories")
      if (res.ok) {
        const data: CategoryWithStats[] = await res.json()
        setCategories(data)
      }
    } catch {
      // silently fail
    } finally {
      setIsLoading(false)
      hasFetched.current = true
    }
  }, [])

  useEffect(() => {
    if (open) {
      hasFetched.current = false
      fetchCategories()
      setEditingSlug(null)
      setIsAdding(false)
      setNewCategoryName("")
      setAddError("")
      setDeleteConfirm(null)
    }
  }, [open, fetchCategories])

  async function handleRename(slug: string) {
    const newLabel = editValue.trim()
    if (!newLabel) {
      setEditingSlug(null)
      return
    }
    // Find current — skip if nothing changed
    const current = categories.find((c) => c.slug === slug)
    if (current && current.label === newLabel && current.color === editColor) {
      setEditingSlug(null)
      return
    }
    setActionLoading(slug)
    try {
      const res = await fetch("/api/expenses/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "rename",
          slug,
          newLabel,
          newColor: editColor,
        }),
      })
      if (res.ok) {
        await fetchCategories()
        onChanged()
      }
    } catch {
      // ignore
    } finally {
      setActionLoading(null)
      setEditingSlug(null)
    }
  }

  async function handleDelete(slug: string) {
    setActionLoading(slug)
    setDeleteConfirm(null)
    try {
      const res = await fetch("/api/expenses/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", category: slug }),
      })
      if (res.ok) {
        await fetchCategories()
        onChanged()
      }
    } catch {
      // ignore
    } finally {
      setActionLoading(null)
    }
  }

  async function handleAdd() {
    const label = newCategoryName.trim()
    if (!label) return
    const slug = label.toLowerCase().replace(/\s+/g, "-")
    const exists = categories.some((c) => c.slug === slug)
    if (exists) {
      setAddError("Category already exists")
      return
    }
    setActionLoading("__add__")
    setAddError("")
    try {
      const res = await fetch("/api/expenses/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, color: newCategoryColor }),
      })
      if (!res.ok) {
        const err = await res.json()
        setAddError(err.error ?? "Failed to create")
        return
      }
      setNewCategoryName("")
      setNewCategoryColor(CUSTOM_COLORS[0].value)
      setIsAdding(false)
      await fetchCategories()
      onChanged()
    } catch {
      setAddError("Failed to create category")
    } finally {
      setActionLoading(null)
    }
  }

  const catsWithData = categories.filter((c) => c.count > 0)
  const catsEmpty = categories
    .filter((c) => c.count === 0)
    .sort((a, b) => {
      // "other" always last
      if (a.slug === "other") return 1
      if (b.slug === "other") return -1
      return 0
    })

  function renderEditRow(slug: string) {
    return (
      <div className="space-y-2 rounded-2xl bg-muted px-3 py-3">
        <div className="flex min-h-[28px] items-center gap-2">
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: editColor }}
          />
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRename(slug)
              if (e.key === "Escape") setEditingSlug(null)
            }}
            className="h-7 flex-1 text-sm font-medium"
            autoFocus
            disabled={actionLoading === slug}
          />
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => handleRename(slug)}
            disabled={actionLoading === slug}
            aria-label="Confirm rename"
          >
            <Check className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setEditingSlug(null)}
            disabled={actionLoading === slug}
            aria-label="Cancel rename"
          >
            <X className="size-3.5" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5 pl-4">
          {CUSTOM_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              title={c.name}
              onClick={() => setEditColor(c.value)}
              className="size-5 rounded-full transition-transform hover:scale-110"
              style={{
                backgroundColor: c.value,
                boxShadow:
                  editColor === c.value
                    ? `0 0 0 2px var(--background), 0 0 0 3.5px ${c.value}`
                    : undefined,
              }}
            />
          ))}
        </div>
      </div>
    )
  }

  function renderCategoryRow(cat: CategoryWithStats) {
    if (editingSlug === cat.slug) {
      return <div key={cat.slug}>{renderEditRow(cat.slug)}</div>
    }

    const canEdit = cat.slug !== "other"
    const canDelete = !cat.isDefault

    return (
      <div
        key={cat.slug}
        className="flex min-h-[44px] items-center gap-2 rounded-2xl px-3 py-2 transition-colors hover:bg-muted/50"
      >
        {(() => {
          const Icon = getIconComponent(cat.icon)
          return (
            <Icon className="size-4 shrink-0" style={{ color: cat.color }} />
          )
        })()}
        <span className="flex-1 truncate text-sm font-medium">{cat.label}</span>
        {cat.count > 0 ? (
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
            {cat.count} · {formatCurrency(cat.total)}
          </span>
        ) : (
          <span className="shrink-0 text-xs text-muted-foreground">
            No expenses
          </span>
        )}
        {canEdit && (
          <Button
            variant="ghost"
            size="icon-xs"
            className="text-muted-foreground"
            onClick={() => {
              setEditingSlug(cat.slug)
              setEditValue(cat.label)
              setEditColor(cat.color)
            }}
            disabled={actionLoading === cat.slug}
            aria-label={`Rename ${cat.label}`}
          >
            <Pencil className="size-3.5" />
          </Button>
        )}
        {canDelete && (
          <Button
            variant="ghost"
            size="icon-xs"
            className="text-destructive"
            onClick={() => setDeleteConfirm(cat.slug)}
            disabled={actionLoading === cat.slug}
            aria-label={`Delete ${cat.label}`}
          >
            <Trash2 className="size-3.5" />
          </Button>
        )}
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
          <DialogDescription>
            Rename or remove categories. Deleted categories move expenses to
            &ldquo;Other&rdquo;.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            Loading...
          </div>
        ) : (
          <div className="-mx-1 max-h-[60vh] space-y-1 overflow-y-auto px-1">
            {/* Add new category */}
            {isAdding ? (
              <div className="space-y-2 rounded-2xl bg-muted px-3 py-3">
                <div className="flex min-h-[28px] items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: newCategoryColor }}
                  />
                  <Input
                    value={newCategoryName}
                    onChange={(e) => {
                      setNewCategoryName(e.target.value)
                      setAddError("")
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAdd()
                      if (e.key === "Escape") {
                        setIsAdding(false)
                        setNewCategoryName("")
                        setAddError("")
                      }
                    }}
                    placeholder="Category name"
                    className="h-7 flex-1 text-sm font-medium"
                    autoFocus
                    disabled={actionLoading === "__add__"}
                  />
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={handleAdd}
                    disabled={actionLoading === "__add__"}
                    aria-label="Confirm add"
                  >
                    <Check className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => {
                      setIsAdding(false)
                      setNewCategoryName("")
                      setAddError("")
                    }}
                    aria-label="Cancel add"
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5 pl-4">
                  {CUSTOM_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      title={c.name}
                      onClick={() => setNewCategoryColor(c.value)}
                      className="size-5 rounded-full transition-transform hover:scale-110"
                      style={{
                        backgroundColor: c.value,
                        boxShadow:
                          newCategoryColor === c.value
                            ? `0 0 0 2px var(--background), 0 0 0 3.5px ${c.value}`
                            : undefined,
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="flex min-h-[44px] w-full items-center gap-2 rounded-2xl border border-dashed px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
              >
                <Plus className="size-4" />
                Add custom category
              </button>
            )}
            {addError && (
              <p className="px-3 text-xs text-destructive">{addError}</p>
            )}

            {catsWithData.map(renderCategoryRow)}

            {catsEmpty.length > 0 && catsWithData.length > 0 && (
              <div className="my-2 border-t" />
            )}

            {catsEmpty.map(renderCategoryRow)}

            {categories.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No categories yet. Add an expense to get started.
              </div>
            )}
          </div>
        )}

        {deleteConfirm && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-3 py-2">
            <p className="text-sm">
              Delete{" "}
              <strong>
                {categories.find((c) => c.slug === deleteConfirm)?.label ??
                  deleteConfirm}
              </strong>
              ? Its expenses will move to &ldquo;Other&rdquo;.
            </p>
            <div className="flex shrink-0 gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteConfirm(null)}
                disabled={actionLoading === deleteConfirm}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(deleteConfirm)}
                disabled={actionLoading === deleteConfirm}
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
