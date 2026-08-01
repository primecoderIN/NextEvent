import { useParams } from "react-router-dom"
import { useOrganizationProfile } from "@/shared/hooks/useOrganizationProfile"
import { formatEventDate } from "@/shared/utils/date"
import { Building2, Globe, Mail, Phone, CalendarDays, MapPin } from "lucide-react"

export function OrganizationProfilePage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: profile, isLoading, isError } = useOrganizationProfile(slug)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-6">
          <Building2 className="w-10 h-10 text-amber-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Organization Pending Approval</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          This organization is currently under review by our admin team or does not exist yet. It will become publicly visible once approved.
        </p>
        <a 
          href="/"
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm transition-colors hover:bg-primary/90"
        >
          Return to Home
        </a>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Cover Image */}
      <div className="h-64 md:h-80 w-full bg-muted relative overflow-hidden">
        {profile.coverImageUrl ? (
          <img 
            src={profile.coverImageUrl} 
            alt={`${profile.name} cover`} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-linear-to-r from-primary/10 to-primary/5">
            <Building2 className="w-24 h-24 text-primary/20" />
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl -mt-20 relative z-10 pb-20">
        <div className="bg-card rounded-xl shadow-md border p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-end">
          {/* Logo */}
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl border-4 border-card bg-muted shadow-sm overflow-hidden shrink-0 flex items-center justify-center">
            {profile.logoUrl ? (
              <img src={profile.logoUrl} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              <Building2 className="w-16 h-16 text-muted-foreground" />
            )}
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{profile.name}</h1>
              {profile.ownerDisplayName && (
                <p className="text-muted-foreground mt-1">Organized by {profile.ownerDisplayName}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {profile.websiteUrl && (
                <a href={profile.websiteUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
                  <Globe className="w-4 h-4" /> {new URL(profile.websiteUrl).hostname}
                </a>
              )}
              {profile.contactEmail && (
                <a href={`mailto:${profile.contactEmail}`} className="flex items-center gap-1 hover:text-primary transition-colors">
                  <Mail className="w-4 h-4" /> Contact
                </a>
              )}
              {profile.contactPhone && (
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" /> {profile.contactPhone}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold">About</h2>
              <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-muted-foreground">
                {profile.description ? (
                  <p className="whitespace-pre-wrap">{profile.description}</p>
                ) : (
                  <p className="italic">No description provided.</p>
                )}
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-bold">Upcoming Events</h2>
              {profile.upcomingEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {profile.upcomingEvents.map((event) => (
                    <div key={event.id} className="group relative bg-card rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-all flex flex-col">
                      <div className="aspect-video bg-muted relative overflow-hidden">
                        {event.bannerImageUrl ? (
                          <img src={event.bannerImageUrl} alt={event.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/5 to-primary/10">
                            <CalendarDays className="w-12 h-12 text-primary/20" />
                          </div>
                        )}
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <h3 className="font-semibold text-lg line-clamp-1 mb-2 group-hover:text-primary transition-colors">{event.title}</h3>
                        <div className="space-y-2 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="w-4 h-4" />
                            {formatEventDate((event as any).date, (event as any).timeZoneId)}
                          </div>
                          {(event.city || event.venueName) && (
                            <div className="flex items-center gap-2 line-clamp-1">
                              <MapPin className="w-4 h-4 shrink-0" />
                              <span>{event.venueName}{event.venueName && event.city ? ', ' : ''}{event.city}</span>
                            </div>
                          )}
                        </div>
                        <a href={`/events/${event.id}`} className="mt-auto block w-full text-center py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md text-sm font-medium transition-colors">
                          View Details
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-muted/50 rounded-xl p-8 text-center text-muted-foreground border border-dashed">
                  No upcoming events scheduled at the moment.
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
