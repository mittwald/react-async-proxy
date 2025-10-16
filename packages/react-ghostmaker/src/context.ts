import { createCascade } from "context";

export interface GhostFnContext {
  ghostId?: string;
  [key: string]: unknown;
}

export const ghostFnContext = createCascade<GhostFnContext>();

const useGhostFnContext = () =>
  ghostFnContext.use() as GhostFnContext | undefined;

export const getGhostId = () => useGhostFnContext()?.ghostId;
