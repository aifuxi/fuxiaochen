import { ProjectCategory } from "@/generated/prisma/enums";
import { describe, expect, test } from "vitest";

import { ApiError } from "@/lib/api/api-error";
import { handleRoute } from "@/lib/api/handle-route";
import { apiErrorCodes } from "@/lib/api/error-codes";
import { createProjectHandler } from "@/lib/project/project-handler";
import type { ProjectService } from "@/lib/project/project-service";

const sampleProject = {
  badgeLabel: "Productivity",
  category: ProjectCategory.Web,
  coverAsset: null,
  coverAssetId: null,
  createdAt: "2026-04-09T00:00:00.000Z",
  detail: null,
  externalUrl: null,
  id: "project_1",
  isFeatured: true,
  metricLabel: "Teams",
  metricValue: "1.2k",
  name: "StreamLine",
  publishedAt: null,
  slug: "streamline",
  sortOrder: 0,
  sourceUrl: null,
  summary: "Project management for modern teams.",
  techNames: ["Svelte", "Supabase"],
  updatedAt: "2026-04-09T00:00:00.000Z",
};

function createServiceStub(overrides: Partial<ProjectService> = {}): ProjectService {
  return {
    createProject: async () => sampleProject,
    deleteProject: async (id) => ({ id }),
    getProjectById: async () => sampleProject,
    listProjects: async () => ({
      items: [sampleProject],
      page: 1,
      pageSize: 10,
      total: 1,
      totalPages: 1,
    }),
    updateProject: async () => sampleProject,
    ...overrides,
  };
}

describe("project handler", () => {
  test("returns 401 when request is unauthenticated", async () => {
    const handler = createProjectHandler({
      requireSession: async () => {
        throw new ApiError({
          code: apiErrorCodes.UNAUTHORIZED,
          message: "Authentication required.",
        });
      },
      service: createServiceStub(),
    });

    const route = handleRoute(async (request: Request) => handler.listProjects(request));
    const response = await route(new Request("http://localhost/api/projects"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      code: apiErrorCodes.UNAUTHORIZED,
      success: false,
    });
  });

  test("returns list response with pagination meta", async () => {
    const handler = createProjectHandler({
      requireSession: async () => ({ user: { id: "user_1" } }),
      service: createServiceStub(),
    });

    const route = handleRoute(async (request: Request) => handler.listProjects(request));
    const response = await route(new Request("http://localhost/api/projects?page=1&pageSize=10"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      code: "OK",
      data: {
        items: [sampleProject],
      },
      meta: {
        page: 1,
        pageSize: 10,
        total: 1,
        totalPages: 1,
      },
      success: true,
    });
  });

  test("returns 201 on create", async () => {
    const handler = createProjectHandler({
      requireSession: async () => ({ user: { id: "user_1" } }),
      service: createServiceStub(),
    });

    const route = handleRoute(async (request: Request) => handler.createProject(request));
    const response = await route(
      new Request("http://localhost/api/projects", {
        body: JSON.stringify({
          category: ProjectCategory.Web,
          isFeatured: true,
          name: "StreamLine",
          slug: "streamline",
          summary: "Project management for modern teams.",
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({
      code: "OK",
      data: sampleProject,
      success: true,
    });
  });

  test("returns updated project on patch", async () => {
    const handler = createProjectHandler({
      requireSession: async () => ({ user: { id: "user_1" } }),
      service: createServiceStub(),
    });

    const route = handleRoute(async (request: Request) =>
      handler.updateProject(request, { id: "project_1" }),
    );
    const response = await route(
      new Request("http://localhost/api/projects/project_1", {
        body: JSON.stringify({
          summary: "Updated summary",
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "PATCH",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      code: "OK",
      data: sampleProject,
      success: true,
    });
  });

  test("returns deleted project id on delete", async () => {
    const handler = createProjectHandler({
      requireSession: async () => ({ user: { id: "user_1" } }),
      service: createServiceStub(),
    });

    const route = handleRoute(async (request: Request) =>
      handler.deleteProject(request, { id: "project_1" }),
    );
    const response = await route(
      new Request("http://localhost/api/projects/project_1", {
        method: "DELETE",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      code: "OK",
      data: {
        id: "project_1",
      },
      success: true,
    });
  });
});
