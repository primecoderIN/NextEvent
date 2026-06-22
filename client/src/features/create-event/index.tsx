import { useState } from "react"
import { useNavigate } from "react-router-dom"
// ── Step 1: Import useForm and FormProvider ───────────────────────────────────
// useForm  — creates the form instance (state, validation, submission handling)
// FormProvider — React context wrapper that shares the form instance with all
//   child components so they can call useFormContext() without prop drilling.
import { useForm, FormProvider } from "react-hook-form"
// zodResolver bridges RHF and Zod: it runs the Zod schema on every validation
// trigger and maps errors back to the RHF errors object.
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react"
import { useCreateEvent } from "@/hooks/useCreateEvent"
import { Button } from "@/components/ui/button"
import { Divider } from "@/features/create-event/components"
import { BasicInfoSection } from "@/features/create-event/BasicInfoSection"
import { DateTimeSection } from "@/features/create-event/DateTimeSection"
import { LocationSection } from "@/features/create-event/LocationSection"
import { EventPreviewCard } from "@/features/create-event/EventPreviewCard"
import { CreateEventSuccess } from "@/features/create-event/CreateEventSuccess"
import { eventFormSchema, type EventFormValues } from "@/features/create-event/types"

// ─── Page ─────────────────────────────────────────────────────────────────────

export function CreateEventPage() {
  const navigate = useNavigate()
  const { createEvent, loading: apiLoading, error: apiError } = useCreateEvent()
  const [newEventId, setNewEventId] = useState<string | null>(null)

  // ── Step 2: Initialise the form ─────────────────────────────────────────────
  //
  // useForm returns the "methods" object which holds the entire form API.
  // We spread it onto <FormProvider> so every child section can access it
  // via useFormContext() without receiving control/errors as props.
  const methods = useForm<EventFormValues>({
    // Wire up Zod schema validation — RHF will call this on every trigger.
    resolver: zodResolver(eventFormSchema),

    // Provide initial values for every field. RHF uses these to detect dirtiness
    // (changed vs. original) and to reset the form back to a clean state.
    // Note: `date` has no default here — Zod will surface "required" on submit.
    defaultValues: {
      title: "",
      description: "",
      category: "",
      time: "",
      city: "",
      venue: "",
      latitude: "",
      longitude: "",
    },

    // mode: "onTouched"
    //   - First interaction: validates on blur (user leaves a field)
    //   - After first submit attempt: switches to onChange for instant feedback
    // This is friendlier than the default "onSubmit" which only validates when
    // the submit button is clicked.
    mode: "onTouched",
  })

  // Destructure only what the page itself needs — sections pull their own
  // values from context via useFormContext().
  const {
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = methods

  // Combine RHF's own submission state with the external API loading flag.
  // isSubmitting is true from the moment handleSubmit fires until onSubmit resolves,
  // so buttons are disabled even before the network call begins.
  const isBusy = isSubmitting || apiLoading

  // ── Step 3: Programmatically set a field value ───────────────────────────────
  //
  // setValue() is the RHF way to update a field outside of a Controller/register.
  // shouldValidate: true   → re-run Zod for this field immediately
  // shouldDirty: true      → mark the field as changed (useful for dirty checks)
  function handleDescriptionGenerated(description: string) {
    setValue("description", description, { shouldValidate: true, shouldDirty: true })
  }

  // ── Step 4: Handle form submission ──────────────────────────────────────────
  //
  // onSubmit only runs if Zod validation passes — RHF won't call it if there
  // are validation errors. The `values` parameter is fully typed as EventFormValues.
  async function onSubmit(values: EventFormValues) {
    // Combine the Date object (from the calendar picker) + time string into
    // a single UTC ISO-8601 string for the API.
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

    const id = await createEvent({
      title: values.title.trim(),
      description: values.description.trim(),
      category: values.category,
      date: utcDate.toISOString(),
      city: values.city.trim(),
      venue: values.venue.trim(),
      latitude: values.latitude ? parseFloat(values.latitude) : 0,
      longitude: values.longitude ? parseFloat(values.longitude) : 0,
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

  // ── Step 5: Render — wrap everything in FormProvider ────────────────────────
  //
  // <FormProvider {...methods}> passes the entire form instance through React
  // context. Any descendant can call useFormContext<EventFormValues>() to get
  // control, errors, setValue, etc. without being passed them as props.
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
            <span className="hidden sm:inline">Back</span>
          </Button>

          <h1 className="text-lg font-bold tracking-tight">Create Event</h1>

          {/* Calling handleSubmit() manually triggers the same validation + onSubmit
              flow as the <form onSubmit> handler — useful for toolbar action buttons. */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSubmit(onSubmit)()}
            disabled={isBusy}
            className="border-primary text-primary hover:bg-primary/10 gap-1.5"
          >
            {isBusy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
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

        {/* ── Form ──
            handleSubmit wraps onSubmit:
              1. Runs Zod validation via zodResolver
              2. If valid   → calls onSubmit(values) with typed, validated data
              3. If invalid → populates formState.errors, does NOT call onSubmit
            noValidate disables the browser's native HTML5 validation popup
            so Zod/RHF errors are the only ones shown. */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="px-4 md:px-6 py-6 space-y-8"
        >
          {/* Each section uses useFormContext() internally — no props needed */}
          <BasicInfoSection onDescriptionGenerated={handleDescriptionGenerated} />

          <Divider />

          <DateTimeSection />

          <Divider />

          <LocationSection />

          <Divider />

          <EventPreviewCard />

          {/* ── Actions ── */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 pb-8">
            <Button
              type="submit"
              id="create-event-submit"
              disabled={isBusy}
              className="flex-1 py-6 text-sm font-semibold gap-2 shadow-lg"
              style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)" }}
            >
              {isBusy ? (
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
              disabled={isBusy}
              className="px-8 py-6"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </FormProvider>
  )
}
