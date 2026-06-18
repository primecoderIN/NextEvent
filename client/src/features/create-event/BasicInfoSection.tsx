import { Loader2, Sparkles, Tag, Type } from "lucide-react"
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
import type { FormState, FormErrors } from "@/features/create-event/types"
import { CATEGORIES } from "@/features/create-event/types"
import { FieldError, SectionTitle } from "@/features/create-event/components"
import { useGenerateDescription } from "@/hooks/useGenerateDescription"
import { useSuggestCategory } from "@/hooks/useSuggestCategory"

interface BasicInfoSectionProps {
  form: FormState
  errors: FormErrors
  onFieldChange: (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onCategoryChange: (value: string) => void
  onDescriptionGenerated: (description: string) => void
}

export function BasicInfoSection({
  form,
  errors,
  onFieldChange,
  onCategoryChange,
  onDescriptionGenerated,
}: BasicInfoSectionProps) {
  const { generate, loading: generating, error: generateError } = useGenerateDescription()
  const { suggestion, loading: suggesting, clearSuggestion } = useSuggestCategory(form.title)

  async function handleGenerate() {
    const result = await generate({
      title: form.title.trim(),
      category: form.category,
      city: form.city.trim(),
      venue: form.venue.trim(),
    })
    if (result) onDescriptionGenerated(result)
  }

  function handleAcceptSuggestion() {
    onCategoryChange(suggestion!)
    clearSuggestion()
  }

  const canGenerate = form.title.trim().length >= 3

  return (
    <section className="space-y-5">
      <SectionTitle icon={<Type className="h-4 w-4" />} title="Basic Info" />

      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="event-title">
          Event Title <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Input
            id="event-title"
            value={form.title}
            onChange={onFieldChange("title")}
            maxLength={100}
            placeholder="Enter a catchy event title"
            aria-invalid={!!errors.title}
            className="pr-14"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground tabular-nums pointer-events-none">
            {form.title.length}/100
          </span>
        </div>
        <FieldError msg={errors.title} />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="event-description">
            Description <span className="text-destructive">*</span>
          </Label>

          {/* ✨ Generate with AI button */}
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
            title={!canGenerate ? "Enter a title first to generate a description" : "Generate description with AI"}
          >
            {generating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3" />
            )}
            {generating ? "Generating…" : "Generate with AI"}
          </Button>
        </div>

        <div className="relative">
          <Textarea
            id="event-description"
            value={form.description}
            onChange={onFieldChange("description")}
            maxLength={1000}
            rows={4}
            placeholder="Describe what attendees can expect at your event…"
            aria-invalid={!!errors.description}
            className={cn("pb-7", generating && "opacity-60 pointer-events-none")}
          />
          <span className="absolute right-3 bottom-2.5 text-xs text-muted-foreground tabular-nums pointer-events-none">
            {form.description.length}/1000
          </span>
        </div>

        {/* AI generation error */}
        {generateError && (
          <p className="text-xs text-destructive">{generateError}</p>
        )}
        <FieldError msg={errors.description} />
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <Label htmlFor="event-category">
          Category <span className="text-destructive">*</span>
        </Label>
        <Select value={form.category} onValueChange={onCategoryChange}>
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

        {/* AI category suggestion chip */}
        {(suggestion || suggesting) && !form.category && (
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

        <FieldError msg={errors.category} />
      </div>
    </section>
  )
}
