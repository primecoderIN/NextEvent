import { MapPin, Building2, Globe } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Controller, useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { EventFormValues } from "@/features/create-event/types"
import { FieldError, SectionTitle } from "@/features/create-event/components"

export function LocationSection() {
  const { t } = useTranslation(["createEvent", "common"])
  const { control, formState: { errors } } = useFormContext<EventFormValues>()

  return (
    <section className="space-y-5">
      <SectionTitle icon={<MapPin className="h-4 w-4" />} title={t("sections.location")} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="event-city">
            {t("fields.city.label")} <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <Input
                  id="event-city"
                  placeholder={t("fields.city.placeholder")}
                  aria-invalid={!!errors.city}
                  className="pl-10"
                  {...field}
                />
              )}
            />
          </div>
          <FieldError msg={errors.city?.message} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="event-venue">
            {t("fields.venue.label")} <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Controller
              name="venue"
              control={control}
              render={({ field }) => (
                <Input
                  id="event-venue"
                  placeholder={t("fields.venue.placeholder")}
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

      <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {t("sections.gpsCoordinates")}{" "}
          <span className="font-normal normal-case">({t("optional", { ns: "common" })})</span>
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="event-latitude">{t("fields.latitude.label")}</Label>
            <Controller
              name="latitude"
              control={control}
              render={({ field }) => (
                <Input
                  id="event-latitude"
                  type="number"
                  step="any"
                  placeholder={t("fields.latitude.placeholder")}
                  {...field}
                />
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="event-longitude">{t("fields.longitude.label")}</Label>
            <Controller
              name="longitude"
              control={control}
              render={({ field }) => (
                <Input
                  id="event-longitude"
                  type="number"
                  step="any"
                  placeholder={t("fields.longitude.placeholder")}
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
