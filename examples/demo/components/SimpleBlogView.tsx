import type { FC } from "react";
import type { BlogGhost } from "../models/react/BlogGhost";
import { asGhostProps } from "@mittwald/react-ghostmaker";

interface Props {
  blog: BlogGhost;
}

export const SimpleBlogView: FC<Props> = (props) => {
  const { blogGhost } = asGhostProps(props);
  const blogTitle = blogGhost
    .getDetailed()
    .title.transform((t) => t.toUpperCase())
    .useGhost();

  return (
    <article>
      <h2>{blogTitle.value}</h2>
      <button onClick={() => blogTitle.invalidate()}>Invalidate local</button>
    </article>
  );
};
