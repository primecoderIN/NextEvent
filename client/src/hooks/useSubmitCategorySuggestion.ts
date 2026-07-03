import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosHttpAgent } from "@/lib/axios";
import { CategoryApiRoutes } from "@/constants/apiRoutes";
import { QueryKeys } from "@/constants/queryKeys";
import type { ApiResponse } from "@/Types/ApiResponse";
import type { Category } from "@/Types/Category";

interface SuggestCategoryPayload {
  name: string;
  slug?: string;
  description?: string;
}

const postSuggest = async (payload: SuggestCategoryPayload): Promise<Category> => {
  const res = await axiosHttpAgent.post<ApiResponse<Category>>(CategoryApiRoutes.Suggest, payload);
  return res.data.data!;
}

export function useSubmitCategorySuggestion() {
  const qc = useQueryClient();

  const mutation = useMutation<Category, unknown, SuggestCategoryPayload>({
    mutationFn: postSuggest,
    onSuccess: () => qc.invalidateQueries({ queryKey: QueryKeys.Categories }),
  });

  return {
    suggestCategory: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error as any,
  }
}
