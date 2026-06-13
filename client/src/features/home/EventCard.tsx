import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Heart, Calendar, MapPin } from "lucide-react"
import type { Event } from "@/Types/Event"
import { formatDate, getEventImage, getCategoryBadgeClass } from "./helpers"
import { Button } from "@/components/ui/button"

// ─── EventCard ────────────────────────────────────────

interface EventCardProps {
  event: Event
  /** Seed offset used to vary the Picsum image */
  index: number
}

export function EventCard({ event, index }: EventCardProps) {
  const [liked, setLiked] = useState(false)
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/events/${event.id}`)}
      className="flex-shrink-0 w-44 md:w-52 rounded-2xl overflow-hidden border border-border/50 bg-card shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
    >
      {/* Image */}
      <div className="relative overflow-hidden">
        <img
          src={getEventImage(event.category, String(index), "card")}
          alt={event.title}
          className="w-full h-28 md:h-32 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span
          className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-semibold text-white ${getCategoryBadgeClass(event.category)}`}
        >
          {event.category}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setLiked(!liked)
          }}
          className="absolute top-2 right-2 h-7 w-7 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
        >
          <Heart
            className={`h-3.5 w-3.5 transition-colors ${
              liked ? "text-red-500 fill-red-500" : "text-muted-foreground"
            }`}
          />
        </button>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-sm leading-tight line-clamp-1">{event.title}</h3>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1.5">
          <Calendar className="h-3 w-3 flex-shrink-0" />
          {formatDate(event.date)}
        </p>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
          <MapPin className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{event.venue}</span>
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-3 w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground text-xs"
        >
          Book Now
        </Button>
      </div>
    </div>
  )
}

// ─── EventCardSkeleton ────────────────────────────────

export function EventCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-44 md:w-52 rounded-2xl overflow-hidden border border-border/50 bg-card animate-pulse">
      <div className="h-28 md:h-32 bg-muted" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-muted rounded w-3/4" />
        <div className="h-2.5 bg-muted rounded w-1/2" />
        <div className="h-2.5 bg-muted rounded w-2/3" />
        <div className="h-7 bg-muted rounded mt-3" />
      </div>
    </div>
  )
}
