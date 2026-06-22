import { MapPin, Building2, Globe } from "lucide-react"
// ── RHF imports ───────────────────────────────────────────────────────────────
// Controller    — connects native inputs to RHF so their values are tracked.
// useFormContext — reads the form instance from the nearest <FormProvider>.
//   No props for control/errors are needed — they come from context.
import { Controller, useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { EventFormValues } from "@/features/create-event/types"
import { FieldError, SectionTitle } from "@/features/create-event/components"

export function LocationSection() {
  // ── Step 1: Access form state from context ────────────────────────────────
  const { control, formState: { errors } } = useFormContext<EventFormValues>()

  return (
    <section className="space-y-5">
      <SectionTitle icon={<MapPin className="h-4 w-4" />} title="Location" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* ── City field ──────────────────────────────────────────────────────
            Controller wraps the Input and injects `field` via render prop.
            Spreading {...field} onto the Input connects:
              field.value    → controlled input value managed by RHF
              field.onChange → updates RHF state on every keystroke
              field.onBlur   → triggers "onTouched" validation when focus leaves
              field.ref      → allows RHF to focus the field on validation error */}
        <div className="space-y-1.5">
          <Label htmlFor="event-city">
            City <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <Input
                  id="event-city"
                  placeholder="e.g. Mumbai"
                  aria-invalid={!!errors.city}
                  className="pl-10"
                  {...field}
                />
              )}
            />
          </div>
          {/* errors.city?.message is set by zodResolver when z.string().min(1) fails */}
          <FieldError msg={errors.city?.message} />
        </div>

        {/* ── Venue field ─────────────────────────────────────────────────── */}
        <div className="space-y-1.5">
          <Label htmlFor="event-venue">
            Venue <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Controller
              name="venue"
              control={control}
              render={({ field }) => (
                <Input
                  id="event-venue"
                  placeholder="e.g. NSCI Dome"
                  aria-invalid={!!errors.venue}
                  className="pl-10"
                  {...field}
                />
              )}
            />
          </div>
          <FieldError msg={errors.venue?.message} />
        </div>

      </div>

      {/* ── GPS Coordinates — optional fields ──────────────────────────────────
          These fields are marked optional in the Zod schema (z.string().optional()),
          so RHF won't produce a validation error if they are left empty.
          On submit, the parent converts them from string → number via parseFloat(). */}
      <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          GPS Coordinates{" "}
          <span className="font-normal normal-case">(optional)</span>
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="event-latitude">Latitude</Label>
            <Controller
              name="latitude"
              control={control}
              render={({ field }) => (
                <Input
                  id="event-latitude"
                  type="number"
                  step="any"
                  placeholder="e.g. 19.0760"
                  {...field}
                />
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="event-longitude">Longitude</Label>
            <Controller
              name="longitude"
              control={control}
              render={({ field }) => (
                <Input
                  id="event-longitude"
                  type="number"
                  step="any"
                  placeholder="e.g. 72.8777"
                  {...field}
                />
              )}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
