import type { Event } from "@/Types/Event"
import { BadgeCheck, Globe, Link2, X } from "lucide-react"
import { getEventImage } from "@/portals/public/widgets/common/helpers"
import { Button } from "@/components/ui/button"

interface OrganizerCardProps {
  event: Event
}

export function OrganizerCard({ event }: OrganizerCardProps) {
  // Derive organizer name from category for demo purposes
  const organizer = event.category.charAt(0).toUpperCase() + event.category.slice(1) + " Events"

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-4 space-y-3">
      <h3 className="font-bold text-sm">Organizer</h3>

      <div className="flex items-center gap-3">
        <img
          src={getEventImage(event.category, "org", "thumb")}
          alt={organizer}
          className="h-12 w-12 rounded-xl object-cover"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <p className="font-semibold text-sm truncate">{organizer}</p>
            <BadgeCheck className="h-4 w-4 text-primary shrink-0" />
          </div>
          <p className="text-xs text-muted-foreground">1.2M Followers</p>
        </div>
        <Button variant="outline" size="sm" className="shrink-0">
          Follow
        </Button>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        Asia's leading {event.category} events and experiences company.
      </p>

      {/* Social links */}
      <div className="flex items-center gap-2 pt-1">
        <a
          href="#"
          aria-label="Website"
          className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
        >
          <Globe className="h-4 w-4" />
        </a>
        <a
          href="#"
          aria-label="Instagram"
          className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
        >
          <Link2 className="h-4 w-4" />
        </a>
        <a
          href="#"
          aria-label="Twitter / X"
          className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </a>
      </div>
    </div>
  )
}
