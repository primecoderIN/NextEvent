import {
  CalendarDays,
  Home,
  Search,
  Ticket,
  Heart,
  Calendar,
  Bookmark,
  Plus,
  Bell,
  MessageSquare,
  Settings,
  HelpCircle,
  User,
  ChevronDown,
} from "lucide-react"

const navItems = [
  { icon: Home, label: "Home", href: "#", active: true },
  { icon: Search, label: "Explore Events", href: "#" },
  { icon: Ticket, label: "My Tickets", href: "#" },
  { icon: Heart, label: "Following", href: "#" },
  { icon: Calendar, label: "My Events", href: "#" },
  { icon: Bookmark, label: "Saved Events", href: "#" },
]

const secondaryItems = [
  { icon: Bell, label: "Notifications", href: "#", badge: 3 },
  { icon: MessageSquare, label: "Messages", href: "#", badge: 0 },
  { icon: Settings, label: "Settings", href: "#", badge: 0 },
  { icon: HelpCircle, label: "Help Center", href: "#", badge: 0 },
]

export function DesktopSidebar() {
  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-56 border-r border-border/40 bg-background z-40">
      {/* Logo */}
      <div className="flex items-center gap-2.5 h-16 px-4 border-b border-border/40 flex-shrink-0">
        <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center">
          <CalendarDays className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-bold text-lg tracking-tight">NextEvent</span>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              item.active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {item.label}
          </a>
        ))}
      </nav>

      {/* Create Event CTA */}
      <div className="px-3 mb-3 flex-shrink-0">
        <button
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)" }}
        >
          <Plus className="h-4 w-4" />
          Create Event
        </button>
      </div>

      {/* Secondary nav */}
      <div className="px-3 py-3 border-t border-border/40 space-y-0.5 flex-shrink-0">
        {secondaryItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            <span className="flex-1">{item.label}</span>
            {item.badge > 0 && (
              <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {item.badge}
              </span>
            )}
          </a>
        ))}
      </div>

      {/* User profile */}
      <div className="px-3 py-3 border-t border-border/40 flex-shrink-0">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted cursor-pointer transition-colors">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-tight truncate">Sanjeev Kumar</p>
            <p className="text-xs text-muted-foreground">View Profile →</p>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
        </div>
      </div>
    </aside>
  )
}
