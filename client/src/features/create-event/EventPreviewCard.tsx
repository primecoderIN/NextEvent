import { format } from "date-fns"
import { Calendar, MapPin, AlignLeft } from "lucide-react"
// ── RHF imports ───────────────────────────────────────────────────────────────
// useFormContext — reads the form instance from the nearest <FormProvider>.
// useWatch       — subscribes to field value changes and re-renders this
//   component reactively. Used here so the preview updates as the user types.
import { useFormContext, useWatch } from "react-hook-form"
import type { EventFormValues } from "@/features/create-event/types"
import { SectionTitle } from "@/features/create-event/components"

export function EventPreviewCard() {
  // ── Step 1: Access form context ───────────────────────────────────────────
  const { control } = useFormContext<EventFormValues>()

  // ── Step 2: Subscribe to all preview fields in a single batched call ────────
  //
  // Best practice: pass an array of field names to a single useWatch() call.
  // This creates ONE subscription for all 7 fields — the component re-renders
  // once per change regardless of which field changed.
  //
  // Anti-pattern avoided:
  //   const title    = useWatch({ control, name: "title" })       ← subscription 1
  //   const description = useWatch({ control, name: "description" }) ← subscription 2
  //   ... (7 separate subscriptions = 7 potential re-renders per keystroke)
  //
  // useWatch vs getValues:
  //   getValues() reads values imperatively (no re-render). useWatch() is
  //   reactive — it subscribes and re-renders when the value changes.
  //   For a live preview we want reactive, so useWatch is the right choice.
  const [title, description, category, date, time, venue, city] = useWatch({
    control,
    name: ["title", "description", "category", "date", "time", "venue", "city"],
  })

  // `date` is stored as a JS Date object (as defined in the Zod schema).
  // Format it for display only — never mutate the RHF value here.
  const formattedDate = date instanceof Date ? format(date, "EEE, d MMM yyyy") : null

  return (
    <section className="space-y-4">
      <SectionTitle icon={<AlignLeft className="h-4 w-4" />} title="Preview" />

      {/* All values below are live — they update on every keystroke because
          useWatch subscribes this component to the form store. */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base truncate">
                {title || (
                  <span className="text-muted-foreground/40 font-normal italic">
                    Event title will appear here
                  </span>
                )}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {description || (
                  <span className="italic">Description preview…</span>
                )}
              </p>
            </div>
            {category && (
              <span className="shrink-0 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                {category}
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
            {(formattedDate || time) && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formattedDate ?? "—"}
                {time && ` • ${time}`}
              </span>
            )}
            {(venue || city) && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {[venue, city].filter(Boolean).join(", ") || "—"}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
