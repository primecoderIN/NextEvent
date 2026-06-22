import { useEffect } from "react"
import { parseISO } from "date-fns"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { useUpdateEvent } from "@/hooks/useUpdateEvent"
import { Button } from "@/components/ui/button"
import { Divider } from "@/features/create-event/components"
import { BasicInfoSection } from "@/features/create-event/BasicInfoSection"
import { DateTimeSection } from "@/features/create-event/DateTimeSection"
import { LocationSection } from "@/features/create-event/LocationSection"
import { EventPreviewCard } from "@/features/create-event/EventPreviewCard"
import { getEventFormSchema, type EventFormValues } from "@/features/create-event/types"
import type { Event } from "@/Types/Event"

function isoToDate(iso: string): Date {
  const d = parseISO(iso)
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

function isoToTime(iso: string): string {
  const d = parseISO(iso)
  const h = String(d.getUTCHours()).padStart(2, "0")
  const m = String(d.getUTCMinutes()).padStart(2, "0")
  return `${h}:${m}`
}

function eventToDefaults(event: Event): EventFormValues {
  return {
    title: event.title ?? "",
    description: event.description ?? "",
    category: event.category ?? "",
    date: event.date ? isoToDate(event.date) : new Date(),
    time: event.date ? isoToTime(event.date) : "",
    city: event.city ?? "",
    venue: event.venue ?? "",
    latitude: event.latitude != null ? String(event.latitude) : "",
    longitude: event.longitude != null ? String(event.longitude) : "",
  }
}

interface UpdateEventFormProps {
  id: string
  event: Event
}

export function UpdateEventForm({ id, event }: UpdateEventFormProps) {
  const navigate = useNavigate()
  const { t } = useTranslation(["createEvent", "common"])
  const { updateEvent, loading: apiLoading, error: apiError } = useUpdateEvent()

  const methods = useForm<EventFormValues>({
    resolver: zodResolver(getEventFormSchema(t)),
    defaultValues: eventToDefaults(event),
    mode: "onTouched",
  })

  const {
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = methods

  const isBusy = isSubmitting || apiLoading

  useEffect(() => {
    reset(eventToDefaults(event))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event.id, event.date, reset])

  // ── Step 4: Programmatic field update (AI description generator) ────────────
  //
  // setValue() is the RHF API for updating a field outside of a Controller.
  // shouldValidate re-runs Zod for the field so an error clears immediately.
  // shouldDirty marks the field as changed so the form knows it was modified.
  function handleDescriptionGenerated(description: string) {
    setValue("description", description, { shouldValidate: true, shouldDirty: true })
  }

  // ── Step 5: Submit handler ───────────────────────────────────────────────────
  //
  // RHF calls onSubmit only after Zod validation passes. The `values` parameter
  // is fully typed — no casting needed. We build a partial payload containing
  // only the fields that differ from the original event to minimise the PATCH.
  async function onSubmit(values: EventFormValues) {
    const payload: Parameters<typeof updateEvent>[1] = {}

    // String field diff — only include if the trimmed value actually changed
    if (values.title.trim() !== event.title) payload.title = values.title.trim()
    if (values.description.trim() !== event.description) payload.description = values.description.trim()
    if (values.category !== event.category) payload.category = values.category
    if (values.city.trim() !== event.city) payload.city = values.city.trim()
    if (values.venue.trim() !== event.venue) payload.venue = values.venue.trim()

    // Date diff — compare each UTC component separately to avoid timezone issues
    const originalDate = event.date ? isoToDate(event.date) : null
    const originalTime = event.date ? isoToTime(event.date) : ""

    const dateChanged =
      !originalDate ||
      values.date.getUTCFullYear() !== originalDate.getUTCFullYear() ||
      values.date.getUTCMonth() !== originalDate.getUTCMonth() ||
      values.date.getUTCDate() !== originalDate.getUTCDate()

    if (dateChanged || values.time !== originalTime) {
      // Reconstruct a UTC ISO string from the Date object + time string
      const [hours, minutes] = values.time.split(":").map(Number)
      const utcDate = new Date(
        Date.UTC(
          values.date.getUTCFullYear(),
          values.date.getUTCMonth(),
          values.date.getUTCDate(),
          hours,
          minutes
        )
      )
      payload.date = utcDate.toISOString()
    }

    // GPS diff — parse optional string fields to numbers for comparison
    const newLat = values.latitude ? parseFloat(values.latitude) : undefined
    const newLng = values.longitude ? parseFloat(values.longitude) : undefined
    if (newLat !== event.latitude) payload.latitude = newLat
    if (newLng !== event.longitude) payload.longitude = newLng

    // Guard: nothing changed — inform the user and skip the network call
    if (Object.keys(payload).length === 0) {
      toast.info(t("noChanges", { ns: "common" }), {
        description: t("noChangesDesc", { ns: "common" }),
      })
      return
    }

    const result = await updateEvent(id, payload)

    if (result === true) {
      toast.success(t("success.updated"), {
        description: t("success.updatedDesc", { title: values.title }),
      })
      navigate(`/events/${id}`, { replace: true })
    }
  }

  // ── Step 6: Render — wrap in FormProvider ────────────────────────────────────
  //
  // Spreading `methods` onto FormProvider passes the full form API through
  // React context. Child sections (BasicInfoSection, etc.) call useFormContext()
  // to read control, errors, and setValue without receiving any props.
  return (
    <FormProvider {...methods}>
      <div className="max-w-4xl mx-auto">
        {/* ── Top bar ── */}
        <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-border/40 sticky top-0 bg-background/95 backdrop-blur z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2 text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{t("back", { ns: "common" })}</span>
          </Button>

          <h1 className="text-lg font-bold tracking-tight">{t("pageTitle.edit")}</h1>

          {/* Calling handleSubmit() manually triggers validation + onSubmit,
              identical to the native form submit — used for toolbar shortcuts. */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSubmit(onSubmit)()}
            disabled={isBusy}
            className="border-primary text-primary hover:bg-primary/10 gap-1.5"
          >
            {isBusy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {t("actions.saveChanges")}
          </Button>
        </div>

        <div className="hidden lg:block px-6 pt-6 pb-2">
          <h2 className="text-3xl font-bold tracking-tight">{t("headings.edit")}</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {t("headings.editSub")}
          </p>
        </div>

        {apiError && (
          <div className="mx-4 md:mx-6 mt-4 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            <p className="text-sm text-destructive">{apiError}</p>
          </div>
        )}

        {/* ── Form ──
            handleSubmit: runs Zod → calls onSubmit if valid, populates errors if not.
            noValidate: suppresses the browser's built-in HTML5 validation UI. */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="px-4 md:px-6 py-6 space-y-8"
        >
          {/* Each section reads control/errors from context — no props needed */}
          <BasicInfoSection onDescriptionGenerated={handleDescriptionGenerated} />

          <Divider />

          <DateTimeSection />

          <Divider />

          <LocationSection />

          <Divider />

          <EventPreviewCard />

          <div className="flex flex-col sm:flex-row gap-3 pt-2 pb-8">
            <Button
              type="submit"
              id="update-event-submit"
              disabled={isBusy}
              className="flex-1 py-6 text-sm font-semibold gap-2 shadow-lg"
              style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)" }}
            >
              {isBusy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("actions.savingChanges")}
                </>
              ) : (
                t("actions.saveChanges") + " →"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isBusy}
              className="px-8 py-6"
            >
              {t("cancel", { ns: "common" })}
            </Button>
          </div>
        </form>
      </div>
    </FormProvider>
  )
}
