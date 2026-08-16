import { Search, Download, Calendar, ChevronLeft, ChevronRight, EyeOff, Eye } from "lucide-react"
import { StatusBadge } from "../EventStatusBadge"
import { CategoryBadge } from "@/features/categories/components/CategoryBadge"
import { formatEventDate, formatEventTime } from "@/shared/utils/date"
import { useSuspendEvent } from "@/shared/hooks/useSuspendEvent"
import { useUnsuspendEvent } from "@/shared/hooks/useUnsuspendEvent"
import { Link } from "react-router-dom"
import { RoutePaths } from "@/shared/constants/routePaths"
import { Input } from "@/shared/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"

const STATUS_TABS: { label: string; value: string }[] = [
  { label: "All Events", value: "all" },
  { label: "Published", value: "published" },
  { label: "Unpublished", value: "unpublished" },
  { label: "Reported", value: "reported" },
]

export interface EventsTableProps {
  events: any[]
  isFetching?: boolean
  totalPages?: number
  totalCount?: number
  page: number
  setPage: (val: number | ((prev: number) => number)) => void
  searchRaw: string
  setSearchRaw: (val: string) => void
  activeTab: string
  setActiveTab: (val: string) => void
  selectedCategory: string
  setSelectedCategory: (val: string) => void
  categories?: any[]
  selectedOrganization?: string
  setSelectedOrganization?: (val: string) => void
  organizations?: any[]
  selectedCity?: string
  setSelectedCity?: (val: string) => void
}

export function EventsTable({
  events,
  isFetching = false,
  totalPages = 1,
  totalCount = 0,
  page,
  setPage,
  searchRaw,
  setSearchRaw,
  activeTab,
  setActiveTab,
  selectedCategory,
  setSelectedCategory,
  categories,
  selectedOrganization,
  setSelectedOrganization,
  organizations,
  selectedCity,
  setSelectedCity,
}: EventsTableProps) {
  const { suspendEvent, loading: suspending } = useSuspendEvent()
  const { unsuspendEvent, loading: unsuspending } = useUnsuspendEvent()

  const handleTabChange = (tab: string) => {
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground z-10" />
          <Input
            type="search"
            value={searchRaw}
            onChange={handleSearchChange}
            placeholder="Search events by title, organizer..."
            className="w-full pl-8 h-8 bg-muted/50 rounded-lg text-sm"
          />
        </div>

        <div className="relative">
          <Select value={activeTab} onValueChange={(val) => handleTabChange(val)}>
            <SelectTrigger className="w-35 h-8 bg-muted/50 rounded-lg text-sm">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="unpublished">Unpublished</SelectItem>
              <SelectItem value="reported">Reported</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative">
          <Select value={selectedCategory || "all"} onValueChange={(val) => { setSelectedCategory(val === "all" ? "" : val); setPage(1) }}>
            <SelectTrigger className="w-37.5 h-8 bg-muted/50 rounded-lg text-sm">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {setSelectedOrganization && organizations && (
          <div className="relative">
            <Select value={selectedOrganization || "all"} onValueChange={(val) => { setSelectedOrganization(val === "all" ? "" : val); setPage(1) }}>
              <SelectTrigger className="w-40 h-8 bg-muted/50 rounded-lg text-sm">
                <SelectValue placeholder="All Organizations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Organizations</SelectItem>
                {organizations.map((o) => (
                  <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {setSelectedCity && (
          <div className="relative">
            <Select value={selectedCity || "all"} onValueChange={(val) => { setSelectedCity(val === "all" ? "" : val); setPage(1) }}>
              <SelectTrigger className="w-32.5 h-8 bg-muted/50 rounded-lg text-sm">
                <SelectValue placeholder="All Cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                <SelectItem value="Bangalore">Bangalore</SelectItem>
                <SelectItem value="Mumbai">Mumbai</SelectItem>
                <SelectItem value="Delhi">Delhi</SelectItem>
                <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                <SelectItem value="Chennai">Chennai</SelectItem>
                <SelectItem value="Pune">Pune</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

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
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Event</TableHead>
              <TableHead>Organizer</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Reports</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="transition-opacity duration-150">
            {isFetching ? (
              Array.from({ length: 5 }).map((_, i) => (
                <EventTableRowSkeleton key={i} />
              ))
            ) : events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No events found.
                </TableCell>
              </TableRow>
            ) : (
              events.map((event) => {
                const dateStr = formatEventDate(event.date, event.timeZoneId)
                const timeStr = formatEventTime(event.date, event.timeZoneId)
                const status = event.isSuspended ? "unpublished" : event.isCancelled ? "cancelled" : "published"
                const shortId = `EVT-${event.id.substring(0, 6).toUpperCase()}`
                const isReported = event.reportCount > 0

                return (
                  <TableRow key={event.id} className={`group ${isReported ? "border-l-4 border-l-red-500" : "border-l-4 border-l-transparent"}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                          <Calendar className="h-5 w-5 text-primary/60" />
                        </div>
                        <div>
                          <p className="font-semibold leading-tight group-hover:text-primary transition-colors">
                            {event.title}
                          </p>
                          <p className="text-xs text-muted-foreground">ID: {shortId}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{event.organizationName || "—"}</TableCell>
                    <TableCell>
                      <CategoryBadge name={event.category} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <p className="text-foreground font-medium">{dateStr}</p>
                      <p className="text-xs">{timeStr}</p>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={status} />
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`font-semibold ${event.reportCount > 0 ? "text-destructive" : "text-muted-foreground"}`}>
                        {event.reportCount || 0}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={RoutePaths.AdminEventDetailLink(event.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center h-7 w-7 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          title="View Event Details (Opens in new tab)"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        {!event.isCancelled && (
                          event.isSuspended ? (
                            <button
                              onClick={() => unsuspendEvent(event.id)}
                              disabled={unsuspending}
                              className="inline-flex items-center justify-center gap-1.5 w-28 py-1.5 text-xs font-medium rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Publish Event"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Publish
                            </button>
                          ) : (
                            <button
                              onClick={() => suspendEvent(event.id)}
                              disabled={suspending}
                              className="inline-flex items-center justify-center gap-1.5 w-28 py-1.5 text-xs font-medium rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Unpublish Event"
                            >
                              <EyeOff className="h-3.5 w-3.5" />
                              Unpublish
                            </button>
                          )
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border/40">
        <p className="text-xs text-muted-foreground">
          Showing {((page - 1) * 8) + 1} to {Math.min(page * 8, totalCount)} of{" "}
          {totalCount.toLocaleString()} events
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

export function EventTableRowSkeleton() {
  return (
    <TableRow className="border-l-4 border-l-transparent animate-pulse">
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-muted shrink-0" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-3 w-16 bg-muted rounded" />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="h-4 w-24 bg-muted rounded" />
      </TableCell>
      <TableCell>
        <div className="h-6 w-20 bg-muted rounded-full" />
      </TableCell>
      <TableCell>
        <div className="space-y-2">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-3 w-12 bg-muted rounded" />
        </div>
      </TableCell>
      <TableCell>
        <div className="h-6 w-20 bg-muted rounded-full" />
      </TableCell>
      <TableCell className="text-center">
        <div className="h-4 w-6 mx-auto bg-muted rounded" />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <div className="h-7 w-7 rounded-lg bg-muted" />
          <div className="h-7 w-28 rounded-lg bg-muted" />
        </div>
      </TableCell>
    </TableRow>
  )
}
