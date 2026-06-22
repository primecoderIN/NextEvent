import { useState } from "react"
import { useTranslation } from "react-i18next"
import type { Event } from "@/Types/Event"
import { AboutTab } from "@/features/event-detail/tabs/AboutTab"
import { ScheduleTab } from "@/features/event-detail/tabs/ScheduleTab"
import { VenueTab } from "@/features/event-detail/tabs/VenueTab"

interface EventDetailTabsProps {
  event: Event
}

const TABS = ["About", "Schedule", "Venue"] as const
type Tab = (typeof TABS)[number]

export function EventDetailTabs({ event }: EventDetailTabsProps) {
  const [active, setActive] = useState<Tab>("About")
  const { t } = useTranslation("eventDetail")

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-0 border-b border-border/50 mt-4 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`shrink-0 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
              active === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t(`tabs.${tab.toLowerCase()}`)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="py-5">
        {active === "About" && <AboutTab event={event} />}
        {active === "Schedule" && <ScheduleTab event={event} />}
        {active === "Venue" && <VenueTab event={event} />}
      </div>
    </div>
  )
}
