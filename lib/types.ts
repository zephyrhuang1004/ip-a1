import type { ObjectId } from "mongodb"

export interface Expense {
  _id: ObjectId
  title: string
  category: string
  amount: number
  date: string // "YYYY-MM-DD"
  description: string
  createdAt: string // ISO 8601
  updatedAt: string // ISO 8601
}

export type ExpenseInput = Omit<Expense, "_id" | "createdAt" | "updatedAt">

export interface CategoryStat {
  category: string
  total: number
  count: number
}

export interface MonthlyTrend {
  month: string // "YYYY-MM"
  total: number
}

export interface ExpenseStats {
  byCategory: CategoryStat[]
  byMonth: MonthlyTrend[]
  totalAmount: number
  thisMonthAmount: number
}

export interface CategoryOption {
  readonly slug: string
  readonly label: string
  readonly icon: string
}

export type AnalyticsPeriod = "1m" | "3m" | "6m" | "1y" | "all"

export interface CategoryDoc {
  slug: string
  label: string
  icon: string
  color: string
  isDefault: boolean
  order: number
}

export interface CategoryWithStats extends CategoryDoc {
  count: number
  total: number
}
