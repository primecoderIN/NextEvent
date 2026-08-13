import { useParams, useNavigate, Link } from "react-router-dom"
import { useEventDetail } from "@/shared/hooks/useEventDetail"
import { EventDetailHero } from "@/app/(public)/event-detail/EventDetailHero"
import { EventDetailTabs } from "@/app/(public)/event-detail/EventDetailTabs"
import { LocationCard } from "@/app/(public)/event-detail/LocationCard"
import { EventDetailSkeleton } from "@/app/(public)/event-detail/EventDetailSkeleton"
import {
  ArrowLeft, ExternalLink, Pencil, CalendarDays, MapPin, Tag, Users, CheckCircle, XCircle
} from "lucide-react"
import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { RoutePaths } from "@/shared/constants/routePaths"
import { formatEventDate, formatEventTime } from "@/shared/utils/date"

export function OrganizerEventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { event, loading, error } = useEventDetail(id)

  if (loading) return <EventDetailSkeleton />

  if (error || !event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6">
        <div className="text-6xl">😕</div>
        <h2 className="text-xl font-bold">Event not found</h2>
        <Button onClick={() => navigate(RoutePaths.OrganizerEvents)}>Back to Events</Button>
      </div>
    )
  }

  const dateStr = formatEventDate(event.date, event.timeZoneId)
  const timeStr = formatEventTime(event.date, event.timeZoneId)

  return (
    <div className="flex-1 overflow-auto">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(RoutePaths.OrganizerEvents)}
            className="gap-2 text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            My Events
          </Button>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium truncate max-w-[200px]">{event.title}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            asChild
          >
            <Link to={RoutePaths.EventDetailLink(event.id)} target="_blank">
              <ExternalLink className="h-4 w-4" />
              Public Page
            </Link>
          </Button>
          <Button
            size="sm"
            className="gap-2"
            onClick={() => navigate(RoutePaths.EventEditLink(event.id))}
          >
            <Pencil className="h-4 w-4" />
            Edit Event
          </Button>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto">
        {/* Hero */}
        <EventDetailHero event={event} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-0">
          {/* Left: tabs */}
          <div className="px-6 lg:border-r lg:border-border/40">
            <EventDetailTabs event={event} />
          </div>

          {/* Right: organizer panels */}
          <div className="px-6 py-6 space-y-5">
            {/* Status */}
            <div className="rounded-xl border border-border/50 bg-card p-4 space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Status</h3>
              {event.isCancelled ? (
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-destructive" />
                  <Badge variant="outline" className="text-destructive bg-destructive/10 border-destructive/20">
                    Cancelled
                  </Badge>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <Badge variant="outline" className="text-emerald-600 bg-emerald-500/10 border-emerald-500/20">
                    Active
                  </Badge>
                </div>
              )}
            </div>

            {/* Event Details */}
            <div className="rounded-xl border border-border/50 bg-card p-4 space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Details</h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex items-start gap-2.5">
                  <CalendarDays className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">{dateStr}</p>
                    <p className="text-muted-foreground text-xs">{timeStr}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">{event.venue}</p>
                    <p className="text-muted-foreground text-xs">{event.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="font-medium capitalize">{event.category}</span>
                </div>
              </div>
            </div>

            {/* Attendees placeholder */}
            <div className="rounded-xl border border-border/50 bg-card p-4 space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Attendees</h3>
              <div className="flex items-center gap-2.5 text-sm">
                <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Attendee tracking coming soon</span>
              </div>
            </div>

            {/* Location map */}
            <LocationCard event={event} />
          </div>
        </div>
      </div>
    </div>
  )
}
