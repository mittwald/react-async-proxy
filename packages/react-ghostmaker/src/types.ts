import { type QueryClient, type UseQueryOptions } from "@tanstack/react-query";
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

export type useGhostOptions<T = unknown> = Omit<
  UseQueryOptions<UseQueryReturnType<T>>,
  "queryKey" | "queryFn"
>;

export interface ReactGhostMethods<T> extends Promise<T> {
  useGhost: (options?: useGhostOptions) => UseGhostReturn<T>;
  use: (options?: useGhostOptions) => T;
  render: (transform?: (item: T) => ReactNode) => ReactNode;
  transform: <U, U2 = U>(
    fn: (item: T extends ReactGhost<infer T2> ? T2 : T) => U2,
    dependencies?: DependencyList,
  ) => ReactGhost<U2>;
  invalidate: (queryClient: QueryClient) => void;
}

export const transformFnProp = "___transformFn" as const;
export const isGhostMarker = "___ghostMarker" as const;

export type ReactGhost<T> = ReactGhostMethods<T> & {
  [K in keyof NonNullable<T>]-?: NonNullable<T>[K] extends AnyFunction
    ? <TParams extends Parameters<NonNullable<T>[K]>>(
        ...args: TParams
      ) => ReactGhost<Awaited<ReturnType<NonNullable<T>[K]>> | OrOptional<T>>
    : ReactGhost<NonNullable<T>[K] | OrOptional<T>>;
};

export interface GhostChainItem {
  propName: string | typeof transformFnProp;
  args?: ExplicitAny[];
}

export type GhostChain = GhostChainItem[];

export type GhostChainModelType =
  | UnknownRecord
  | Class<unknown>
  | null
  | undefined;

export type QueryKey = string[];

export type InvalidateGhostFn = () => void;

export interface GhostChainContext {
  queryKey: QueryKey;
  ghostId: string;
}

export interface UseGhostReturn<T> {
  value: T;
  invalidate: InvalidateGhostFn;
}

export function isReactGhost<T>(
  something: unknown,
): something is ReactGhost<T> {
  return (
    is.function(something) &&
    something[isGhostMarker as keyof typeof something] === true
  );
}

export type ModelIdentifier = (model: unknown) => string | undefined;
