import { MapPin } from "lucide-react"
import { SectionHeader } from "@/portals/public/widgets/common/SectionHeader"

/**
 * Shows events near the user's location.
 * Placeholder — empty state until geo-location + city-filter API is wired up.
 */
export function NearbyEvents() {
  return (
    <section>
      <SectionHeader title="Events Near You" />
      <div className="flex flex-col items-center justify-center py-10 gap-3 rounded-2xl border border-dashed border-border/60 bg-muted/30">
        <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <MapPin className="h-6 w-6 text-emerald-600" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold">No nearby events found</p>
          <p className="text-xs text-muted-foreground mt-1">
            Allow location access to see events happening around you.
          </p>
        </div>
      </div>
    </section>
  )
}
