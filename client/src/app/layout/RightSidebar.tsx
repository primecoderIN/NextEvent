import { Calendar, MapPin } from "lucide-react"
import { compareAsc, parseISO } from "date-fns"
import type { Event } from "@/Types/Event"
import { formatDate } from "@/features/home/helpers"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

const TOP_ORGANIZERS = [
  { name: "BookMyShow Live", followers: "12.4K", initials: "BL", color: "bg-red-500" },
  { name: "Paytm Insider", followers: "8.7K", initials: "PI", color: "bg-blue-600" },
  { name: "Zomaland", followers: "6.1K", initials: "ZL", color: "bg-orange-500" },
  { name: "District by Zomato", followers: "5.3K", initials: "DZ", color: "bg-red-700" },
]


function getThumb(category: string, index: number): string {
  return `https://picsum.photos/seed/${category}-${index}/120/120`
}

export function RightSidebar({ events=[] }: { events: Event[] }) {
  const navigate = useNavigate()
  const upcomingEvents = [...events]
    .sort((a, b) => compareAsc(parseISO(a.date), parseISO(b.date)))
    .slice(0, 4)

  return (
    <aside className="hidden xl:flex flex-col fixed right-0 top-0 h-screen w-80 border-l border-border/40 bg-background z-40 overflow-y-auto">
      <div className="p-5 space-y-7">
        {/* ── Upcoming Events ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Upcoming Events</h3>
            <a href="#" className="text-xs text-primary font-medium hover:underline">
              View All
            </a>
          </div>

          <div className="space-y-1">
            {upcomingEvents.length === 0
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3 p-2 animate-pulse">
                    <div className="h-14 w-14 rounded-xl bg-muted shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-3 bg-muted rounded w-3/4" />
                      <div className="h-2.5 bg-muted rounded w-1/2" />
                      <div className="h-2.5 bg-muted rounded w-2/3" />
                    </div>
                  </div>
                ))
              : upcomingEvents.map((event, i) => (
                  <div
                    key={event.id}
                    className="flex gap-3 p-2 -mx-2 rounded-xl hover:bg-muted/60 cursor-pointer transition-colors"
                    onClick={()=> navigate(`events/${event.id}`)}
                  >
                    <img
                      src={getThumb(event.category, i)}
                      alt={event.title}
                      className="h-14 w-14 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight line-clamp-2">
                        {event.title}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3 shrink-0" />
                        {formatDate(event.date)}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {event.city}
                      </p>
                    </div>
                  </div>
                ))}
          </div>
        </section>

        {/* ── Top Organizers ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Top Organizers</h3>
            <a href="#" className="text-xs text-primary font-medium hover:underline">
              View All
            </a>
          </div>
          <div className="space-y-3">
            {TOP_ORGANIZERS.map((org) => (
              <div key={org.name} className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-full ${org.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}
                >
                  {org.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight truncate">{org.name}</p>
                  <p className="text-xs text-muted-foreground">{org.followers} Followers</p>
                </div>
                <Button variant="outline" size="sm" className="shrink-0 text-primary border-primary/50 hover:bg-primary/5">
                  Follow
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* ── Create Event CTA ── */}
        <section className="rounded-2xl bg-primary/5 border border-primary/20 p-4">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h3 className="text-sm font-semibold">Create Your Own Event</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Share your ideas and bring people together.
              </p>
            </div>
            <span className="text-2xl ml-2 shrink-0">🎪</span>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/events/new")}
            className="mt-3 w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            Create Event
          </Button>
        </section>
      </div>
    </aside>
  )
}
