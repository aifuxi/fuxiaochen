import type {
  Article as PrismaArticle,
  Tag as PrismaTag,
} from '@prisma/client';

export type NavItem = {
  label: string;
  link: string;
};

export type Tag = PrismaTag & { articleCount?: number };

export type Article = PrismaArticle & { tags: PrismaTag[] };

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
  page?: number;
  pageSize?: number;
};

export type GetArticlesRequest = {
  published?: boolean;
  tags?: string[];
} & PaginationRequest;

export type GetTagsRequest = PaginationRequest;

export type DynamicRouteHandleParams = { params: { id: string } };
