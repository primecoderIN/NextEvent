import { Calendar, MapPin, Star } from "lucide-react"
import type { Event } from "@/Types/Event"
import { formatDate, getEventImage, getCategoryBadgeClass } from "@/features/home/helpers"

interface EventDetailHeroProps {
  event: Event
}

export function EventDetailHero({ event }: EventDetailHeroProps) {
  const month = new Date(event.date).toLocaleString("en-IN", { month: "short" }).toUpperCase()
  const day = new Date(event.date).getDate()
  const weekday = new Date(event.date).toLocaleString("en-IN", { weekday: "short" }).toUpperCase()

  return (
    <div className="relative w-full" style={{ aspectRatio: "16/7" }}>
      {/* Background image */}
      <img
        src={getEventImage(event.category, event.id, "banner")}
        alt={event.title}
        className="w-full h-full object-cover"
      />

      {/* Dark gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

      {/* Category badge */}
      <span
        className={`absolute top-4 left-4 px-3 py-1 rounded-lg text-xs font-bold text-white uppercase tracking-wide ${getCategoryBadgeClass(event.category)}`}
      >
        {event.category}
      </span>

      {/* Content overlay */}
      <div className="absolute bottom-0 inset-x-0 p-4 md:p-6">
        <div className="flex items-end gap-4">
          {/* Date badge */}
          <div className="flex-shrink-0 bg-white/15 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 text-center text-white min-w-[52px]">
            <p className="text-[10px] font-bold tracking-widest">{month}</p>
            <p className="text-2xl font-black leading-none">{day}</p>
            <p className="text-[10px] font-bold tracking-widest">{weekday}</p>
          </div>

          {/* Title & meta */}
          <div className="flex-1 min-w-0">
            {event.isCancelled && (
              <span className="inline-block mb-1 px-2 py-0.5 rounded bg-red-500 text-white text-[10px] font-bold uppercase tracking-wide">
                Cancelled
              </span>
            )}
            <h1 className="text-white text-xl md:text-3xl font-black leading-tight line-clamp-2">
              {event.title}
            </h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-white/75 text-xs md:text-sm">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                {formatDate(event.date)}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                {event.venue}, {event.city}
              </span>
              <span className="flex items-center gap-1.5 text-yellow-400">
                <Star className="h-3.5 w-3.5 fill-yellow-400" />
                <span className="font-semibold text-white">4.8</span>
                <span className="text-white/60">(2.3K)</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
