import { Calendar, Tag, Lightbulb, Users } from "lucide-react"
import { StatCard } from "./StatCard"
import { useAdminEvents } from "@/shared/hooks/useAdminEvents"
import { useCategories } from "@/shared/hooks/useCategories"
import { useCategorySuggestions } from "@/shared/hooks/useCategorySuggestions"
import { useUsers } from "@/shared/hooks/useUsers"

export function DashboardStats() {
  const { data: eventsPage } = useAdminEvents({ page: 1, pageSize: 1 }) // Just need totalCount
  const { data: categories } = useCategories()
  const { suggestions } = useCategorySuggestions()
  const { data: usersPage } = useUsers(1, 1)

  const stats = {
    totalEvents: eventsPage?.totalCount ?? 0,
    categories: categories?.length ?? 0,
    pendingSuggestions: suggestions.filter((s) => s.status === "Pending").length,
    totalUsers: usersPage?.totalCount ?? 0,
  }

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <StatCard
        iconBg="bg-blue-500/10"
        icon={<Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
        label="Total Users"
        value={stats.totalUsers.toLocaleString()}
      />
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
