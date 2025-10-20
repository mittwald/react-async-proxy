import type { QueryClient } from "@tanstack/react-query";

export const invalidateQueriesById = (
  queryClient: QueryClient,
  queryId: string,
) => {
  queryClient.invalidateQueries({
    predicate: (query) => query.meta?.id === queryId,
  });
};
