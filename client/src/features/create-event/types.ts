// ─── Shared form types, constants & Zod schema for Create/Edit Event ──────────
import { z } from "zod"
import { TFunction } from "i18next"

export const CATEGORIES = [
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
] as const

// We define the base schema without messages to infer the type safely
export const baseEventFormSchema = z.object({
  title: z.string(),
  description: z.string(),
  category: z.string(),
  date: z.date(),
  time: z.string(),
  city: z.string(),
  venue: z.string(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
})

export type EventFormValues = z.infer<typeof baseEventFormSchema>

// ── Step 1: Define the Zod validation schema via a factory function ───────────
// We use a factory function to inject `t` so error messages update when language changes.
export const getEventFormSchema = (t: TFunction<"createEvent">) =>
  z.object({
    title: z
      .string()
      .min(1, t("validation.titleRequired"))
      .min(3, t("validation.titleMin"))
      .max(100, t("validation.titleMax")),
    description: z
      .string()
      .min(1, t("validation.descriptionRequired"))
      .min(10, t("validation.descriptionMin"))
      .max(1000, t("validation.descriptionMax")),
    category: z.string().min(1, t("validation.categoryRequired")),
    date: z.date({ required_error: t("validation.dateRequired") }),
    time: z.string().min(1, t("validation.timeRequired")).regex(/^\d{2}:\d{2}$/, t("validation.timeFormat")),
    city: z.string().min(1, t("validation.cityRequired")),
    venue: z.string().min(1, t("validation.venueRequired")),
    latitude: z.string().optional(),
    longitude: z.string().optional(),
  })
