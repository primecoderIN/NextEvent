import type { Event } from "@/Types/Event"
import { SectionHeader } from "@/portals/public/widgets/common/SectionHeader"
import { EventGrid } from "@/portals/public/widgets/common/EventGrid"

interface RecommendedEventsSectionProps {
  events: Event[]
  loading: boolean
}

/**
 * "Recommended Events" horizontal card row for the public landing page.
 * Matches the card scroll section shown in the design below categories.
 */
export function RecommendedEventsSection({ events, loading }: RecommendedEventsSectionProps) {
  return (
    <section>
      <SectionHeader title="Recommended Events" />
      <EventGrid events={events} loading={loading} skeletonCount={4} />
    </section>
  )
}
