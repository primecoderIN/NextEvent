import { NavLink } from "react-router-dom"
import {
  CalendarDays,
  LayoutDashboard,
  Calendar,
  Tag,
  Lightbulb,
  Users,
  Building2,
  BarChart3,
  Settings,
  ScrollText,
  ShieldCheck,
} from "lucide-react"
import { RoutePaths } from "@/constants/routePaths"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard",             to: RoutePaths.AdminDashboard },
  { icon: Calendar,        label: "Events",                to: RoutePaths.AdminEvents },
  { icon: Tag,             label: "Categories",            to: RoutePaths.AdminCategories },
  { icon: Lightbulb,       label: "Category Suggestions",  to: RoutePaths.AdminCategorySuggestions },
  { icon: Users,           label: "Users",                 to: RoutePaths.AdminUsers },
  { icon: Building2,       label: "Organizations",         to: RoutePaths.AdminOrganizations },
  { icon: BarChart3,       label: "Reports",               to: RoutePaths.AdminReports },
  { icon: Settings,        label: "Settings",              to: RoutePaths.AdminSettings },
  { icon: ScrollText,      label: "Activity Logs",         to: RoutePaths.AdminActivityLogs },
]

export function AdminSidebar() {
  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-56 border-r border-border/40 bg-background z-40">
      {/* Logo */}
      <div className="flex flex-col justify-center h-16 px-4 border-b border-border/40 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center">
            <CalendarDays className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-tight">NextEvent</span>
        </div>
      </div>

      {/* Admin badge */}
      <div className="px-4 py-2.5 border-b border-border/40 shrink-0">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 w-fit">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold text-primary">Admin Panel</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`
            }
          >
            <item.icon className="h-4.5 w-4.5 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Back to site */}
      <div className="px-3 py-3 border-t border-border/40 shrink-0">
        <NavLink
          to={RoutePaths.Home}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <CalendarDays className="h-4.5 w-4.5 shrink-0" />
          Back to Site
        </NavLink>
      </div>
    </aside>
  )
}
