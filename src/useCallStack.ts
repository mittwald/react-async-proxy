import { getAsyncResource, usePromise } from "@mittwald/react-use-promise";
import is, { assert } from "@sindresorhus/is";
import { hash } from "object-code";
import { useMemo, useRef } from "react";
import { getModelIdentifiers } from "./modelIdentifier";
import {
  transformFnProp,
  type CallStack,
  type CallStackContext,
  type CallStackItem,
  type CallStackModelType,
  type ReactAsyncProxyOptions,
  type UseAsyncProxyReturn,
} from "./types";
import { joinedId } from "./lib/joinedId";
import { reactUsePromiseTag } from "./tags";
import { useIsFirstRender } from "./lib/useIsFirstRender";

const useVoidPromise = (options: ReactAsyncProxyOptions) =>
  usePromise(() => Promise.resolve(), null, options);

const useCallStackItem = (
  target: unknown,
  item: CallStackItem,
  options: ReactAsyncProxyOptions = {},
  context: CallStackContext,
): unknown => {
  const { propName, args } = item;

  const model = target as CallStackModelType;
  const prevModelHash = useRef<number>(undefined);

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
      useVoidPromise(options);
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
  const modelId = joinedId(...getModelIdentifiers(model)) || "-";
  const modelFunctionId = joinedId(modelId, propName);

  const asyncResource = getAsyncResource(modelFunction, args, {
    tags: [[reactUsePromiseTag, modelFunctionId]],
    loaderId: modelFunctionId,
  });

  const asyncResourceValue = asyncResource.use(options);

  const isSyncModelFunction = asyncResource.syncValue.isSet;
  const isFirstRender = useIsFirstRender();

  const needsRefresh = useMemo(() => {
    if (isFirstRender) {
      return;
    }
    if (isSyncModelFunction) {
      return false;
    }
    const modelHash = hash(model);

    const needsRefresh =
      prevModelHash.current !== undefined &&
      prevModelHash.current !== modelHash;

    prevModelHash.current = modelHash;
    return needsRefresh;
  }, [model, isSyncModelFunction]);

  if (needsRefresh) {
    asyncResource.refresh();
  }

  context.refreshFunctions.push(() => asyncResource.refresh());
  return asyncResourceValue;
};

export const useCallStack = <T>(
  initialModel: unknown,
  stack: CallStack,
  options?: ReactAsyncProxyOptions,
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
