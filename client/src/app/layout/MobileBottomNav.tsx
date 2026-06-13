import { Home, Search, Plus, Ticket, User } from "lucide-react"

const leftItems = [
  { icon: Home, label: "Home", href: "#", active: true },
  { icon: Search, label: "Explore", href: "#" },
]

const rightItems = [
  { icon: Ticket, label: "Tickets", href: "#" },
  { icon: User, label: "Profile", href: "#" },
]

export function MobileBottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center h-16 px-2">
        {/* Left items */}
        {leftItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={`flex-1 flex flex-col items-center gap-1 py-2 transition-colors ${
              item.active ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </a>
        ))}

        {/* Center Create FAB */}
        <div className="flex-1 flex justify-center -mt-5">
          <button
            className="h-12 w-12 rounded-full text-white shadow-xl flex items-center justify-center hover:opacity-90 active:scale-95 transition-all"
            style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)" }}
            aria-label="Create Event"
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>

        {/* Right items */}
        {rightItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="flex-1 flex flex-col items-center gap-1 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </a>
        ))}
      </div>
    </nav>
  )
}
