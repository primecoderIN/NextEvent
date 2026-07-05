import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Heart, Calendar, MapPin } from "lucide-react"
import { format } from "date-fns"
import type { Event } from "@/types/Event"
import { getEventImage, getCategoryBadgeClass } from "@/app/(public)/widgets/common/helpers"
import { Button } from "@/shared/ui/button"

export interface EventCardProps {
  event: Partial<Event>
  imageSeed?: string
  onClick?: () => void
  showBookButton?: boolean
  className?: string
}

export function EventCard({ event, imageSeed, onClick, showBookButton = true, className = "" }: EventCardProps) {
  const [liked, setLiked] = useState(false)
  const navigate = useNavigate()

  const handleCardClick = () => {
    if (onClick) {
      onClick()
    } else if (event.id) {
      navigate(`/events/${event.id}`)
    }
  }

  const dateStr = event.date ? new Date(event.date) : null
  const displayTitle = event.title?.trim() || "Untitled Event"
  const displayVenue = event.venue?.trim() || "TBA"
  const displayCity = event.city?.trim() || ""

  // Ensure category is at least 'other' for the helpers
  const category = event.category || "other"
  const seed = imageSeed || event.title || "default"

  return (
    <div
      onClick={handleCardClick}
      className={`shrink-0 w-full md:w-64 rounded-2xl overflow-hidden border border-border/50 bg-card shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group ${className}`}
    >
      {/* Image Header */}
      <div className="relative h-40 bg-muted w-full overflow-hidden">
        <img
          src={getEventImage(category, seed, "card")}
          alt={displayTitle}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        <span
          className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold text-white uppercase tracking-wider shadow-sm ${getCategoryBadgeClass(category)}`}
        >
          {category}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation()
            setLiked(!liked)
          }}
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              liked ? "text-red-500 fill-red-500" : "text-muted-foreground"
            }`}
          />
        </button>

        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-2.5 py-1.5 text-center text-white min-w-12 shadow-sm">
            <p className="text-[9px] font-bold tracking-widest uppercase opacity-90">
              {dateStr ? format(dateStr, "MMM") : "---"}
            </p>
            <p className="text-xl font-black leading-none my-0.5">
              {dateStr ? format(dateStr, "dd") : "--"}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-sm leading-tight line-clamp-1 mb-2">
          {displayTitle}
        </h3>

        <div className="flex flex-col gap-1.5 text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0 opacity-70" />
            <span>{dateStr ? format(dateStr, "d MMM yyyy") : "Date TBA"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 opacity-70" />
            <span className="line-clamp-1">
              {displayVenue}{displayCity ? `, ${displayCity}` : ""}
            </span>
          </div>
        </div>

        {showBookButton && (
          <Button
            variant="outline"
            size="sm"
            className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground text-xs"
          >
            Book Now
          </Button>
        )}
      </div>
    </div>
  )
}

export function EventCardSkeleton() {
  return (
    <div className="shrink-0 w-full md:w-64 rounded-2xl overflow-hidden border border-border/50 bg-card animate-pulse">
      <div className="h-40 bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="h-3 bg-muted rounded w-2/3" />
        <div className="h-8 bg-muted rounded mt-4 w-full" />
      </div>
    </div>
  )
}
