import is from "@sindresorhus/is";
import { modelIdentifiers } from "./modelIdentifier";
import type { GhostChain, GhostChainItem, QueryKey } from "./types";

export const getObjectQueryKey = (something: unknown): string => {
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

export const ghostmakerQueryKey = "react-ghostmaker";

export const getGhostId = (queryKey: QueryKey): string => {
  return queryKey.join(".");
};

export const queries = {
  ghostmaker: () => [ghostmakerQueryKey],
  model: (model: unknown) => [
    ...queries.ghostmaker(),
    getObjectQueryKey(model),
  ],
  chainItem: (chainItem: GhostChainItem) => {
    const { propName, args = [] } = chainItem;
    return [propName, ...args.map(getObjectQueryKey)];
  },
  ghostChain: (model: unknown, chain: GhostChain) => [
    ...queries.model(model),
    ...chain.flatMap(queries.chainItem),
  ],
};
