import { useTranslation } from "react-i18next"
import type { Event } from "@/Types/Event"
import { SectionHeader } from "@/features/home/SectionHeader"
import { EventCard, EventCardSkeleton } from "@/features/home/EventCard"

interface RecommendedSectionProps {
  events: Event[]
  loading: boolean
}

export function RecommendedSection({ events, loading }: RecommendedSectionProps) {
  const { t } = useTranslation("home")

  return (
    <section>
      <SectionHeader title={t("sections.recommended")} />
      <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <EventCardSkeleton key={i} />)
        ) : events.length === 0 ? (
          <p className="text-muted-foreground text-sm py-6">
            {t("empty")}
          </p>
        ) : (
          events.map((event, i) => <EventCard key={event.id} event={event} index={i} />)
        )}
      </div>
    </section>
  )
}
