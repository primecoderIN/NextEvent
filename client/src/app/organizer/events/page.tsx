import { useNavigate } from "react-router-dom"
import { useMyOrganization } from "@/shared/hooks/useMyOrganization"
import { useMyEvents } from "@/shared/hooks/useMyEvents"
import { CalendarPlus, MapPin, CalendarDays, ExternalLink, Building2 } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { RoutePaths } from "@/shared/constants/routePaths"
import { RequirePermission } from "@/authorization"
import { getEventImage } from "@/app/(public)/widgets/common/helpers"
import { Permissions } from "@/shared/constants/permissions"
import { formatEventDate } from "@/shared/utils/date"

export function OrganizerEventsPage() {
  const navigate = useNavigate()
  const { data: organization, isLoading: isLoadingOrg } = useMyOrganization()
  
  // Fetch events belonging to the organizer (only if active)
  const { events, loading: isLoadingEvents } = useMyEvents(
    { organizationId: organization?.id },
    { enabled: !!organization?.id && organization?.status === "active" }
  )

  if (isLoadingOrg) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!organization) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
        <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Organization Required</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          You must create an organization before you can manage events.
        </p>
        <Button onClick={() => navigate(RoutePaths.StartOrganizer)}>
          Create Organization
        </Button>
      </div>
    )
  }

  // Organization exists, check status
  if (organization.status === "pending_verification") {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-6">
          <Building2 className="w-10 h-10 text-amber-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Organization Pending Approval</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          Your organization <strong>{organization.name}</strong> is currently under review by our admin team. You'll be able to manage events once it is approved.
        </p>
        <Button variant="outline" onClick={() => navigate(`/organizer/organizations/${organization.id}`)}>
          View Organization Details
        </Button>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 overflow-auto max-w-7xl mx-auto w-full space-y-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-2xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Events</h1>
          <p className="text-muted-foreground text-sm">
            Manage all events belonging to {organization.name}
          </p>
        </div>
        <RequirePermission permission={Permissions.EventsCreate}>
          <Button onClick={() => navigate(RoutePaths.CreateEvent)}>
            <CalendarPlus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </RequirePermission>
      </div>

      {/* Events section */}
      <div className="space-y-4">
        {isLoadingEvents ? (
          <div className="py-12 flex justify-center">
            <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                onClick={() => navigate(RoutePaths.OrganizerEventDetailLink(event.id))}
                className="group relative bg-card rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col cursor-pointer"
              >
                <div className="aspect-video bg-muted relative">
                  <img
                    src={getEventImage(event.category, event.id, "banner")}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    {event.isCancelled && (
                      <Badge variant="destructive" className="shadow-sm backdrop-blur-md">Cancelled</Badge>
                    )}
                  </div>
                </div>
                
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-semibold text-lg line-clamp-1 mb-2 group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CalendarDays className="w-4 h-4 mr-2 shrink-0" />
                      <span className="truncate">{formatEventDate(event.date, (event as any).timeZoneId)}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2 shrink-0" />
                      <span className="truncate">{event.venue}, {event.city}</span>
                    </div>
                  </div>
                  
                  <div className="mt-auto flex items-center gap-2 pt-4 border-t">
                    <RequirePermission permission={Permissions.EventsUpdate} resource={event}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => { e.stopPropagation(); navigate(RoutePaths.EventEditLink(event.id)) }}
                      >
                        Edit
                      </Button>
                    </RequirePermission>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="View Public Page"
                      onClick={(e) => { e.stopPropagation(); window.open(RoutePaths.EventDetailLink(event.id), "_blank") }}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center mt-6">
            <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mb-6">
              <CalendarPlus className="w-12 h-12 text-primary/40" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight mb-3">No Events Found</h3>
            <p className="text-muted-foreground max-w-md mb-8 text-lg">
              You haven't created any events for your organization yet.
            </p>
            <RequirePermission permission={Permissions.EventsCreate}>
              <Button size="lg" onClick={() => navigate(RoutePaths.CreateEvent)} className="h-14 px-8 text-lg shadow-lg">
                <CalendarPlus className="w-5 h-5 mr-2" />
                Create Your First Event
              </Button>
            </RequirePermission>
          </div>
        )}
      </div>
    </div>
  )
}
