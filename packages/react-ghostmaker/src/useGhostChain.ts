import is, { assert } from "@sindresorhus/is";
import { useMemo } from "react";
import {
  transformFnProp,
  type GhostChain,
  type GhostChainContext,
  type GhostChainItem,
  type GhostChainModelType,
  type useGhostOptions,
  type UseGhostReturn,
  type UseQueryReturnType,
} from "./types";
import {
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { getGhostId, queries } from "./queries";
import { ghostFnContext } from "./context";
import { invalidateGhosts } from "./invalidate";

const useVoidQuery = () =>
  useQuery<UseQueryReturnType<true>>({
    queryKey: ["void"],
    queryFn: () =>
      Promise.resolve({
        result: true,
      }),
  });

const useGhostChainItem = <T>(
  target: unknown,
  item: GhostChainItem,
  options: useGhostOptions<T> = {},
  context: GhostChainContext,
): unknown => {
  const { propName, args } = item;

  const model = target as GhostChainModelType;

  if (propName === transformFnProp) {
    assert.array(args);
    const transformFn = args[0];
    assert.function(transformFn, "transform requires a mapping function");

    const transformDependencies = args[1] ?? [];
    assert.array(transformDependencies);
    return useMemo(() => transformFn(model), [model, ...transformDependencies]);
  }

  if (is.nullOrUndefined(model)) {
    if (args) {
      useVoidQuery();
    }
    return model;
  }

  const modelPropertyName = propName as keyof typeof model;
  const modelProperty = model[modelPropertyName];
  context.queryKey.push(...queries.chainItem(item));

  if (args === undefined) {
    // no function call, just a property access
    return modelProperty;
  }

  assert.function(modelProperty);
  const modelFn = modelProperty.bind(model);

  const queryKey = [...context.queryKey];

  const query = useSuspenseQuery<UseQueryReturnType<T>>({
    ...options,
    queryKey: [...context.queryKey],
    queryFn: async () => {
      const modelFnWithContext = ghostFnContext.bind(
        { ghostId: context.ghostId },
        modelFn,
      );
      const result = await modelFnWithContext(...args);
      if (result instanceof Promise) {
        return { result: await result };
      }
      return { result };
    },
    meta: {
      ghostId: context.ghostId,
      queryKey,
    },
  });

  if (query.error) {
    throw query.error;
  }

  return query.data.result;
};

export const useGhostChain = <T>(
  initialModel: unknown,
  chain: GhostChain,
  options?: useGhostOptions,
): UseGhostReturn<T> => {
  const queryClient = useQueryClient();

  const chainQueryId = queries.ghostChain(initialModel, chain);
  const ghostId = getGhostId(chainQueryId);

  const context: GhostChainContext = {
    queryKey: queries.model(initialModel),
    ghostId,
  };

  const value = chain.reduce(
    (model, item) => useGhostChainItem(model, item, options, context),
    initialModel,
  ) as T;

  const invalidate = () => {
    invalidateGhosts(queryClient, initialModel, chain);
  };

  return {
    value,
    invalidate,
  };
};
