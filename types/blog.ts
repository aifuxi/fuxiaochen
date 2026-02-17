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
  categoryId: string;
  category?: Category;
  tags?: Tag[];
}

export interface BlogListReq extends ListReq {
  title?: string;
  slug?: string;
  categoryId?: string;
  tagId?: string;
  tagIds?: string[];
  blogIDs?: string[];
  published?: boolean;
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
  categoryId: string;
  tags?: string[];
}
