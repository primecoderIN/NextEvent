import type { Event } from "@/Types/Event"
import type { ApiResponse } from "@/Types/ApiResponse"
import { useQuery } from "@tanstack/react-query"
import { axiosHttpAgent } from "@/lib/axios";

export const fetchEvents = async (): Promise<Event[]> => {
  const response = await axiosHttpAgent.get<ApiResponse<Event[]>>("/events")
  return response.data.data ?? []
};

export const EVENTS_QUERY_KEY = ["events"] as const

export function useEvents() {
  const { isPending, data: events, isError } = useQuery<Event[], Error>({
    queryKey: EVENTS_QUERY_KEY,
    queryFn: fetchEvents,
  })

  return { events: events || [], loading: isPending, error: isError }
}
