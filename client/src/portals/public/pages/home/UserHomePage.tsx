import { useMemo, useState } from "react"
import { compareDesc, parseISO } from "date-fns"
import type { Event } from "@/Types/Event"
import { Button } from "@/components/ui/button"
import { SearchBar } from "@/portals/public/widgets/common/SearchBar"
import { CategoryCarousel } from "@/portals/public/widgets/common/CategoryCarousel"
import { WelcomeBanner } from "@/portals/public/widgets/user-home/WelcomeBanner"
import { RecommendedEvents } from "@/portals/public/widgets/user-home/RecommendedEvents"
import { TrendingEvents } from "@/portals/public/widgets/user-home/TrendingEvents"
import { UpcomingRegistrations } from "@/portals/public/widgets/user-home/UpcomingRegistrations"
import { ContinueBrowsing } from "@/portals/public/widgets/user-home/ContinueBrowsing"
import { SavedEvents } from "@/portals/public/widgets/user-home/SavedEvents"
import { NearbyEvents } from "@/portals/public/widgets/user-home/NearbyEvents"
import { useAuth } from "@/features/auth/AuthContext"

interface UserHomePageProps {
  events: Event[]
  loading: boolean
  fetchNextPage?: () => void
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
}

export function UserHomePage({
  events,
  loading,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}: UserHomePageProps) {
  const { user } = useAuth()
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
      {/* 1. Welcome Banner */}
      <WelcomeBanner username={user?.displayName ?? "there"} notificationCount={3} />

      {/* 2. Search Bar */}
      <SearchBar placeholder="Search events, categories, artists..." />

      {/* 3. Recommended Events */}
      <RecommendedEvents events={filteredEvents} loading={loading} />

      {/* 4. Upcoming Registrations */}
      <UpcomingRegistrations />

      {/* 5. Continue Browsing */}
      <ContinueBrowsing />

      {/* 6. Saved Events */}
      <SavedEvents />

      {/* 7. Nearby Events */}
      <NearbyEvents />

      {/* 8. Category Carousel */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold">Browse by Category</h2>
        <CategoryCarousel active={activeCategory} onChange={setActiveCategory} />
      </section>

      {/* 9. Trending This Week */}
      <TrendingEvents events={trendingEvents} loading={loading} />

      {/* 10. Load More */}
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
