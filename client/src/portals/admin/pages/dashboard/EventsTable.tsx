import { useState } from "react"
import { Search, ChevronDown, Download, Calendar, Eye, Pencil, Ban, ChevronLeft, ChevronRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { RoutePaths } from "@/constants/routePaths"
import { useAdminEvents, type EventStatusFilter } from "@/hooks/useAdminEvents"
import { useCategories } from "@/hooks/useCategories"
import { useDebounce } from "@/hooks/useDebounce"
import { StatusBadge } from "./StatusBadge"
import { CategoryBadge } from "./CategoryBadge"

const STATUS_TABS: { label: string; value: EventStatusFilter }[] = [
  { label: "All Events", value: "all" },
  { label: "Published", value: "published" },
  { label: "Unpublished", value: "unpublished" },
  { label: "Reported", value: "reported" },
]

export function EventsTable() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<EventStatusFilter>("all")
  const [page, setPage] = useState(1)
  const [searchRaw, setSearchRaw] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  
  const search = useDebounce(searchRaw, 400)

  const { data: eventsPage, isFetching } = useAdminEvents({
    page,
    pageSize: 8,
    search,
    status: activeTab,
    categoryId: selectedCategory,
  })

  const { data: categories } = useCategories()

  const totalPages = eventsPage?.totalPages ?? 1
  const events = eventsPage?.items ?? []

  const handleTabChange = (tab: EventStatusFilter) => {
    setActiveTab(tab)
    setPage(1)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchRaw(e.target.value)
    setPage(1)
  }

  return (
    <div className="bg-card border border-border/40 rounded-2xl overflow-hidden">
      {/* Tabs */}
      <div className="flex items-center gap-0 border-b border-border/40 px-4 pt-4">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.value
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-border/40">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="search"
            value={searchRaw}
            onChange={handleSearchChange}
            placeholder="Search events by title, organizer..."
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-muted/50 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="relative">
          <select
            value={activeTab}
            onChange={(e) => handleTabChange(e.target.value as EventStatusFilter)}
            className="appearance-none pl-3 pr-8 py-1.5 text-sm bg-muted/50 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="unpublished">Unpublished</option>
            <option value="reported">Reported</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setPage(1) }}
            className="appearance-none pl-3 pr-8 py-1.5 text-sm bg-muted/50 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        </div>

        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)" }}
        >
          <Download className="h-3.5 w-3.5" />
          Export
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/40 bg-muted/30">
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Event</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Organizer</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Category</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Date</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y divide-border/30 transition-opacity duration-150 ${isFetching ? "opacity-60" : "opacity-100"}`}>
            {events.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  {isFetching ? "Loading…" : "No events found."}
                </td>
              </tr>
            ) : (
              events.map((event, idx) => {
                const evtDate = new Date(event.date)
                const dateStr = evtDate.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })
                const timeStr = evtDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
                const status = event.isCancelled ? "unpublished" : "published"
                const shortId = `EVT-${String(idx + 1 + (page - 1) * 8).padStart(4, "0")}`

                return (
                  <tr key={event.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 overflow-hidden">
                          <Calendar className="h-5 w-5 text-primary/60" />
                        </div>
                        <div>
                          <p className="font-semibold leading-tight group-hover:text-primary transition-colors">
                            {event.title}
                          </p>
                          <p className="text-xs text-muted-foreground">ID: {shortId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{event.venue || "—"}</td>
                    <td className="px-4 py-3">
                      <CategoryBadge name={event.category} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <p className="text-foreground font-medium">{dateStr}</p>
                      <p className="text-xs">{timeStr}</p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => navigate(RoutePaths.EventDetailLink(event.id))}
                          title="View"
                          className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => navigate(RoutePaths.EventEditLink(event.id))}
                          title="Edit"
                          className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          title="Disable"
                          className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border/40">
        <p className="text-xs text-muted-foreground">
          Showing {((page - 1) * 8) + 1} to {Math.min(page * 8, eventsPage?.totalCount ?? 0)} of{" "}
          {(eventsPage?.totalCount ?? 0).toLocaleString()} events
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const p = i + 1
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`h-7 w-7 rounded-lg text-xs font-semibold transition-colors ${
                  page === p
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {p}
              </button>
            )
          })}
          {totalPages > 5 && (
            <>
              <span className="text-xs text-muted-foreground px-1">…</span>
              <button
                onClick={() => setPage(totalPages)}
                className={`h-7 w-7 rounded-lg text-xs font-semibold transition-colors ${
                  page === totalPages
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {totalPages}
              </button>
            </>
          )}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
