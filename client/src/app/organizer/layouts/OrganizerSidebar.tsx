import { NavLink, useNavigate } from "react-router-dom"
import {
  CalendarDays,
  LayoutDashboard,
  Calendar,
  Users,
  Building2,
  BarChart3,
  Settings,
  Briefcase,
  User,
  ChevronDown,
  RefreshCw,
  LogOut,
} from "lucide-react"
import { RoutePaths } from "@/shared/constants/routePaths"
import { useAuth } from "@/features/auth/context/AuthContext"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard",             to: RoutePaths.OrganizerDashboard },
  { icon: Building2,       label: "My Organizations",      to: RoutePaths.OrganizerMyOrganization },
  { icon: Calendar,        label: "Events",                to: RoutePaths.OrganizerEvents }, 
  { icon: Users,           label: "Attendees",             to: "/organizer/attendees" },
  { icon: BarChart3,       label: "Analytics",             to: "/organizer/analytics" },
  { icon: Settings,        label: "Settings",              to: "/organizer/settings" },
]

export function OrganizerSidebar() {
  const { user, switchProfile, logout } = useAuth()
  const navigate = useNavigate()

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

      {/* Organizer badge */}
      <div className="px-4 py-2.5 border-b border-border/40 shrink-0">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 w-fit">
          <Briefcase className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold text-primary">Organizer</span>
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

      {/* User Auth Section (Profile Switcher) */}
      <div className="px-3 py-3 border-t border-border/40 shrink-0">
        {user ? (
          <Popover>
            <PopoverTrigger asChild>
              <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted cursor-pointer transition-colors">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold leading-tight truncate">{user.displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.activeProfile} mode
                  </p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="end" side="top">
              <div className="flex flex-col gap-1">
                <div className="px-2 py-1.5 mb-1 border-b border-border/40">
                  <p className="text-sm font-medium">{user.displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                {user.availableProfiles && user.availableProfiles.length > 1 && (
                  user.availableProfiles
                    .filter((profile: string) => profile !== user.activeProfile)
                    .map((profile: string) => (
                      <button
                        key={profile}
                        onClick={() => {
                          if (user.activeProfile !== profile) {
                            switchProfile(profile as "Member" | "Organizer");
                            if (profile === "Organizer") navigate(RoutePaths.OrganizerDashboard);
                            else navigate(RoutePaths.Home);
                          }
                        }}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-muted text-foreground transition-colors"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Switch to {profile}
                      </button>
                    ))
                )}
                <button
                  onClick={() => logout()}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-red-500 hover:bg-red-500/10 transition-colors mt-1 border-t border-border/40 pt-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </PopoverContent>
          </Popover>
        ) : null}
      </div>
    </aside>
  )
}
