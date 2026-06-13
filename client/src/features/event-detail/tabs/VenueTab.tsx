import type { Event } from "@/Types/Event"
import { MapPin, Navigation } from "lucide-react"

interface VenueTabProps {
  event: Event
}

export function VenueTab({ event }: VenueTabProps) {
  const mapsUrl = `https://www.google.com/maps?q=${event.latitude},${event.longitude}`
  const embedUrl = `https://www.google.com/maps?q=${event.latitude},${event.longitude}&output=embed`

  return (
    <div className="space-y-4">
      <h2 className="text-base font-bold">Venue</h2>

      {/* Venue card */}
      <div className="flex gap-4 p-4 rounded-2xl border border-border/50 bg-card">
        <img
          src={`https://picsum.photos/seed/venue-${event.id}/80/80`}
          alt={event.venue}
          className="h-16 w-16 rounded-xl object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm">{event.venue}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-start gap-1">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
            {event.venue}, {event.city}
          </p>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-primary hover:underline"
          >
            <Navigation className="h-3 w-3" />
            View on Map
          </a>
        </div>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
          aria-label="Get Directions"
        >
          <Navigation className="h-5 w-5 text-primary" />
        </a>
      </div>

      {/* Map embed */}
      {event.latitude !== 0 && event.longitude !== 0 && (
        <div className="rounded-2xl overflow-hidden border border-border/50 h-56">
          <iframe
            title="Event location map"
            src={embedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}

      {event.latitude === 0 && event.longitude === 0 && (
        <div className="rounded-2xl border border-border/50 bg-muted h-44 flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <MapPin className="h-8 w-8 opacity-30" />
          <p className="text-sm">Map coordinates not available</p>
        </div>
      )}
    </div>
  )
}
