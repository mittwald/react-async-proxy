import is from "@sindresorhus/is";
import { modelIdentifiers } from "./modelIdentifier";
import { hashObject } from "./hash";

const getObjectIdentifier = (something: unknown): string | null => {
  const isObject = is.object(something);
  const isClass = is.class(something);
  const isFunction = is.function(something);

  const objectName = isFunction
    ? something.name
    : isClass || isObject
      ? something.constructor.name
      : null;

  const objectHash = isObject ? hashObject(something) : 0;

  const currentModelIdentifiers = modelIdentifiers
    .map((fn) => fn(something))
    .filter(is.string)
    .join(".");

  if (objectName) {
    if (currentModelIdentifiers) {
      return `${objectName}@${currentModelIdentifiers}(${objectHash})`;
    }
    return `${objectName}(${objectHash})`;
  }

  return currentModelIdentifiers
    ? `@${currentModelIdentifiers}(${objectHash})`
    : null;
};

const getArgKey = (arg: unknown) => {
  if (is.primitive(arg)) {
    return arg;
  }
  /**
   * Opt-out of TanStack Query's default key generation via JSON-Stringify
   * because it does not support circular references
   */
  return getObjectIdentifier(arg);
};

export const getModelQueryKey = (
  model: unknown,
  propName: string,
  ...args: unknown[]
): unknown[] => {
  const objectIdentifier = getObjectIdentifier(model);
  const argKeys = args.map(getArgKey).filter(is.string);
  return [objectIdentifier, `${propName}()`, ...argKeys];
};
