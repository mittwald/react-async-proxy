import type { QueryFunctionContext } from "@tanstack/react-query";
import { createCascade } from "context";

export interface GhostFnContext {
  query?: QueryFunctionContext;
  [key: string]: unknown;
}

export const ghostFnContext = createCascade<GhostFnContext>();

const useGhostFnContext = () =>
  ghostFnContext.use() as GhostFnContext | undefined;

export const getQueryContext = () => useGhostFnContext()?.query;

export function forwardQueryContext<T>(fn: () => T): T {
  const queryContext = getQueryContext();
  ghostFnContext.bind({ query: queryContext }, fn);
  return fn();
}
