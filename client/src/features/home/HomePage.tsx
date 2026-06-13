import { useState, useEffect, useMemo } from "react"
import {
  Bell,
  Calendar,
  MapPin,
  Heart,
  Play,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Music,
  Wine,
  GraduationCap,
  Dumbbell,
  Briefcase,
  MoreHorizontal,
  TrendingUp,
} from "lucide-react"
import type { Event } from "@/Types/Event"

// ─────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  } catch {
    return dateStr
  }
}

function getEventImage(
  category: string,
  seed: string,
  variant: "banner" | "card" | "thumb" = "card"
): string {
  const dims: Record<string, string> = {
    banner: "800/480",
    card: "400/280",
    thumb: "120/120",
  }
  return `https://picsum.photos/seed/${category}-${seed}/${dims[variant]}`
}

function getCategoryBadgeClass(category: string): string {
  const map: Record<string, string> = {
    music: "bg-blue-600",
    nightlife: "bg-violet-600",
    workshop: "bg-amber-500",
    workshops: "bg-amber-500",
    sports: "bg-green-600",
    business: "bg-slate-700",
  }
  return map[category.toLowerCase()] ?? "bg-primary"
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return "Good Morning"
  if (h < 17) return "Good Afternoon"
  return "Good Evening"
}

// ─────────────────────────────────────────────────────
// Category Filter
// ─────────────────────────────────────────────────────

const CATEGORIES = [
  { id: "all", label: "All Events", icon: LayoutGrid },
  { id: "music", label: "Music", icon: Music },
  { id: "nightlife", label: "Nightlife", icon: Wine },
  { id: "workshop", label: "Workshops", icon: GraduationCap },
  { id: "sports", label: "Sports", icon: Dumbbell },
  { id: "business", label: "Business", icon: Briefcase },
  { id: "more", label: "More", icon: MoreHorizontal },
]

function CategoryFilter({
  active,
  onChange,
}: {
  active: string
  onChange: (cat: string) => void
}) {
  return (
    <div className="flex gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
      {CATEGORIES.map((cat) => {
        const isActive = active === cat.id
        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className={`flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-2xl transition-all duration-200 ${
              isActive
                ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <cat.icon className="h-5 w-5" />
            <span className="text-xs font-medium whitespace-nowrap">{cat.label}</span>
          </button>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────
// Featured Carousel
// ─────────────────────────────────────────────────────

function FeaturedCarousel({ events }: { events: Event[] }) {
  const [current, setCurrent] = useState(0)
  const featured = events.slice(0, 4)

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
                <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                {formatDate(event.date)}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                {event.venue}, {event.city}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button className="bg-primary text-primary-foreground px-5 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg">
                Book Tickets
              </button>
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

// ─────────────────────────────────────────────────────
// Event Card
// ─────────────────────────────────────────────────────

function EventCard({ event, index }: { event: Event; index: number }) {
  const [liked, setLiked] = useState(false)

  return (
    <div className="flex-shrink-0 w-44 md:w-52 rounded-2xl overflow-hidden border border-border/50 bg-card shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group">
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
        <button className="mt-3 w-full border border-primary text-primary text-xs font-semibold py-1.5 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors duration-200">
          Book Now
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────
// Section Header
// ─────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-bold">{title}</h2>
      <a
        href="#"
        className="text-sm text-primary font-medium hover:underline flex items-center gap-0.5"
      >
        See All <ChevronRight className="h-3.5 w-3.5" />
      </a>
    </div>
  )
}

// ─────────────────────────────────────────────────────
// Skeleton (loading state)
// ─────────────────────────────────────────────────────

function EventCardSkeleton() {
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

// ─────────────────────────────────────────────────────
// HomePage
// ─────────────────────────────────────────────────────

interface HomePageProps {
  events: Event[]
  loading: boolean
}

export function HomePage({ events, loading }: HomePageProps) {
  const [activeCategory, setActiveCategory] = useState("all")

  const filteredEvents = useMemo(() => {
    if (activeCategory === "all" || activeCategory === "more") return events
    return events.filter((e) =>
      e.category.toLowerCase().startsWith(activeCategory)
    )
  }, [events, activeCategory])

  const trendingEvents = useMemo(
    () =>
      [...events]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 6),
    [events]
  )

  return (
    <div className="px-4 py-5 md:px-6 md:py-7 space-y-7 max-w-4xl mx-auto">
      {/* ── Greeting ── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-sm font-medium">
            {getGreeting()}, Sanjeev 👋
          </p>
          <h1 className="text-2xl md:text-3xl font-bold leading-tight mt-0.5">
            Discover amazing events
            <br className="hidden sm:block" />
            happening around you.
          </h1>
        </div>
        <div className="relative flex-shrink-0 ml-4">
          <button className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors">
            <Bell className="h-5 w-5" />
          </button>
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
            3
          </span>
        </div>
      </div>

      {/* ── Category Filter ── */}
      <CategoryFilter active={activeCategory} onChange={setActiveCategory} />

      {/* ── Featured Carousel ── */}
      <FeaturedCarousel events={events} />

      {/* ── Recommended For You ── */}
      <section>
        <SectionHeader title="Recommended For You" />
        <div
          className="flex gap-4 overflow-x-auto pb-2"
          style={{ scrollbarWidth: "none" }}
        >
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <EventCardSkeleton key={i} />)
          ) : filteredEvents.length === 0 ? (
            <p className="text-muted-foreground text-sm py-6">
              No events found in this category yet.
            </p>
          ) : (
            filteredEvents.map((event, i) => (
              <EventCard key={event.id} event={event} index={i} />
            ))
          )}
        </div>
      </section>

      {/* ── Trending This Week ── */}
      {(loading || trendingEvents.length > 0) && (
        <section>
          <SectionHeader title="Trending This Week" />
          <div
            className="flex gap-4 overflow-x-auto pb-2"
            style={{ scrollbarWidth: "none" }}
          >
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <EventCardSkeleton key={i} />)
              : trendingEvents.map((event, i) => (
                  <div key={event.id} className="relative flex-shrink-0">
                    <EventCard event={event} index={i + 20} />
                    {/* "Trending" badge overlay for top 2 */}
                    {i < 2 && (
                      <span className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 z-10">
                        <TrendingUp className="h-2.5 w-2.5" />
                        Trending
                      </span>
                    )}
                  </div>
                ))}
          </div>
        </section>
      )}

      {/* Bottom padding for mobile bottom nav */}
      <div className="h-2 lg:hidden" />
    </div>
  )
}
