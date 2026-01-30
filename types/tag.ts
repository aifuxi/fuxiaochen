import type { Blog } from "./blog";
import type { CommonModel, ListReq } from "./common";

export interface Tag extends CommonModel {
  name: string;
  slug: string;
  description: string;
  blogCount: number;
  blogs?: Blog[];
}

export interface TagListReq extends ListReq {
  name?: string;
  slug?: string;
  sortBy?: "createdAt" | "updatedAt";
  order?: "asc" | "desc";
}

export interface TagListResp {
  total: number;
  lists: Tag[] | null;
}

export interface TagCreateReq {
  name: string;
  slug: string;
  description?: string;
}
