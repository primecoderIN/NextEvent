import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useOrganizationDetail } from "@/shared/hooks/useOrganizationDetail"
import { useAdminEvents, type EventStatusFilter } from "@/shared/hooks/useAdminEvents"
import { Building2, ArrowLeft, Users, CalendarDays, FileText } from "lucide-react"
import { OrganizationDetailsView } from "@/features/organizations/components/OrganizationDetailsView"
import { OrganizationMembersView } from "@/features/organizations/components/OrganizationMembersView"
import { EventsTable } from "@/features/events/components/EventTable"
import { Button } from "@/shared/ui/button"

export function AdminOrganizationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  // Events State
  const [eventsPage, setEventsPage] = useState(1)
  const [eventsSearch, setEventsSearch] = useState("")
  const [eventsStatus, setEventsStatus] = useState<EventStatusFilter>("all")
  const [eventsCategory, setEventsCategory] = useState("")

  const { data: organization, isLoading, isError } = useOrganizationDetail(id)
  
  const { data: eventsData, isFetching: eventsFetching } = useAdminEvents({
    page: eventsPage,
    pageSize: 8,
    q: eventsSearch,
    status: eventsStatus,
    categoryId: eventsCategory,
    organizationId: id,
  })

  if (isLoading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (isError || !organization) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
        <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Organization Not Found</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          The requested organization could not be found or you do not have permission to view it.
        </p>
        <Button onClick={() => navigate("/admin/organizations")}>
          Back to Organizations
        </Button>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 overflow-auto max-w-7xl mx-auto w-full">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/organizations")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Building2 className="h-4 w-4" />
            <span>Admin / Organizations / Details</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Organization Profile</h1>
        </div>
      </div>

      <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
        
        {/* Overview Section */}
        <section>
          <div className="flex items-center gap-2 mb-4 text-lg font-semibold">
            <FileText className="w-5 h-5 text-primary" />
            <h2>Overview</h2>
          </div>
          <OrganizationDetailsView organization={organization} />
        </section>
        
        {/* Members Section */}
        <section>
          <div className="flex items-center gap-2 mb-4 text-lg font-semibold">
            <Users className="w-5 h-5 text-primary" />
            <h2>Members</h2>
          </div>
          <div className="bg-card border border-border/40 rounded-2xl overflow-hidden">
             <OrganizationMembersView organization={organization} />
          </div>
        </section>
        
        {/* Events Section */}
        <section>
          <div className="flex items-center gap-2 mb-4 text-lg font-semibold">
            <CalendarDays className="w-5 h-5 text-primary" />
            <h2>Events</h2>
          </div>
          <EventsTable
            events={eventsData?.items || []}
            isFetching={eventsFetching}
            page={eventsPage}
            setPage={setEventsPage}
            totalPages={eventsData?.totalPages || 1}
            totalCount={eventsData?.totalCount || 0}
            searchRaw={eventsSearch}
            setSearchRaw={setEventsSearch}
            activeTab={eventsStatus}
            setActiveTab={(val) => setEventsStatus(val as EventStatusFilter)}
            selectedCategory={eventsCategory}
            setSelectedCategory={setEventsCategory}
            selectedOrganization={undefined}
            setSelectedOrganization={undefined}
            organizations={[]}
          />
        </section>

      </div>
    </div>
  )
}
