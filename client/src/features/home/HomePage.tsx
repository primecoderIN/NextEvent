import { useState, useMemo } from "react"
import type { Event } from "@/Types/Event"
import { GreetingHeader } from "./GreetingHeader"
import { CategoryFilter } from "./CategoryFilter"
import { FeaturedCarousel } from "./FeaturedCarousel"
import { RecommendedSection } from "./RecommendedSection"
import { TrendingSection } from "./TrendingSection"

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
      <GreetingHeader username="Sanjeev" notificationCount={3} />

      {/* ── Category Filter ── */}
      <CategoryFilter active={activeCategory} onChange={setActiveCategory} />

      {/* ── Featured Carousel ── */}
      <FeaturedCarousel events={events} />

      {/* ── Recommended For You ── */}
      <RecommendedSection events={filteredEvents} loading={loading} />

      {/* ── Trending This Week ── */}
      <TrendingSection events={trendingEvents} loading={loading} />

      {/* Bottom padding for mobile bottom nav */}
      <div className="h-2 lg:hidden" />
    </div>
  )
}
