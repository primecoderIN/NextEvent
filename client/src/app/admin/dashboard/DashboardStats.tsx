import { Calendar, Tag, Lightbulb } from "lucide-react"
import { StatCard } from "./StatCard"
import { useAdminEvents } from "@/shared/hooks/useAdminEvents"
import { useCategories } from "@/shared/hooks/useCategories"
import { useCategorySuggestions } from "@/shared/hooks/useCategorySuggestions"

export function DashboardStats() {
  const { data: eventsPage } = useAdminEvents({ page: 1, pageSize: 1 }) // Just need totalCount
  const { data: categories } = useCategories()
  const { suggestions } = useCategorySuggestions()

  const stats = {
    totalEvents: eventsPage?.totalCount ?? 0,
    categories: categories?.length ?? 0,
    pendingSuggestions: suggestions.filter((s) => s.status === "Pending").length,
  }

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <StatCard
        iconBg="bg-violet-500/10"
        icon={<Calendar className="h-5 w-5 text-violet-600 dark:text-violet-400" />}
        label="Total Events"
        value={stats.totalEvents.toLocaleString()}
      />
      <StatCard
        iconBg="bg-amber-500/10"
        icon={<Tag className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
        label="Total Categories"
        value={stats.categories.toLocaleString()}
      />
      <StatCard
        iconBg="bg-rose-500/10"
        icon={<Lightbulb className="h-5 w-5 text-rose-600 dark:text-rose-400" />}
        label="Pending Suggestions"
        value={stats.pendingSuggestions.toLocaleString()}
        subtext={<span className="text-muted-foreground">Needs review</span>}
      />
    </div>
  )
}
