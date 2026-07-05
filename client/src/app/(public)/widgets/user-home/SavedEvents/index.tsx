import { Bookmark } from "lucide-react"
import { SectionHeader } from "@/app/(public)/widgets/common/SectionHeader"

/**
 * Shows events the user has bookmarked/saved.
 * Placeholder — empty state until saved-events API is implemented.
 */
export function SavedEvents() {
  return (
    <section>
      <SectionHeader title="Saved Events" />
      <div className="flex flex-col items-center justify-center py-10 gap-3 rounded-2xl border border-dashed border-border/60 bg-muted/30">
        <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
          <Bookmark className="h-6 w-6 text-amber-600" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold">No saved events yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Tap the bookmark icon on any event to save it here.
          </p>
        </div>
      </div>
    </section>
  )
}
