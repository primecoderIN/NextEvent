import { useState, useEffect, useRef, useCallback } from "react"
import {
  Tag, Building2, MapPin, Clock, CalendarDays,
  Loader2, X, Eye, EyeOff, MoreVertical, AlertTriangle
} from "lucide-react"
import { useInfiniteAdminEvents, type EventStatusFilter } from "@/shared/hooks/useAdminEvents"
import { useCategories } from "@/shared/hooks/useCategories"
import { useOrganizations } from "@/shared/hooks/useOrganizations"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { Input } from "@/shared/ui/input"
import { Button } from "@/shared/ui/button"
import { useNavigate } from "react-router-dom"
import { RoutePaths } from "@/shared/constants/routePaths"
import { getEventImage } from "@/app/(public)/widgets/common/helpers"
import { formatEventDate, formatEventTime } from "@/shared/utils/date"
import type { Event } from "@/types/Event"

// ─── Category badge colours ──────────────────────────────────────────────────
const CATEGORY_PILL: Record<string, string> = {
  music:     "bg-blue-100 text-blue-700",
  nightlife: "bg-violet-100 text-violet-700",
  workshop:  "bg-amber-100 text-amber-700",
  workshops: "bg-amber-100 text-amber-700",
  sports:    "bg-green-100 text-green-700",
  business:  "bg-slate-100 text-slate-700",
  other:     "bg-gray-100 text-gray-600",
}
function getCategoryPill(category: string) {
  return CATEGORY_PILL[category?.toLowerCase()] ?? "bg-primary/10 text-primary"
}

// ─── Row action menu ─────────────────────────────────────────────────────────
function RowActionsMenu({ event }: { event: Event }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-border bg-popover shadow-lg py-1 z-50 animate-in fade-in-0 zoom-in-95">
          <button
            onClick={() => { navigate(RoutePaths.AdminEventDetailLink(event.id)); setOpen(false) }}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
          >
            <Eye className="h-4 w-4 text-muted-foreground" />
            View event
          </button>
          <button
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
          >
            <EyeOff className="h-4 w-4 text-muted-foreground" />
            Unpublish event
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Filter chip ─────────────────────────────────────────────────────────────
function FilterSelect({
  icon,
  placeholder,
  value,
  onValueChange,
  children,
}: {
  icon: React.ReactNode
  placeholder: string
  value: string
  onValueChange: (v: string) => void
  children: React.ReactNode
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="h-9 gap-1.5 px-3 rounded-lg border border-border/70 bg-background text-sm font-medium w-auto min-w-[148px]">
        <span className="text-muted-foreground shrink-0">{icon}</span>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>{children}</SelectContent>
    </Select>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export function AdminEventsPage() {
  const [status, setStatus] = useState<EventStatusFilter>("all")
  const [categoryId, setCategoryId] = useState("all")
  const [organizationId, setOrganizationId] = useState("all")
  const [city, setCity] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const { data: categoriesData } = useCategories()
  const { data: orgsData } = useOrganizations(1, 100)
  const categories = categoriesData || []
  const organizations = orgsData?.items || []

  // Debounce city
  const [debouncedCity, setDebouncedCity] = useState("")
  useEffect(() => {
    const h = setTimeout(() => setDebouncedCity(city), 500)
    return () => clearTimeout(h)
  }, [city])

  // Count active filters (excluding defaults)
  const activeFilterCount = [
    status !== "all",
    categoryId !== "all",
    organizationId !== "all",
    city !== "",
    dateFrom !== "",
    dateTo !== "",
  ].filter(Boolean).length

  const handleResetFilters = () => {
    setStatus("all")
    setCategoryId("all")
    setOrganizationId("all")
    setCity("")
    setDateFrom("")
    setDateTo("")
  }

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useInfiniteAdminEvents({
      pageSize: 20,
      status,
      categoryId,
      organizationId,
      city: debouncedCity,
      dateFrom: dateFrom ? new Date(dateFrom).toISOString() : undefined,
      dateTo: dateTo ? new Date(dateTo).toISOString() : undefined,
    })

  // Intersection observer
  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastRowRef = useCallback(
    (node: HTMLTableRowElement | null) => {
      if (isFetchingNextPage) return
      if (observerRef.current) observerRef.current.disconnect()
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) fetchNextPage()
      })
      if (node) observerRef.current.observe(node)
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  )

  const allEvents = data?.pages.flatMap((p) => p.items) ?? []

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }
  const toggleAll = () => {
    if (selectedIds.size === allEvents.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(allEvents.map((e) => e.id)))
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 p-6">
      {/* ── Header ── */}
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

      {/* ── Filter bar ── */}
      <div className="shrink-0 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Category */}
          <FilterSelect
            icon={<Tag className="h-3.5 w-3.5" />}
            placeholder="All Categories"
            value={categoryId}
            onValueChange={setCategoryId}
          >
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </FilterSelect>

          {/* Organization */}
          <FilterSelect
            icon={<Building2 className="h-3.5 w-3.5" />}
            placeholder="All Organizations"
            value={organizationId}
            onValueChange={setOrganizationId}
          >
            <SelectItem value="all">All Organizations</SelectItem>
            {organizations.map((o) => (
              <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
            ))}
          </FilterSelect>

          {/* City */}
          <FilterSelect
            icon={<MapPin className="h-3.5 w-3.5" />}
            placeholder="All Cities"
            value={city || "all"}
            onValueChange={(v) => setCity(v === "all" ? "" : v)}
          >
            <SelectItem value="all">All Cities</SelectItem>
            <SelectItem value="Bangalore">Bangalore</SelectItem>
            <SelectItem value="Mumbai">Mumbai</SelectItem>
            <SelectItem value="Delhi">Delhi</SelectItem>
            <SelectItem value="Hyderabad">Hyderabad</SelectItem>
            <SelectItem value="Chennai">Chennai</SelectItem>
            <SelectItem value="Pune">Pune</SelectItem>
          </FilterSelect>

          {/* Status */}
          <FilterSelect
            icon={<Clock className="h-3.5 w-3.5" />}
            placeholder="All Statuses"
            value={status}
            onValueChange={(v) => setStatus(v as EventStatusFilter)}
          >
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="unpublished">Unpublished</SelectItem>
            <SelectItem value="reported">Reported</SelectItem>
          </FilterSelect>

          {/* Date From */}
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-9 pl-8 pr-3 rounded-lg border-border/70 text-sm w-[155px] [color-scheme:light] dark:[color-scheme:dark]"
            />
          </div>

          <span className="text-muted-foreground text-sm select-none">–</span>

          {/* Date To */}
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-9 pl-8 pr-3 rounded-lg border-border/70 text-sm w-[155px] [color-scheme:light] dark:[color-scheme:dark]"
            />
          </div>

          {/* Clear all */}
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="h-9 gap-1.5 text-primary hover:text-primary hover:bg-primary/10 font-medium"
            >
              Clear all ({activeFilterCount})
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="flex-1 min-h-0 bg-card rounded-xl border border-border/50 shadow-sm flex flex-col overflow-hidden">
        <div className="overflow-auto flex-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allEvents.length > 0 && selectedIds.size === allEvents.length}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Event
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Reports
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      Loading events…
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-destructive">
                    Failed to load events.
                  </td>
                </tr>
              ) : allEvents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-muted-foreground">
                    No events found.
                  </td>
                </tr>
              ) : (
                allEvents.map((event, index) => {
                  const isLast = index === allEvents.length - 1
                  const category = event.category || "other"
                  const imgSrc = getEventImage(category, event.title, "thumb")
                  const dateStr = formatEventDate(event.date, event.timeZoneId)
                  const timeStr = formatEventTime(event.date, event.timeZoneId)
                  const isSelected = selectedIds.has(event.id)

                  return (
                    <tr
                      key={event.id}
                      ref={isLast ? lastRowRef : null}
                      className={`transition-colors hover:bg-muted/30 ${isSelected ? "bg-primary/5" : ""}`}
                    >
                      {/* Checkbox */}
                      <td className="w-10 px-4 py-3.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(event.id)}
                          className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                        />
                      </td>

                      {/* Event */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={imgSrc}
                            alt={event.title}
                            className="h-11 w-16 rounded-lg object-cover shrink-0 bg-muted"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground leading-snug line-clamp-1">
                              {event.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              ID: EVT-{event.id.replace(/-/g, "").slice(0, 5).toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Organization */}
                      <td className="px-4 py-3.5 text-sm text-foreground">
                        {event.organizationName ? (
                          <span>{event.organizationName}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getCategoryPill(category)}`}
                        >
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </span>
                      </td>

                      {/* Schedule */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1 text-sm">
                          <div className="flex items-center gap-1.5 text-foreground">
                            <CalendarDays className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span>{dateStr}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                            <Clock className="h-3 w-3 shrink-0" />
                            <span>{timeStr}</span>
                            {event.city && (
                              <>
                                <span className="mx-0.5">·</span>
                                <span>{event.city}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        {event.isSuspended ? (
                          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                            <span className="h-2 w-2 rounded-full bg-muted-foreground shrink-0" />
                            Unpublished
                          </span>
                        ) : event.isCancelled ? (
                          <span className="inline-flex items-center gap-1.5 text-sm text-destructive">
                            <span className="h-2 w-2 rounded-full bg-destructive shrink-0" />
                            Cancelled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                            Published
                          </span>
                        )}
                      </td>

                      {/* Reports */}
                      <td className="px-4 py-3.5">
                        {event.reportCount > 0 ? (
                          <span className="inline-flex items-center gap-1.5 text-sm text-amber-600 font-medium">
                            <AlertTriangle className="h-4 w-4" />
                            {event.reportCount} {event.reportCount === 1 ? 'Report' : 'Reports'}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <RowActionsMenu event={event} />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Loading more indicator */}
        {(isFetchingNextPage || hasNextPage) && !isLoading && (
          <div className="shrink-0 border-t border-border/40 py-4 text-center">
            {isFetchingNextPage ? (
              <div className="flex items-center justify-center gap-2 text-sm text-primary">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="font-medium">Loading more events…</span>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Scroll to load more</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
