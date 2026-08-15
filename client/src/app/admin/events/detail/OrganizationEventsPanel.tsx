import { Link } from "react-router-dom"
import { Building2, CalendarDays, ExternalLink } from "lucide-react"
import { useAdminEvents } from "@/shared/hooks/useAdminEvents"
import { RoutePaths } from "@/shared/constants/routePaths"
import { formatEventDate } from "@/shared/utils/date"


interface OrganizationEventsPanelProps {
  organizationId: string
  currentEventId: string
}

export function OrganizationEventsPanel({ organizationId, currentEventId }: OrganizationEventsPanelProps) {
  // Fetch a small batch of events for this organization
  const { data: orgEvents, isFetching } = useAdminEvents({
    organizationId,
    pageSize: 5,
  })

  if (isFetching) {
    return (
      <div className="rounded-xl border border-border/50 bg-card p-4 space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Building2 className="h-3.5 w-3.5" />
          Other Events
        </h3>
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  // Filter out the current event
  const otherEvents = orgEvents?.items.filter(e => e.id !== currentEventId) || []

  if (otherEvents.length === 0) {
    return (
      <div className="rounded-xl border border-border/50 bg-card p-4 space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Building2 className="h-3.5 w-3.5" />
          Other Events
        </h3>
        <p className="text-sm text-muted-foreground">No other events found for this organization.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
      <div className="p-4 border-b border-border/50 bg-muted/30 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Building2 className="h-3.5 w-3.5" />
          Other Events
        </h3>
      </div>
      <div className="divide-y divide-border/50">
        {otherEvents.map((evt) => (
          <Link
            key={evt.id}
            to={RoutePaths.AdminEventDetailLink(evt.id)}
            className="flex items-start gap-3 p-3 hover:bg-muted/30 transition-colors group"
          >
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <CalendarDays className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-tight truncate group-hover:text-primary transition-colors">
                {evt.title}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatEventDate(evt.date, evt.timeZoneId)}
              </p>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
          </Link>
        ))}
      </div>
      {orgEvents && orgEvents.totalCount > 5 && (
        <div className="p-2 border-t border-border/50 bg-muted/10">
          <Link
            to={`${RoutePaths.AdminEvents}?organizationId=${organizationId}`}
            className="block w-full text-center text-xs font-medium text-primary hover:underline py-1"
          >
            View all {orgEvents.totalCount} events
          </Link>
        </div>
      )}
    </div>
  )
}
