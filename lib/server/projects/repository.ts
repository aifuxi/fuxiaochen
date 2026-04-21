import {
  and,
  asc,
  desc,
  eq,
  ilike,
  or,
  sql,
  type SQL,
  type SQLWrapper,
} from "drizzle-orm";

import { db } from "@/lib/db";
import { projects, type NewProject, type Project } from "@/lib/db/schema";
import type {
  AdminProjectListQuery,
  PublicProjectListQuery,
} from "@/lib/server/projects/dto";

export interface ProjectRepository {
  listAdmin(query: AdminProjectListQuery): Promise<{
    items: Project[];
    total: number;
  }>;
  listPublic(query: PublicProjectListQuery): Promise<{
    items: Project[];
    total: number;
  }>;
  findById(id: string): Promise<Project | null>;
  findBySlug(slug: string): Promise<Project | null>;
  create(project: NewProject): Promise<Project>;
  update(id: string, project: Partial<NewProject>): Promise<Project | null>;
  delete(id: string): Promise<boolean>;
}

const buildAdminWhere = ({
  query,
  featured,
  published,
  year,
}: Pick<
  AdminProjectListQuery,
  "query" | "featured" | "published" | "year"
>) => {
  const filters: SQLWrapper[] = [];

  if (query) {
    filters.push(
      or(
        ilike(projects.title, `%${query}%`),
        ilike(projects.slug, `%${query}%`),
        ilike(projects.description, `%${query}%`),
        ilike(projects.longDescription, `%${query}%`),
      )!,
    );
  }

  if (featured !== undefined) {
    filters.push(eq(projects.featured, featured));
  }

  if (published !== undefined) {
    filters.push(eq(projects.published, published));
  }

  if (year !== undefined) {
    filters.push(eq(projects.year, year));
  }

  return filters.length > 0 ? and(...filters) : undefined;
};

const buildPublicWhere = ({
  query,
  featured,
  year,
  tag,
}: Pick<PublicProjectListQuery, "query" | "featured" | "year" | "tag">) => {
  const filters: SQLWrapper[] = [eq(projects.published, true)];

  if (query) {
    filters.push(
      or(
        ilike(projects.title, `%${query}%`),
        ilike(projects.description, `%${query}%`),
        ilike(projects.longDescription, `%${query}%`),
      )!,
    );
  }

  if (featured !== undefined) {
    filters.push(eq(projects.featured, featured));
  }

  if (year !== undefined) {
    filters.push(eq(projects.year, year));
  }

  if (tag) {
    filters.push(sql`${projects.tags} @> ARRAY[${tag}]::text[]`);
  }

  return and(...filters);
};

const buildAdminOrderBy = ({
  sortBy,
  sortDirection,
}: Pick<AdminProjectListQuery, "sortBy" | "sortDirection">) => {
  if (sortBy === "year") {
    return [
      sortDirection === "asc" ? asc(projects.year) : desc(projects.year),
      asc(projects.title),
      desc(projects.id),
    ] as const;
  }

  if (sortBy === "title") {
    return [
      sortDirection === "asc" ? asc(projects.title) : desc(projects.title),
      desc(projects.year),
      desc(projects.id),
    ] as const;
  }

  return [
    sortDirection === "asc"
      ? asc(projects.updatedAt)
      : desc(projects.updatedAt),
    desc(projects.id),
  ] as const;
};

const buildPublicOrderBy = ({
  sortBy,
  sortDirection,
}: Pick<PublicProjectListQuery, "sortBy" | "sortDirection">) => {
  if (sortBy === "title") {
    return [
      sortDirection === "asc" ? asc(projects.title) : desc(projects.title),
      desc(projects.year),
      desc(projects.id),
    ] as const;
  }

  return [
    sortDirection === "asc" ? asc(projects.year) : desc(projects.year),
    desc(projects.featured),
    asc(projects.title),
    desc(projects.id),
  ] as const;
};

const countProjects = async (where?: SQL<unknown>) => {
  const rows = await db
    .select({
      total: sql<number>`count(*)`.mapWith(Number),
    })
    .from(projects)
    .where(where);

  return rows[0]?.total ?? 0;
};

export const projectRepository: ProjectRepository = {
  async listAdmin({
    page,
    pageSize,
    query,
    featured,
    published,
    year,
    sortBy,
    sortDirection,
  }) {
    const offset = (page - 1) * pageSize;
    const where = buildAdminWhere({ query, featured, published, year });
    const [items, total] = await Promise.all([
      db
        .select()
        .from(projects)
        .where(where)
        .orderBy(...buildAdminOrderBy({ sortBy, sortDirection }))
        .limit(pageSize)
        .offset(offset),
      countProjects(where),
    ]);

    return { items, total };
  },
  async listPublic({
    page,
    pageSize,
    query,
    featured,
    year,
    tag,
    sortBy,
    sortDirection,
  }) {
    const offset = (page - 1) * pageSize;
    const where = buildPublicWhere({ query, featured, year, tag });
    const [items, total] = await Promise.all([
      db
        .select()
        .from(projects)
        .where(where)
        .orderBy(...buildPublicOrderBy({ sortBy, sortDirection }))
        .limit(pageSize)
        .offset(offset),
      countProjects(where),
    ]);

    return { items, total };
  },
  async findById(id) {
    const rows = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    return rows[0] ?? null;
  },
  async findBySlug(slug) {
    const rows = await db
      .select()
      .from(projects)
      .where(eq(projects.slug, slug))
      .limit(1);

    return rows[0] ?? null;
  },
  async create(project) {
    const rows = await db.insert(projects).values(project).returning();
    return rows[0] as Project;
  },
  async update(id, project) {
    const rows = await db
      .update(projects)
      .set(project)
      .where(eq(projects.id, id))
      .returning();

    return rows[0] ?? null;
  },
  async delete(id) {
    const rows = await db
      .delete(projects)
      .where(eq(projects.id, id))
      .returning({
        id: projects.id,
      });

    return rows.length > 0;
  },
};
