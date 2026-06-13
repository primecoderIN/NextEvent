import axios from "axios"
import type { Event } from "@/Types/Event"
import { useQuery } from "@tanstack/react-query"

export const fetchEvents = async (): Promise<Event[]> => {
  const response = await axios.get<Event[]>(
    "https://localhost:5001/api/events"
  );

  return response.data;
};

export function useEvents() {
  const {isPending,data:events,isError}=  useQuery<Event[], Error>({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  return {events,loading: isPending, error: isError}
}
