import { useState } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
// ── RHF imports ───────────────────────────────────────────────────────────────
// Controller    — bridges RHF to third-party/custom inputs (Calendar, Input).
// useFormContext — retrieves the form instance from FormProvider context.
//   This component needs no props — it reads everything from context.
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
  // ── Step 1: Pull form context ─────────────────────────────────────────────
  const { control, formState: { errors } } = useFormContext<EventFormValues>()

  // Local UI state for the calendar popover — this has nothing to do with RHF,
  // it's just controlling whether the date picker dropdown is open or closed.
  const [calendarOpen, setCalendarOpen] = useState(false)

  return (
    <section className="space-y-5">
      <SectionTitle icon={<CalendarIcon className="h-4 w-4" />} title="Date & Time" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* ── Date field — shadcn Calendar inside a Popover ──────────────────
            The Calendar component is not a native input, so we use Controller.
            Controller's render prop gives us:
              field.value    → the currently selected Date (or undefined)
              field.onChange → called when the user picks a day; we pass a Date object
              field.onBlur   → called when focus leaves; triggers "onTouched" validation
            The Zod schema expects a Date, so we pass the Date object directly from
            the Calendar's onSelect callback — no string conversion needed here. */}
        <div className="space-y-1.5">
          <Label htmlFor="event-date">
            Event Date <span className="text-destructive">*</span>
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
                    // aria-invalid surfaces the destructive ring style from the
                    // Input component's aria-invalid CSS selector
                    aria-invalid={!!errors.date}
                    className={cn(
                      "w-full justify-start text-left font-normal h-10 rounded-xl border-input bg-background px-3.5",
                      "hover:bg-background focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/60",
                      !field.value && "text-muted-foreground/60",
                      errors.date && "border-destructive/60 bg-destructive/5"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                    {/* field.value is a JS Date — format it for display only */}
                    {field.value ? format(field.value, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      // field.onChange stores the Date into RHF state.
                      // Then we close the popover — this also triggers onBlur
                      // which kicks off "onTouched" validation.
                      field.onChange(date)
                      setCalendarOpen(false)
                    }}
                    // Prevent selecting dates in the past
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          {/* errors.date is set by zodResolver when the field is empty or invalid.
              The message comes directly from z.date({ required_error: "..." }) */}
          <FieldError msg={errors.date?.message} />
        </div>

        {/* ── Time field — native <input type="time"> ────────────────────────
            This is a native input so Controller spreads field directly.
            The value is a "HH:mm" string which matches the Zod .regex() rule.
            No conversion is needed — the browser's time picker returns HH:mm. */}
        <div className="space-y-1.5">
          <Label htmlFor="event-time">
            Start Time <span className="text-destructive">*</span>
          </Label>
          <Controller
            name="time"
            control={control}
            render={({ field }) => (
              <Input
                id="event-time"
                type="time"
                aria-invalid={!!errors.time}
                // Spread field: wires value, onChange, onBlur, name, ref
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
