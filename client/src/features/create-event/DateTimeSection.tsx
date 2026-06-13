import { Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { FormState, FormErrors } from "@/features/create-event/types"
import { FieldError, SectionTitle } from "@/features/create-event/components"

interface DateTimeSectionProps {
  form: FormState
  errors: FormErrors
  onFieldChange: (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}

export function DateTimeSection({ form, errors, onFieldChange }: DateTimeSectionProps) {
  return (
    <section className="space-y-5">
      <SectionTitle icon={<Calendar className="h-4 w-4" />} title="Date & Time" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Date */}
        <div className="space-y-1.5">
          <Label htmlFor="event-date">
            Event Date <span className="text-destructive">*</span>
          </Label>
          <Input
            id="event-date"
            type="date"
            value={form.date}
            onChange={onFieldChange("date")}
            min={new Date().toISOString().split("T")[0]}
            aria-invalid={!!errors.date}
          />
          <FieldError msg={errors.date} />
        </div>

        {/* Time */}
        <div className="space-y-1.5">
          <Label htmlFor="event-time">
            Start Time <span className="text-destructive">*</span>
          </Label>
          <Input
            id="event-time"
            type="time"
            value={form.time}
            onChange={onFieldChange("time")}
            aria-invalid={!!errors.time}
          />
          <FieldError msg={errors.time} />
        </div>
      </div>
    </section>
  )
}
