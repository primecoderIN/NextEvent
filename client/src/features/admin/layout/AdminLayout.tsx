import { Outlet } from "react-router-dom"
import { useState } from "react"
import { Bell, Search, User, ChevronDown, LogOut, Menu, X } from "lucide-react"
import { useAuth } from "@/features/auth/AuthContext"
import { RoutePaths } from "@/constants/routePaths"
import { AdminSidebar } from "./AdminSidebar"
import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Calendar,
  Tag,
  Lightbulb,
  Users,
  Building2,
  BarChart3,
  Settings,
  ScrollText,
  CalendarDays,
  ShieldCheck,
} from "lucide-react"

const mobileNavItems = [
  { icon: LayoutDashboard, label: "Dashboard",           to: RoutePaths.AdminDashboard },
  { icon: Calendar,        label: "Events",              to: RoutePaths.AdminEvents },
  { icon: Tag,             label: "Categories",          to: RoutePaths.AdminCategories },
  { icon: Lightbulb,       label: "Suggestions",         to: RoutePaths.AdminCategorySuggestions },
  { icon: Users,           label: "Users",               to: RoutePaths.AdminUsers },
  { icon: Building2,       label: "Organizations",       to: RoutePaths.AdminOrganizations },
  { icon: BarChart3,       label: "Reports",             to: RoutePaths.AdminReports },
  { icon: Settings,        label: "Settings",            to: RoutePaths.AdminSettings },
  { icon: ScrollText,      label: "Activity Logs",       to: RoutePaths.AdminActivityLogs },
]

export function AdminLayout() {
  const { user, logout } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <AdminSidebar />

      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center h-14 px-4 border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="flex items-center gap-2 mr-auto">
          <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
            <CalendarDays className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-base tracking-tight">NextEvent</span>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 ml-1">
            <ShieldCheck className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-wide">Admin</span>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen((v) => !v)}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
        >
          {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-30 top-14 bg-background/95 backdrop-blur">
          <nav className="flex flex-col px-3 py-3 space-y-0.5">
            {mobileNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
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
            <NavLink
              to={RoutePaths.Home}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border-t border-border/40 mt-2 pt-4"
            >
              <CalendarDays className="h-4.5 w-4.5 shrink-0" />
              Back to Site
            </NavLink>
          </nav>
        </div>
      )}

      {/* Main content — offset by sidebar width on desktop */}
      <div className="lg:ml-56 flex flex-col min-h-screen">
        {/* Desktop top bar */}
        <header className="hidden lg:flex sticky top-0 z-30 h-14 items-center gap-4 px-6 border-b border-border/40 bg-background/95 backdrop-blur shrink-0">
          {/* Search */}
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search events, users, categories..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-muted/50 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Notification bell */}
            <button className="relative h-9 w-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
            </button>

            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-muted transition-colors"
              >
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium">{user?.displayName ?? "Admin"}</span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-border/50 bg-popover shadow-lg py-1 z-50">
                  <div className="px-3 py-2 border-b border-border/40">
                    <p className="text-sm font-semibold">{user?.displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <NavLink
                    to={RoutePaths.Home}
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <CalendarDays className="h-4 w-4" />
                    Back to Site
                  </NavLink>
                  <button
                    onClick={() => { setProfileOpen(false); logout(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
