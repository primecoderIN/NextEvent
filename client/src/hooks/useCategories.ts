import { useQuery } from "@tanstack/react-query"
import { axiosHttpAgent } from "@/lib/axios"
import type { Category } from "@/Types/Category"
import type { ApiResponse } from "@/Types/ApiResponse"

export const CATEGORIES_QUERY_KEY = ["categories"] as const

export const fetchCategories = async (): Promise<Category[]> => {
  const response = await axiosHttpAgent.get<ApiResponse<Category[]>>("/categories")
  return response.data.data ?? []
}

export function useCategories() {
  const query = useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: fetchCategories,
  })

  return query
}
