import is from "@sindresorhus/is";
import { modelIdentifiers } from "./modelIdentifier";
import type { GhostChain, GhostChainItem, QueryKey } from "./types";
import { hashObject } from "./hash";

const getTargetQueryKey = (something: unknown): string => {
  if (is.primitive(something)) {
    return String(something);
  }

  const isObject = is.object(something);
  const isClass = is.class(something);
  const isFunction = is.function(something);

  const objectName = isFunction
    ? something.name
    : isClass || isObject
      ? something.constructor.name
      : "unknown";

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
  return hashObject(arg);
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
