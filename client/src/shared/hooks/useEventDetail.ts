import type { Event } from "@/types/Event"
import type { ApiResponse } from "@/types/ApiResponse"
import { useQuery } from "@tanstack/react-query"
import { axiosHttpAgent } from "@/shared/lib/axios"

export const fetchEventDetail = async (id: string): Promise<Event> => {
  const response = await axiosHttpAgent.get<ApiResponse<Event>>(`/events/${id}`)
  const event = response.data.data
  if (!event) throw new Error(response.data.message || "Event not found")
  return event
}

export const eventDetailQueryKey = (id: string) => ["events", id] as const

export function useEventDetail(id: string | undefined) {
  const { isPending, data: event, isError } = useQuery<Event, Error>({
    queryKey: eventDetailQueryKey(id!),
    queryFn: () => fetchEventDetail(id!),
    enabled: !!id,
    retry: false,
  })

  return { event: event ?? null, loading: isPending, error: isError }
}
