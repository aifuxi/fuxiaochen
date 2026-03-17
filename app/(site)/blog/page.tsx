import { Suspense } from "react";
import { getBlogsAction } from "@/app/actions/blog";
import { getCategoriesAction } from "@/app/actions/category";
import { getTagsAction } from "@/app/actions/tag";
import { BlogFilterBar } from "@/components/blog/blog-filter-bar";
import { BlogList } from "@/components/blog/blog-list";
import { Loader2 } from "lucide-react";
import type { Category } from "@/types/category";
import type { Tag } from "@/types/tag";

interface BlogPageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    title?: string;
    categoryId?: string;
    tagId?: string;
    sortBy?: "createdAt" | "updatedAt";
    order?: "asc" | "desc";
  }>;
}

const DEFAULT_PAGE_SIZE = 10;

// Hero
function Hero({
  categories,
  tags,
  currentFilters,
}: {
  categories: Category[];
  tags: Tag[];
  currentFilters: {
    title?: string;
    categoryId?: string;
    tagId?: string;
    sortBy?: "createdAt" | "updatedAt";
    order?: "asc" | "desc";
  };
}) {
  return (
    <section className={`
      relative px-6 py-20
      md:py-28
    `}>
      {/* Background glow */}
      <div
        className={`
          pointer-events-none absolute -top-40 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full blur-3xl
        `}
        style={{ background: "var(--primary-glow)" }}
      />

      <div className="relative z-10 mx-auto w-full max-w-4xl">
        {/* Eyebrow */}
        <div
          className="mb-4"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.72rem",
            color: "var(--foreground-subtle)",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            animation: "fade-up 0.5s ease forwards",
          }}
        >
          EXPLORATION &amp; ARTICLES
        </div>

        {/* Title */}
        <h1
          className="mb-4 font-bold"
          style={{
            fontSize: "clamp(2rem, 5vw, 3.25rem)",
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
            color: "var(--foreground)",
            animation: "fade-up 0.5s ease 0.1s both",
          }}
        >
          探索所有文章
        </h1>

        {/* Description */}
        <p
          className="mb-10"
          style={{
            fontSize: "1rem",
            color: "var(--foreground-muted)",
            animation: "fade-up 0.5s ease 0.2s both",
          }}
        >
          探索技术文章、前端开发与学习笔记
        </p>

        {/* Filter Bar */}
        <div style={{ animation: "fade-up 0.5s ease 0.3s both" }}>
          <BlogFilterBar
            categories={categories}
            tags={tags}
            currentFilters={currentFilters}
          />
        </div>
      </div>
    </section>
  );
}

async function BlogListContent({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const pageSize = parseInt(params.pageSize || String(DEFAULT_PAGE_SIZE), 10);

  const [blogsResult, categoriesResult, tagsResult] = await Promise.all([
    getBlogsAction({
      page,
      pageSize,
      title: params.title,
      categoryId: params.categoryId,
      tagId: params.tagId,
      sortBy: params.sortBy || "createdAt",
      order: params.order || "desc",
      published: true,
    }),
    getCategoriesAction({ page: 1, pageSize: 100 }),
    getTagsAction({ page: 1, pageSize: 100 }),
  ]);

  console.log(blogsResult.success, categoriesResult.success, tagsResult.success);

  if (!blogsResult.success || !categoriesResult.success || !tagsResult.success) {
    throw new Error("获取数据失败");
  }

  if (!blogsResult.data) {
    throw new Error("获取博客数据失败");
  }

  const blogs = blogsResult.data;
  const categories = categoriesResult.data?.lists || [];
  const tags = tagsResult.data?.lists || [];

  const baseUrl = `/blog?title=${params.title || ""}&categoryId=${params.categoryId || ""}&tagId=${params.tagId || ""}&sortBy=${params.sortBy || "createdAt"}&order=${params.order || "desc"}`;

  return (
    <>
      <Hero
        categories={categories}
        tags={tags}
        currentFilters={{
          title: params.title,
          categoryId: params.categoryId,
          tagId: params.tagId,
          sortBy: params.sortBy || "createdAt",
          order: params.order || "desc",
        }}
      />

      {/* Blog list */}
      <div className="mx-auto max-w-4xl px-6 pb-16">
        <BlogList
          blogs={blogs.lists || []}
          total={blogs.total}
          currentPage={page}
          pageSize={pageSize}
          baseUrl={baseUrl}
        />
      </div>
    </>
  );
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--foreground-muted)" }} />
        </div>
      }
    >
      <BlogListContent searchParams={searchParams} />
    </Suspense>
  );
}
