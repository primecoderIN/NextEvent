import { MapPin, Building2, Globe } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { FormState, FormErrors } from "@/features/create-event/types"
import { FieldError, SectionTitle } from "@/features/create-event/components"

interface LocationSectionProps {
  form: FormState
  errors: FormErrors
  onFieldChange: (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}

export function LocationSection({ form, errors, onFieldChange }: LocationSectionProps) {
  return (
    <section className="space-y-5">
      <SectionTitle icon={<MapPin className="h-4 w-4" />} title="Location" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* City */}
        <div className="space-y-1.5">
          <Label htmlFor="event-city">
            City <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="event-city"
              value={form.city}
              onChange={onFieldChange("city")}
              placeholder="e.g. Mumbai"
              aria-invalid={!!errors.city}
              className="pl-10"
            />
          </div>
          <FieldError msg={errors.city} />
        </div>

        {/* Venue */}
        <div className="space-y-1.5">
          <Label htmlFor="event-venue">
            Venue <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="event-venue"
              value={form.venue}
              onChange={onFieldChange("venue")}
              placeholder="e.g. NSCI Dome"
              aria-invalid={!!errors.venue}
              className="pl-10"
            />
          </div>
          <FieldError msg={errors.venue} />
        </div>
      </div>

      {/* GPS — optional */}
      <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          GPS Coordinates{" "}
          <span className="font-normal normal-case">(optional)</span>
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="event-latitude">Latitude</Label>
            <Input
              id="event-latitude"
              type="number"
              step="any"
              value={form.latitude}
              onChange={onFieldChange("latitude")}
              placeholder="e.g. 19.0760"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="event-longitude">Longitude</Label>
            <Input
              id="event-longitude"
              type="number"
              step="any"
              value={form.longitude}
              onChange={onFieldChange("longitude")}
              placeholder="e.g. 72.8777"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
