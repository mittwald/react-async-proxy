import type { UseWatchResourceOptions } from "@mittwald/react-use-promise";
import is from "@sindresorhus/is";
import type { DependencyList, ReactNode } from "react";
import type { Class, UnknownRecord } from "type-fest";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ExplicitAny = any;
export type OrOptional<T> = T extends undefined ? undefined : never;
export type AnyFunction = (...args: ExplicitAny[]) => ExplicitAny;

export type ReactAsyncProxyOptions = Omit<
  UseWatchResourceOptions,
  "useSuspense"
>;

export interface ReactAsyncProxyMethods<T> {
  use: (options?: ReactAsyncProxyOptions) => UseAsyncProxyReturn<T>;
  useValue: (options?: ReactAsyncProxyOptions) => T;
  resolve: () => Promise<T>;
  render: (transform?: (item: T) => ReactNode) => ReactNode;
  transform: <U, U2 = U>(
    fn: (item: T extends ReactAsyncProxy<infer T2> ? T2 : T) => U2,
    dependencies?: DependencyList,
  ) => ReactAsyncProxy<U2>;
}

export const transformFnProp = "___transformFn" as const;
export const useProxyMarker = "___useProxyMarker" as const;

export type ReactAsyncProxy<T> = ReactAsyncProxyMethods<T> & {
  [K in keyof NonNullable<T>]-?: NonNullable<T>[K] extends AnyFunction
    ? <TParams extends Parameters<NonNullable<T>[K]>>(
        ...args: TParams
      ) => ReactAsyncProxy<
        Awaited<ReturnType<NonNullable<T>[K]>> | OrOptional<T>
      >
    : ReactAsyncProxy<NonNullable<T>[K] | OrOptional<T>>;
};

export interface CallStackItem {
  propName: string | typeof transformFnProp;
  args?: ExplicitAny[];
}

export type CallStack = CallStackItem[];

export type CallStackModelType =
  | UnknownRecord
  | Class<unknown>
  | null
  | undefined;

export type RefreshAsyncProxyFn = () => void;

export interface CallStackContext {
  refreshFunctions: RefreshAsyncProxyFn[];
}

export interface UseAsyncProxyReturn<T> {
  value: T;
  refresh: RefreshAsyncProxyFn;
}

export function isReactAsyncProxy<T>(
  something: unknown,
): something is ReactAsyncProxy<T> {
  return (
    is.function(something) &&
    something[useProxyMarker as keyof typeof something] === true
  );
}
