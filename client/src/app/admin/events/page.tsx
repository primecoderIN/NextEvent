import { useState } from "react"
import { useAdminEvents, type EventStatusFilter } from "@/shared/hooks/useAdminEvents"
import { useCategories } from "@/shared/hooks/useCategories"
import { useOrganizations } from "@/shared/hooks/useOrganizations"
import { useDebounce } from "@/shared/hooks/useDebounce"
import { EventsTable } from "@/features/events/components/EventTable"

export function AdminEventsPage() {
  const [activeTab, setActiveTab] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedOrganization, setSelectedOrganization] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [searchRaw, setSearchRaw] = useState("")
  const [page, setPage] = useState(1)

  const search = useDebounce(searchRaw, 400)

  const { data: categoriesData } = useCategories()
  const { data: orgsData } = useOrganizations(1, 100)
  const categories = categoriesData || []
  const organizations = orgsData?.items || []

  const { data: eventsPage, isFetching } = useAdminEvents({
    page,
    pageSize: 8,
    q: search,
    status: activeTab as EventStatusFilter,
    categoryId: selectedCategory,
    organizationId: selectedOrganization,
    city: selectedCity,
  })

  return (
    <div className="flex-1 flex flex-col min-h-0 p-6">
      <div className="mb-5 shrink-0">
        <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
          <span>Admin</span>
          <span>›</span>
          <span>Events</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Events</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage and monitor all events across organizations.
        </p>
      </div>

      <div className="flex-1 min-h-0 bg-card rounded-xl shadow-sm flex flex-col">
        <EventsTable 
          events={eventsPage?.items ?? []}
          isFetching={isFetching}
          totalPages={eventsPage?.totalPages ?? 1}
          totalCount={eventsPage?.totalCount ?? 0}
          page={page}
          setPage={setPage}
          searchRaw={searchRaw}
          setSearchRaw={setSearchRaw}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
          selectedOrganization={selectedOrganization}
          setSelectedOrganization={setSelectedOrganization}
          organizations={organizations}
          selectedCity={selectedCity}
          setSelectedCity={setSelectedCity}
        />
      </div>
    </div>
  )
}
