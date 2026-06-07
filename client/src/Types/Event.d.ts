export type Event = {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string; // ISO date string from API
  city: string;
  venue: string;
  isCancelled: boolean;
  latitude: number;
  longitude: number;
}