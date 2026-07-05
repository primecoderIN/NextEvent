import { format } from "date-fns"
import { Calendar, Eye, MapPin } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useFormContext, useWatch } from "react-hook-form"
import type { EventFormValues } from "@/portals/organizer/pages/create-event/types"
import { SectionTitle } from "@/portals/organizer/pages/create-event/components"
import { getEventImage, getCategoryBadgeClass } from "@/portals/public/widgets/common/helpers"

export function EventPreviewCard() {
  const { t } = useTranslation(["createEvent", "common"])
  const { control } = useFormContext<EventFormValues>()

  const [title, description, category, date, city, venue] = useWatch({
    control,
    name: ["title", "description", "category", "date", "city", "venue"],
  })

  // Use values if present, else fallback to placeholders
  const displayTitle = title?.trim() || t("preview.titlePlaceholder")
  const displayDesc = description?.trim() || t("preview.descriptionPlaceholder")
  const displayCity = city?.trim() || t("fields.city.label")
  const displayVenue = venue?.trim() || t("fields.venue.label")

  // We use the raw category value for the seed so the image matches
  const imageSeed = title?.trim() || "preview"
  const catParam = category || "other"

  return (
    <section className="space-y-5">
      <SectionTitle icon={<Eye className="h-4 w-4" />} title={t("sections.preview")} />

      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm max-w-sm mx-auto sm:mx-0 transition-all duration-300 hover:shadow-md hover:border-primary/20">
        {/* Image / Header */}
        <div className="relative h-48 bg-muted w-full overflow-hidden">
          <img
            src={getEventImage(catParam, imageSeed, "card")}
            alt="Event preview"
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {category && (
            <span
              className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold text-white uppercase tracking-wider shadow-sm ${getCategoryBadgeClass(category)}`}
            >
              {category}
            </span>
          )}

          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-2.5 py-1.5 text-center text-white min-w-12 shadow-sm">
              <p className="text-[9px] font-bold tracking-widest uppercase opacity-90">
                {date ? format(date, "MMM") : "---"}
              </p>
              <p className="text-xl font-black leading-none my-0.5">
                {date ? format(date, "dd") : "--"}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-lg leading-tight line-clamp-1 mb-1.5">
            {displayTitle}
          </h3>

          <div className="flex flex-col gap-1.5 text-xs text-muted-foreground mb-3">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 shrink-0 opacity-70" />
              <span>{date ? format(date, "d MMM yyyy") : t("fields.date.label")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0 opacity-70" />
              <span className="line-clamp-1">
                {displayVenue}, {displayCity}
              </span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground/80 leading-relaxed line-clamp-2">
            {displayDesc}
          </p>
        </div>
      </div>
    </section>
  )
}
