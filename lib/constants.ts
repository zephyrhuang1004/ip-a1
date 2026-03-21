import type { CategoryOption } from "./types"

export const DEFAULT_CATEGORIES: readonly CategoryOption[] = [
  { slug: "food", label: "Food & Dining", icon: "UtensilsCrossed" },
  { slug: "transport", label: "Transport", icon: "Car" },
  { slug: "entertainment", label: "Entertainment", icon: "Gamepad2" },
  { slug: "shopping", label: "Shopping", icon: "ShoppingBag" },
  { slug: "bills", label: "Bills & Utilities", icon: "Receipt" },
  { slug: "health", label: "Health", icon: "Heart" },
  { slug: "education", label: "Education", icon: "GraduationCap" },
  { slug: "other", label: "Other", icon: "MoreHorizontal" },
] as const

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

export function getCategoryLabel(slug: string): string {
  const found = DEFAULT_CATEGORIES.find((c) => c.slug === slug)
  return found ? found.label : slug
}

export function getCategoryIcon(slug: string): string {
  const found = DEFAULT_CATEGORIES.find((c) => c.slug === slug)
  return found ? found.icon : "Tag"
}

/** Maps category slug to its CSS variable name for color */
export function getCategoryColor(slug: string): string {
  const known = new Set([
    "food",
    "transport",
    "entertainment",
    "shopping",
    "bills",
    "health",
    "education",
    "other",
  ])
  return known.has(slug) ? `var(--cat-${slug})` : "var(--cat-other)"
}
