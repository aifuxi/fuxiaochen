import { ApiError } from "@/lib/api/api-error";
import { articleErrorCodes } from "@/lib/api/error-codes";
import type {
  CreateFriendLinkApplicationInput,
  PublicArticleDetailDto,
  PublicArticleListItemDto,
  PublicChangelogReleaseDto,
  PublicFriendLinkDto,
  PublicListArticlesQuery,
  PublicListChangelogQuery,
  PublicListFriendLinksQuery,
  PublicListProjectsQuery,
  PublicListResult,
  PublicProjectDto,
  PublicSiteDto,
} from "@/lib/public/public-content-dto";
import {
  toPublicArticleDto,
  toPublicArticleListItemDto,
  toPublicChangelogReleaseDto,
  toPublicFriendLinkDto,
  toPublicProjectDto,
  toPublicSiteDto,
} from "@/lib/public/public-content-dto";
import type { PublicContentRepository } from "@/lib/public/public-content-repository";

export type PublicContentService = {
  createFriendLinkApplication: (input: CreateFriendLinkApplicationInput) => Promise<{ id: string; status: string }>;
  getArticleBySlug: (slug: string) => Promise<PublicArticleDetailDto>;
  getSite: () => Promise<PublicSiteDto>;
  listArticleSlugs: () => Promise<Array<{ slug: string }>>;
  listArticles: (query: PublicListArticlesQuery) => Promise<PublicListResult<PublicArticleListItemDto>>;
  listChangelog: (query: PublicListChangelogQuery) => Promise<PublicListResult<PublicChangelogReleaseDto>>;
  listFriendLinks: (query: PublicListFriendLinksQuery) => Promise<PublicListResult<PublicFriendLinkDto>>;
  listProjects: (query: PublicListProjectsQuery) => Promise<PublicListResult<PublicProjectDto>>;
};

export function createPublicContentService(repository: PublicContentRepository): PublicContentService {
  return {
    async createFriendLinkApplication(input) {
      return repository.createFriendLinkApplication(input);
    },
    async getArticleBySlug(slug) {
      const now = new Date();
      const article = await repository.findPublishedArticleBySlug(slug, now);

      if (!article) {
        throw new ApiError({
          code: articleErrorCodes.ARTICLE_NOT_FOUND,
          message: "Article does not exist.",
        });
      }

      const relatedArticles = await repository.findRelatedPublishedArticles({
        articleId: article.id,
        categoryId: article.categoryId,
        now,
        take: 3,
      });

      return {
        article: toPublicArticleDto(article),
        relatedArticles: relatedArticles.map(toPublicArticleListItemDto),
      };
    },
    async getSite() {
      const now = new Date();
      const [settings, stats, articleCategories] = await Promise.all([
        repository.findSettings(),
        repository.getPublicStats(now),
        repository.findArticleCategories(now),
      ]);

      return toPublicSiteDto({
        articleCategories,
        settings,
        stats,
      });
    },
    async listArticleSlugs() {
      return repository.findPublishedArticleSlugs(new Date());
    },
    async listArticles(query) {
      const now = new Date();
      const skip = (query.page - 1) * query.pageSize;
      const [items, total] = await Promise.all([
        repository.findPublishedArticles({
          ...query,
          now,
          skip,
          take: query.pageSize,
        }),
        repository.countPublishedArticles(query, now),
      ]);

      return buildListResult({
        items: items.map(toPublicArticleListItemDto),
        page: query.page,
        pageSize: query.pageSize,
        total,
      });
    },
    async listChangelog(query) {
      const skip = (query.page - 1) * query.pageSize;
      const [items, total] = await Promise.all([
        repository.findChangelogReleases({
          ...query,
          skip,
          take: query.pageSize,
        }),
        repository.countChangelogReleases(query),
      ]);

      return buildListResult({
        items: items.map(toPublicChangelogReleaseDto),
        page: query.page,
        pageSize: query.pageSize,
        total,
      });
    },
    async listFriendLinks(query) {
      const skip = (query.page - 1) * query.pageSize;
      const [items, total] = await Promise.all([
        repository.findApprovedFriendLinks({
          ...query,
          skip,
          take: query.pageSize,
        }),
        repository.countApprovedFriendLinks(query),
      ]);

      return buildListResult({
        items: items.map(toPublicFriendLinkDto),
        page: query.page,
        pageSize: query.pageSize,
        total,
      });
    },
    async listProjects(query) {
      const now = new Date();
      const skip = (query.page - 1) * query.pageSize;
      const [items, total] = await Promise.all([
        repository.findPublishedProjects({
          ...query,
          now,
          skip,
          take: query.pageSize,
        }),
        repository.countPublishedProjects(query, now),
      ]);

      return buildListResult({
        items: items.map(toPublicProjectDto),
        page: query.page,
        pageSize: query.pageSize,
        total,
      });
    },
  };
}

function buildListResult<TItem>({
  items,
  page,
  pageSize,
  total,
}: {
  items: TItem[];
  page: number;
  pageSize: number;
  total: number;
}): PublicListResult<TItem> {
  return {
    items,
    page,
    pageSize,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
  };
}
