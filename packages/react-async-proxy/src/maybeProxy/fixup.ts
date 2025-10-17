import { reactAsyncProxy } from "../reactAsyncProxy";
import { isReactAsyncProxy, type ReactAsyncProxy } from "../types";
import type {
  MaybeReactAsyncProxy,
  PropsWithFixedUpReactAsyncProxies,
  PropsWithMaybeReactAsyncProxies,
} from "../maybeProxy/types";

export function fixupMaybeReactAsyncProxy<T>(
  maybeProxy: MaybeReactAsyncProxy<T>,
): ReactAsyncProxy<T> {
  if (isReactAsyncProxy<T>(maybeProxy)) {
    return maybeProxy;
  }
  return reactAsyncProxy(maybeProxy) as ReactAsyncProxy<T>;
}

export function fixupMaybeReactAsyncProxyProps<
  T,
  TProps extends (keyof T)[] = (keyof T)[],
>(
  props: PropsWithMaybeReactAsyncProxies<T, TProps>,
  keys?: TProps,
): PropsWithFixedUpReactAsyncProxies<T, TProps> {
  const fixupObjectEntry = (entry: [string, unknown]) => {
    const [key, value] = entry;

    const shouldFixup =
      keys === undefined || keys.includes(key as TProps[number]);

    if (shouldFixup) {
      return [`${key}Proxy`, fixupMaybeReactAsyncProxy(value)];
    }

    return [key, value];
  };

  return Object.fromEntries(
    Object.entries(props).map(fixupObjectEntry),
  ) as PropsWithFixedUpReactAsyncProxies<T, TProps>;
}
