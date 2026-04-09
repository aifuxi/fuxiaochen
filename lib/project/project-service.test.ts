import { ProjectCategory } from "@/generated/prisma/enums";
import { describe, expect, test } from "vitest";

import type { ApiError } from "@/lib/api/api-error";
import { projectErrorCodes } from "@/lib/api/error-codes";
import type { ProjectRepository } from "@/lib/project/project-repository";
import { createProjectService } from "@/lib/project/project-service";

const baseProjectRecord = {
  badgeLabel: "Productivity",
  category: ProjectCategory.Web,
  coverAsset: null,
  coverAssetId: null,
  createdAt: new Date("2026-04-09T00:00:00.000Z"),
  detail: null,
  externalUrl: null,
  id: "project_1",
  isFeatured: true,
  metricLabel: "Teams",
  metricValue: "1.2k",
  name: "StreamLine",
  technologies: [{ techName: "Svelte" }, { techName: "Supabase" }],
  publishedAt: null,
  slug: "streamline",
  sortOrder: 0,
  sourceUrl: null,
  summary: "Project management for modern teams.",
  updatedAt: new Date("2026-04-09T00:00:00.000Z"),
};

function createRepositoryStub(overrides: Partial<ProjectRepository> = {}): ProjectRepository {
  return {
    countByFilters: async () => 0,
    create: async (data) => ({
      ...baseProjectRecord,
      ...data,
      technologies: (data.techNames ?? []).map((techName) => ({ techName })),
    }),
    delete: async () => undefined,
    findById: async () => baseProjectRecord,
    findBySlug: async () => null,
    findCoverAssetById: async () => null,
    findManyWithPagination: async () => [baseProjectRecord],
    update: async (_id, data) => ({
      ...baseProjectRecord,
      ...data,
      technologies:
        data.techNames !== undefined ? data.techNames.map((techName) => ({ techName })) : baseProjectRecord.technologies,
    }),
    ...overrides,
  };
}

describe("project service", () => {
  test("returns PROJECT_SLUG_CONFLICT when slug already exists on create", async () => {
    const service = createProjectService(
      createRepositoryStub({
        findBySlug: async () => baseProjectRecord,
      }),
    );

    await expect(
      service.createProject({
        category: ProjectCategory.Web,
        isFeatured: true,
        name: "Another StreamLine",
        slug: "streamline",
        sortOrder: 0,
        summary: "Another project.",
      }),
    ).rejects.toMatchObject({
      code: projectErrorCodes.PROJECT_SLUG_CONFLICT,
    } satisfies Partial<ApiError>);
  });

  test("returns PROJECT_COVER_ASSET_NOT_FOUND when cover asset does not exist", async () => {
    const service = createProjectService(
      createRepositoryStub({
        findCoverAssetById: async () => null,
      }),
    );

    await expect(
      service.createProject({
        category: ProjectCategory.Web,
        coverAssetId: "missing-asset",
        isFeatured: true,
        name: "StreamLine",
        slug: "streamline-asset",
        sortOrder: 0,
        summary: "Project with missing cover.",
      }),
    ).rejects.toMatchObject({
      code: projectErrorCodes.PROJECT_COVER_ASSET_NOT_FOUND,
    } satisfies Partial<ApiError>);
  });

  test("returns PROJECT_SLUG_CONFLICT when update collides with another project slug", async () => {
    const service = createProjectService(
      createRepositoryStub({
        findById: async () => baseProjectRecord,
        findBySlug: async () => ({
          ...baseProjectRecord,
          id: "project_2",
          slug: "another-project",
        }),
      }),
    );

    await expect(
      service.updateProject("project_1", {
        slug: "another-project",
      }),
    ).rejects.toMatchObject({
      code: projectErrorCodes.PROJECT_SLUG_CONFLICT,
    } satisfies Partial<ApiError>);
  });

  test("returns PROJECT_NOT_FOUND when project does not exist", async () => {
    const service = createProjectService(
      createRepositoryStub({
        findById: async () => null,
      }),
    );

    await expect(service.getProjectById("missing")).rejects.toMatchObject({
      code: projectErrorCodes.PROJECT_NOT_FOUND,
    } satisfies Partial<ApiError>);
  });
});
