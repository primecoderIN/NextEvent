import axios from "axios"
import type { Event } from "@/Types/Event"
import { useQuery } from "@tanstack/react-query"

export const fetchEventDetail = async (id: string): Promise<Event> => {
  const response = await axios.get<Event>(
    `https://localhost:5001/api/events/${id}`
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
