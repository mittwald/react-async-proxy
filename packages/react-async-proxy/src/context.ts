import { createCascade } from "context";
import type { QueryFnContext } from "./types";

export const queryFnContext = createCascade<QueryFnContext>();

export const useQueryFnContext = () =>
  queryFnContext.use() as QueryFnContext | undefined;
