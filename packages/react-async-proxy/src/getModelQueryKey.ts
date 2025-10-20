import is from "@sindresorhus/is";
import { hash } from "object-code";

const hashCache = new WeakMap<object, number>();

export const getModelQueryKey = (
  model: unknown,
  propName: string,
  ...args: unknown[]
): unknown[] => {
  const isObject = is.object(model);
  const isClass = is.class(model);
  const isFunction = is.function(model);

  const staticModelKey = isFunction
    ? model.name
    : isClass || isObject
      ? model.constructor.name
      : null;

  const modelHash = isObject ? (hashCache.get(model) ?? hash(model)) : null;
  if (modelHash !== null) {
    hashCache.set(model as object, modelHash);
  }

  return [staticModelKey, modelHash, propName, ...args];
};
