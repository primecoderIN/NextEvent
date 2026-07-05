import { memo } from "react"
import type { Event } from "@/Types/Event"
import { EventCard, EventCardSkeleton } from "@/portals/public/widgets/common/EventCard"

interface EventGridProps {
  events: Event[]
  loading: boolean
  skeletonCount?: number
  /** Optional offset so card seeds don't clash across sections */
  indexOffset?: number
}

/**
 * Horizontal-scroll row of EventCards.
 * Used by RecommendedEvents, TrendingEvents, and any other section that needs
 * a scrollable list of cards — no duplication of the layout pattern.
 */
export const EventGrid = memo(function EventGrid({
  events,
  loading,
  skeletonCount = 4,
  indexOffset = 0,
}: EventGridProps) {
  return (
    <div
      className="flex gap-4 overflow-x-auto pb-2"
      style={{ scrollbarWidth: "none" }}
    >
      {loading
        ? Array.from({ length: skeletonCount }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))
        : events.map((event, i) => (
            <EventCard key={event.id} event={event} index={i + indexOffset} />
          ))}
    </div>
  )
})
