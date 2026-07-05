import { useTranslation } from "react-i18next"
import type { Event } from "@/Types/Event"
import { SectionHeader } from "@/portals/public/widgets/common/SectionHeader"
import { EventGrid } from "@/portals/public/widgets/common/EventGrid"

interface RecommendedEventsProps {
  events: Event[]
  loading: boolean
}

export function RecommendedEvents({ events, loading }: RecommendedEventsProps) {
  const { t } = useTranslation("home")

  return (
    <section>
      <SectionHeader title={t("sections.recommended")} />
      {!loading && events.length === 0 ? (
        <p className="text-muted-foreground text-sm py-6">{t("empty")}</p>
      ) : (
        <EventGrid events={events} loading={loading} />
      )}
    </section>
  )
}
