import { Loader2, Sparkles, Tag, Type } from "lucide-react"
// ── Step 1: Read form context and watch values ────────────────────────────────
// useFormContext() — retrieves the form instance created by useForm() in the
//   parent page and shared via <FormProvider>. No props needed.
// Controller  — the RHF component for wrapping uncontrolled/third-party inputs.
//   It injects { field, fieldState } into the render prop.
// useWatch    — subscribes to field values and re-renders when they change.
//   Used here instead of getValues() because we need reactive, live values
//   (e.g. for the character counter, AI button enable state, and suggestion chip).
import { Controller, useFormContext, useWatch } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { EventFormValues } from "@/features/create-event/types"
import { CATEGORIES } from "@/features/create-event/types"
import { FieldError, SectionTitle } from "@/features/create-event/components"
import { useGenerateDescription } from "@/hooks/useGenerateDescription"
import { useSuggestCategory } from "@/hooks/useSuggestCategory"

interface BasicInfoSectionProps {
  // Only the AI description callback is passed as a prop — everything else
  // (control, errors, setValue) comes from the form context.
  onDescriptionGenerated: (description: string) => void
}

export function BasicInfoSection({ onDescriptionGenerated }: BasicInfoSectionProps) {
  // ── Step 2: Access the form instance from context ─────────────────────────
  //
  // useFormContext<EventFormValues>() returns the same object that useForm()
  // created in the parent. The generic ensures the field names and types are
  // type-safe throughout this component.
  const { control, formState: { errors }, setValue } = useFormContext<EventFormValues>()

  // ── Step 3: Subscribe to field values with a single batched useWatch ────────
  //
  // Best practice: use one useWatch({ name: [...] }) instead of calling
  // useWatch separately for each field. A single call = one subscription =
  // one re-render per change, regardless of how many fields are in the array.
  //
  // Anti-pattern avoided:
  //   const title    = useWatch({ control, name: "title" })    // subscription 1
  //   const category = useWatch({ control, name: "category" }) // subscription 2
  //   ...  // N fields = N subscriptions = N re-renders per keystroke
  const [title, category, city, venue] = useWatch({
    control,
    name: ["title", "category", "city", "venue"],
  })

  const { generate, loading: generating, error: generateError } = useGenerateDescription()
  // Pass the live `title` value to useSuggestCategory — same reference from
  // the useWatch above, no second subscription needed.
  const { suggestion, loading: suggesting, clearSuggestion } = useSuggestCategory(title ?? "")

  async function handleGenerate() {
    const result = await generate({
      title: title?.trim() ?? "",
      category: category ?? "",
      city: city?.trim() ?? "",
      venue: venue?.trim() ?? "",
    })
    if (result) onDescriptionGenerated(result)
  }

  // ── Step 4: Programmatic field update (AI suggestion chip) ─────────────────
  //
  // setValue() is the correct way to update a field outside of a Controller.
  // Anti-pattern avoided: wrapping the suggestion button in its own <Controller>
  // just to call field.onChange() registers a duplicate field instance and
  // confuses RHF's internal state. Use setValue() from the form context instead.
  //
  // shouldValidate: true → immediately re-run Zod for "category" so the error
  //   clears as soon as the suggestion is accepted.
  // shouldDirty: true   → mark the field as changed in the dirty state map.
  function handleAcceptSuggestion() {
    setValue("category", suggestion!, { shouldValidate: true, shouldDirty: true })
    clearSuggestion()
  }

  const canGenerate = (title?.trim().length ?? 0) >= 3

  return (
    <section className="space-y-5">
      <SectionTitle icon={<Type className="h-4 w-4" />} title="Basic Info" />

      {/* ── Title field ──────────────────────────────────────────────────────────
          Controller wraps the shadcn Input and bridges it to RHF.
          The render prop receives `field` which contains:
            value, onChange, onBlur, name, ref
          Spreading {...field} onto the input wires all of these up automatically.
          aria-invalid uses the errors object from context to set the ARIA state. */}
      <div className="space-y-1.5">
        <Label htmlFor="event-title">
          Event Title <span className="text-destructive">*</span>
        </Label>
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <div className="relative">
              <Input
                id="event-title"
                maxLength={100}
                placeholder="Enter a catchy event title"
                aria-invalid={!!errors.title}
                className="pr-14"
                // Spread field last so RHF's value/onChange/onBlur/ref take effect
                {...field}
              />
              {/* field.value is live — same value tracked by useWatch above */}
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground tabular-nums pointer-events-none">
                {(field.value ?? "").length}/100
              </span>
            </div>
          )}
        />
        {/* FieldError reads errors.title.message — populated by zodResolver */}
        <FieldError msg={errors.title?.message} />
      </div>

      {/* ── Description field ────────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="event-description">
            Description <span className="text-destructive">*</span>
          </Label>

          {/* ✨ Generate with AI — disabled until title has ≥ 3 chars (from useWatch) */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGenerate}
            disabled={!canGenerate || generating}
            className={cn(
              "h-7 gap-1.5 px-2.5 text-xs border-violet-500/40 text-violet-400",
              "hover:bg-violet-500/10 hover:text-violet-300 hover:border-violet-400/60",
              "disabled:opacity-40 transition-all duration-200"
            )}
            title={
              !canGenerate
                ? "Enter a title first to generate a description"
                : "Generate description with AI"
            }
          >
            {generating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3" />
            )}
            {generating ? "Generating…" : "Generate with AI"}
          </Button>
        </div>

        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <div className="relative">
              <Textarea
                id="event-description"
                maxLength={1000}
                rows={4}
                placeholder="Describe what attendees can expect at your event…"
                aria-invalid={!!errors.description}
                className={cn("pb-7", generating && "opacity-60 pointer-events-none")}
                {...field}
              />
              <span className="absolute right-3 bottom-2.5 text-xs text-muted-foreground tabular-nums pointer-events-none">
                {(field.value ?? "").length}/1000
              </span>
            </div>
          )}
        />

        {generateError && <p className="text-xs text-destructive">{generateError}</p>}
        <FieldError msg={errors.description?.message} />
      </div>

      {/* ── Category field — shadcn Select wrapped in Controller ────────────────
          Select is a third-party component that doesn't expose a native input ref.
          Controller's render prop gives us `field.onChange` and `field.value`
          which we wire to Select's `onValueChange` and `value` props. */}
      <div className="space-y-1.5">
        <Label htmlFor="event-category">
          Category <span className="text-destructive">*</span>
        </Label>
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger
                id="event-category"
                aria-invalid={!!errors.category}
                className={cn(errors.category && "border-destructive/60 bg-destructive/5")}
              >
                <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />

        {/* AI suggestion chip — only visible when category is empty (from useWatch).
            Uses setValue() to update the field — NOT a nested Controller.
            Nesting a Controller inside another Controller's render prop creates a
            duplicate field registration and is an explicit RHF anti-pattern. */}
        {(suggestion || suggesting) && !category && (
          <div className="flex items-center gap-2 mt-1.5">
            {suggesting ? (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                AI is thinking…
              </span>
            ) : suggestion ? (
              <button
                type="button"
                onClick={handleAcceptSuggestion}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                  "bg-violet-500/10 text-violet-400 border border-violet-500/30",
                  "hover:bg-violet-500/20 hover:border-violet-400/50 transition-all duration-150",
                  "cursor-pointer"
                )}
              >
                <Sparkles className="h-3 w-3" />
                AI suggests: {suggestion} — click to apply
              </button>
            ) : null}
          </div>
        )}

        <FieldError msg={errors.category?.message} />
      </div>
    </section>
  )
}
