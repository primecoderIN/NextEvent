import { useParams, useNavigate } from "react-router-dom"
import { useEventDetail } from "@/hooks/useEventDetail"
import { EventDetailHero } from "./EventDetailHero"
import { EventDetailTabs } from "./EventDetailTabs"
import { TicketPanel } from "./TicketPanel"
import { OrganizerCard } from "./OrganizerCard"
import { LocationCard } from "./LocationCard"
import { EventDetailSkeleton } from "./EventDetailSkeleton"
import { ArrowLeft, Share2, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"

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
        <Button onClick={() => navigate("/")} className="mt-2">
          Back to Home
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* ── Top bar (mobile + desktop) ── */}
      <div className="flex items-center justify-between px-4 md:px-6 py-4 lg:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="gap-2 text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to events
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="rounded-full h-9 w-9">
            <Heart className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full h-9 w-9">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ── Desktop back bar ── */}
      <div className="hidden lg:flex items-center justify-between px-6 py-4 border-b border-border/40">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="gap-2 text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to events
        </Button>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Heart className="h-4 w-4" />
            Save
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
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
        <Button className="flex-1 shadow-lg">
          Book Tickets
        </Button>
      </div>

      {/* Bottom padding for mobile sticky bar */}
      <div className="h-24 lg:hidden" />
    </div>
  )
}
