import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useEventDetail } from "@/shared/hooks/useEventDetail"
import { useDeleteEvent } from "@/shared/hooks/useDeleteEvent"
import { EventDetailHero } from "@/app/(public)/event-detail/EventDetailHero"
import { EventDetailTabs } from "@/app/(public)/event-detail/EventDetailTabs"
import { LocationCard } from "@/app/(public)/event-detail/LocationCard"
import { EventDetailSkeleton } from "@/app/(public)/event-detail/EventDetailSkeleton"
import { DeleteEventDialog } from "@/app/(public)/event-detail/DeleteEventDialog"
import {
  ArrowLeft, ExternalLink, EyeOff, Trash2,
  CalendarDays, MapPin, Tag, Building2, Globe, Hash, CheckCircle, XCircle, Flag
} from "lucide-react"
import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { RoutePaths } from "@/shared/constants/routePaths"
import { formatEventDate, formatEventTime } from "@/shared/utils/date"
import { useSuspendEvent } from "@/shared/hooks/useSuspendEvent"
import { ReportsPanel } from "./ReportsPanel"
import { Loader2 } from "lucide-react"

export function AdminEventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { event, loading, error } = useEventDetail(id)
  const { deleteEvent, loading: deleting } = useDeleteEvent()
  const { suspendEvent, loading: suspending } = useSuspendEvent()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  async function handleSuspend() {
    if (!id) return
    const success = await suspendEvent(id)
    if (success) {
      // Refresh page or event details to get updated state
      window.location.reload()
    }
  }

  async function handleDelete() {
    if (!id) return
    const result = await deleteEvent(id)
    if (result === true) {
      setShowDeleteDialog(false)
      navigate(RoutePaths.AdminEvents, { replace: true })
    }
  }

  if (loading) return <EventDetailSkeleton />

  if (error || !event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6">
        <div className="text-6xl">😕</div>
        <h2 className="text-xl font-bold">Event not found</h2>
        <Button onClick={() => navigate(RoutePaths.AdminEvents)}>Back to Events</Button>
      </div>
    )
  }

  const dateStr = formatEventDate(event.date, event.timeZoneId)
  const timeStr = formatEventTime(event.date, event.timeZoneId)

  return (
    <div className="flex-1 overflow-auto">
      <DeleteEventDialog
        open={showDeleteDialog}
        eventTitle={event.title}
        loading={deleting}
        error={null}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(RoutePaths.AdminEvents)}
            className="gap-2 text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Button>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium truncate max-w-52">{event.title}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => window.open(RoutePaths.EventDetailLink(event.id), "_blank")}
          >
            <ExternalLink className="h-4 w-4" />
            Public Page
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto">
        {/* Hero */}
        <EventDetailHero event={event} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-0">
          {/* Left: tabs */}
          <div className="px-6 lg:border-r lg:border-border/40">
            <EventDetailTabs event={event} />
          </div>

          {/* Right: admin panels */}
          <div className="px-6 py-6 space-y-5">
            {/* Status */}
            <div className="rounded-xl border border-border/50 bg-card p-4 space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Status</h3>
              {event.isSuspended ? (
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-destructive" />
                  <Badge variant="outline" className="text-destructive bg-destructive/10 border-destructive/20">
                    Suspended
                  </Badge>
                </div>
              ) : event.isCancelled ? (
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

              <div className="flex gap-2 pt-1">
                {event.isSuspended ? (
                  <Button size="sm" variant="outline" className="gap-1.5 flex-1" disabled>
                    <EyeOff className="h-4 w-4" />
                    Suspended (Action final)
                  </Button>
                ) : event.isCancelled ? (
                  <Button size="sm" variant="outline" className="gap-1.5 flex-1" disabled>
                    <XCircle className="h-4 w-4" />
                    Cancelled by Organizer
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" className="gap-1.5 flex-1 text-amber-600 border-amber-500/30 hover:bg-amber-500/10" onClick={handleSuspend} disabled={suspending}>
                    {suspending ? <Loader2 className="h-4 w-4 animate-spin" /> : <EyeOff className="h-4 w-4" />}
                    Suspend Event
                  </Button>
                )}
              </div>
            </div>

            {/* Event Details */}
            <div className="rounded-xl border border-border/50 bg-card p-4 space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Event Details</h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex items-start gap-2.5">
                  <CalendarDays className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">{dateStr}</p>
                    <p className="text-muted-foreground text-xs">{timeStr} · {event.timeZoneId}</p>
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
                {event.organizationName && (
                  <div className="flex items-center gap-2.5">
                    <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="font-medium">{event.organizationName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Internal IDs (admin only) */}
            <div className="rounded-xl border border-border/50 bg-muted/30 p-4 space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5" />
                Internal Info
              </h3>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground">Event ID</span>
                  <span className="text-foreground break-all select-all">{event.id}</span>
                </div>
                {event.organizationId && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground">Organization ID</span>
                    <span className="text-foreground break-all select-all">{event.organizationId}</span>
                    {event.organizationSlug && (
                      <a
                        href={`/admin/organizations`}
                        className="flex items-center gap-1 text-primary hover:underline mt-0.5 not-mono"
                      >
                        <Globe className="h-3 w-3" />
                        <span className="font-sans">View Organization</span>
                      </a>
                    )}
                  </div>
                )}
                {event.categoryId && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground">Category ID</span>
                    <span className="text-foreground break-all select-all">{event.categoryId}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Moderation Reports */}
            <div className="rounded-xl border border-destructive/20 bg-card overflow-hidden flex flex-col">
              <div className="bg-destructive/5 p-4 border-b border-destructive/10">
                <h3 className="text-sm font-semibold text-destructive uppercase tracking-wider flex items-center gap-1.5">
                  <Flag className="h-4 w-4" />
                  User Reports
                </h3>
              </div>
              <ReportsPanel eventId={event.id} />
            </div>

            {/* Location map */}
            <LocationCard event={event} />
          </div>
        </div>
      </div>
    </div>
  )
}
