import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Calendar,
  MapPin,
  AlignLeft,
  Type,
  Building2,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Globe,
  Tag,
} from "lucide-react"
import { useCreateEvent } from "@/hooks/useCreateEvent"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "Music",
  "Technology",
  "Sports",
  "Art",
  "Food & Drink",
  "Business",
  "Health",
  "Education",
  "Networking",
  "Comedy",
  "Theatre",
  "Film",
  "Gaming",
  "Outdoor",
  "Other",
]

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  title: string
  description: string
  category: string
  date: string
  time: string
  city: string
  venue: string
  latitude: string
  longitude: string
}

interface FormErrors {
  title?: string
  description?: string
  category?: string
  date?: string
  time?: string
  city?: string
  venue?: string
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return (
    <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {msg}
    </p>
  )
}

function SectionTitle({
  icon,
  title,
}: {
  icon: React.ReactNode
  title: string
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
        {icon}
      </div>
      <h3 className="font-bold text-base">{title}</h3>
    </div>
  )
}

function Divider() {
  return <hr className="border-border/40" />
}

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
  const [submitted, setSubmitted] = useState(false)
  const [newEventId, setNewEventId] = useState<string | null>(null)

  // ── Helpers ────────────────────────────────────────────────────────────────

  function setField(field: keyof FormState) {
    return (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
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

    if (id) {
      setNewEventId(id)
      setSubmitted(true)
    }
  }

  // ── Success ────────────────────────────────────────────────────────────────

  if (submitted && newEventId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center gap-5">
        <div
          className="h-20 w-20 rounded-full flex items-center justify-center shadow-lg"
          style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)" }}
        >
          <CheckCircle2 className="h-10 w-10 text-white" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Event Created! 🎉</h2>
          <p className="text-muted-foreground text-sm max-w-xs">
            Your event has been successfully published and is now live.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <Button
            onClick={() => navigate(`/events/${newEventId}`)}
            className="px-6"
            style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)" }}
          >
            View Event
          </Button>
          <Button variant="outline" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </div>
      </div>
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

      {/* ── API error ── */}
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
        {/* ── Section 1: Basic Info ── */}
        <section className="space-y-5">
          <SectionTitle icon={<Type className="h-4 w-4" />} title="Basic Info" />

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="event-title">
              Event Title <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="event-title"
                value={form.title}
                onChange={setField("title")}
                maxLength={100}
                placeholder="Enter a catchy event title"
                aria-invalid={!!errors.title}
                className="pr-14"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground tabular-nums pointer-events-none">
                {form.title.length}/100
              </span>
            </div>
            <FieldError msg={errors.title} />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="event-description">
              Description <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Textarea
                id="event-description"
                value={form.description}
                onChange={setField("description")}
                maxLength={1000}
                rows={4}
                placeholder="Describe what attendees can expect at your event…"
                aria-invalid={!!errors.description}
                className="pb-7"
              />
              <span className="absolute right-3 bottom-2.5 text-xs text-muted-foreground tabular-nums pointer-events-none">
                {form.description.length}/1000
              </span>
            </div>
            <FieldError msg={errors.description} />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label htmlFor="event-category">
              Category <span className="text-destructive">*</span>
            </Label>
            <Select value={form.category} onValueChange={setCategory}>
              <SelectTrigger
                id="event-category"
                aria-invalid={!!errors.category}
                className={cn(
                  errors.category && "border-destructive/60 bg-destructive/5"
                )}
              >
                <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError msg={errors.category} />
          </div>
        </section>

        <Divider />

        {/* ── Section 2: Date & Time ── */}
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
                onChange={setField("date")}
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
                onChange={setField("time")}
                aria-invalid={!!errors.time}
              />
              <FieldError msg={errors.time} />
            </div>
          </div>
        </section>

        <Divider />

        {/* ── Section 3: Location ── */}
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
                  onChange={setField("city")}
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
                  onChange={setField("venue")}
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
                  onChange={setField("latitude")}
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
                  onChange={setField("longitude")}
                  placeholder="e.g. 72.8777"
                />
              </div>
            </div>
          </div>
        </section>

        <Divider />

        {/* ── Section 4: Live Preview ── */}
        <section className="space-y-4">
          <SectionTitle icon={<AlignLeft className="h-4 w-4" />} title="Preview" />
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base truncate">
                    {form.title || (
                      <span className="text-muted-foreground/40 font-normal italic">
                        Event title will appear here
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {form.description || (
                      <span className="italic">Description preview…</span>
                    )}
                  </p>
                </div>
                {form.category && (
                  <span className="shrink-0 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                    {form.category}
                  </span>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                {(form.date || form.time) && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {form.date
                      ? new Date(
                          `${form.date}T${form.time || "00:00"}`
                        ).toLocaleDateString("en-IN", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                    {form.time && ` • ${form.time}`}
                  </span>
                )}
                {(form.venue || form.city) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {[form.venue, form.city].filter(Boolean).join(", ") || "—"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

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
            className="px-8"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
