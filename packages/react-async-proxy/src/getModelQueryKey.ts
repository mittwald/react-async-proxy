import is from "@sindresorhus/is";
import { modelIdentifiers } from "./modelIdentifier";
import { hash } from "object-code";

const getObjectName = (something: unknown): string | null => {
  const isObject = is.object(something);
  const isClass = is.class(something);
  const isFunction = is.function(something);

  return isFunction
    ? something.name
    : isClass || isObject
      ? something.constructor.name
      : null;
};

const getArgKey = (arg: unknown) => {
  if (is.plainObject(arg)) {
    /**
     * Opt-out of TanStack Query's default key generation via JSON-Stringify
     * because it does not support circular references
     */
    const objectName = getObjectName(arg);
    const objectHash = hash(arg);
    return `${objectName}(${objectHash})`;
  }
  return arg;
};

export const getModelQueryKey = (
  model: unknown,
  propName: string,
  ...args: unknown[]
): unknown[] => {
  const objectName = getObjectName(model);
  const currentModelIdentifiers = modelIdentifiers.map((fn) => fn(model));
  const argKeys = args.map(getArgKey);
  return [objectName, ...currentModelIdentifiers, propName, ...argKeys];
};
