import { Loader2, Sparkles, Tag, Type } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Controller, useFormContext, useWatch } from "react-hook-form"
import { Input } from "@/shared/ui/input"
import { Textarea } from "@/shared/ui/textarea"
import { Label } from "@/shared/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import { Button } from "@/shared/ui/button"
import { cn } from "@/shared/lib/utils"
import type { EventFormValues } from "@/features/events/components/EventForm/types"
import { FieldError, SectionTitle } from "@/features/events/components/EventForm/components"
import { useGenerateDescription } from "@/shared/hooks/useGenerateDescription"

import { useCategories } from "@/shared/hooks/useCategories"

// ── Step 1: Read form context and watch values ────────────────────────────────
// useFormContext() — retrieves the form instance created by useForm() in the
//   parent page and shared via <FormProvider>. No props needed.
// Controller  — the RHF component for wrapping uncontrolled/third-party inputs.
//   It injects { field, fieldState } into the render prop.
// useWatch    — subscribes to field values and re-renders when they change.
//   Used here instead of getValues() because we need reactive, live values
//   (e.g. for the character counter, AI button enable state, and suggestion chip).

interface BasicInfoSectionProps {
  // Only the AI description callback is passed as a prop — everything else
  // (control, errors, setValue) comes from the form context.
  onDescriptionGenerated: (description: string) => void
}

export function BasicInfoSection({ onDescriptionGenerated }: BasicInfoSectionProps) {
  const { t } = useTranslation(["createEvent", "common"])

  // ── Step 2: Access the form instance from context ─────────────────────────
  //
  // useFormContext<EventFormValues>() returns the same object that useForm()
  // created in the parent. The generic ensures the field names and types are
  // type-safe throughout this component.
  const { control, formState: { errors }, setValue } = useFormContext<EventFormValues>()
  const { data: categories = [], isLoading: categoriesLoading } = useCategories()

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


  async function handleGenerate() {
    const result = await generate({
      title: title?.trim() ?? "",
      category: category ?? "",
      city: city?.trim() ?? "",
      venue: venue?.trim() ?? "",
    })
    if (result) onDescriptionGenerated(result)
  }



  const canGenerate = (title?.trim().length ?? 0) >= 3

  return (
    <section className="space-y-5">
      <SectionTitle icon={<Type className="h-4 w-4" />} title={t("sections.basicInfo")} />

      <div className="space-y-1.5">
        <Label htmlFor="event-title">
          {t("fields.title.label")} <span className="text-destructive">*</span>
        </Label>
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <div className="relative">
              <Input
                id="event-title"
                maxLength={100}
                placeholder={t("fields.title.placeholder")}
                aria-invalid={!!errors.title}
                className="pr-14"
                // Spread field last so RHF's value/onChange/onBlur/ref take effect
                {...field}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground tabular-nums pointer-events-none">
                {t("fields.title.counter", { count: (field.value ?? "").length })}
              </span>
            </div>
          )}
        />
        <FieldError msg={errors.title?.message} />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="event-description">
            {t("fields.description.label")} <span className="text-destructive">*</span>
          </Label>

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
                ? t("ai.generateTitle")
                : t("ai.generateHint")
            }
          >
            {generating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3" />
            )}
            {generating ? t("ai.generating") : t("ai.generate")}
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
                placeholder={t("fields.description.placeholder")}
                aria-invalid={!!errors.description}
                className={cn("pb-7", generating && "opacity-60 pointer-events-none")}
                {...field}
              />
              <span className="absolute right-3 bottom-2.5 text-xs text-muted-foreground tabular-nums pointer-events-none">
                {t("fields.description.counter", { count: (field.value ?? "").length })}
              </span>
            </div>
          )}
        />

        {generateError && <p className="text-xs text-destructive">{generateError}</p>}
        <FieldError msg={errors.description?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="event-category">
          {t("fields.category.label")} <span className="text-destructive">*</span>
        </Label>
        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(value) => {
                const selected = categories.find((cat) => cat.id === value)
                setValue("categoryId", value)
                setValue("category", selected?.name ?? "")
                field.onChange(value)
              }}
            >
              <SelectTrigger
                id="event-category"
                aria-invalid={!!errors.categoryId}
                className={cn(errors.categoryId && "border-destructive/60 bg-destructive/5")}
              >
                <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
                <SelectValue placeholder={t("fields.category.placeholder")} />
              </SelectTrigger>
              <SelectContent>
                {categoriesLoading ? (
                  <SelectItem value="_loading" disabled>
                    {t("loading")}
                  </SelectItem>
                ) : (
                  categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}
        />



        <FieldError msg={errors.categoryId?.message} />
      </div>
    </section>
  )
}

