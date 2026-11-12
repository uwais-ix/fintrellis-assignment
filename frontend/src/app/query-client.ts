import { QueryClient } from "@tanstack/react-query";
import { ApiProblem } from "@/lib/api/client";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: (attempt, error) =>
          attempt < 2 && (!(error instanceof ApiProblem) || error.status >= 500),
      },
    },
  });
}

export const queryClient = createQueryClient();
