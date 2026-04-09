import { type Prisma, type PrismaClient } from "@/generated/prisma/client";
import type { ProjectCategory } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import type { ListProjectsQuery } from "@/lib/project/project-dto";

type ProjectTechnologyRecord = {
  techName: string;
};

type ProjectCoverAssetRecord = {
  altText: string | null;
  id: string;
  originalUrl: string | null;
};

type ProjectRecord = {
  badgeLabel: string | null;
  category: ProjectCategory;
  coverAsset: ProjectCoverAssetRecord | null;
  coverAssetId: string | null;
  createdAt: Date;
  detail: string | null;
  externalUrl: string | null;
  id: string;
  isFeatured: boolean;
  metricLabel: string | null;
  metricValue: string | null;
  name: string;
  technologies: ProjectTechnologyRecord[];
  publishedAt: Date | null;
  slug: string;
  sortOrder: number;
  sourceUrl: string | null;
  summary: string;
  updatedAt: Date;
};

type ProjectCreateData = {
  badgeLabel?: string | null;
  category: ProjectCategory;
  coverAssetId?: string | null;
  detail?: string | null;
  externalUrl?: string | null;
  isFeatured: boolean;
  metricLabel?: string | null;
  metricValue?: string | null;
  name: string;
  publishedAt?: Date | null;
  slug: string;
  sortOrder: number;
  sourceUrl?: string | null;
  summary: string;
  techNames?: string[];
};

type ProjectUpdateData = {
  badgeLabel?: string | null;
  category?: ProjectCategory;
  coverAssetId?: string | null;
  detail?: string | null;
  externalUrl?: string | null;
  isFeatured?: boolean;
  metricLabel?: string | null;
  metricValue?: string | null;
  name?: string;
  publishedAt?: Date | null;
  slug?: string;
  sortOrder?: number;
  sourceUrl?: string | null;
  summary?: string;
  techNames?: string[];
};

type FindManyOptions = ListProjectsQuery & {
  skip: number;
  take: number;
};

export type ProjectRepository = {
  countByFilters: (filters: ListProjectsQuery) => Promise<number>;
  create: (data: ProjectCreateData) => Promise<ProjectRecord>;
  delete: (id: string) => Promise<void>;
  findById: (id: string) => Promise<ProjectRecord | null>;
  findBySlug: (slug: string) => Promise<ProjectRecord | null>;
  findCoverAssetById: (id: string) => Promise<{ id: string } | null>;
  findManyWithPagination: (options: FindManyOptions) => Promise<ProjectRecord[]>;
  update: (id: string, data: ProjectUpdateData) => Promise<ProjectRecord>;
};

const projectCoverAssetSelect = {
  altText: true,
  id: true,
  originalUrl: true,
} satisfies Prisma.MediaAssetSelect;

const projectTechnologySelect = {
  techName: true,
} satisfies Prisma.ProjectTechnologySelect;

const projectSelect = {
  badgeLabel: true,
  category: true,
  coverAsset: {
    select: projectCoverAssetSelect,
  },
  coverAssetId: true,
  createdAt: true,
  detail: true,
  externalUrl: true,
  id: true,
  isFeatured: true,
  metricLabel: true,
  metricValue: true,
  name: true,
  technologies: {
    orderBy: {
      sortOrder: "asc",
    },
    select: projectTechnologySelect,
  },
  publishedAt: true,
  slug: true,
  sortOrder: true,
  sourceUrl: true,
  summary: true,
  updatedAt: true,
} satisfies Prisma.ProjectSelect;

function buildProjectWhere(filters: Pick<ListProjectsQuery, "category" | "isFeatured" | "keyword">): Prisma.ProjectWhereInput {
  return {
    ...(filters.category ? { category: filters.category } : {}),
    ...(filters.isFeatured !== undefined ? { isFeatured: filters.isFeatured } : {}),
    ...(filters.keyword
      ? {
          OR: [
            {
              name: {
                contains: filters.keyword,
              },
            },
            {
              slug: {
                contains: filters.keyword,
              },
            },
            {
              summary: {
                contains: filters.keyword,
              },
            },
          ],
        }
      : {}),
  };
}

export function createProjectRepository(database: PrismaClient = prisma): ProjectRepository {
  return {
    async countByFilters(filters) {
      return database.project.count({
        where: buildProjectWhere(filters),
      });
    },
    async create(data) {
      const { techNames, ...projectData } = data;

      return database.project.create({
        data: {
          ...projectData,
          ...(techNames && techNames.length > 0
            ? {
                technologies: {
                  create: techNames.map((techName, index) => ({
                    sortOrder: index,
                    techName,
                  })),
                },
              }
            : {}),
        },
        select: projectSelect,
      });
    },
    async delete(id) {
      await database.project.delete({
        where: {
          id,
        },
      });
    },
    async findById(id) {
      return database.project.findUnique({
        select: projectSelect,
        where: {
          id,
        },
      });
    },
    async findBySlug(slug) {
      return database.project.findUnique({
        select: projectSelect,
        where: {
          slug,
        },
      });
    },
    async findCoverAssetById(id) {
      return database.mediaAsset.findUnique({
        select: {
          id: true,
        },
        where: {
          id,
        },
      });
    },
    async findManyWithPagination({ category, isFeatured, keyword, skip, take }) {
      return database.project.findMany({
        orderBy: [
          {
            sortOrder: "asc",
          },
          {
            publishedAt: "desc",
          },
          {
            createdAt: "desc",
          },
        ],
        select: projectSelect,
        skip,
        take,
        where: buildProjectWhere({
          category,
          isFeatured,
          keyword,
        }),
      });
    },
    async update(id, data) {
      const { techNames, ...projectData } = data;

      return database.$transaction(async (transaction) => {
        await transaction.project.update({
          data: projectData,
          where: {
            id,
          },
        });

        if (techNames !== undefined) {
          await transaction.projectTechnology.deleteMany({
            where: {
              projectId: id,
            },
          });

          if (techNames.length > 0) {
            await transaction.projectTechnology.createMany({
              data: techNames.map((techName, index) => ({
                projectId: id,
                sortOrder: index,
                techName,
              })),
            });
          }
        }

        return transaction.project.findUniqueOrThrow({
          select: projectSelect,
          where: {
            id,
          },
        });
      });
    },
  };
}
