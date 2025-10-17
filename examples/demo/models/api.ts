import type { BlogApiData } from "./types";

export const getBlog = async (id: string) => {
  const response = await fetch(
    `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
  );
  return response.json() as Promise<BlogApiData>;
};
