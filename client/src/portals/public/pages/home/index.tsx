import { useState, useMemo } from "react"
import { compareDesc, parseISO } from "date-fns"
import type { Event } from "@/Types/Event"
import { Button } from "@/components/ui/button"
import { GreetingHeader } from "@/portals/public/pages/home/GreetingHeader"
import { CategoryFilter } from "@/portals/public/pages/home/CategoryFilter"
import { FeaturedCarousel } from "@/portals/public/pages/home/FeaturedCarousel"
import { RecommendedSection } from "@/portals/public/pages/home/RecommendedSection"
import { TrendingSection } from "@/portals/public/pages/home/TrendingSection"

interface HomePageProps {
  events: Event[]
  loading: boolean
  fetchNextPage?: () => void
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
}

export function HomePage({ events, loading, fetchNextPage, hasNextPage, isFetchingNextPage }: HomePageProps) {
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

      {/* ── Load More Button ── */}
      {/* Only render this button if react-query determines there is a next page available in the database */}
      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button 
            variant="outline" 
            onClick={() => fetchNextPage && fetchNextPage()} 
            disabled={isFetchingNextPage}
            className="w-full sm:w-auto"
          >
            {isFetchingNextPage ? (
              <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin mr-2" />
            ) : null}
            {isFetchingNextPage ? "Loading more..." : "Load More Events"}
          </Button>
        </div>
      )}

      {/* Bottom padding for mobile bottom nav */}
      <div className="h-2 lg:hidden" />
    </div>
  )
}
