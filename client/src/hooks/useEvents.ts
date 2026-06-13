import axios from "axios"
import type { Event } from "@/Types/Event"
import { useQuery } from "@tanstack/react-query"

export const fetchEvents = async (): Promise<Event[]> => {
  const response = await axios.get<Event[]>(
    "https://localhost:5001/api/events"
  );

  return response.data;
};

export const EVENTS_QUERY_KEY = ["events"] as const

export function useEvents() {
  const { isPending, data: events, isError } = useQuery<Event[], Error>({
    queryKey: EVENTS_QUERY_KEY,
    queryFn: fetchEvents,
  })

  return {events: events || [],loading: isPending, error: isError}
}
