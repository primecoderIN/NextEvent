import type { Event } from "@/Types/Event"
import { useQuery } from "@tanstack/react-query"
import { axiosHttpAgent } from "@/lib/axios"

export const fetchEventDetail = async (id: string): Promise<Event> => {
  const response = await axiosHttpAgent.get<Event>(
    `/events/${id}`
  )
  return response.data
}

export const eventDetailQueryKey = (id: string) => ["events", id] as const

export function useEventDetail(id: string | undefined) {
  const { isPending, data: event, isError } = useQuery<Event, Error>({
    queryKey: eventDetailQueryKey(id!),
    queryFn: () => fetchEventDetail(id!),
    enabled: !!id,
  })

  return { event: event ?? null, loading: isPending, error: isError }
}
