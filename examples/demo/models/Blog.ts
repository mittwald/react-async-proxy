import { GhostMakerModel } from "@mittwald/react-ghostmaker";
import { getBlog } from "./api";
import type { BlogApiData } from "./types";

@GhostMakerModel({
  getId: (blog) => blog.id,
  name: "Blog",
})
export class Blog {
  public readonly id: string;

  public constructor(id: string) {
    this.id = id;
  }

  public static ofId(id: string): Blog {
    return new Blog(id);
  }

  public async getDetailed(): Promise<DetailedBlog> {
    const data = await getBlog(this.id);
    return new DetailedBlog(data);
  }
}

@GhostMakerModel({
  name: "DetailedBlog",
})
export class DetailedBlog extends Blog {
  public readonly title: string;
  public readonly author: string;

  public constructor(data: BlogApiData) {
    super(data.id);
    this.title = data.title;
    this.author = data.by;
  }

  public getTitle() {
    return this.title;
  }
}
