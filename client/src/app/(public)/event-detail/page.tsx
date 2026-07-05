import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useEventDetail } from "@/shared/hooks/useEventDetail"
import { useDeleteEvent } from "@/shared/hooks/useDeleteEvent"
import { EventDetailHero } from "@/app/(public)/event-detail/EventDetailHero"
import { EventDetailTabs } from "@/app/(public)/event-detail/EventDetailTabs"
import { TicketPanel } from "@/app/(public)/event-detail/TicketPanel"
import { OrganizerCard } from "@/app/(public)/event-detail/OrganizerCard"
import { LocationCard } from "@/app/(public)/event-detail/LocationCard"
import { EventDetailSkeleton } from "@/app/(public)/event-detail/EventDetailSkeleton"
import { DeleteEventDialog } from "@/app/(public)/event-detail/DeleteEventDialog"
import { ArrowLeft, Share2, Heart } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { EventEditAction, EventDeleteAction } from "@/features/events/components/EventActions"

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { event, loading, error } = useEventDetail(id)
  const { deleteEvent, loading: deleting, error: deleteError } = useDeleteEvent()
  const { t } = useTranslation(["eventDetail", "common"])

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  async function handleDelete() {
    if (!id) return
    const result = await deleteEvent(id)
    if (result === true) {
      setShowDeleteDialog(false)
      navigate("/", { replace: true })
    }
  }

  if (loading) return <EventDetailSkeleton />

  if (error || !event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6">
        <div className="text-6xl">😕</div>
        <h2 className="text-xl font-bold">{t("notFound.title")}</h2>
        <p className="text-muted-foreground text-sm text-center">
          {t("notFound.description")}
        </p>
        <Button onClick={() => navigate("/")} className="mt-2">
          {t("backToHome", { ns: "common" })}
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <DeleteEventDialog
        open={showDeleteDialog}
        eventTitle={event.title}
        loading={deleting}
        error={deleteError}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />

      {/* ── Top bar (mobile) ── */}
      <div className="flex items-center justify-between px-4 md:px-6 py-4 lg:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="gap-2 text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToEvents", { ns: "common" })}
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="rounded-full h-9 w-9">
            <Heart className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full h-9 w-9">
            <Share2 className="h-4 w-4" />
          </Button>
          <EventEditAction 
            event={event} 
            iconOnly 
            className="rounded-full h-9 w-9 border-primary/40 text-primary hover:bg-primary/10" 
            label={t("actions.editEvent")}
          />
          <EventDeleteAction 
            event={event} 
            iconOnly 
            className="rounded-full h-9 w-9 border-destructive/40 text-destructive hover:bg-destructive/10"
            onClick={() => setShowDeleteDialog(true)} 
            label={t("actions.deleteEvent")}
          />
        </div>
      </div>

      {/* ── Desktop back bar ── */}
      <div className="hidden lg:flex items-center justify-between px-6 py-4 border-b border-border/40">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="gap-2 text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToEvents", { ns: "common" })}
        </Button>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Heart className="h-4 w-4" />
            {t("actions.save")}
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
            {t("actions.share")}
          </Button>
          <EventEditAction 
            event={event} 
            label={t("actions.editEvent")} 
          />
          <EventDeleteAction 
            event={event} 
            onClick={() => setShowDeleteDialog(true)} 
            label={t("actions.deleteEvent")} 
          />
        </div>
      </div>

      {/* ── Main content grid ── */}
      <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-0">
        <div className="lg:border-r lg:border-border/40">
          <EventDetailHero event={event} />
          <div className="px-4 md:px-6">
            <EventDetailTabs event={event} />
          </div>
        </div>

        <div className="hidden lg:block px-6 py-6 space-y-6">
          <TicketPanel event={event} />
          <OrganizerCard event={event} />
          <LocationCard event={event} />
        </div>
      </div>

      {/* ── Mobile bottom sticky ── */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-background/95 backdrop-blur border-t border-border/40 px-4 py-3 flex items-center gap-3 z-30">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">{t("actions.startingFrom")}</p>
          <p className="text-lg font-bold text-primary">₹999</p>
        </div>
        <Button className="flex-1 shadow-lg">
          {t("actions.bookTickets")}
        </Button>
      </div>

      <div className="h-24 lg:hidden" />
    </div>
  )
}
