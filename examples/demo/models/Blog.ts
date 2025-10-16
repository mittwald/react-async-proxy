import { getBlog } from "./api";
import type { BlogApiData } from "./types";

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

export class DetailedBlog extends Blog {
  public readonly title: string;
  public readonly author: string;

  public constructor(data: BlogApiData) {
    super(data.id);
    this.title = data.title;
    this.author = data.by;
  }
}
