import { Type, Tag } from "lucide-react"
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
import { cn } from "@/lib/utils"
import type { FormState, FormErrors } from "@/features/create-event/types"
import { CATEGORIES } from "@/features/create-event/types"
import { FieldError, SectionTitle } from "@/features/create-event/components"

interface BasicInfoSectionProps {
  form: FormState
  errors: FormErrors
  onFieldChange: (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onCategoryChange: (value: string) => void
}

export function BasicInfoSection({
  form,
  errors,
  onFieldChange,
  onCategoryChange,
}: BasicInfoSectionProps) {
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
        <Label htmlFor="event-description">
          Description <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Textarea
            id="event-description"
            value={form.description}
            onChange={onFieldChange("description")}
            maxLength={1000}
            rows={4}
            placeholder="Describe what attendees can expect at your event…"
            aria-invalid={!!errors.description}
            className="pb-7"
          />
          <span className="absolute right-3 bottom-2.5 text-xs text-muted-foreground tabular-nums pointer-events-none">
            {form.description.length}/1000
          </span>
        </div>
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
        <FieldError msg={errors.category} />
      </div>
    </section>
  )
}
