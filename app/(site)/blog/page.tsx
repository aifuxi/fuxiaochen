import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { getBlogsAction } from "@/app/actions/blog";
import { getCategoriesAction } from "@/app/actions/category";
import { getTagsAction } from "@/app/actions/tag";
import type { Category } from "@/types/category";
import type { Tag } from "@/types/tag";
import { BlogFilterBar } from "@/components/blog/blog-filter-bar";
import { BlogList } from "@/components/blog/blog-list";

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

// Hero 区域 - Apple 大胆风格
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
    <section
      className={`
        relative flex min-h-[50vh] flex-col items-center justify-center overflow-hidden py-20
        md:min-h-[60vh] md:py-28
      `}
    >
      {/* 动态渐变背景 */}
      <div
        className={`
          pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))]
          from-accent/10 via-transparent to-transparent
        `}
      />
      <div
        className={`
          pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full
          bg-gradient-to-b from-accent/5 via-info/5 to-transparent blur-3xl
        `}
      />

      {/* 内容 */}
      <div className="relative z-10 mx-auto w-full max-w-4xl px-4">
        {/* 标题 */}
        <div className="mb-10 text-center">
          <h1
            className={`
              mb-4 text-5xl font-bold tracking-tight text-text
              md:text-7xl
            `}
          >
            Blog
          </h1>
          <p
            className={`
              text-lg text-text-secondary
              md:text-xl
            `}
          >
            探索技术文章与学习笔记
          </p>
        </div>

        {/* 筛选栏 */}
        <BlogFilterBar
          categories={categories}
          tags={tags}
          currentFilters={currentFilters}
        />
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

  if (
    !blogsResult.success ||
    !categoriesResult.success ||
    !tagsResult.success
  ) {
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

      {/* 博客列表 */}
      <div className="mx-auto max-w-4xl px-4 pb-16">
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
          <Loader2 className="h-8 w-8 animate-spin text-text-secondary" />
        </div>
      }
    >
      <BlogListContent searchParams={searchParams} />
    </Suspense>
  );
}
