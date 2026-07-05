import { useMemo, useState } from "react"
import { compareDesc, parseISO } from "date-fns"
import type { Event } from "@/Types/Event"
import { SearchBar } from "@/portals/public/widgets/common/SearchBar"
import { TrustBar } from "@/portals/public/widgets/common/TrustBar"
import { HeroSection } from "@/portals/public/widgets/public-home/HeroSection"
import { CategorySection } from "@/portals/public/widgets/public-home/CategorySection"
import { RecommendedEventsSection } from "@/portals/public/widgets/public-home/RecommendedEventsSection"
import { TrendingEvents } from "@/portals/public/widgets/user-home/TrendingEvents"
import { OrganizerCTA } from "@/portals/public/widgets/public-home/OrganizerCTA"
import { JoinNowSection } from "@/portals/public/widgets/public-home/JoinNowSection"

interface PublicHomePageProps {
  events: Event[]
  loading: boolean
}

export function PublicHomePage({ events, loading }: PublicHomePageProps) {
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
        .sort((a, b) => compareDesc(parseISO(a.date), parseISO(b.date)))
        .slice(0, 6),
    [events]
  )

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 md:py-8 space-y-10">
      {/* 1. Hero — split layout: text+CTA left, FeaturedCarousel right */}
      <HeroSection events={events} />

      {/* 2. Search Bar */}
      <SearchBar placeholder="Search events, categories..." />

      {/* 3. Popular Categories */}
      <CategorySection active={activeCategory} onChange={setActiveCategory} />

      {/* 4. Recommended Events */}
      <RecommendedEventsSection events={filteredEvents} loading={loading} />

      {/* 5. Trending This Week — re-used from user-home, no duplication */}
      <TrendingEvents events={trendingEvents} loading={loading} />

      {/* 6. Become an Organizer CTA */}
      <OrganizerCTA />

      {/* 7. Join Now conversion section */}
      <JoinNowSection />

      {/* 8. Trust bar (Safe & Secure, Easy Ticketing, Connect & Network) */}
      <TrustBar />

      {/* Bottom padding for mobile */}
      <div className="h-2 lg:hidden" />
    </div>
  )
}
