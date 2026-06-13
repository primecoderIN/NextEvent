import { useState } from "react"
import type { Event } from "@/Types/Event"
import { AboutTab } from "./tabs/AboutTab"
import { ScheduleTab } from "./tabs/ScheduleTab"
import { VenueTab } from "./tabs/VenueTab"

interface EventDetailTabsProps {
  event: Event
}

const TABS = ["About", "Schedule", "Venue"] as const
type Tab = (typeof TABS)[number]

export function EventDetailTabs({ event }: EventDetailTabsProps) {
  const [active, setActive] = useState<Tab>("About")

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-0 border-b border-border/50 mt-4 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`flex-shrink-0 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
              active === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
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
