import type { Event } from "@/types/Event"
import type { ApiResponse } from "@/types/ApiResponse"
import type { PagedList } from "@/types/PagedList"
import { useInfiniteQuery } from "@tanstack/react-query"
import { axiosHttpAgent } from "@/shared/lib/axios";

export const fetchEvents = async ({ pageParam = 1 }): Promise<PagedList<Event>> => {
  // Pass pagination parameters in camelCase to perfectly match the REST standard.
  // ASP.NET Core will automatically bind these to the PascalCase properties on GetEventsListQuery.
  const response = await axiosHttpAgent.get<ApiResponse<PagedList<Event>>>(`/events?pageNumber=${pageParam}&pageSize=10`)
  return response.data.data!
};

export const EVENTS_QUERY_KEY = ["events"] as const

export function useEvents() {
  // We use useInfiniteQuery to implement a "Load More" pattern instead of standard page-by-page.
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending, isError } = useInfiniteQuery({
    queryKey: EVENTS_QUERY_KEY,
    queryFn: fetchEvents,
    initialPageParam: 1,
    // Determines if there are more pages by comparing the current page against the total pages returned by the API.
    getNextPageParam: (lastPage) => 
      lastPage.currentPage < lastPage.totalPages ? lastPage.currentPage + 1 : undefined,
  })

  // Magic step: We flatten the array of paginated responses into a single continuous array of events.
  // This allows all UI components (like Carousels) to consume this data without knowing pagination even exists!
  const events = data?.pages.flatMap(page => page.items) || []

  return { events, loading: isPending, error: isError, fetchNextPage, hasNextPage, isFetchingNextPage }
}
