import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Heart, Calendar, MapPin, Play, ChevronLeft, ChevronRight } from "lucide-react"
import type { Event } from "@/Types/Event"
import { formatDate, getEventImage } from "@/portals/public/pages/home/helpers"
import { Button } from "@/components/ui/button"

interface FeaturedCarouselProps {
  /** The full event list — component slices the first 4 as featured */
  events: Event[]
}

export function FeaturedCarousel({ events }: FeaturedCarouselProps) {
  const [current, setCurrent] = useState(0)
  const navigate = useNavigate()
  const featured = events.slice(0, 4)

  // Auto-advance every 4.5 s
  useEffect(() => {
    if (featured.length <= 1) return
    const t = setInterval(() => setCurrent((i) => (i + 1) % featured.length), 4500)
    return () => clearInterval(t)
  }, [featured.length])

  const prev = () => setCurrent((i) => (i - 1 + featured.length) % featured.length)
  const next = () => setCurrent((i) => (i + 1) % featured.length)

  if (featured.length === 0) {
    return (
      <div
        className="w-full rounded-2xl bg-muted animate-pulse"
        style={{ aspectRatio: "16/8" }}
      />
    )
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden" style={{ aspectRatio: "16/8" }}>
      {featured.map((event, i) => (
        <div
          key={event.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === current ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Background image */}
          <img
            src={getEventImage(event.category, String(i), "banner")}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          {/* Dark gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

          {/* Heart */}
          <button className="absolute top-4 right-4 h-9 w-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors">
            <Heart className="h-4 w-4" />
          </button>

          {/* Content */}
          <div className="absolute bottom-0 inset-x-0 p-4 md:p-6">
            <span className="inline-block bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full mb-2 uppercase tracking-wide">
              Featured
            </span>
            <h2 className="text-white text-xl md:text-2xl lg:text-3xl font-bold leading-tight mb-2">
              {event.title}
            </h2>
            <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 text-white/80 text-xs md:text-sm mb-4">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                {formatDate(event.date)}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {event.venue}, {event.city}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => navigate(`/events/${event.id}`)}
                className="shadow-lg"
              >
                Book Tickets
              </Button>
              <button className="flex items-center gap-2 text-white text-sm font-semibold hover:opacity-80 transition-opacity">
                <span className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Play className="h-3.5 w-3.5 ml-0.5" />
                </span>
                Watch Trailer
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Dot indicators */}
      {featured.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {featured.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? "w-6 bg-white" : "w-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      )}

      {/* Arrow buttons (desktop only) */}
      {featured.length > 1 && (
        <>
          <button
            onClick={prev}
            className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/40 backdrop-blur-sm items-center justify-center text-white hover:bg-black/60 transition-colors z-10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/40 backdrop-blur-sm items-center justify-center text-white hover:bg-black/60 transition-colors z-10"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
    </div>
  )
}
