import { matchQuery, type QueryClient } from "@tanstack/react-query";
import type { GhostChain } from "./types";
import { getGhostId, queries } from "./queries";

export const invalidateGhostsById = (
  queryClient: QueryClient,
  ghostId: string,
) => {
  queryClient.invalidateQueries({
    predicate: (query) => query.meta?.ghostId === ghostId,
  });
};

export function invalidateGhosts(
  queryClient: QueryClient,
  model: unknown,
  chain: GhostChain,
) {
  const queryKey = queries.ghostChain(model, chain);
  const ghostId = getGhostId(queryKey);

  queryClient.invalidateQueries({
    predicate: (query) =>
      query.meta?.ghostId === ghostId ||
      matchQuery(
        {
          queryKey,
        },
        query,
      ),
  });
}
