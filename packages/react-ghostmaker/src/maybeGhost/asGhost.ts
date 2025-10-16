import { makeGhost } from "../makeGhost";
import { isReactGhost, type ReactGhost } from "../types";
import type {
  MaybeReactGhost,
  PropsWithFixedUpReactGhosts,
  PropsWithMaybeReactGhosts,
} from "./types";

export function asGhost<T>(maybeGhost: MaybeReactGhost<T>): ReactGhost<T> {
  if (isReactGhost<T>(maybeGhost)) {
    return maybeGhost;
  }
  return makeGhost(maybeGhost) as ReactGhost<T>;
}

export function asGhostProps<T, TProps extends (keyof T)[] = (keyof T)[]>(
  props: PropsWithMaybeReactGhosts<T, TProps>,
  keys?: TProps,
): PropsWithFixedUpReactGhosts<T, TProps> {
  const fixupObjectEntry = (entry: [string, unknown]) => {
    const [key, value] = entry;

    const shouldFixup =
      keys === undefined || keys.includes(key as TProps[number]);

    if (shouldFixup) {
      return [`${key}Ghost`, asGhost(value)];
    }

    return [key, value];
  };

  return Object.fromEntries(
    Object.entries(props).map(fixupObjectEntry),
  ) as PropsWithFixedUpReactGhosts<T, TProps>;
}
