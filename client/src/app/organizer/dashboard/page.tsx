import { Link, useNavigate } from "react"
import { useMyOrganization } from "@/shared/hooks/useMyOrganization"
import { useEvents } from "@/shared/hooks/useEvents"
import { Building2, CalendarPlus, Settings, LayoutDashboard, MapPin, CalendarDays, ExternalLink, Shield } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { RoutePaths } from "@/shared/constants/routePaths"

export function OrganizerDashboardPage() {
  const navigate = useNavigate()
  const { data: organization, isLoading: isLoadingOrg, isError: isErrorOrg } = useMyOrganization()
  
  // We only fetch events if we know the organization ID
  const { events, loading: isLoadingEvents } = useEvents({ 
    organizationId: organization?.id 
  })

  if (isLoadingOrg) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  // If no org found, they probably need to create one
  if (isErrorOrg || !organization) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
        <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Welcome to Organizer Hub</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          You don't have an organization set up yet. Create an organization profile to start publishing events and managing attendees.
        </p>
        <Button onClick={() => navigate(RoutePaths.StartOrganizer)} size="lg">
          <CalendarPlus className="w-5 h-5 mr-2" />
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
          Your organization <strong>{organization.name}</strong> is currently under review by our admin team. You'll be able to create events once it is approved.
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
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border">
            {organization.logoUrl ? (
              <img src={organization.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-xl" />
            ) : (
              <Building2 className="w-8 h-8 text-primary" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight">{organization.name}</h1>
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Active</Badge>
            </div>
            <p className="text-muted-foreground text-sm flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" /> Organizer Dashboard
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(`/organizer/organizations/${organization.id}`)}>
            <Settings className="w-4 h-4 mr-2" />
            Organization Settings
          </Button>
          <Button onClick={() => navigate(RoutePaths.CreateEvent)}>
            <CalendarPlus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </div>
      </div>

      {/* Events section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Your Events</h2>
        
        {isLoadingEvents ? (
          <div className="py-12 flex justify-center">
            <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event.id} className="group relative bg-card rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
                <div className="aspect-video bg-muted relative">
                  {event.imageUrl ? (
                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/5">
                      <CalendarDays className="w-10 h-10 text-primary/20" />
                    </div>
                  )}
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
                      <span className="truncate">{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2 shrink-0" />
                      <span className="truncate">{event.venue}, {event.city}</span>
                    </div>
                  </div>
                  
                  <div className="mt-auto flex items-center gap-2 pt-4 border-t">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/organizer/events/${event.id}/edit`)}>
                      Edit Event
                    </Button>
                    <Button variant="ghost" size="icon" title="View Public Page" asChild>
                      <Link to={`/events/${event.id}`} target="_blank">
                        <ExternalLink className="w-4 h-4" />
                      </Link>
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
            <h3 className="text-2xl font-bold tracking-tight mb-3">No Events Created Yet</h3>
            <p className="text-muted-foreground max-w-md mb-8 text-lg">
              You haven't created any events for your organization. Start hosting and engaging with your audience!
            </p>
            <Button size="lg" onClick={() => navigate(RoutePaths.CreateEvent)} className="h-14 px-8 text-lg shadow-lg">
              <CalendarPlus className="w-5 h-5 mr-2" />
              Create Your First Event
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
