import { useState } from "react"
import {
  Calendar,
  Tag,
  Lightbulb,
  LayoutDashboard,
  Search,
  Filter,
  Download,
  Eye,
  Pencil,
  Ban,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Plus,
  ChevronDown,
} from "lucide-react"
import { useAdminEvents, type EventStatusFilter } from "@/hooks/useAdminEvents"
import { useCategorySuggestions } from "@/hooks/useCategorySuggestions"
import { useCategories } from "@/hooks/useCategories"
import { useCreateCategory } from "@/hooks/useCreateCategory"
import { useDebounce } from "@/hooks/useDebounce"
import { RoutePaths } from "@/constants/routePaths"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { getCreateCategorySchema, type CreateCategoryFormValues } from "@/features/admin/types"
import { useTranslation } from "react-i18next"

// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  icon: React.ReactNode
  iconBg: string
  label: string
  value: string | number
  subtext: React.ReactNode
}

function StatCard({ icon, iconBg, label, value, subtext }: StatCardProps) {
  return (
    <div className="flex-1 min-w-0 bg-card border border-border/40 rounded-2xl p-4 flex gap-3 items-start">
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground font-medium mb-0.5">{label}</p>
        <p className="text-2xl font-bold tracking-tight leading-none">{value}</p>
        <div className="mt-1 text-xs">{subtext}</div>
      </div>
    </div>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const lower = status?.toLowerCase() ?? ""
  if (lower === "published")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-500/10 text-green-600 dark:text-green-400">
        <CheckCircle className="h-3 w-3" /> Published
      </span>
    )
  if (lower === "reported")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400">
        <Clock className="h-3 w-3" /> Reported
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
      <XCircle className="h-3 w-3" /> Unpublished
    </span>
  )
}

// ─── Category Badge ───────────────────────────────────────────────────────────
const categoryColors: Record<string, string> = {
  business: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  music: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  sports: "bg-green-500/10 text-green-600 dark:text-green-400",
  exhibition: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  "food & beverage": "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  health: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
}

function CategoryBadge({ name }: { name: string }) {
  const color = categoryColors[name?.toLowerCase()] ?? "bg-primary/10 text-primary"
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${color}`}>
      {name}
    </span>
  )
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const STATUS_TABS: { label: string; value: EventStatusFilter }[] = [
  { label: "All Events",  value: "all" },
  { label: "Published",   value: "published" },
  { label: "Unpublished", value: "unpublished" },
  { label: "Reported",    value: "reported" },
]

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const { t } = useTranslation(["admin", "common"])
  const navigate = useNavigate()

  // ── Table state ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab]         = useState<EventStatusFilter>("all")
  const [page, setPage]                   = useState(1)
  const [searchRaw, setSearchRaw]         = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const search = useDebounce(searchRaw, 400)

  // ── Data ─────────────────────────────────────────────────────────────────────
  const { data: eventsPage, isFetching } = useAdminEvents({
    page,
    pageSize: 8,
    search,
    status: activeTab,
    categoryId: selectedCategory,
  })

  const { suggestions, isLoading: suggestionsLoading, approve, reject, isApproving, isRejecting } =
    useCategorySuggestions()

  const { data: categories } = useCategories()

  // ── Create Category form ─────────────────────────────────────────────────────
  const schema = getCreateCategorySchema(t as any)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateCategoryFormValues>({
    resolver: zodResolver(schema),
  })
  const { createCategory, loading: creating } = useCreateCategory()

  const onCreateCategory = async (values: CreateCategoryFormValues) => {
    try {
      await createCategory({ name: values.name, slug: values.slug, description: values.description })
      toast.success("Category created successfully")
      reset()
    } catch {
      toast.error("Failed to create category")
    }
  }

  // ── Pagination helpers ────────────────────────────────────────────────────────
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

  // ── Mock stats (replace with real API when available) ─────────────────────────
  const stats = {
    totalEvents: eventsPage?.totalCount ?? 0,
    published: 0,
    categories: categories?.length ?? 0,
    pendingSuggestions: suggestions.filter((s) => s.status === "Pending").length,
  }

  // ── Render ───────────────────────────────────────────────────────────────────
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
        <div className="flex flex-wrap gap-3 mb-6">
          <StatCard
            iconBg="bg-violet-500/10"
            icon={<Calendar className="h-5 w-5 text-violet-600 dark:text-violet-400" />}
            label="Total Events"
            value={stats.totalEvents.toLocaleString()}
            subtext={
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                <TrendingUp className="h-3 w-3" /> 12.5% this month
              </span>
            }
          />
          <StatCard
            iconBg="bg-emerald-500/10"
            icon={<Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
            label="Published Events"
            value={stats.published.toLocaleString()}
            subtext={
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                <TrendingUp className="h-3 w-3" /> 8.2% this month
              </span>
            }
          />
          <StatCard
            iconBg="bg-amber-500/10"
            icon={<Tag className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
            label="Total Categories"
            value={stats.categories}
            subtext={
              <span className="text-muted-foreground">3 new this month</span>
            }
          />
          <StatCard
            iconBg="bg-rose-500/10"
            icon={<Lightbulb className="h-5 w-5 text-rose-600 dark:text-rose-400" />}
            label="Pending Suggestions"
            value={stats.pendingSuggestions}
            subtext={
              <span className="text-muted-foreground">Needs review</span>
            }
          />
        </div>

        {/* ── Events Table ── */}
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
            {/* Search */}
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

            {/* Status filter */}
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

            {/* Category filter */}
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

            {/* Export button */}
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
                        {/* Event */}
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

                        {/* Organizer */}
                        <td className="px-4 py-3 text-muted-foreground">{event.venue || "—"}</td>

                        {/* Category */}
                        <td className="px-4 py-3">
                          <CategoryBadge name={event.category} />
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3 text-muted-foreground">
                          <p className="text-foreground font-medium">{dateStr}</p>
                          <p className="text-xs">{timeStr}</p>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <StatusBadge status={status} />
                        </td>

                        {/* Actions */}
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
      </div>

      {/* ── Right Panel ── */}
      <aside className="hidden xl:flex flex-col w-80 shrink-0 border-l border-border/40 p-5 gap-6 overflow-y-auto">

        {/* Create Category */}
        <div className="bg-card border border-border/40 rounded-2xl p-4">
          <h2 className="text-sm font-bold mb-4">Create Category</h2>
          <form onSubmit={handleSubmit(onCreateCategory)} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Category Name
              </label>
              <input
                {...register("name")}
                placeholder="Enter category name"
                className="w-full px-3 py-2 text-sm bg-muted/50 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.name && (
                <p className="text-xs text-destructive mt-1">{errors.name.message as string}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Description{" "}
                <span className="text-muted-foreground/60">(Optional)</span>
              </label>
              <input
                {...register("description")}
                placeholder="Enter description"
                className="w-full px-3 py-2 text-sm bg-muted/50 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Slug
              </label>
              <input
                {...register("slug")}
                placeholder="e.g. tech-conference"
                className="w-full px-3 py-2 text-sm bg-muted/50 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.slug && (
                <p className="text-xs text-destructive mt-1">{errors.slug.message as string}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)" }}
            >
              <Plus className="h-4 w-4" />
              {creating ? "Creating…" : "Create Category"}
            </button>
          </form>
        </div>

        {/* Category Suggestions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold">Category Suggestions</h2>
            <button
              onClick={() => navigate(RoutePaths.AdminCategorySuggestions)}
              className="text-xs text-primary font-medium hover:underline"
            >
              View All
            </button>
          </div>

          {suggestionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : suggestions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No pending suggestions</p>
          ) : (
            <div className="space-y-3">
              {suggestions.slice(0, 5).map((s) => {
                const ago = new Date(s.createdAt).toLocaleDateString("en-US", {
                  month: "short", day: "numeric",
                })
                return (
                  <div key={s.id} className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-primary truncate">{s.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        Suggested by: {s.suggestedByDisplayName}
                      </p>
                      <p className="text-xs text-muted-foreground">{ago}</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => approve(s.id).catch(() => toast.error("Failed to approve"))}
                        disabled={isApproving}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 transition-colors disabled:opacity-60"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => reject(s.id).catch(() => toast.error("Failed to reject"))}
                        disabled={isRejecting}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {suggestions.length > 5 && (
            <button
              onClick={() => navigate(RoutePaths.AdminCategorySuggestions)}
              className="mt-4 w-full text-xs text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              View All Suggestions →
            </button>
          )}
        </div>
      </aside>
    </div>
  )
}
