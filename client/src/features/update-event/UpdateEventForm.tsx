import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { useUpdateEvent } from "@/hooks/useUpdateEvent"
import { Button } from "@/components/ui/button"
import { Divider } from "@/features/create-event/components"
import { BasicInfoSection } from "@/features/create-event/BasicInfoSection"
import { DateTimeSection } from "@/features/create-event/DateTimeSection"
import { LocationSection } from "@/features/create-event/LocationSection"
import { EventPreviewCard } from "@/features/create-event/EventPreviewCard"
import type { FormState, FormErrors } from "@/features/create-event/types"
import type { Event } from "@/Types/Event"

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert ISO datetime string → "YYYY-MM-DD" */
function toDateInput(iso: string): string {
  try {
    return new Date(iso).toISOString().split("T")[0]
  } catch {
    return ""
  }
}

/** Convert ISO datetime string → "HH:MM" (local time) */
function toTimeInput(iso: string): string {
  try {
    const d = new Date(iso)
    const hh = String(d.getHours()).padStart(2, "0")
    const mm = String(d.getMinutes()).padStart(2, "0")
    return `${hh}:${mm}`
  } catch {
    return ""
  }
}

/** Build initial FormState from an existing Event */
function eventToFormState(event: Event): FormState {
  return {
    title: event.title ?? "",
    description: event.description ?? "",
    category: event.category ?? "",
    date: event.date ? toDateInput(event.date) : "",
    time: event.date ? toTimeInput(event.date) : "",
    city: event.city ?? "",
    venue: event.venue ?? "",
    latitude: event.latitude != null ? String(event.latitude) : "",
    longitude: event.longitude != null ? String(event.longitude) : "",
  }
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface UpdateEventFormProps {
  id: string
  event: Event
}

// ─── Component ────────────────────────────────────────────────────────────────

export function UpdateEventForm({ id, event }: UpdateEventFormProps) {
  const navigate = useNavigate()
  const { updateEvent, loading: saving, error: apiError } = useUpdateEvent()
  const formRef = useRef<HTMLFormElement>(null)

  const [form, setForm] = useState<FormState>(() => eventToFormState(event))
  const [errors, setErrors] = useState<FormErrors>({})

  // Re-sync form if the event prop changes (e.g. React Query refetch)
  useEffect(() => {
    setForm(eventToFormState(event))
  }, [event])

  // ── Field handlers ───────────────────────────────────────────────────────────

  function setField(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
      if (errors[field as keyof FormErrors]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }))
      }
    }
  }

  function setCategory(value: string) {
    setForm((prev) => ({ ...prev, category: value }))
    if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }))
  }

  // ── Validation ───────────────────────────────────────────────────────────────

  function validate(): boolean {
    const e: FormErrors = {}
    if (!form.title.trim()) e.title = "Event title is required"
    else if (form.title.length < 3) e.title = "Title must be at least 3 characters"
    if (!form.description.trim()) e.description = "Description is required"
    else if (form.description.length < 10) e.description = "Must be at least 10 characters"
    if (!form.category) e.category = "Please select a category"
    if (!form.date) e.date = "Event date is required"
    if (!form.time) e.time = "Event time is required"
    if (!form.city.trim()) e.city = "City is required"
    if (!form.venue.trim()) e.venue = "Venue is required"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Submit ───────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    // ── Build a partial payload: only include fields that actually changed ──
    const payload: Parameters<typeof updateEvent>[1] = {}

    if (form.title.trim() !== event.title) payload.title = form.title.trim()
    if (form.description.trim() !== event.description) payload.description = form.description.trim()
    if (form.category !== event.category) payload.category = form.category
    if (form.city.trim() !== event.city) payload.city = form.city.trim()
    if (form.venue.trim() !== event.venue) payload.venue = form.venue.trim()

    // Compare date & time against what was originally loaded from the event
    const originalDate = event.date ? toDateInput(event.date) : ""
    const originalTime = event.date ? toTimeInput(event.date) : ""
    if (form.date !== originalDate || form.time !== originalTime) {
      payload.date = new Date(`${form.date}T${form.time}:00`).toISOString()
    }

    // Compare GPS — treat empty string as "no value"
    const newLat = form.latitude ? parseFloat(form.latitude) : undefined
    const newLng = form.longitude ? parseFloat(form.longitude) : undefined
    if (newLat !== event.latitude) payload.latitude = newLat
    if (newLng !== event.longitude) payload.longitude = newLng

    // Nothing changed — skip the network call
    if (Object.keys(payload).length === 0) {
      toast.info("No changes detected", {
        description: "You haven't modified anything yet.",
      })
      return
    }

    const result = await updateEvent(id, payload)

    if (result === true) {
      toast.success("Event updated!", {
        description: `"${form.title}" has been saved successfully.`,
      })
      navigate(`/events/${id}`, { replace: true })
    }
  }

  // ── Form ─────────────────────────────────────────────────────────────────────

  return (
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
          <span className="hidden sm:inline">Back</span>
        </Button>

        <h1 className="text-lg font-bold tracking-tight">Edit Event</h1>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => formRef.current?.requestSubmit()}
          disabled={saving}
          className="border-primary text-primary hover:bg-primary/10 gap-1.5"
        >
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Save Changes
        </Button>
      </div>

      {/* ── Desktop heading ── */}
      <div className="hidden lg:block px-6 pt-6 pb-2">
        <h2 className="text-3xl font-bold tracking-tight">Edit Event</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Update the details below. Fields marked with{" "}
          <span className="text-destructive font-semibold">*</span> are required.
        </p>
      </div>

      {/* ── API error banner ── */}
      {apiError && (
        <div className="mx-4 md:mx-6 mt-4 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
          <p className="text-sm text-destructive">{apiError}</p>
        </div>
      )}

      {/* ── Form ── */}
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        noValidate
        className="px-4 md:px-6 py-6 space-y-8"
      >
        <BasicInfoSection
          form={form}
          errors={errors}
          onFieldChange={setField}
          onCategoryChange={setCategory}
        />

        <Divider />

        <DateTimeSection form={form} errors={errors} onFieldChange={setField} />

        <Divider />

        <LocationSection form={form} errors={errors} onFieldChange={setField} />

        <Divider />

        <EventPreviewCard form={form} />

        {/* ── Actions ── */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 pb-8">
          <Button
            type="submit"
            id="update-event-submit"
            disabled={saving}
            className="flex-1 py-6 text-sm font-semibold gap-2 shadow-lg"
            style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)" }}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving Changes…
              </>
            ) : (
              "Save Changes →"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={saving}
            className="px-8 py-6"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
