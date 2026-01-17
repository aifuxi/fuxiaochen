import type { Category } from "./category";
import type { CommonModel, ListReq } from "./common";
import type { Tag } from "./tag";

export interface Blog extends CommonModel {
  title: string;
  slug: string;
  description: string;
  cover?: string;
  content: string;
  published: boolean;
  featured: boolean;
  publishedAt?: string;
  categoryID: string;
  category?: Category;
  tags?: Tag[];
}

export interface BlogListReq extends ListReq {
  title?: string;
  slug?: string;
  categoryID?: string;
  blogIDs?: string[];
}

export interface BlogListResp {
  total: number;
  lists: Blog[] | null;
}

export interface BlogCreateReq {
  title: string;
  slug: string;
  description: string;
  cover?: string;
  content: string;
  published: boolean;
  featured: boolean;
  categoryID?: string;
  tagIDs?: string[];
}

export interface BlogPublishedReq {
  published: boolean;
}

export interface BlogFeaturedReq {
  featured: boolean;
}
