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
      <div className="morph-blob top-16 left-[6%] h-72 w-72" />
      <div className="morph-blob right-[10%] bottom-0 h-96 w-96 bg-info/10" />

      <div className="container-shell relative z-10 max-w-5xl">
        <div className="mb-10 text-center">
          <div className={`
            text-label mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2
            text-primary
          `}>
            <span className="inline-flex h-2 w-2 rounded-full bg-primary" />
            Article Archive
          </div>
          <h1 className="hero-title text-foreground">
            所有文章与
            <span className="brand-gradient block">学习记录</span>
          </h1>
          <p className={`
            mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground
            md:text-xl
          `}>
            围绕前端工程、交互实现、内容系统与个人实践，按主题把文章整理成一套可检索的知识栈。
          </p>
        </div>

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
      <div className="container-shell max-w-5xl pb-20">
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
