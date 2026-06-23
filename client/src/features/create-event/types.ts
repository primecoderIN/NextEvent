// ─── Shared form types, constants & Zod schema for Create/Edit Event ──────────
import { z } from "zod"
import type { TFunction } from "i18next"

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
// All error params use the Zod v4 unified { error: "..." } API.
// Zod v3's plain-string shorthand and required_error/invalid_type_error are removed.
export const getEventFormSchema = (t: TFunction<"createEvent">) =>
  z.object({
    title: z
      .string()
      .min(1, { error: t("validation.titleRequired") })
      .min(3, { error: t("validation.titleMin") })
      .max(100, { error: t("validation.titleMax") }),
    description: z
      .string()
      .min(1, { error: t("validation.descriptionRequired") })
      .min(10, { error: t("validation.descriptionMin") })
      .max(1000, { error: t("validation.descriptionMax") }),
    category: z.string().min(1, { error: t("validation.categoryRequired") }),
    date: z.date({ error: t("validation.dateRequired") }),
    time: z
      .string()
      .min(1, { error: t("validation.timeRequired") })
      .regex(/^\d{2}:\d{2}$/, { error: t("validation.timeFormat") }),
    city: z.string().min(1, { error: t("validation.cityRequired") }),
    venue: z.string().min(1, { error: t("validation.venueRequired") }),
    latitude: z.string().optional(),
    longitude: z.string().optional(),
  })
