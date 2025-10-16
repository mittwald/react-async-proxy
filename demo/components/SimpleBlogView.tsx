import type { FC } from "react";
import type { BlogProxy } from "../models/react/BlogProxy";
import { fixupMaybeReactAsyncProxyProps } from "@mittwald/react-async-proxy";

interface Props {
  blog: BlogProxy;
}

export const SimpleBlogView: FC<Props> = (props) => {
  const { blogProxy } = fixupMaybeReactAsyncProxyProps(props);
  const blog = blogProxy.getDetailed().useValue();

  return (
    <article>
      <h2>{blog.title}</h2>
      <p>By {blog.author}</p>
    </article>
  );
};
