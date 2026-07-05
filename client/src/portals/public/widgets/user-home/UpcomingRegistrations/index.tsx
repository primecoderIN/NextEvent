import { CalendarCheck } from "lucide-react"
import { SectionHeader } from "@/portals/public/widgets/common/SectionHeader"

/**
 * Shows events the user has registered for that are upcoming.
 * Placeholder — displays a friendly empty state until the
 * registrations API endpoint is implemented.
 */
export function UpcomingRegistrations() {
  return (
    <section>
      <SectionHeader title="Your Upcoming Events" />
      <div className="flex flex-col items-center justify-center py-10 gap-3 rounded-2xl border border-dashed border-border/60 bg-muted/30">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <CalendarCheck className="h-6 w-6 text-primary" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold">No upcoming registrations</p>
          <p className="text-xs text-muted-foreground mt-1">
            Events you register for will appear here.
          </p>
        </div>
      </div>
    </section>
  )
}
