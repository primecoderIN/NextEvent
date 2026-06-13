import { useParams, useNavigate } from "react-router-dom"
import { useEventDetail } from "@/hooks/useEventDetail"
import { EventDetailHero } from "./EventDetailHero"
import { EventDetailTabs } from "./EventDetailTabs"
import { TicketPanel } from "./TicketPanel"
import { OrganizerCard } from "./OrganizerCard"
import { LocationCard } from "./LocationCard"
import { EventDetailSkeleton } from "./EventDetailSkeleton"
import { ArrowLeft, Share2, Heart } from "lucide-react"

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { event, loading, error } = useEventDetail(id)

  if (loading) return <EventDetailSkeleton />

  if (error || !event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6">
        <div className="text-6xl">😕</div>
        <h2 className="text-xl font-bold">Event not found</h2>
        <p className="text-muted-foreground text-sm text-center">
          We couldn't find this event. It may have been removed or the link is
          invalid.
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Back to Home
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* ── Top bar (mobile + desktop) ── */}
      <div className="flex items-center justify-between px-4 md:px-6 py-4 lg:hidden">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to events
        </button>
        <div className="flex items-center gap-2">
          <button className="h-9 w-9 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
            <Heart className="h-4 w-4" />
          </button>
          <button className="h-9 w-9 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Desktop back bar ── */}
      <div className="hidden lg:flex items-center justify-between px-6 py-4 border-b border-border/40">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to events
        </button>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">
            <Heart className="h-4 w-4" />
            Save
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">
            <Share2 className="h-4 w-4" />
            Share
          </button>
        </div>
      </div>

      {/* ── Main content grid ── */}
      <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-0">
        {/* Left column */}
        <div className="lg:border-r lg:border-border/40">
          {/* Hero banner */}
          <EventDetailHero event={event} />

          {/* Tabs + content */}
          <div className="px-4 md:px-6">
            <EventDetailTabs event={event} />
          </div>
        </div>

        {/* Right column — desktop sidebar */}
        <div className="hidden lg:block px-6 py-6 space-y-6">
          <TicketPanel event={event} />
          <OrganizerCard event={event} />
          <LocationCard event={event} />
        </div>
      </div>

      {/* ── Mobile bottom sticky ── */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-background/95 backdrop-blur border-t border-border/40 px-4 py-3 flex items-center gap-3 z-30">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">Starting from</p>
          <p className="text-lg font-bold text-primary">₹999</p>
        </div>
        <button className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors shadow-lg">
          Book Tickets
        </button>
      </div>

      {/* Bottom padding for mobile sticky bar */}
      <div className="h-24 lg:hidden" />
    </div>
  )
}
