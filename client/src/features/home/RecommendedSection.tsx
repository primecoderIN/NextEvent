import type { Event } from "@/Types/Event"
import { SectionHeader } from "./SectionHeader"
import { EventCard, EventCardSkeleton } from "./EventCard"

interface RecommendedSectionProps {
  events: Event[]
  loading: boolean
}

export function RecommendedSection({ events, loading }: RecommendedSectionProps) {
  return (
    <section>
      <SectionHeader title="Recommended For You" />
      <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <EventCardSkeleton key={i} />)
        ) : events.length === 0 ? (
          <p className="text-muted-foreground text-sm py-6">
            No events found in this category yet.
          </p>
        ) : (
          events.map((event, i) => <EventCard key={event.id} event={event} index={i} />)
        )}
      </div>
    </section>
  )
}
