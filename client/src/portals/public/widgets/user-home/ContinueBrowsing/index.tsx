import { History } from "lucide-react"
import { SectionHeader } from "@/portals/public/widgets/common/SectionHeader"

/**
 * Shows recently browsed events, persisted in localStorage.
 * Placeholder — empty state until browse-history tracking is implemented.
 */
export function ContinueBrowsing() {
  return (
    <section>
      <SectionHeader title="Continue Browsing" />
      <div className="flex flex-col items-center justify-center py-10 gap-3 rounded-2xl border border-dashed border-border/60 bg-muted/30">
        <div className="h-12 w-12 rounded-full bg-violet-500/10 flex items-center justify-center">
          <History className="h-6 w-6 text-violet-600" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold">Nothing to resume yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Events you've recently viewed will appear here.
          </p>
        </div>
      </div>
    </section>
  )
}
