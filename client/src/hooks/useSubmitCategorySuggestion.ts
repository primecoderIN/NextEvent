import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosHttpAgent } from "@/lib/axios";
import type { ApiResponse } from "@/Types/ApiResponse";
import type { Category } from "@/Types/Category";

interface SuggestCategoryPayload {
  name: string;
  slug?: string;
  description?: string;
}

const postSuggest = async (payload: SuggestCategoryPayload): Promise<Category> => {
  const res = await axiosHttpAgent.post<ApiResponse<Category>>("/categories/suggest", payload);
  return res.data.data!;
}

export function useSubmitCategorySuggestion() {
  const qc = useQueryClient();

  const mutation = useMutation<Category, unknown, SuggestCategoryPayload>({
    mutationFn: postSuggest,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });

  return {
    suggestCategory: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error as any,
  }
}
