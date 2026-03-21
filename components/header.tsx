"use client"

import { Moon, Sun, Wallet } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function Header() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Wallet className="size-[18px]" />
        </div>
        <h1 className="text-lg font-bold tracking-tight">SpendWise</h1>
      </div>

      <Button
        variant="ghost"
        size="icon-sm"
        className="relative overflow-hidden"
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        aria-label="Toggle theme"
      >
        <Sun className="size-4 scale-100 rotate-0 transition-transform duration-300 dark:scale-0 dark:-rotate-90" />
        <Moon className="absolute size-4 scale-0 rotate-90 transition-transform duration-300 dark:scale-100 dark:rotate-0" />
      </Button>
    </header>
  )
}
