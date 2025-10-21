import type { FC } from "react";
import type { BlogProxy } from "../models/react/BlogProxy";
import { asProxyProps } from "@mittwald/react-async-proxy";

interface Props {
  blog: BlogProxy;
}

export const SimpleBlogView: FC<Props> = (props) => {
  const { blogProxy } = asProxyProps(props);
  const blogTitle = blogProxy
    .getDetailed()
    .title.transform((t) => t.toUpperCase());

  return (
    <article>
      <h2>{blogTitle.render()}</h2>
    </article>
  );
};
