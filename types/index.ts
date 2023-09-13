import type {
  Article as PrismaArticle,
  Tag as PrismaTag,
} from '@prisma/client';

export type Tag = PrismaTag & {
  articleCount?: number;
  articles?: PrismaArticle[];
};

export type Article = PrismaArticle & { tags?: PrismaTag[] };

export type CreateTagRequest = {
  name: string;
  friendlyUrl: string;
};

export type CreateArticleRequest = {
  title: string;
  friendlyUrl: string;
  description: string;
  content: string;
  cover?: string;
  published: boolean;
  tags?: string[];
};

export type GeneralResponse<T> = {
  code: number;
  data?: T;
  msg?: string;
  error?: string;
};

export type TotalResponse<T> = GeneralResponse<T> & {
  total: number;
};

export type URLStruct = {
  url: string;
};

export type PaginationRequest = {
  page: number;
  pageSize: number;
};

export type GetArticlesRequest = {
  published?: boolean;
  friendlyUrl?: string;
  title?: string;
  tags?: string[];
} & PaginationRequest;

export type GetTagsRequest = {
  friendlyUrl?: string;
  /** 该标签下对应文章的发布状态 */
  published?: boolean;
} & PaginationRequest;

export type DynamicRouteHandleParams = { params: { id: string } };
