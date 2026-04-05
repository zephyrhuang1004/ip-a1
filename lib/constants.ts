import type { CategoryDoc } from "./types"

export const CURRENCY = {
  code: "AUD",
  symbol: "$",
  locale: "en-AU",
} as const

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(CURRENCY.locale, {
    style: "currency",
    currency: CURRENCY.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/** Seed data — only used server-side to initialize the categories collection */
export const SEED_CATEGORIES: readonly Omit<CategoryDoc, "order">[] = [
  {
    slug: "food",
    label: "Food & Dining",
    icon: "UtensilsCrossed",
    color: "oklch(0.75 0.15 65)",
    isDefault: true,
  },
  {
    slug: "transport",
    label: "Transport",
    icon: "Car",
    color: "oklch(0.65 0.16 250)",
    isDefault: true,
  },
  {
    slug: "entertainment",
    label: "Entertainment",
    icon: "Gamepad2",
    color: "oklch(0.63 0.18 295)",
    isDefault: true,
  },
  {
    slug: "shopping",
    label: "Shopping",
    icon: "ShoppingBag",
    color: "oklch(0.70 0.16 350)",
    isDefault: true,
  },
  {
    slug: "bills",
    label: "Bills & Utilities",
    icon: "Receipt",
    color: "oklch(0.58 0.04 250)",
    isDefault: true,
  },
  {
    slug: "health",
    label: "Health",
    icon: "Heart",
    color: "oklch(0.65 0.19 20)",
    isDefault: true,
  },
  {
    slug: "education",
    label: "Education",
    icon: "GraduationCap",
    color: "oklch(0.70 0.13 175)",
    isDefault: true,
  },
  {
    slug: "other",
    label: "Other",
    icon: "MoreHorizontal",
    color: "oklch(0.62 0.02 75)",
    isDefault: true,
  },
] as const

/** Color palette for auto-assigning to new custom categories */
export const COLOR_PALETTE = [
  "oklch(0.65 0.18 30)",
  "oklch(0.70 0.15 130)",
  "oklch(0.60 0.16 210)",
  "oklch(0.65 0.14 310)",
  "oklch(0.72 0.12 90)",
  "oklch(0.58 0.17 270)",
  "oklch(0.67 0.15 160)",
  "oklch(0.63 0.13 45)",
] as const

/** Icon pool for auto-assigning to new custom categories */
export const ICON_POOL = [
  "Tag",
  "Folder",
  "Star",
  "Zap",
  "Coffee",
  "Music",
  "Gift",
  "Briefcase",
  "Home",
  "Plane",
] as const

/** Color options for custom category creation UI */
export const CUSTOM_COLORS = [
  { name: "Red", value: "oklch(0.63 0.2 25)" },
  { name: "Orange", value: "oklch(0.70 0.16 55)" },
  { name: "Amber", value: "oklch(0.75 0.15 75)" },
  { name: "Yellow", value: "oklch(0.80 0.14 95)" },
  { name: "Lime", value: "oklch(0.77 0.15 130)" },
  { name: "Green", value: "oklch(0.68 0.16 155)" },
  { name: "Teal", value: "oklch(0.65 0.13 175)" },
  { name: "Cyan", value: "oklch(0.70 0.12 200)" },
  { name: "Blue", value: "oklch(0.62 0.17 250)" },
  { name: "Indigo", value: "oklch(0.55 0.18 270)" },
  { name: "Purple", value: "oklch(0.60 0.19 295)" },
  { name: "Pink", value: "oklch(0.68 0.17 350)" },
] as const
