"use client"

import { useEffect, useState } from "react"
import { CalendarIcon } from "lucide-react"
import { format, parse } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useMediaQuery } from "@/hooks/use-media-query"
import type { CategoryWithStats, Expense } from "@/lib/types"
import type { ExpenseFormData } from "@/lib/schemas"

interface ExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: ExpenseFormData) => Promise<void>
  expense?: Expense | null
  categories: CategoryWithStats[]
}

const INITIAL_FORM: ExpenseFormData = {
  title: "",
  category: "",
  amount: 0,
  date: new Date().toISOString().split("T")[0],
  description: "",
}

export function ExpenseDialog({
  open,
  onOpenChange,
  onSubmit,
  expense,
  categories,
}: ExpenseDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 640px)")
  const [form, setForm] = useState<ExpenseFormData>(INITIAL_FORM)
  const [isCustomCategory, setIsCustomCategory] = useState(false)
  const [customCategoryInput, setCustomCategoryInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEditing = !!expense

  useEffect(() => {
    if (open) {
      if (expense) {
        const isKnown = categories.some((c) => c.slug === expense.category)
        setForm({
          title: expense.title,
          category: expense.category,
          amount: expense.amount,
          date: expense.date,
          description: expense.description,
        })
        setIsCustomCategory(!isKnown)
        setCustomCategoryInput(!isKnown ? expense.category : "")
      } else {
        setForm(INITIAL_FORM)
        setIsCustomCategory(false)
        setCustomCategoryInput("")
      }
      setErrors({})
    }
  }, [open, expense, categories])

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    if (!form.title.trim()) newErrors.title = "Title is required"
    const category = isCustomCategory
      ? customCategoryInput.trim()
      : form.category
    if (!category) newErrors.category = "Category is required"
    if (!form.amount || form.amount <= 0)
      newErrors.amount = "Amount must be positive"
    if (!form.date) newErrors.date = "Date is required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const category = isCustomCategory
        ? customCategoryInput.trim().toLowerCase()
        : form.category
      await onSubmit({ ...form, category })
      onOpenChange(false)
    } catch {
      setErrors({ submit: "Something went wrong. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Expense" : "Add Expense"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details of this expense."
              : "Add a new expense to your tracker."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g. Lunch at cafe"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              aria-invalid={!!errors.title}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={isCustomCategory ? "__custom__" : form.category}
              onValueChange={(value) => {
                if (value === "__custom__") {
                  setIsCustomCategory(true)
                  setForm({ ...form, category: "" })
                } else {
                  setIsCustomCategory(false)
                  setCustomCategoryInput("")
                  setForm({ ...form, category: value })
                }
              }}
            >
              <SelectTrigger id="category" aria-invalid={!!errors.category}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.slug} value={cat.slug}>
                    {cat.label}
                  </SelectItem>
                ))}
                <SelectItem value="__custom__">+ Add custom...</SelectItem>
              </SelectContent>
            </Select>
            {isCustomCategory && (
              <Input
                placeholder="Enter custom category"
                value={customCategoryInput}
                onChange={(e) => setCustomCategoryInput(e.target.value)}
                autoFocus
              />
            )}
            {errors.category && (
              <p className="text-xs text-destructive">{errors.category}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (AUD)</Label>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
                  $
                </span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={form.amount || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      amount: parseFloat(e.target.value) || 0,
                    })
                  }
                  aria-invalid={!!errors.amount}
                  className="pl-7"
                />
              </div>
              {errors.amount && (
                <p className="text-xs text-destructive">{errors.amount}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              {isDesktop ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      aria-invalid={!!errors.date}
                    >
                      <CalendarIcon className="size-4 text-muted-foreground" />
                      {form.date
                        ? format(
                            parse(form.date, "yyyy-MM-dd", new Date()),
                            "d MMM yyyy"
                          )
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        form.date
                          ? parse(form.date, "yyyy-MM-dd", new Date())
                          : undefined
                      }
                      onSelect={(date) => {
                        if (date) {
                          setForm({
                            ...form,
                            date: format(date, "yyyy-MM-dd"),
                          })
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>
              ) : (
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  aria-invalid={!!errors.date}
                />
              )}
              {errors.date && (
                <p className="text-xs text-destructive">{errors.date}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Add a note..."
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={2}
            />
          </div>

          {errors.submit && (
            <p className="text-sm text-destructive">{errors.submit}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : isEditing
                  ? "Update"
                  : "Add Expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
