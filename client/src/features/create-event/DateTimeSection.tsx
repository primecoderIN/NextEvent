import { useState } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Controller, useFormContext } from "react-hook-form"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { EventFormValues } from "@/features/create-event/types"
import { FieldError, SectionTitle } from "@/features/create-event/components"

export function DateTimeSection() {
  const { t } = useTranslation("createEvent")
  const { control, formState: { errors } } = useFormContext<EventFormValues>()
  const [calendarOpen, setCalendarOpen] = useState(false)

  return (
    <section className="space-y-5">
      <SectionTitle icon={<CalendarIcon className="h-4 w-4" />} title={t("sections.dateTime")} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="event-date">
            {t("fields.date.label")} <span className="text-destructive">*</span>
          </Label>
          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="event-date"
                    type="button"
                    variant="outline"
                    aria-invalid={!!errors.date}
                    className={cn(
                      "w-full justify-start text-left font-normal h-10 rounded-xl border-input bg-background px-3.5",
                      "hover:bg-background focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/60",
                      !field.value && "text-muted-foreground/60",
                      errors.date && "border-destructive/60 bg-destructive/5"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                    {field.value ? format(field.value, "PPP") : t("fields.date.placeholder")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      field.onChange(date)
                      setCalendarOpen(false)
                    }}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          <FieldError msg={errors.date?.message} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="event-time">
            {t("fields.time.label")} <span className="text-destructive">*</span>
          </Label>
          <Controller
            name="time"
            control={control}
            render={({ field }) => (
              <Input
                id="event-time"
                type="time"
                aria-invalid={!!errors.time}
                {...field}
              />
            )}
          />
          <FieldError msg={errors.time?.message} />
        </div>
      </div>
    </section>
  )
}
