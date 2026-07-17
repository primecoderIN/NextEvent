import type { Event } from "@/types/Event"
import type { ApiResponse } from "@/types/ApiResponse"
import type { PagedList } from "@/types/PagedList"
import { useInfiniteQuery } from "@tanstack/react-query"
import { axiosHttpAgent } from "@/shared/lib/axios";

export interface EventFilters {
  q?: string | null;
  categoryId?: string | null;
  city?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  organizationId?: string | null;
}

export const fetchEvents = async ({ pageParam = 1, queryKey }: any): Promise<PagedList<Event>> => {
  const [_key, filters] = queryKey as [string, EventFilters | undefined];
  
  const params = new URLSearchParams();
  params.append("pageNumber", pageParam.toString());
  params.append("pageSize", "10");
  
  if (filters?.q) params.append("q", filters.q);
  if (filters?.categoryId && filters.categoryId !== "all") params.append("categoryId", filters.categoryId);
  if (filters?.city) params.append("city", filters.city);
  if (filters?.dateFrom) params.append("dateFrom", filters.dateFrom);
  if (filters?.dateTo) params.append("dateTo", filters.dateTo);
  if (filters?.organizationId) params.append("organizationId", filters.organizationId);

  const response = await axiosHttpAgent.get<ApiResponse<PagedList<Event>>>(`/events?${params.toString()}`);
  return response.data.data!
};

export const EVENTS_QUERY_KEY = ["events"] as const

export interface UseEventsOptions {
  enabled?: boolean;
}

export function useEvents(filters?: EventFilters, options?: UseEventsOptions) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending, isError } = useInfiniteQuery({
    queryKey: [...EVENTS_QUERY_KEY, filters],
    queryFn: fetchEvents,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => 
      lastPage.currentPage < lastPage.totalPages ? lastPage.currentPage + 1 : undefined,
    enabled: options?.enabled,
  })

  const events = data?.pages.flatMap(page => page.items) || []

  return { events, loading: isPending, error: isError, fetchNextPage, hasNextPage, isFetchingNextPage }
}
