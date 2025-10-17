import { nanoid } from "nanoid";
import is, { assert } from "@sindresorhus/is";
import { useMemo } from "react";
import {
  transformFnProp,
  type CallStack,
  type CallStackContext,
  type CallStackItem,
  type CallStackModelType,
  type ProxyUseQueryOptions,
  type UseAsyncProxyReturn,
  type UseQueryReturnType,
} from "./types";
import {
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { getModelQueryKey } from "./getModelQueryKey";

const useVoidQuery = () =>
  useQuery({
    queryKey: ["void"],
    queryFn: () => Promise.resolve(),
  });

const useCallStackItem = <T>(
  target: unknown,
  item: CallStackItem,
  options: ProxyUseQueryOptions<T> = {},
  context: CallStackContext,
): unknown => {
  const { propName, args } = item;
  const queryClient = useQueryClient();

  const model = target as CallStackModelType;

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

  if (args === undefined) {
    // no function call, just a property access
    return modelProperty;
  }

  assert.function(modelProperty);

  const modelFunction = modelProperty.bind(model);
  const queryId = nanoid();
  const modelQueryKey = getModelQueryKey(model, propName, ...args);

  const query = useSuspenseQuery<UseQueryReturnType<T>>({
    staleTime: Infinity,
    ...options,
    queryKey: modelQueryKey,
    queryFn: async () => {
      const result = await modelFunction(...args);
      if (result instanceof Promise) {
        return { result: await result };
      }
      return { result };
    },
    meta: {
      ...options?.meta,
      queryId,
    },
  });

  const refresh = () => {
    queryClient.invalidateQueries({
      predicate: (query) => query.meta?.queryId === queryId,
    });
  };

  if (query.error) {
    throw query.error;
  }

  context.refreshFunctions.push(refresh);
  return query.data.result;
};

export const useCallStack = <T>(
  initialModel: unknown,
  stack: CallStack,
  options?: ProxyUseQueryOptions<T>,
): UseAsyncProxyReturn<T> => {
  const context: CallStackContext = {
    refreshFunctions: [],
  };

  const value = stack.reduce(
    (model, item) => useCallStackItem(model, item, options, context),
    initialModel,
  ) as T;

  const refresh = () => {
    for (const fn of context.refreshFunctions) {
      fn();
    }
  };

  return {
    value,
    refresh,
  };
};
