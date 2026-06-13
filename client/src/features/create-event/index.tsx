import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react"
import { useCreateEvent } from "@/hooks/useCreateEvent"
import { Button } from "@/components/ui/button"
import { Divider } from "@/features/create-event/components"
import { BasicInfoSection } from "@/features/create-event/BasicInfoSection"
import { DateTimeSection } from "@/features/create-event/DateTimeSection"
import { LocationSection } from "@/features/create-event/LocationSection"
import { EventPreviewCard } from "@/features/create-event/EventPreviewCard"
import { CreateEventSuccess } from "@/features/create-event/CreateEventSuccess"
import type { FormState, FormErrors } from "@/features/create-event/types"

// ─── Page ─────────────────────────────────────────────────────────────────────

export function CreateEventPage() {
  const navigate = useNavigate()
  const { createEvent, loading, error: apiError } = useCreateEvent()
  const formRef = useRef<HTMLFormElement>(null)

  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    category: "",
    date: "",
    time: "",
    city: "",
    venue: "",
    latitude: "",
    longitude: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [newEventId, setNewEventId] = useState<string | null>(null)

  // ── Field handlers ─────────────────────────────────────────────────────────

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

  // ── Validation ─────────────────────────────────────────────────────────────

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

  // ── Submit ─────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    const isoDate = new Date(`${form.date}T${form.time}:00`).toISOString()
    const id = await createEvent({
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      date: isoDate,
      city: form.city.trim(),
      venue: form.venue.trim(),
      latitude: form.latitude ? parseFloat(form.latitude) : 0,
      longitude: form.longitude ? parseFloat(form.longitude) : 0,
    })

    if (id) setNewEventId(id)
  }

  // ── Success screen ─────────────────────────────────────────────────────────

  if (newEventId) {
    return (
      <CreateEventSuccess
        eventId={newEventId}
        onViewEvent={() => navigate(`/events/${newEventId}`)}
        onBackHome={() => navigate("/")}
      />
    )
  }

  // ── Form ───────────────────────────────────────────────────────────────────

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

        <h1 className="text-lg font-bold tracking-tight">Create Event</h1>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => formRef.current?.requestSubmit()}
          disabled={loading}
          className="border-primary text-primary hover:bg-primary/10 gap-1.5"
        >
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Save Draft
        </Button>
      </div>

      {/* ── Desktop heading ── */}
      <div className="hidden lg:block px-6 pt-6 pb-2">
        <h2 className="text-3xl font-bold tracking-tight">Create New Event</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Fields marked with <span className="text-destructive font-semibold">*</span> are required.
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

        <DateTimeSection
          form={form}
          errors={errors}
          onFieldChange={setField}
        />

        <Divider />

        <LocationSection
          form={form}
          errors={errors}
          onFieldChange={setField}
        />

        <Divider />

        <EventPreviewCard form={form} />

        {/* ── Actions ── */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 pb-8">
          <Button
            type="submit"
            id="create-event-submit"
            disabled={loading}
            className="flex-1 py-6 text-sm font-semibold gap-2 shadow-lg"
            style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)" }}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating Event…
              </>
            ) : (
              "Publish Event →"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={loading}
            className="px-8 py-6"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
