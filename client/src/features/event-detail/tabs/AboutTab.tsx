import type { Event } from "@/Types/Event"
import { Music2, Settings2, UtensilsCrossed, ShieldCheck } from "lucide-react"

interface AboutTabProps {
  event: Event
}

const highlights = [
  { icon: Music2, label: "Live Performances" },
  { icon: Settings2, label: "World Class Production" },
  { icon: UtensilsCrossed, label: "Food & Beverages" },
  { icon: ShieldCheck, label: "Secure Entry" },
]

export function AboutTab({ event }: AboutTabProps) {
  return (
    <div className="space-y-6">
      {/* Description */}
      <div>
        <h2 className="text-base font-bold mb-3">About This Event</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {event.description}
        </p>
        {event.isCancelled && (
          <div className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">
              ⚠️ This event has been cancelled. Please contact the organizer for
              refund information.
            </p>
          </div>
        )}
      </div>

      {/* Highlights grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {highlights.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-border/50 bg-card hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 cursor-default"
          >
            <span className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Icon className="h-5 w-5 text-primary" />
            </span>
            <p className="text-xs font-semibold text-center leading-tight">{label}</p>
          </div>
        ))}
      </div>

      {/* Event meta chips */}
      <div className="flex flex-wrap gap-2">
        <span className="px-3 py-1.5 rounded-full bg-muted text-xs font-medium text-muted-foreground">
          📍 {event.city}
        </span>
        <span className="px-3 py-1.5 rounded-full bg-muted text-xs font-medium text-muted-foreground">
          🏟️ {event.venue}
        </span>
        <span className="px-3 py-1.5 rounded-full bg-muted text-xs font-medium text-muted-foreground capitalize">
          🎭 {event.category}
        </span>
      </div>
    </div>
  )
}
