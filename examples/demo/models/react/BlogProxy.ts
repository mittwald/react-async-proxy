import {
  reactAsyncProxy,
  type MaybeReactAsyncProxy,
} from "@mittwald/react-async-proxy";
import { Blog } from "../Blog";

export const BlogProxy = reactAsyncProxy(Blog);
export type BlogProxy = MaybeReactAsyncProxy<Blog>;
