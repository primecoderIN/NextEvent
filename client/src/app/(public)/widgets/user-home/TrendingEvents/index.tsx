import { TrendingUp } from "lucide-react"
import { useTranslation } from "react-i18next"
import type { Event } from "@/types/Event"
import { SectionHeader } from "@/app/(public)/widgets/common/SectionHeader"
import { EventCard, EventCardSkeleton } from "@/features/events/components/EventCard"

interface TrendingEventsProps {
  /** Pre-sorted trending events to display */
  events: Event[]
  loading: boolean
}

/**
 * Shared by both UserHomePage and PublicHomePage.
 * No duplicate — PublicHomePage imports this directly from user-home.
 */
export function TrendingEvents({ events, loading }: TrendingEventsProps) {
  const { t } = useTranslation("home")

  if (!loading && events.length === 0) return null

  return (
    <section>
      <SectionHeader title={t("sections.trending")} />
      <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <EventCardSkeleton key={i} />)
          : events.map((event, i) => (
              <div key={event.id} className="relative shrink-0">
                <EventCard event={event} imageSeed={String(i + 20)} />
                {/* "Trending" badge overlay for top 2 */}
                {i < 2 && (
                  <span className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 z-10">
                    <TrendingUp className="h-2.5 w-2.5" />
                    {t("sections.trendingBadge")}
                  </span>
                )}
              </div>
            ))}
      </div>
    </section>
  )
}
