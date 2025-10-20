import { type UseQueryOptions } from "@tanstack/react-query";
import is from "@sindresorhus/is";
import type { DependencyList, ReactNode } from "react";
import type { Class, UnknownRecord } from "type-fest";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ExplicitAny = any;
export type OrOptional<T> = T extends undefined ? undefined : never;
export type AnyFunction = (...args: ExplicitAny[]) => ExplicitAny;

export interface UseQueryReturnType<T> {
  result: T;
}

export type ProxyUseQueryOptions<T = unknown> = Omit<
  UseQueryOptions<UseQueryReturnType<T>>,
  "queryKey" | "queryFn"
>;

export interface ReactAsyncProxyMethods<T> {
  useQuery: (options?: ProxyUseQueryOptions) => UseAsyncProxyReturn<T>;
  useValue: (options?: ProxyUseQueryOptions) => T;
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

export interface QueryFnContext {
  id?: string;
  [key: string]: unknown;
}

export type ModelIdentifier = (model: unknown) => string | undefined;
