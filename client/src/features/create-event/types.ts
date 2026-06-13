// ─── Shared form types & constants for the Create Event feature ───────────────

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

export interface FormState {
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

export interface FormErrors {
  title?: string
  description?: string
  category?: string
  date?: string
  time?: string
  city?: string
  venue?: string
}
