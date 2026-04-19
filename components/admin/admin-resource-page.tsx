"use client";

import { startTransition, useEffect, useRef, useState } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  buildBlogDraft,
  buildResourcePayload,
  emptyBlogDraft,
  emptyData,
  fetchAdminResourceList,
  fetchDashboardData,
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
import { AdminResourceView } from "./admin-resource-view";
import type {
  AdminDashboardData,
  AdminListMeta,
  AdminListParams,
  BlogRecord,
  CategoryRecord,
  DraftByResource,
  ResourceSection,
  TagRecord,
} from "./admin-types";
import { BlogForm } from "./resource-forms/blog-form";

const apiPathByResource = {
  categories: "categories",
  tags: "tags",
  blogs: "blogs",
  changelogs: "changelogs",
} as const;

const blogConfig = getAdminResourceConfig("blogs");

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
    <LegacyAdminResourcePage
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

function LegacyAdminResourcePage<TResource extends ResourceSection>({
  resource,
  title,
  description,
}: AdminResourcePageProps<TResource>) {
  const [data, setData] = useState<AdminDashboardData>(emptyData);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftByResource[TResource]>(
    getEmptyDraft(resource) as DraftByResource[TResource],
  );
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  async function loadData(preferredId?: string | null) {
    setLoading(true);

    try {
      const nextData = await fetchDashboardData();
      const items = nextData[resource] as Array<{ id: string }>;
      const nextSelectedId = pickSelectedId(items, preferredId ?? selectedId);

      setData(nextData);
      setSelectedId(nextSelectedId);
      setDraft(
        getDraftForResource(
          nextData,
          resource,
          nextSelectedId,
        ) as DraftByResource[TResource],
      );
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "后台数据加载失败",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      try {
        const nextData = await fetchDashboardData();

        if (cancelled) {
          return;
        }

        const nextSelectedId = pickSelectedId(
          nextData[resource] as Array<{ id: string }>,
          null,
        );
        setData(nextData);
        setSelectedId(nextSelectedId);
        setDraft(
          getDraftForResource(
            nextData,
            resource,
            nextSelectedId,
          ) as DraftByResource[TResource],
        );
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

    void loadInitialData();

    return () => {
      cancelled = true;
    };
  }, [resource]);

  const handleCreate = () => {
    setSelectedId(null);
    setDraft(getEmptyDraft(resource) as DraftByResource[TResource]);
    setErrorMessage("");
    setFeedbackMessage("");
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setDraft(
      getDraftForResource(data, resource, id) as DraftByResource[TResource],
    );
    setFeedbackMessage("");
  };

  const handleDraftChange = (field: string, value: string | boolean) => {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleToggleBlogTag = (tagId: string) => {
    if (resource !== "blogs") {
      return;
    }

    setDraft((current) => {
      const blogDraft = current as DraftByResource["blogs"];
      const exists = blogDraft.tagIds.includes(tagId);

      return {
        ...blogDraft,
        tagIds: exists
          ? blogDraft.tagIds.filter((id) => id !== tagId)
          : [...blogDraft.tagIds, tagId],
      } as DraftByResource[TResource];
    });
  };

  const handleSubmit = async () => {
    setPending(true);
    setErrorMessage("");
    setFeedbackMessage("");

    try {
      const method = selectedId ? "PATCH" : "POST";
      const basePath = `/api/${apiPathByResource[resource]}`;
      const url = selectedId ? `${basePath}/${selectedId}` : basePath;
      const response = await fetch(url, {
        method,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(buildResourcePayload(resource, draft)),
      });
      const saved = await parseResponse<{ id: string }>(response);

      await loadData(saved.id);
      setFeedbackMessage(selectedId ? "保存成功。" : "创建成功。");
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
      await loadData(null);
      setFeedbackMessage("删除成功。");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "删除失败");
    } finally {
      setPending(false);
    }
  };

  if (loading) {
    return (
      <main className="shell-page pt-32 pb-24">
        <section className="ui-panel p-8">
          <p className="ui-meta">Loading</p>
          <p className="mt-4 text-base leading-7 text-text-base">
            正在加载 {title.toLowerCase()} 数据...
          </p>
        </section>
      </main>
    );
  }

  return (
    <AdminResourceView
      data={data}
      description={description}
      draft={draft}
      errorMessage={errorMessage}
      feedbackMessage={feedbackMessage}
      pending={pending}
      resource={resource}
      selectedId={selectedId}
      title={title}
      onCreate={handleCreate}
      onDelete={() => {
        void handleDelete();
      }}
      onDraftChange={handleDraftChange}
      onRefresh={() => {
        void loadData();
      }}
      onSelect={handleSelect}
      onSubmit={() => {
        void handleSubmit();
      }}
      onToggleBlogTag={handleToggleBlogTag}
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
