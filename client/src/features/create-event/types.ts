// ─── Shared form types, constants & Zod schema for Create/Edit Event ──────────
import { z } from "zod"

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

// ── Step 1: Define the Zod validation schema ──────────────────────────────────
//
// This schema serves as the single source of truth for:
//   - Field shapes (string, Date, optional)
//   - Validation rules (min length, regex, required)
//   - TypeScript types (inferred via z.infer below)
//
// It is passed to zodResolver() inside useForm() so RHF delegates all
// validation logic to Zod instead of writing validate functions manually.
export const eventFormSchema = z.object({
  title: z
    .string()
    .min(1, "Event title is required")
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be at most 100 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .min(10, "Must be at least 10 characters")
    .max(1000, "Must be at most 1000 characters"),
  category: z.string().min(1, "Please select a category"),
  // date is a JS Date object, not a string — the shadcn Calendar picker returns
  // a Date, so we validate it as z.date(). On submit we convert it to ISO string.
  date: z.date({ required_error: "Event date is required" }),
  time: z.string().min(1, "Event time is required").regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  city: z.string().min(1, "City is required"),
  venue: z.string().min(1, "Venue is required"),
  // Latitude and longitude are optional strings from the input; we parse them
  // to floats on submit rather than storing numbers in the form state.
  latitude: z.string().optional(),
  longitude: z.string().optional(),
})

// ── Step 2: Infer the TypeScript type from the schema ────────────────────────
//
// z.infer<> derives the TypeScript type automatically from the Zod schema.
// This means the type and the validation rules can never drift apart —
// updating the schema updates the type automatically.
export type EventFormValues = z.infer<typeof eventFormSchema>
