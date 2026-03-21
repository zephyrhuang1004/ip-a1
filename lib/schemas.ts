import { z } from "zod/v4"

export const expenseSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  category: z.string().min(1, "Category is required").max(50),
  amount: z
    .number()
    .positive("Amount must be positive")
    .max(999999.99, "Amount too large"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  description: z.string().max(500, "Description too long").default(""),
})

export type ExpenseFormData = z.infer<typeof expenseSchema>
