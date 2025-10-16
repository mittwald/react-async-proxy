import is, { assert } from "@sindresorhus/is";
import {
  isReactGhost,
  transformFnProp,
  type AnyFunction,
  type GhostChain,
  type GhostChainItem,
  type GhostChainModelType,
  type ExplicitAny,
} from "./types";

const resolveGhostChainItem = async (target: unknown, item: GhostChainItem) => {
  const { propName, args } = item;

  const model = target as GhostChainModelType;

  if (propName === transformFnProp) {
    assert.array(args);
    const transformFn = args[0];
    assert.function(transformFn, "transform requires a mapping function");

    const transformed = transformFn(target);

    if (isReactGhost(transformed)) {
      return transformed;
    }

    return transformed;
  }

  if (is.nullOrUndefined(model)) {
    return undefined;
  }

  const property = model[propName as keyof typeof model];

  if (args === undefined) {
    return property;
  }

  assert.function(property);

  const asyncFn = property.bind(target) as AnyFunction;

  return await asyncFn(...args);
};

export const resolveGhostChain = async (
  initialModel: ExplicitAny,
  stack: GhostChain,
) => {
  let result = initialModel;

  for (const item of stack) {
    result = await resolveGhostChainItem(result, item);
  }

  return result;
};
