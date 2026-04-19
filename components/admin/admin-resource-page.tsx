"use client";

import { startTransition, useEffect, useRef, useState } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  buildBlogDraft,
  buildResourcePayload,
  emptyBlogDraft,
  emptyData,
  fetchAdminResourceList,
  fetchList,
  getDraftForResource,
  getEmptyDraft,
  parseResponse,
  pickSelectedId,
} from "./admin-data";
import {
  parseAdminResourceListParams,
  toAdminResourceSearchParams,
} from "./admin-query-state";
import { getAdminResourceConfig } from "./admin-resource-config";
import { AdminResourceTablePage } from "./admin-resource-table-page";
import type {
  AdminDashboardData,
  AdminListMeta,
  AdminListParams,
  BlogRecord,
  CategoryRecord,
  ChangelogRecord,
  DraftByResource,
  ResourceSection,
  TagRecord,
} from "./admin-types";
import { BlogForm } from "./resource-forms/blog-form";
import { CategoryForm } from "./resource-forms/category-form";
import { ChangelogForm } from "./resource-forms/changelog-form";
import { TagForm } from "./resource-forms/tag-form";

const apiPathByResource = {
  categories: "categories",
  tags: "tags",
  blogs: "blogs",
  changelogs: "changelogs",
} as const;

const blogConfig = getAdminResourceConfig("blogs");
type DrawerMode = "create" | "edit";
type LightweightResource = Exclude<ResourceSection, "blogs">;

type AdminResourcePageProps<TResource extends ResourceSection> = {
  resource: TResource;
  title: string;
  description: string;
};

type BlogTableRow = {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: string;
  featured: boolean;
  publishedAt: string;
  updatedAt: string;
};

type CategoryTableRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  updatedAt: string;
};

type TagTableRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  updatedAt: string;
};

type ChangelogTableRow = {
  id: string;
  version: string;
  releaseDate: string;
  contentPreview: string;
  updatedAt: string;
};

const emptyBlogListMeta: AdminListMeta = {
  page: blogConfig.defaultListParams.page,
  pageSize: blogConfig.defaultListParams.pageSize,
  total: 0,
};

type ApplyAdminBlogListResultInput = {
  blogs: BlogRecord[];
  categories: CategoryRecord[];
  currentDraft: DraftByResource["blogs"];
  currentSelectedId: string | null;
  meta: AdminListMeta;
  tags: TagRecord[];
};

export function getCreateBlogDraft(categories: CategoryRecord[]) {
  return {
    ...emptyBlogDraft(),
    categoryId: getDefaultBlogCategoryId(categories),
  };
}

export function applyAdminBlogListResult({
  blogs,
  categories,
  currentDraft,
  currentSelectedId,
  meta,
  tags,
}: ApplyAdminBlogListResultInput) {
  return {
    data: {
      ...emptyData,
      blogs,
      categories,
      tags,
    } satisfies AdminDashboardData,
    draft: normalizeBlogDraftCategory(currentDraft, categories),
    listMeta: meta,
    selectedId: currentSelectedId,
  };
}

export function AdminResourcePage<TResource extends ResourceSection>({
  resource,
  title,
  description,
}: AdminResourcePageProps<TResource>) {
  if (resource === "blogs") {
    return <AdminBlogResourcePage />;
  }

  return (
    <AdminLightweightResourcePage
      description={description}
      resource={resource}
      title={title}
    />
  );
}

function AdminBlogResourcePage() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState<AdminDashboardData>(emptyData);
  const [draft, setDraft] = useState(emptyBlogDraft);
  const [listMeta, setListMeta] = useState<AdminListMeta>(emptyBlogListMeta);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");
  const [errorMessage, setErrorMessage] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [reloadToken, setReloadToken] = useState(0);
  const draftRef = useRef(draft);
  const selectedIdRef = useRef(selectedId);

  const listParams = parseAdminResourceListParams(
    "blogs",
    new URLSearchParams(searchParams.toString()),
  );
  const listQuery = toAdminResourceSearchParams("blogs", listParams).toString();
  draftRef.current = draft;
  selectedIdRef.current = selectedId;

  useEffect(() => {
    let cancelled = false;

    async function loadCurrentPage() {
      setLoading(true);

      try {
        const [blogsResult, categories, tags] = await Promise.all([
          fetchAdminResourceList<BlogRecord>(
            "/api/blogs",
            new URLSearchParams(listQuery),
          ),
          fetchList<CategoryRecord>("/api/categories?page=1&pageSize=100"),
          fetchList<TagRecord>("/api/tags?page=1&pageSize=100"),
        ]);

        if (cancelled) {
          return;
        }

        const nextState = applyAdminBlogListResult({
          blogs: blogsResult.items,
          categories,
          currentDraft: draftRef.current,
          currentSelectedId: selectedIdRef.current,
          meta: blogsResult.meta,
          tags,
        });

        setData(nextState.data);
        setDraft(nextState.draft);
        setListMeta(nextState.listMeta);
        setSelectedId(nextState.selectedId);
        setErrorMessage("");
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error ? error.message : "后台数据加载失败",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadCurrentPage();

    return () => {
      cancelled = true;
    };
  }, [listQuery, reloadToken]);

  const rows = data.blogs.map((blog) => buildBlogTableRow(blog));

  const categoryOptions = data.categories.map((category) => ({
    label: category.name,
    value: category.id,
  }));

  const refreshBlogList = () => {
    setReloadToken((current) => current + 1);
  };

  const updateLocation = (nextParams: Partial<AdminListParams>) => {
    const nextSearchParams = toAdminResourceSearchParams("blogs", {
      ...listParams,
      ...nextParams,
    });
    const query = nextSearchParams.toString();

    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  };

  const handleCreate = () => {
    setSelectedId(null);
    setDrawerMode("create");
    setDrawerOpen(true);
    setDraft(getCreateBlogDraft(data.categories));
    setErrorMessage("");
    setFeedbackMessage("");
  };

  const handleRowClick = (row: BlogTableRow) => {
    const selectedBlog = data.blogs.find((blog) => blog.id === row.id);

    if (!selectedBlog) {
      return;
    }

    setSelectedId(selectedBlog.id);
    setDrawerMode("edit");
    setDrawerOpen(true);
    setDraft(
      normalizeBlogDraftCategory(buildBlogDraft(selectedBlog), data.categories),
    );
    setFeedbackMessage("");
  };

  const handleSubmit = async () => {
    setPending(true);
    setErrorMessage("");
    setFeedbackMessage("");

    try {
      const editing = drawerMode === "edit" && Boolean(selectedId);
      const method = editing ? "PATCH" : "POST";
      const basePath = `/api/${apiPathByResource.blogs}`;
      const url = editing ? `${basePath}/${selectedId}` : basePath;
      const response = await fetch(url, {
        method,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(buildResourcePayload("blogs", draft)),
      });
      const saved = await parseResponse<{ id: string }>(response);

      setDrawerOpen(false);
      setDrawerMode("edit");
      setSelectedId(saved.id);
      setFeedbackMessage(editing ? "保存成功。" : "创建成功。");
      refreshBlogList();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "保存失败");
    } finally {
      setPending(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) {
      return;
    }

    setPending(true);
    setErrorMessage("");
    setFeedbackMessage("");

    try {
      const response = await fetch(
        `/api/${apiPathByResource.blogs}/${selectedId}`,
        {
          method: "DELETE",
        },
      );
      await parseResponse<null>(response);
      setDrawerMode("create");
      setDrawerOpen(false);
      setSelectedId(null);
      setDraft(getCreateBlogDraft(data.categories));
      setFeedbackMessage("删除成功。");
      refreshBlogList();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "删除失败");
    } finally {
      setPending(false);
    }
  };

  return (
    <AdminResourceTablePage
      config={blogConfig}
      drawerBody={
        <BlogForm
          canDelete={drawerMode === "edit" && Boolean(selectedId)}
          categories={data.categories}
          deleteLabel={blogConfig.form.deleteLabel}
          draft={draft}
          pending={pending}
          submitLabel={blogConfig.form.submitLabel}
          tags={data.tags}
          onDelete={() => {
            void handleDelete();
          }}
          onDraftChange={(field, value) => {
            setDraft((current) => ({
              ...normalizeBlogDraftCategory(current, data.categories),
              [field]: value,
            }));
          }}
          onSubmit={() => {
            void handleSubmit();
          }}
          onToggleTag={(tagId) => {
            setDraft((current) => {
              const exists = current.tagIds.includes(tagId);

              return {
                ...current,
                tagIds: exists
                  ? current.tagIds.filter((id) => id !== tagId)
                  : [...current.tagIds, tagId],
              };
            });
          }}
        />
      }
      drawerMode={drawerMode}
      drawerOpen={drawerOpen}
      errorMessage={errorMessage}
      feedbackMessage={feedbackMessage}
      filterActions={
        <button
          className="ui-admin-button"
          disabled={loading}
          type="button"
          onClick={() => {
            refreshBlogList();
          }}
        >
          Refresh
        </button>
      }
      filterOptions={{
        categoryId: categoryOptions,
      }}
      filterValues={{
        categoryId: listParams.categoryId,
        featured: listParams.featured,
        published: listParams.published,
        query: listParams.query,
      }}
      items={rows}
      loading={loading}
      page={listMeta.page}
      pageSize={listMeta.pageSize}
      pending={pending}
      resource="blogs"
      selectedRowId={selectedId}
      total={listMeta.total}
      onCloseDrawer={() => {
        setDrawerOpen(false);
      }}
      onCreate={handleCreate}
      onFilterChange={(key, value) => {
        updateLocation({
          [key]: value,
          page: 1,
        });
      }}
      onPageChange={(page) => {
        updateLocation({ page });
      }}
      onPageSizeChange={(pageSize) => {
        updateLocation({ page: 1, pageSize });
      }}
      onResetFilters={() => {
        updateLocation({
          ...blogConfig.defaultListParams,
          categoryId: undefined,
          featured: undefined,
          published: undefined,
          query: undefined,
        });
      }}
      onRowClick={handleRowClick}
    />
  );
}

function AdminLightweightResourcePage<TResource extends LightweightResource>({
  resource,
}: AdminResourcePageProps<TResource>) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const config = getAdminResourceConfig(resource);

  const [data, setData] = useState<AdminDashboardData>(emptyData);
  const [draft, setDraft] = useState<DraftByResource[TResource]>(
    getEmptyDraft(resource) as DraftByResource[TResource],
  );
  const [listMeta, setListMeta] = useState<AdminListMeta>({
    page: config.defaultListParams.page,
    pageSize: config.defaultListParams.pageSize,
    total: 0,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("create");
  const [errorMessage, setErrorMessage] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [reloadToken, setReloadToken] = useState(0);
  const draftRef = useRef(draft);
  const selectedIdRef = useRef(selectedId);

  const listParams = parseAdminResourceListParams(
    resource,
    new URLSearchParams(searchParams.toString()),
  );
  const listQuery = toAdminResourceSearchParams(
    resource,
    listParams,
  ).toString();
  draftRef.current = draft;
  selectedIdRef.current = selectedId;

  useEffect(() => {
    let cancelled = false;

    async function loadCurrentPage() {
      setLoading(true);

      try {
        const result = await fetchLightweightResourcePageData(
          resource,
          new URLSearchParams(listQuery),
        );

        if (cancelled) {
          return;
        }

        const nextState = applyAdminLightweightListResult({
          currentDraft: draftRef.current,
          currentSelectedId: selectedIdRef.current,
          data: result.data,
          meta: result.meta,
          resource,
        });

        setData(nextState.data);
        setDraft(nextState.draft);
        setListMeta(nextState.listMeta);
        setSelectedId(nextState.selectedId);
        setErrorMessage("");
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error ? error.message : "后台数据加载失败",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadCurrentPage();

    return () => {
      cancelled = true;
    };
  }, [listQuery, reloadToken, resource]);

  const rows = buildLightweightTableRows(resource, data);

  const refreshList = () => {
    setReloadToken((current) => current + 1);
  };

  const updateLocation = (nextParams: Partial<AdminListParams>) => {
    const nextSearchParams = toAdminResourceSearchParams(resource, {
      ...listParams,
      ...nextParams,
    });
    const query = nextSearchParams.toString();

    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  };

  const handleCreate = () => {
    setSelectedId(null);
    setDrawerMode("create");
    setDrawerOpen(true);
    setDraft(getEmptyDraft(resource) as DraftByResource[TResource]);
    setErrorMessage("");
    setFeedbackMessage("");
  };

  const handleRowClick = (
    row: CategoryTableRow | TagTableRow | ChangelogTableRow,
  ) => {
    setSelectedId(row.id);
    setDrawerMode("edit");
    setDrawerOpen(true);
    setDraft(
      getDraftForResource(data, resource, row.id) as DraftByResource[TResource],
    );
    setFeedbackMessage("");
  };

  const handleSubmit = async () => {
    setPending(true);
    setErrorMessage("");
    setFeedbackMessage("");

    try {
      const editing = drawerMode === "edit" && Boolean(selectedId);
      const method = editing ? "PATCH" : "POST";
      const basePath = `/api/${apiPathByResource[resource]}`;
      const url = editing ? `${basePath}/${selectedId}` : basePath;
      const response = await fetch(url, {
        method,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(buildResourcePayload(resource, draft)),
      });
      const saved = await parseResponse<{ id: string }>(response);

      setDrawerOpen(false);
      setDrawerMode("edit");
      setSelectedId(saved.id);
      setFeedbackMessage(editing ? "保存成功。" : "创建成功。");
      refreshList();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "保存失败");
    } finally {
      setPending(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) {
      return;
    }

    setPending(true);
    setErrorMessage("");
    setFeedbackMessage("");

    try {
      const response = await fetch(
        `/api/${apiPathByResource[resource]}/${selectedId}`,
        {
          method: "DELETE",
        },
      );
      await parseResponse<null>(response);
      setDrawerMode("create");
      setDrawerOpen(false);
      setSelectedId(null);
      setDraft(getEmptyDraft(resource) as DraftByResource[TResource]);
      setFeedbackMessage("删除成功。");
      refreshList();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "删除失败");
    } finally {
      setPending(false);
    }
  };

  return (
    <AdminResourceTablePage
      config={config}
      drawerBody={renderLightweightForm({
        canDelete: drawerMode === "edit" && Boolean(selectedId),
        deleteLabel: config.form.deleteLabel,
        draft,
        pending,
        resource,
        submitLabel: config.form.submitLabel,
        onDelete: () => {
          void handleDelete();
        },
        onDraftChange: (field, value) => {
          setDraft((current) => ({
            ...current,
            [field]: value,
          }));
        },
        onSubmit: () => {
          void handleSubmit();
        },
      })}
      drawerMode={drawerMode}
      drawerOpen={drawerOpen}
      errorMessage={errorMessage}
      feedbackMessage={feedbackMessage}
      filterActions={
        <button
          className="ui-admin-button"
          disabled={loading}
          type="button"
          onClick={() => {
            refreshList();
          }}
        >
          Refresh
        </button>
      }
      filterValues={{
        query: listParams.query,
      }}
      items={rows}
      loading={loading}
      page={listMeta.page}
      pageSize={listMeta.pageSize}
      pending={pending}
      resource={resource}
      selectedRowId={selectedId}
      total={listMeta.total}
      onCloseDrawer={() => {
        setDrawerOpen(false);
      }}
      onCreate={handleCreate}
      onFilterChange={(key, value) => {
        updateLocation({
          [key]: value,
          page: 1,
        });
      }}
      onPageChange={(page) => {
        updateLocation({ page });
      }}
      onPageSizeChange={(pageSize) => {
        updateLocation({ page: 1, pageSize });
      }}
      onResetFilters={() => {
        updateLocation({
          ...config.defaultListParams,
          query: undefined,
        });
      }}
      onRowClick={handleRowClick}
    />
  );
}

function buildBlogTableRow(blog: BlogRecord): BlogTableRow {
  return {
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    category: blog.category?.name ?? "Uncategorized",
    status: blog.published ? "Published" : "Draft",
    featured: blog.featured,
    publishedAt: formatDateLabel(blog.publishedAt),
    updatedAt: formatDateLabel(blog.updatedAt),
  };
}

type ApplyAdminLightweightListResultInput<
  TResource extends LightweightResource,
> = {
  resource: TResource;
  data: AdminDashboardData;
  currentDraft: DraftByResource[TResource];
  currentSelectedId: string | null;
  meta: AdminListMeta;
};

function applyAdminLightweightListResult<
  TResource extends LightweightResource,
>({
  resource,
  data,
  currentDraft,
  currentSelectedId,
  meta,
}: ApplyAdminLightweightListResultInput<TResource>) {
  return {
    data,
    draft: currentDraft,
    listMeta: meta,
    selectedId: pickSelectedId(
      data[resource] as Array<{ id: string }>,
      currentSelectedId,
    ),
  };
}

async function fetchLightweightResourcePageData<
  TResource extends LightweightResource,
>(resource: TResource, params: URLSearchParams) {
  switch (resource) {
    case "categories": {
      const result = await fetchAdminResourceList<CategoryRecord>(
        "/api/categories",
        params,
      );

      return {
        data: {
          ...emptyData,
          categories: result.items,
        } satisfies AdminDashboardData,
        meta: result.meta,
      };
    }
    case "tags": {
      const result = await fetchAdminResourceList<TagRecord>(
        "/api/tags",
        params,
      );

      return {
        data: {
          ...emptyData,
          tags: result.items,
        } satisfies AdminDashboardData,
        meta: result.meta,
      };
    }
    case "changelogs": {
      const result = await fetchAdminResourceList<ChangelogRecord>(
        "/api/changelogs",
        params,
      );

      return {
        data: {
          ...emptyData,
          changelogs: result.items,
        } satisfies AdminDashboardData,
        meta: result.meta,
      };
    }
  }
}

function buildLightweightTableRows(
  resource: LightweightResource,
  data: AdminDashboardData,
) {
  switch (resource) {
    case "categories":
      return data.categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        updatedAt: formatDateLabel(category.updatedAt),
      })) satisfies CategoryTableRow[];
    case "tags":
      return data.tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        description: tag.description,
        updatedAt: formatDateLabel(tag.updatedAt),
      })) satisfies TagTableRow[];
    case "changelogs":
      return data.changelogs.map((changelog) => ({
        id: changelog.id,
        version: changelog.version,
        releaseDate: formatDateLabel(changelog.releaseDate),
        contentPreview: changelog.content,
        updatedAt: formatDateLabel(changelog.updatedAt),
      })) satisfies ChangelogTableRow[];
  }
}

function renderLightweightForm<TResource extends LightweightResource>({
  resource,
  draft,
  pending,
  canDelete,
  submitLabel,
  deleteLabel,
  onDraftChange,
  onSubmit,
  onDelete,
}: {
  resource: TResource;
  draft: DraftByResource[TResource];
  pending: boolean;
  canDelete: boolean;
  submitLabel: string;
  deleteLabel: string;
  onDraftChange: (field: string, value: string) => void;
  onSubmit: () => void;
  onDelete: () => void;
}) {
  switch (resource) {
    case "categories":
      return (
        <CategoryForm
          canDelete={canDelete}
          deleteLabel={deleteLabel}
          draft={draft as DraftByResource["categories"]}
          pending={pending}
          submitLabel={submitLabel}
          onDelete={onDelete}
          onDraftChange={onDraftChange}
          onSubmit={onSubmit}
        />
      );
    case "tags":
      return (
        <TagForm
          canDelete={canDelete}
          deleteLabel={deleteLabel}
          draft={draft as DraftByResource["tags"]}
          pending={pending}
          submitLabel={submitLabel}
          onDelete={onDelete}
          onDraftChange={onDraftChange}
          onSubmit={onSubmit}
        />
      );
    case "changelogs":
      return (
        <ChangelogForm
          canDelete={canDelete}
          deleteLabel={deleteLabel}
          draft={draft as DraftByResource["changelogs"]}
          pending={pending}
          submitLabel={submitLabel}
          onDelete={onDelete}
          onDraftChange={onDraftChange}
          onSubmit={onSubmit}
        />
      );
  }
}

function getDefaultBlogCategoryId(categories: CategoryRecord[]) {
  return categories[0]?.id ?? "";
}

function normalizeBlogDraftCategory(
  draft: DraftByResource["blogs"],
  categories: CategoryRecord[],
) {
  if (categories.length === 0) {
    return draft;
  }

  if (categories.some((category) => category.id === draft.categoryId)) {
    return draft;
  }

  return {
    ...draft,
    categoryId: getDefaultBlogCategoryId(categories),
  };
}

function formatDateLabel(value: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
