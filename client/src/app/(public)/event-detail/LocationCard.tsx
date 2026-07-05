import type { Event } from "@/types/Event"
import { MapPin, Navigation } from "lucide-react"

interface LocationCardProps {
  event: Event
}

export function LocationCard({ event }: LocationCardProps) {
  const mapsUrl = `https://www.google.com/maps?q=${event.latitude},${event.longitude}`
  const embedUrl = `https://www.google.com/maps?q=${event.latitude},${event.longitude}&output=embed`

  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
      <div className="p-4 border-b border-border/40">
        <h3 className="font-bold text-sm">Location</h3>
      </div>

      {/* Map */}
      {event.latitude !== 0 && event.longitude !== 0 ? (
        <div className="h-40">
          <iframe
            title="Location map"
            src={embedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      ) : (
        <div className="h-32 bg-muted flex items-center justify-center text-muted-foreground">
          <MapPin className="h-6 w-6 opacity-40" />
        </div>
      )}

      {/* Address */}
      <div className="p-4 space-y-2">
        <p className="font-semibold text-sm">{event.venue}</p>
        <p className="text-xs text-muted-foreground">{event.city}</p>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline mt-1"
        >
          <Navigation className="h-3 w-3" />
          View on Google Maps
        </a>
      </div>
    </div>
  )
}
