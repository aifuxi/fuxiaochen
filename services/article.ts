import { HttpMethod } from '@/constants';
import type {
  Article,
  CreateArticleRequest,
  GeneralResponse,
  GetArticlesRequest,
  TotalResponse,
} from '@/types';
import { getBaseURL, obj2QueryString } from '@/utils';

export const ARTICLE_URL = '/api/article';

export async function getArticles(data: GetArticlesRequest) {
  const res = await fetch(
    `${getBaseURL()}${ARTICLE_URL}${obj2QueryString(data)}`,
  );
  return res.json() as unknown as TotalResponse<Article[]>;
}

export async function deleteArticle(id: string) {
  const res = await fetch(`${ARTICLE_URL}/${id}`, {
    method: HttpMethod.DELETE,
  });
  return res.json() as unknown as GeneralResponse<Article | undefined>;
}

export async function getArticle(id: string, published?: boolean) {
  const query = published ? { published: true } : {};
  const res = await fetch(
    `${getBaseURL()}${ARTICLE_URL}/${id}${obj2QueryString(query)}`,
    {
      method: HttpMethod.GET,
    },
  );
  return res.json() as unknown as GeneralResponse<Article | undefined>;
}

export async function updateArticle(
  id: string,
  data: Partial<CreateArticleRequest>,
) {
  const res = await fetch(`${ARTICLE_URL}/${id}`, {
    method: HttpMethod.PUT,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return res.json() as unknown as GeneralResponse<Article | undefined>;
}

export async function createArticle(data: CreateArticleRequest) {
  const res = await fetch(`${ARTICLE_URL}`, {
    method: HttpMethod.POST,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return res.json() as unknown as GeneralResponse<Article | undefined>;
}
