import { makeGhost, type MaybeReactGhost } from "@mittwald/react-ghostmaker";
import { Blog } from "../Blog";

export const BlogGhost = makeGhost(Blog);
export type BlogGhost = MaybeReactGhost<Blog>;
