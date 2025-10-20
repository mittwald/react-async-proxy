import is from "@sindresorhus/is";
import { modelIdentifiers } from "./modelIdentifier";

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

  const thisModelIdentifiers = modelIdentifiers.map((fn) => fn(model));

  return [staticModelKey, ...thisModelIdentifiers, propName, ...args];
};
