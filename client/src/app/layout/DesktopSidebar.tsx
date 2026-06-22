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
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"

const navItems = [
  { icon: Home, labelKey: "home", href: "#", active: true },
  { icon: Search, labelKey: "exploreEvents", href: "#" },
  { icon: Ticket, labelKey: "myTickets", href: "#" },
  { icon: Heart, labelKey: "following", href: "#" },
  { icon: Calendar, labelKey: "myEvents", href: "#" },
  { icon: Bookmark, labelKey: "savedEvents", href: "#" },
]

const secondaryItems = [
  { icon: Bell, labelKey: "notifications", href: "#", badge: 3 },
  { icon: MessageSquare, labelKey: "messages", href: "#", badge: 0 },
  { icon: Settings, labelKey: "settings", href: "#", badge: 0 },
  { icon: HelpCircle, labelKey: "helpCenter", href: "#", badge: 0 },
]

export function DesktopSidebar() {
  const navigate = useNavigate()
  const { t } = useTranslation(["nav", "common"])

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-56 border-r border-border/40 bg-background z-40">
      {/* Logo & Language Switcher */}
      <div className="flex flex-col justify-center h-20 px-4 border-b border-border/40 shrink-0 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center">
              <CalendarDays className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">NextEvent</span>
          </div>
        </div>
        <div className="flex items-center px-1">
          <LanguageSwitcher />
        </div>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <a
            key={item.labelKey}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              item.active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {t(item.labelKey, { ns: "nav" })}
          </a>
        ))}
      </nav>

      {/* Create Event CTA */}
      <div className="px-3 mb-3 shrink-0">
        <button
          onClick={() => navigate("/events/new")}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)" }}
        >
          <Plus className="h-4 w-4" />
          {t("createEvent", { ns: "common" })}
        </button>
      </div>

      {/* Secondary nav */}
      <div className="px-3 py-3 border-t border-border/40 space-y-0.5 shrink-0">
        {secondaryItems.map((item) => (
          <a
            key={item.labelKey}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <item.icon className="h-5 w-5 shrink-0" />
            <span className="flex-1">{t(item.labelKey, { ns: "nav" })}</span>
            {item.badge > 0 && (
              <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {item.badge}
              </span>
            )}
          </a>
        ))}
      </div>

      {/* User profile */}
      <div className="px-3 py-3 border-t border-border/40 shrink-0">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted cursor-pointer transition-colors">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-tight truncate">Sanjeev Kumar</p>
            <p className="text-xs text-muted-foreground">{t("viewProfile", { ns: "common" })} →</p>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        </div>
      </div>
    </aside>
  )
}
