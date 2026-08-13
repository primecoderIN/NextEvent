import { useState } from "react"
import { LayoutDashboard } from "lucide-react"
import { DashboardStats } from "./DashboardStats"
import { EventsTable } from "@/features/events/components/EventTable"
import { CreateCategoryWidget } from "./CreateCategoryWidget"
import { CategorySuggestionsWidget } from "./CategorySuggestionsWidget"
import { useAdminEvents, type EventStatusFilter } from "@/shared/hooks/useAdminEvents"
import { useCategories } from "@/shared/hooks/useCategories"
import { useDebounce } from "@/shared/hooks/useDebounce"

export function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<EventStatusFilter>("all")
  const [page, setPage] = useState(1)
  const [searchRaw, setSearchRaw] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  
  const search = useDebounce(searchRaw, 400)

  const { data: eventsPage, isFetching } = useAdminEvents({
    page,
    pageSize: 8,
    q: search,
    status: activeTab,
    categoryId: selectedCategory,
  })

  const { data: categories } = useCategories()

  return (
    <div className="flex gap-0 min-h-[calc(100vh-3.5rem)]">
      {/* ── Left: main dashboard area ── */}
      <div className="flex-1 min-w-0 p-6 overflow-auto">
        {/* Page title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <LayoutDashboard className="h-4 w-4" />
            <span>Admin</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        </div>

        {/* ── Stat Cards ── */}
        <DashboardStats />

        {/* ── Events Table ── */}
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
          setActiveTab={setActiveTab as any}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
        />
      </div>

      {/* ── Right Panel ── */}
      <aside className="hidden xl:flex flex-col w-80 shrink-0 border-l border-border/40 p-5 gap-6 overflow-y-auto">
        <CreateCategoryWidget />
        <CategorySuggestionsWidget />
      </aside>
    </div>
  )
}
