import { Eye } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useFormContext, useWatch } from "react-hook-form"
import type { EventFormValues } from "@/features/events/components/EventForm/types"
import { SectionTitle } from "@/features/events/components/EventForm/components"
import { EventCard } from "@/features/events/components/EventCard"
import type { Event } from "@/types/Event"

export function EventPreviewCard() {
  const { t } = useTranslation(["createEvent", "common"])
  const { control } = useFormContext<EventFormValues>()

  const [title, description, category, date, city, venue] = useWatch({
    control,
    name: ["title", "description", "category", "date", "city", "venue"],
  })

  // We map form values to a partial Event object for the EventCard
  const mockEvent: Partial<Event> = {
    title: title?.trim() || t("preview.titlePlaceholder"),
    description: description?.trim() || t("preview.descriptionPlaceholder"),
    category: category || "other",
    date: date ? date.toISOString() : undefined,
    city: city?.trim() || t("fields.city.label"),
    venue: venue?.trim() || t("fields.venue.label"),
  }

  const imageSeed = title?.trim() || "preview"

  return (
    <section className="space-y-5">
      <SectionTitle icon={<Eye className="h-4 w-4" />} title={t("sections.preview")} />
      
      <div className="max-w-sm mx-auto sm:mx-0">
        <EventCard 
          event={mockEvent} 
          imageSeed={imageSeed} 
          showBookButton={false} 
          className="w-full md:w-full"
        />
      </div>
    </section>
  )
}

