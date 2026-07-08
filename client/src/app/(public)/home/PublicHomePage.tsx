import { useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import { compareDesc, parseISO } from "date-fns"
import type { Event } from "@/types/Event"
import { SearchBar } from "@/app/(public)/widgets/common/SearchBar"
import { TrustBar } from "@/app/(public)/widgets/common/TrustBar"
import { HeroSection } from "@/app/(public)/widgets/public-home/HeroSection"
import { CategorySection } from "@/app/(public)/widgets/public-home/CategorySection"
import { RecommendedEventsSection } from "@/app/(public)/widgets/public-home/RecommendedEventsSection"
import { TrendingEvents } from "@/app/(public)/widgets/user-home/TrendingEvents"
import { OrganizerCTA } from "@/app/(public)/widgets/public-home/OrganizerCTA"
import { JoinNowSection } from "@/app/(public)/widgets/public-home/JoinNowSection"

interface PublicHomePageProps {
  events: Event[]
  loading: boolean
}

export function PublicHomePage({ events, loading }: PublicHomePageProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategory = searchParams.get("categoryId") || "all"

  const handleCategoryChange = (categoryId: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (categoryId === "all") {
      newParams.delete("categoryId")
    } else {
      newParams.set("categoryId", categoryId)
    }
    setSearchParams(newParams)
  }

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
      <CategorySection active={activeCategory} onChange={handleCategoryChange} />

      {/* 4. Recommended Events */}
      <RecommendedEventsSection events={events} loading={loading} />

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
