import is from "@sindresorhus/is";
import type { GhostChain, GhostChainItem, QueryKey } from "./types";
import { hashObject } from "./hash";
import { getMetaData } from "./metaData";
import { modelIdentifiers } from "./modelIdentifier";

export const getModelName = (something: unknown): string | undefined => {
  const isObject = is.object(something);

  const getModelNameRecursive = (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    klass: Function | undefined,
  ): string | undefined => {
    if (!klass) {
      return;
    }
    return (
      getMetaData(klass)?.name ??
      getModelNameRecursive(Object.getPrototypeOf(klass))
    );
  };

  const klass = isObject ? something.constructor : undefined;
  return getModelNameRecursive(klass);
};

export const getModelId = (something: unknown): string | undefined => {
  const isObject = is.object(something);

  const getIdRecursive = (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    klass: Function | undefined,
  ): string | undefined => {
    if (!klass) {
      return;
    }
    const getId = getMetaData(klass)?.getId;
    if (getId) {
      return getId(something);
    }
    return getIdRecursive(Object.getPrototypeOf(klass));
  };

  const klass = isObject ? something.constructor : undefined;
  return getIdRecursive(klass);
};

const getObjectName = (something: unknown) => {
  const modelName = getModelName(something);
  if (modelName) {
    return modelName;
  }

  const isClass = is.class(something);
  const isFunction = is.function(something);
  const isObject = is.object(something);

  return isFunction
    ? something.name
    : isClass || isObject
      ? something.constructor.name
      : "unknown";
};

const getTargetQueryKey = (something: unknown): string => {
  if (is.primitive(something)) {
    return String(something);
  }

  const objectName = getObjectName(something);

  const id = getModelId(something);
  if (id) {
    return `${objectName}@${id}`;
  }

  const thisModelIdentifiers = modelIdentifiers
    .map((fn) => fn(something))
    .filter(is.string)
    .join(".");

  if (thisModelIdentifiers) {
    return `${objectName}@${thisModelIdentifiers}`;
  }

  return objectName;
};

const getArgKey = (arg: unknown) => {
  if (is.primitive(arg)) {
    return String(arg);
  }
  return `${getObjectName(arg)}(hash:${hashObject(arg)})`;
};

export const queries = {
  ghostmaker: () => ["react-ghostmaker"],
  target: (target: unknown) => [
    ...queries.ghostmaker(),
    getTargetQueryKey(target),
  ],
  chainItem: (prev: QueryKey, chainItem: GhostChainItem) => {
    const { propName, args = [] } = chainItem;
    return [...prev, propName, ...args.map(getArgKey)];
  },
  ghostChain: (target: unknown, chain: GhostChain) =>
    chain.reduce(queries.chainItem, queries.target(target)),
};
