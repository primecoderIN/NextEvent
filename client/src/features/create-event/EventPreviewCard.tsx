import { Calendar, MapPin, AlignLeft } from "lucide-react"
import type { FormState } from "@/features/create-event/types"
import { SectionTitle } from "@/features/create-event/components"

interface EventPreviewCardProps {
  form: FormState
}

export function EventPreviewCard({ form }: EventPreviewCardProps) {
  return (
    <section className="space-y-4">
      <SectionTitle icon={<AlignLeft className="h-4 w-4" />} title="Preview" />

      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base truncate">
                {form.title || (
                  <span className="text-muted-foreground/40 font-normal italic">
                    Event title will appear here
                  </span>
                )}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {form.description || (
                  <span className="italic">Description preview…</span>
                )}
              </p>
            </div>
            {form.category && (
              <span className="shrink-0 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                {form.category}
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
            {(form.date || form.time) && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {form.date
                  ? new Date(
                      `${form.date}T${form.time || "00:00"}`
                    ).toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
                {form.time && ` • ${form.time}`}
              </span>
            )}
            {(form.venue || form.city) && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {[form.venue, form.city].filter(Boolean).join(", ") || "—"}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
