import { Calendar, Tag, Lightbulb, TrendingUp } from "lucide-react"
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
    published: 0, // Mock, needs API support if desired
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
        subtext={<span className="text-muted-foreground">3 new this month</span>}
      />
      <StatCard
        iconBg="bg-rose-500/10"
        icon={<Lightbulb className="h-5 w-5 text-rose-600 dark:text-rose-400" />}
        label="Pending Suggestions"
        value={stats.pendingSuggestions}
        subtext={<span className="text-muted-foreground">Needs review</span>}
      />
    </div>
  )
}
