import type { Event } from "@/types/Event"
import { BadgeCheck, Globe } from "lucide-react"
import { getEventImage } from "@/app/(public)/widgets/common/helpers"
import { Button } from "@/shared/ui/button"
import { Link } from "react-router-dom"
import { RoutePaths } from "@/shared/constants/routePaths"

interface OrganizerCardProps {
  event: Event
}

export function OrganizerCard({ event }: OrganizerCardProps) {
  // If the event has a real organization, use it. Otherwise fallback to demo derived name.
  const isRealOrganization = !!event.organizationId
  const organizerName = isRealOrganization 
    ? event.organizationName! 
    : event.category.charAt(0).toUpperCase() + event.category.slice(1) + " Events"

  const logoUrl = isRealOrganization && event.organizationLogoUrl 
    ? event.organizationLogoUrl 
    : getEventImage(event.category, "org", "thumb")

  const profileLink = isRealOrganization 
    ? RoutePaths.OrganizationProfile.replace(":slug", event.organizationSlug!)
    : "#"

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-4 space-y-3">
      <h3 className="font-bold text-sm">Organizer</h3>

      <div className="flex items-center gap-3">
        <Link to={profileLink} className="shrink-0 hover:opacity-80 transition-opacity">
          <img
            src={logoUrl}
            alt={organizerName}
            className="h-12 w-12 rounded-xl object-cover bg-muted"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <Link to={profileLink} className="hover:underline underline-offset-4">
              <p className="font-semibold text-sm truncate">{organizerName}</p>
            </Link>
            {isRealOrganization && <BadgeCheck className="h-4 w-4 text-primary shrink-0" />}
          </div>
          <p className="text-xs text-muted-foreground">{isRealOrganization ? "Verified Organizer" : "Community Organizer"}</p>
        </div>
        <Button variant="outline" size="sm" className="shrink-0" asChild>
          <Link to={profileLink}>View Profile</Link>
        </Button>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        {isRealOrganization ? `Official ${organizerName} events and experiences.` : `Asia's leading ${event.category} events and experiences company.`}
      </p>

      {/* Social links placeholder */}
      <div className="flex items-center gap-2 pt-1">
        <a
          href="#"
          aria-label="Website"
          className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
        >
          <Globe className="h-4 w-4" />
        </a>
      </div>
    </div>
  )
}
