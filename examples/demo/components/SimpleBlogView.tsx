import type { FC } from "react";
import type { BlogGhost } from "../models/react/BlogGhost";
import { asGhostProps, makeGhost } from "@mittwald/react-ghostmaker";

interface Props {
  blog: BlogGhost;
}

export const SimpleBlogView: FC<Props> = (props) => {
  const { blogGhost } = asGhostProps(props);
  const blogTitle = makeGhost(blogGhost.getDetailed().use())
    .getTitle()
    .transform((t) => t.toUpperCase())
    .useGhost();

  return (
    <article>
      <h2>{blogTitle.value}</h2>
      <button onClick={() => blogTitle.invalidate()}>Invalidate local</button>
    </article>
  );
};
