import { createGhost, type MaybeReactGhost } from "@mittwald/react-ghostmaker";
import { Blog } from "../Blog";

export const BlogGhost = createGhost(Blog);
export type BlogGhost = MaybeReactGhost<Blog>;
