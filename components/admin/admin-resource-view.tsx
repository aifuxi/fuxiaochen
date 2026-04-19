import { cn } from "@/lib/utils";

import type {
  AdminDashboardData,
  BlogDraft,
  CategoryDraft,
  ChangelogDraft,
  DraftByResource,
  ResourceSection,
  TagDraft,
} from "./admin-types";

type AdminResourceViewProps<TResource extends ResourceSection> = {
  data: AdminDashboardData;
  resource: TResource;
  title: string;
  description: string;
  selectedId: string | null;
  pending: boolean;
  errorMessage: string;
  feedbackMessage: string;
  draft: DraftByResource[TResource];
  onSelect: (id: string) => void;
  onCreate: () => void;
  onRefresh: () => void;
  onSubmit: () => void;
  onDelete: () => void;
  onDraftChange: (field: string, value: string | boolean) => void;
  onToggleBlogTag: (tagId: string) => void;
};

const formatDateLabel = (value: string | null) => {
  if (!value) {
    return "Not scheduled";
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
};

export function AdminResourceView<TResource extends ResourceSection>({
  data,
  resource,
  title,
  description,
  selectedId,
  pending,
  errorMessage,
  feedbackMessage,
  draft,
  onSelect,
  onCreate,
  onRefresh,
  onSubmit,
  onDelete,
  onDraftChange,
  onToggleBlogTag,
}: AdminResourceViewProps<TResource>) {
  return (
    <main className="shell-page flex flex-col gap-10 pt-32 pb-24">
      <header className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
        <div className="space-y-4">
          <p className="ui-eyebrow">{title}</p>
          <h1 className="text-display-2 font-light tracking-[-0.06em] text-text-strong md:text-[4rem]">
            {title}
          </h1>
          <p className="max-w-2xl text-body-lg text-text-base">{description}</p>
        </div>
        <button type="button" className="ui-admin-button" onClick={onRefresh}>
          刷新数据
        </button>
      </header>

      {errorMessage ? (
        <div className="rounded-control border border-rose-300/20 bg-rose-500/8 px-4 py-3 text-sm text-rose-200">
          {errorMessage}
        </div>
      ) : null}

      {feedbackMessage ? (
        <div className="rounded-control border border-brand/20 bg-brand/8 px-4 py-3 text-sm text-brand-soft">
          {feedbackMessage}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
        <ResourceList
          emptyLabel={getEmptyLabel(resource)}
          items={getListItems(data, resource)}
          selectedId={selectedId}
          onCreate={onCreate}
          onSelect={onSelect}
        />

        {resource === "categories" ? (
          <CategoryEditor
            busy={pending}
            canDelete={Boolean(selectedId)}
            draft={draft as CategoryDraft}
            onDelete={onDelete}
            onDraftChange={onDraftChange}
            onSubmit={onSubmit}
          />
        ) : null}

        {resource === "tags" ? (
          <TagEditor
            busy={pending}
            canDelete={Boolean(selectedId)}
            draft={draft as TagDraft}
            onDelete={onDelete}
            onDraftChange={onDraftChange}
            onSubmit={onSubmit}
          />
        ) : null}

        {resource === "blogs" ? (
          <BlogEditor
            busy={pending}
            canDelete={Boolean(selectedId)}
            categories={data.categories}
            draft={draft as BlogDraft}
            tags={data.tags}
            onDelete={onDelete}
            onDraftChange={onDraftChange}
            onSubmit={onSubmit}
            onToggleBlogTag={onToggleBlogTag}
          />
        ) : null}

        {resource === "changelogs" ? (
          <ChangelogEditor
            busy={pending}
            canDelete={Boolean(selectedId)}
            draft={draft as ChangelogDraft}
            onDelete={onDelete}
            onDraftChange={onDraftChange}
            onSubmit={onSubmit}
          />
        ) : null}
      </section>
    </main>
  );
}

function getEmptyLabel(resource: ResourceSection) {
  switch (resource) {
    case "categories":
      return "还没有分类。";
    case "tags":
      return "还没有标签。";
    case "blogs":
      return "还没有文章。";
    case "changelogs":
      return "还没有 changelog。";
  }
}

function getListItems(data: AdminDashboardData, resource: ResourceSection) {
  switch (resource) {
    case "categories":
      return data.categories.map((category) => ({
        id: category.id,
        title: category.name,
        meta: category.slug,
        description: category.description,
      }));
    case "tags":
      return data.tags.map((tag) => ({
        id: tag.id,
        title: tag.name,
        meta: tag.slug,
        description: tag.description,
      }));
    case "blogs":
      return data.blogs.map((blog) => ({
        id: blog.id,
        title: blog.title,
        meta: blog.category?.name ?? "Uncategorized",
        description: blog.description,
        badge: blog.published ? "Published" : "Draft",
      }));
    case "changelogs":
      return data.changelogs.map((changelog) => ({
        id: changelog.id,
        title: changelog.version,
        meta: formatDateLabel(changelog.releaseDate),
        description: changelog.content,
      }));
  }
}

function ResourceList({
  emptyLabel,
  items,
  selectedId,
  onCreate,
  onSelect,
}: {
  emptyLabel: string;
  items: Array<{
    id: string;
    title: string;
    meta: string;
    description: string;
    badge?: string;
  }>;
  selectedId: string | null;
  onCreate: () => void;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4 ui-panel p-6">
      <div className="flex items-center justify-between gap-4">
        <p className="ui-meta">Items</p>
        <button type="button" className="ui-admin-button" onClick={onCreate}>
          新建
        </button>
      </div>

      <div className="flex max-h-[36rem] flex-col gap-2 overflow-y-auto pr-1">
        {items.length > 0 ? (
          items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={cn(
                "ui-admin-list-item text-left",
                selectedId === item.id && "ui-admin-list-item-active",
              )}
              onClick={() => onSelect(item.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-medium tracking-[-0.02em] text-text-strong">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs tracking-[0.18em] text-text-muted uppercase">
                    {item.meta}
                  </p>
                </div>
                {item.badge ? (
                  <span className="ui-admin-chip whitespace-nowrap">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-text-soft">
                {item.description}
              </p>
            </button>
          ))
        ) : (
          <div className="rounded-control border border-dashed border-white/10 px-4 py-6 text-sm text-text-muted">
            {emptyLabel}
          </div>
        )}
      </div>
    </div>
  );
}

function EditorFrame({
  title,
  description,
  busy,
  canDelete,
  onSubmit,
  onDelete,
  children,
}: {
  title: string;
  description: string;
  busy: boolean;
  canDelete: boolean;
  onSubmit: () => void;
  onDelete: () => void;
  children: React.ReactNode;
}) {
  return (
    <form
      className="flex flex-col gap-5 ui-panel p-6"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="space-y-2">
        <p className="ui-meta">Editor</p>
        <h2 className="text-title font-medium tracking-[-0.03em] text-text-strong">
          {title}
        </h2>
        <p className="text-sm leading-7 text-text-soft">{description}</p>
      </div>
      <div className="space-y-4">{children}</div>
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          type="submit"
          className="ui-admin-button-primary"
          disabled={busy}
        >
          {busy ? "提交中..." : "保存"}
        </button>
        {canDelete ? (
          <button
            type="button"
            className="ui-admin-button-danger"
            disabled={busy}
            onClick={onDelete}
          >
            删除
          </button>
        ) : (
          <span className="text-xs tracking-[0.18em] text-text-muted uppercase">
            新建模式
          </span>
        )}
      </div>
    </form>
  );
}

function CategoryEditor({
  busy,
  canDelete,
  draft,
  onDelete,
  onDraftChange,
  onSubmit,
}: {
  busy: boolean;
  canDelete: boolean;
  draft: CategoryDraft;
  onDelete: () => void;
  onDraftChange: (field: string, value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <EditorFrame
      busy={busy}
      canDelete={canDelete}
      description="分类用于文章归档，不额外拆更多字段。"
      title={canDelete ? "编辑分类" : "新建分类"}
      onDelete={onDelete}
      onSubmit={onSubmit}
    >
      <AdminInput
        label="名称"
        name="name"
        value={draft.name}
        onChange={(value) => onDraftChange("name", value)}
      />
      <AdminInput
        label="Slug"
        name="slug"
        value={draft.slug}
        onChange={(value) => onDraftChange("slug", value)}
      />
      <AdminInput
        label="Description"
        name="description"
        value={draft.description}
        onChange={(value) => onDraftChange("description", value)}
      />
    </EditorFrame>
  );
}

function TagEditor({
  busy,
  canDelete,
  draft,
  onDelete,
  onDraftChange,
  onSubmit,
}: {
  busy: boolean;
  canDelete: boolean;
  draft: TagDraft;
  onDelete: () => void;
  onDraftChange: (field: string, value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <EditorFrame
      busy={busy}
      canDelete={canDelete}
      description="保留简洁的名称、slug 和说明。"
      title={canDelete ? "编辑标签" : "新建标签"}
      onDelete={onDelete}
      onSubmit={onSubmit}
    >
      <AdminInput
        label="名称"
        name="tagName"
        value={draft.name}
        onChange={(value) => onDraftChange("name", value)}
      />
      <AdminInput
        label="Slug"
        name="tagSlug"
        value={draft.slug}
        onChange={(value) => onDraftChange("slug", value)}
      />
      <AdminInput
        label="Description"
        name="tagDescription"
        value={draft.description}
        onChange={(value) => onDraftChange("description", value)}
      />
    </EditorFrame>
  );
}

function BlogEditor({
  busy,
  canDelete,
  categories,
  draft,
  tags,
  onDelete,
  onDraftChange,
  onSubmit,
  onToggleBlogTag,
}: {
  busy: boolean;
  canDelete: boolean;
  categories: AdminDashboardData["categories"];
  draft: BlogDraft;
  tags: AdminDashboardData["tags"];
  onDelete: () => void;
  onDraftChange: (field: string, value: string | boolean) => void;
  onSubmit: () => void;
  onToggleBlogTag: (tagId: string) => void;
}) {
  return (
    <EditorFrame
      busy={busy}
      canDelete={canDelete}
      description="文章编辑保持最小字段集，内容只使用 textarea。"
      title={canDelete ? "编辑文章" : "新建文章"}
      onDelete={onDelete}
      onSubmit={onSubmit}
    >
      <AdminInput
        label="标题"
        name="title"
        value={draft.title}
        onChange={(value) => onDraftChange("title", value)}
      />
      <AdminInput
        label="Slug"
        name="blogSlug"
        value={draft.slug}
        onChange={(value) => onDraftChange("slug", value)}
      />
      <AdminInput
        label="描述"
        name="blogDescription"
        value={draft.description}
        onChange={(value) => onDraftChange("description", value)}
      />
      <AdminInput
        label="封面"
        name="cover"
        value={draft.cover}
        onChange={(value) => onDraftChange("cover", value)}
      />
      <AdminTextArea
        label="Content"
        name="content"
        rows={14}
        value={draft.content}
        onChange={(value) => onDraftChange("content", value)}
      />
      <AdminSelect
        label="Category"
        name="categoryId"
        options={categories.map((category) => ({
          label: category.name,
          value: category.id,
        }))}
        value={draft.categoryId}
        onChange={(value) => onDraftChange("categoryId", value)}
      />
      <div className="space-y-3">
        <FieldLabel htmlFor="blog-tags">Tags</FieldLabel>
        <div
          id="blog-tags"
          className="rounded-control border border-white/8 bg-surface-2/80 p-4"
        >
          <div className="flex flex-wrap gap-2">
            {tags.length > 0 ? (
              tags.map((tag) => {
                const checked = draft.tagIds.includes(tag.id);

                return (
                  <label
                    key={tag.id}
                    className={cn(
                      "ui-admin-chip cursor-pointer",
                      checked && "ui-admin-chip-active",
                    )}
                  >
                    <input
                      checked={checked}
                      className="sr-only"
                      type="checkbox"
                      onChange={() => onToggleBlogTag(tag.id)}
                    />
                    {tag.name}
                  </label>
                );
              })
            ) : (
              <p className="text-sm text-text-muted">暂无标签可选。</p>
            )}
          </div>
        </div>
      </div>
      <AdminInput
        label="Published At"
        name="publishedAt"
        type="datetime-local"
        value={draft.publishedAt}
        onChange={(value) => onDraftChange("publishedAt", value)}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <AdminCheckbox
          checked={draft.published}
          label="Published"
          name="published"
          onChange={(checked) => onDraftChange("published", checked)}
        />
        <AdminCheckbox
          checked={draft.featured}
          label="Featured"
          name="featured"
          onChange={(checked) => onDraftChange("featured", checked)}
        />
      </div>
    </EditorFrame>
  );
}

function ChangelogEditor({
  busy,
  canDelete,
  draft,
  onDelete,
  onDraftChange,
  onSubmit,
}: {
  busy: boolean;
  canDelete: boolean;
  draft: ChangelogDraft;
  onDelete: () => void;
  onDraftChange: (field: string, value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <EditorFrame
      busy={busy}
      canDelete={canDelete}
      description="版本更新保持纯文本编辑，内容直接写入 textarea。"
      title={canDelete ? "编辑版本记录" : "新建版本记录"}
      onDelete={onDelete}
      onSubmit={onSubmit}
    >
      <AdminInput
        label="Version"
        name="version"
        value={draft.version}
        onChange={(value) => onDraftChange("version", value)}
      />
      <AdminInput
        label="Release Date"
        name="releaseDate"
        type="date"
        value={draft.releaseDate}
        onChange={(value) => onDraftChange("releaseDate", value)}
      />
      <AdminTextArea
        label="Content"
        name="changelogContent"
        rows={12}
        value={draft.content}
        onChange={(value) => onDraftChange("content", value)}
      />
    </EditorFrame>
  );
}

function FieldLabel({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block ui-meta text-[0.68rem] tracking-[0.22em]"
    >
      {children}
    </label>
  );
}

function AdminInput({
  label,
  name,
  onChange,
  type = "text",
  value,
}: {
  label: string;
  name: string;
  onChange: (value: string) => void;
  type?: string;
  value: string;
}) {
  return (
    <div className="space-y-2">
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <input
        id={name}
        className="ui-admin-input"
        name={name}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function AdminTextArea({
  label,
  name,
  onChange,
  rows,
  value,
}: {
  label: string;
  name: string;
  onChange: (value: string) => void;
  rows: number;
  value: string;
}) {
  return (
    <div className="space-y-2">
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <textarea
        id={name}
        className="ui-admin-textarea"
        name={name}
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function AdminSelect({
  label,
  name,
  onChange,
  options,
  value,
}: {
  label: string;
  name: string;
  onChange: (value: string) => void;
  options: Array<{
    label: string;
    value: string;
  }>;
  value: string;
}) {
  return (
    <div className="space-y-2">
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <select
        id={name}
        className="ui-admin-input"
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">请选择分类</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function AdminCheckbox({
  checked,
  label,
  name,
  onChange,
}: {
  checked: boolean;
  label: string;
  name: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      className="flex items-center gap-3 rounded-control border border-white/8 bg-surface-2/80 px-4 py-3"
      htmlFor={name}
    >
      <input
        id={name}
        checked={checked}
        className="h-4 w-4 accent-brand"
        name={name}
        type="checkbox"
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="text-sm text-text-base">{label}</span>
    </label>
  );
}
