export type Event = {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryId: string;
  date: string; // UTC ISO-8601 datetime string with Z suffix, e.g. "2026-06-29T10:30:00.000Z"
  city: string;
  venue: string;
  isCancelled: boolean;
  latitude: number;
  longitude: number;
  organizationId?: string | null;
  organizationName?: string | null;
  organizationSlug?: string | null;
  organizationLogoUrl?: string | null;
}
