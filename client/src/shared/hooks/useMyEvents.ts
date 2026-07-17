import type { Event } from "@/types/Event"
import type { ApiResponse } from "@/types/ApiResponse"
import type { PagedList } from "@/types/PagedList"
import { useInfiniteQuery } from "@tanstack/react-query"
import { axiosHttpAgent } from "@/shared/lib/axios";
import { type EventFilters, EVENTS_QUERY_KEY } from "./useEvents"

export const fetchMyEvents = async ({ pageParam = 1, queryKey }: any): Promise<PagedList<Event>> => {
  const [_key, _type, filters] = queryKey as [string, string, EventFilters | undefined];
  
  const params = new URLSearchParams();
  params.append("pageNumber", pageParam.toString());
  params.append("pageSize", "10");
  
  if (filters?.q) params.append("q", filters.q);
  if (filters?.categoryId && filters.categoryId !== "all") params.append("categoryId", filters.categoryId);
  if (filters?.city) params.append("city", filters.city);
  if (filters?.dateFrom) params.append("dateFrom", filters.dateFrom);
  if (filters?.dateTo) params.append("dateTo", filters.dateTo);
  if (filters?.organizationId) params.append("organizationId", filters.organizationId);

  const response = await axiosHttpAgent.get<ApiResponse<PagedList<Event>>>(`/events/my?${params.toString()}`);
  return response.data.data!
};

export interface UseMyEventsOptions {
  enabled?: boolean;
}

export function useMyEvents(filters?: EventFilters, options?: UseMyEventsOptions) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending, isError } = useInfiniteQuery({
    queryKey: [...EVENTS_QUERY_KEY, "my", filters],
    queryFn: fetchMyEvents,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => 
      lastPage.currentPage < lastPage.totalPages ? lastPage.currentPage + 1 : undefined,
    enabled: options?.enabled,
  })

  const events = data?.pages.flatMap(page => page.items) || []

  return { events, loading: isPending, error: isError, fetchNextPage, hasNextPage, isFetchingNextPage }
}
