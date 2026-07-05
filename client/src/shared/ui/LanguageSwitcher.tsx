import { useTranslation } from "react-i18next"
import { cn } from "@/shared/lib/utils"

// ── LanguageSwitcher ──────────────────────────────────────────────────────────
// A compact EN | हि toggle. Uses i18n.changeLanguage() which:
//   1. Swaps the active language in the i18next instance
//   2. LanguageDetector writes the choice to localStorage (nextevent_lang)
//   3. All components using useTranslation() re-render automatically
export function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n } = useTranslation()
  // resolvedLanguage is always one of the supportedLngs ("en" | "hi").
  // i18n.language can be a full BCP-47 tag like "en-US" from the browser
  // navigator, which breaks the strict === "en" check.
  const current = i18n.resolvedLanguage ?? "en"

  function toggle() {
    i18n.changeLanguage(current === "en" ? "hi" : "en")
  }

  return (
    <button
      onClick={toggle}
      title={current === "en" ? "Switch to Hindi" : "अंग्रेज़ी में बदलें"}
      aria-label="Toggle language"
      className={cn(
        "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold",
        "border border-border/60 text-muted-foreground",
        "hover:border-primary/40 hover:text-primary hover:bg-primary/5",
        "transition-all duration-200 select-none",
        className
      )}
    >
      <span className={current === "en" ? "text-primary font-bold" : "opacity-50"}>EN</span>
      <span className="text-border/80">|</span>
      <span className={current === "hi" ? "text-primary font-bold" : "opacity-50"}>हि</span>
    </button>
  )
}
