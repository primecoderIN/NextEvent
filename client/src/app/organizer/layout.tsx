import { Outlet } from "react-router-dom"
import { useState } from "react"
import { Bell, Search, Menu, X, RefreshCw } from "lucide-react"
import { useAuth } from "@/features/auth/context/AuthContext"
import { RoutePaths } from "@/shared/constants/routePaths"
import { OrganizerSidebar } from "./layouts/OrganizerSidebar"
import { NavLink, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  Calendar,
  Building2,
  Users,
  BarChart3,
  Settings,
  CalendarDays,
  Briefcase,
} from "lucide-react"

const mobileNavItems = [
  { icon: LayoutDashboard, label: "Dashboard",             to: RoutePaths.OrganizerDashboard },
  { icon: Building2,       label: "My Organizations",      to: RoutePaths.OrganizerOrganizationDetail },
  { icon: Calendar,        label: "Events",                to: RoutePaths.EditEvent }, 
  { icon: Users,           label: "Attendees",             to: "#" },
  { icon: BarChart3,       label: "Analytics",             to: "#" },
  { icon: Settings,        label: "Settings",              to: "#" },
]

export function OrganizerLayout() {
  const { user, switchProfile } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <OrganizerSidebar />

      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center h-14 px-4 border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="flex items-center gap-2 mr-auto">
          <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
            <CalendarDays className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-base tracking-tight">NextEvent</span>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 ml-1">
            <Briefcase className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-wide">Organizer</span>
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
            {user?.availableProfiles && user.availableProfiles.length > 1 && (
              <div className="border-t border-border/40 mt-2 pt-4 px-2">
                <p className="text-xs text-muted-foreground mb-2">Switch Profile</p>
                {user.availableProfiles
                  .filter(profile => profile !== user.activeProfile)
                  .map(profile => (
                    <button
                      key={profile}
                      onClick={() => {
                        if (user.activeProfile !== profile) {
                          switchProfile(profile as "Member" | "Organizer");
                          if (profile === "Organizer") navigate(RoutePaths.OrganizerDashboard);
                          else navigate(RoutePaths.Home);
                        }
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm w-full transition-colors hover:bg-muted text-foreground"
                    >
                      <RefreshCw className="h-4.5 w-4.5" />
                      Switch to {profile}
                    </button>
                  ))}
              </div>
            )}
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
                placeholder="Search events, organizations, attendees..."
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
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-muted/20">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
