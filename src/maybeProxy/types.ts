import { type OrOptional, type ReactAsyncProxy } from "@/types";

export type MaybeReactAsyncProxy<T> =
  T extends ReactAsyncProxy<infer U>
    ? ReactAsyncProxy<U> | U
    : T | ReactAsyncProxy<T>;

export type PropsWithMaybeReactAsyncProxies<
  T,
  TProps extends Array<keyof T>,
> = {
  [K in keyof T]: K extends TProps[number]
    ? MaybeReactAsyncProxy<T[K] | OrOptional<T[K]>>
    : T[K] | OrOptional<T[K]>;
};

type FixedUpReactAsyncProxy<T> =
  T extends MaybeReactAsyncProxy<infer U> ? ReactAsyncProxy<U> : T;

type WithPropsSuffix<T, TProps extends unknown[]> = T extends TProps[number]
  ? `${string & T}Proxy`
  : T;

export type PropsWithFixedUpReactAsyncProxies<
  T,
  TProps extends Array<keyof T>,
> = {
  [K in keyof T as WithPropsSuffix<K, TProps>]: K extends TProps[number]
    ? FixedUpReactAsyncProxy<NonNullable<T[K]>>
    : T[K];
};
