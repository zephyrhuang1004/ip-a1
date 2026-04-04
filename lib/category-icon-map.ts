import {
  Briefcase,
  Car,
  Coffee,
  Folder,
  Gamepad2,
  Gift,
  GraduationCap,
  Heart,
  Home,
  MoreHorizontal,
  Music,
  Plane,
  Receipt,
  ShoppingBag,
  Star,
  Tag,
  UtensilsCrossed,
  Zap,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

const ICON_MAP: Record<string, LucideIcon> = {
  Briefcase,
  Car,
  Coffee,
  Folder,
  Gamepad2,
  Gift,
  GraduationCap,
  Heart,
  Home,
  MoreHorizontal,
  Music,
  Plane,
  Receipt,
  ShoppingBag,
  Star,
  Tag,
  UtensilsCrossed,
  Zap,
}

export function getIconComponent(name: string): LucideIcon {
  return ICON_MAP[name] ?? Tag
}
