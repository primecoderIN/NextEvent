import { format, parseISO, getHours } from "date-fns"

// ─── Date formatting ───────────────────────────────────
// Formats a UTC ISO-8601 string (with Z suffix) as a human-readable date.
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
    card:   "400/280",
    thumb:  "120/120",
  }
  return `https://picsum.photos/seed/${category}-${seed}/${dims[variant]}`
}

// ─── Category badge colour ─────────────────────────────
export function getCategoryBadgeClass(category: string): string {
  const map: Record<string, string> = {
    music:     "bg-blue-600",
    nightlife: "bg-violet-600",
    workshop:  "bg-amber-500",
    workshops: "bg-amber-500",
    sports:    "bg-green-600",
    business:  "bg-slate-700",
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

// Categories are now fetched from the API and mapped in the UI components directly.
