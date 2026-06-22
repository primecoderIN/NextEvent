import {
  LayoutGrid,
  Music,
  Wine,
  GraduationCap,
  Dumbbell,
  Briefcase,
  MoreHorizontal,
} from "lucide-react"
import { format, parseISO, getHours } from "date-fns"

// ─── Date formatting ───────────────────────────────────
// Formats a UTC ISO-8601 string (with Z suffix) as a human-readable date.
// Uses date-fns format() with parseISO() for safe, consistent parsing.
export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "d MMM yyyy")
  } catch {
    return dateStr
  }
}

// ─── Picsum image helper ───────────────────────────────
export function getEventImage(
  category: string,
  seed: string,
  variant: "banner" | "card" | "thumb" = "card"
): string {
  const dims: Record<string, string> = {
    banner: "800/480",
    card: "400/280",
    thumb: "120/120",
  }
  return `https://picsum.photos/seed/${category}-${seed}/${dims[variant]}`
}

// ─── Category badge colour ─────────────────────────────
export function getCategoryBadgeClass(category: string): string {
  const map: Record<string, string> = {
    music: "bg-blue-600",
    nightlife: "bg-violet-600",
    workshop: "bg-amber-500",
    workshops: "bg-amber-500",
    sports: "bg-green-600",
    business: "bg-slate-700",
  }
  return map[category.toLowerCase()] ?? "bg-primary"
}

// ─── Time-based greeting ───────────────────────────────
export function getGreeting(): string {
  const h = getHours(new Date())
  if (h < 12) return "greeting.morning"
  if (h < 17) return "greeting.afternoon"
  return "greeting.evening"
}

// ─── Category list ─────────────────────────────────────
export const CATEGORIES = [
  { id: "all", label: "All Events", icon: LayoutGrid },
  { id: "music", label: "Music", icon: Music },
  { id: "nightlife", label: "Nightlife", icon: Wine },
  { id: "workshop", label: "Workshops", icon: GraduationCap },
  { id: "sports", label: "Sports", icon: Dumbbell },
  { id: "business", label: "Business", icon: Briefcase },
  { id: "more", label: "More", icon: MoreHorizontal },
]
