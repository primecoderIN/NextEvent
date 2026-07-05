import { addDays, format, parseISO } from "date-fns"
import type { Event } from "@/types/Event"
import { CalendarDays } from "lucide-react"

interface ScheduleTabProps {
  event: Event
}

/** Generate mock schedule items derived from the single event date */
function buildSchedule(event: Event) {

  const slots = [
    {
      time: "4:00 PM – 6:00 PM",
      label: "Doors Open & Registration",
      desc: "Welcome drinks and networking",
    },
    {
      time: "6:00 PM – 8:00 PM",
      label: "Opening Acts",
      desc: "Warm-up performances & entertainment",
    },
    {
      time: "8:00 PM – 11:00 PM",
      label: "Main Event",
      desc: "Headline performances",
    },
    {
      time: "11:00 PM – 12:00 AM",
      label: "Closing Ceremony",
      desc: "Closing acts and wrap-up",
    },
  ]

  // Parse the event's UTC date once; addDays handles month/year boundaries correctly.
  const base = parseISO(event.date)

  return slots.map((slot, i) => ({
    ...slot,
    date: format(addDays(base, i), "d MMMM yyyy"),
  }))
}

export function ScheduleTab({ event }: ScheduleTabProps) {
  const schedule = buildSchedule(event)

  return (
    <div className="space-y-4">
      <h2 className="text-base font-bold">Event Schedule</h2>

      <div className="space-y-3">
        {schedule.map((item, i) => (
          <div
            key={i}
            className="flex gap-4 p-4 rounded-2xl border border-border/50 bg-card hover:border-primary/20 hover:bg-primary/5 transition-all duration-200"
          >
            {/* Left: date icon */}
            <div className="shrink-0">
              <span className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <CalendarDays className="h-5 w-5 text-primary" />
              </span>
            </div>

            {/* Right: info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <p className="text-sm font-semibold">{item.label}</p>
                <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-md w-fit">
                  {item.time}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{item.date}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center pt-2">
        Schedule subject to change. Check back closer to the event for updates.
      </p>
    </div>
  )
}
