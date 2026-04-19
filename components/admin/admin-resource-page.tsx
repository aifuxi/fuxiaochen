"use client";

import { useEffect, useState } from "react";

import {
  buildResourcePayload,
  emptyData,
  fetchDashboardData,
  getDraftForResource,
  getEmptyDraft,
  parseResponse,
  pickSelectedId,
} from "./admin-data";
import { AdminResourceView } from "./admin-resource-view";
import type {
  AdminDashboardData,
  DraftByResource,
  ResourceSection,
} from "./admin-types";

const apiPathByResource = {
  categories: "categories",
  tags: "tags",
  blogs: "blogs",
  changelogs: "changelogs",
} as const;

type AdminResourcePageProps<TResource extends ResourceSection> = {
  resource: TResource;
  title: string;
  description: string;
};

export function AdminResourcePage<TResource extends ResourceSection>({
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
