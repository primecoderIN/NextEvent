import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  Menu,
  CalendarDays,
  Home,
  Search,
  Ticket,
  Heart,
  Plus,
  LogOut,
  ChevronRight,
  User,
  Pencil,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { BottomSheet } from "@/components/ui/sheet"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"

const navItems = [
  { icon: Home, labelKey: "home", href: "#" },
  { icon: Search, labelKey: "exploreEvents", href: "#" },
  { icon: Ticket, labelKey: "myTickets", href: "#" },
  { icon: Heart, labelKey: "following", href: "#" },
  { icon: CalendarDays, labelKey: "myEvents", href: "#" },
]

export const Navbar = () => {
  const [sheetOpen, setSheetOpen] = useState(false)
  const navigate = useNavigate()
  const { t } = useTranslation(["nav", "common"])

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 max-w-7xl items-center px-4">
          {/* Logo */}
          <div className="flex items-center gap-2 mr-6">
            <CalendarDays className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold tracking-tight">NextEvent</span>
          </div>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-6 flex-1">
            {navItems.map(({ labelKey, href }) => (
              <a
                key={labelKey}
                href={href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {t(labelKey, { ns: "nav" })}
              </a>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-2 ml-auto">
            <LanguageSwitcher className="mr-2" />
            <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
              {t("login", { ns: "common" })}
            </Button>
            <Button size="sm" onClick={() => navigate("/register")}>
              {t("signUp", { ns: "common" })}
            </Button>
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden ml-auto items-center gap-3">
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("toggleMenu", { ns: "nav" })}
              onClick={() => setSheetOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile bottom sheet */}
      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <div className="px-4 pb-8 max-h-[85dvh] overflow-y-auto">
          {/* User Auth Section */}
          <div className="py-4 border-b border-border/40">
            {/* Mock auth state - set to false to show Login/Signup */}
            {false ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/20">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                      <Plus className="h-2.5 w-2.5 text-primary-foreground" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-tight">Sanjeev Kumar</p>
                    <a
                      href="#"
                      className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-0.5"
                    >
                      {t("viewProfile", { ns: "common" })}
                      <ChevronRight className="h-3 w-3" />
                    </a>
                  </div>
                </div>
                <button
                  className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label={t("editProfile", { ns: "common" })}
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setSheetOpen(false)
                    navigate("/login")
                  }}
                >
                  {t("login", { ns: "common" })}
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    setSheetOpen(false)
                    navigate("/register")
                  }}
                >
                  {t("signUp", { ns: "common" })}
                </Button>
              </div>
            )}
          </div>

          {/* Primary nav */}
          <nav className="mt-2 flex flex-col">
            {navItems.map(({ icon: Icon, labelKey, href }) => (
              <a
                key={labelKey}
                href={href}
                onClick={() => setSheetOpen(false)}
                className="flex items-center justify-between px-2 py-3.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Icon className="h-4.5 w-4.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  {t(labelKey, { ns: "nav" })}
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
              </a>
            ))}
          </nav>

          {/* Create Event CTA */}
          <div className="mt-2 mb-2">
            <button
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90 active:opacity-80"
              style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
              }}
              onClick={() => { setSheetOpen(false); navigate("/events/new") }}
            >
              <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Plus className="h-4 w-4" />
              </div>
              {t("createEvent", { ns: "common" })}
            </button>
          </div>

          {/* Logout */}
          {false && (
            <div className="mt-2 pt-2 border-t border-border/40">
              <button
                className="flex items-center gap-3 px-2 py-3.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors w-full text-left group"
                onClick={() => setSheetOpen(false)}
              >
                <div className="h-9 w-9 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <LogOut className="h-4.5 w-4.5 text-destructive" />
                </div>
                {t("logout", { ns: "common" })}
              </button>
            </div>
          )}
        </div>
      </BottomSheet>
    </>
  )
}
