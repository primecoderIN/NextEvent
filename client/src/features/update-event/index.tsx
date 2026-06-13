import { useParams, useNavigate } from "react-router-dom"
import { useEventDetail } from "@/hooks/useEventDetail"
import { EventDetailSkeleton } from "@/features/event-detail/EventDetailSkeleton"
import { UpdateEventForm } from "@/features/update-event/UpdateEventForm"
import { Button } from "@/components/ui/button"

// ─── Page (orchestrator) ──────────────────────────────────────────────────────
// Responsibilities:
//   1. Read the :id param
//   2. Fetch the existing event
//   3. Render the appropriate state: loading | not-found | form

export function UpdateEventPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { event, loading, error } = useEventDetail(id)

  if (loading) return <EventDetailSkeleton />

  if (error || !event || !id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6">
        <div className="text-6xl">😕</div>
        <h2 className="text-xl font-bold">Event not found</h2>
        <p className="text-muted-foreground text-sm text-center">
          We couldn't find this event. It may have been removed or the link is invalid.
        </p>
        <Button onClick={() => navigate("/")} className="mt-2">
          Back to Home
        </Button>
      </div>
    )
  }

  return <UpdateEventForm id={id} event={event} />
}
