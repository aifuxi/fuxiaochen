import Link from "next/link";
import Image from "next/image";
import { getBlogsAction } from "@/app/actions/blog";
import { getCategoriesAction } from "@/app/actions/category";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { formatSimpleDate } from "@/lib/time";

// 精选文章卡片
async function FeaturedPosts() {
  const result = await getBlogsAction({
    page: 1,
    pageSize: 4,
    published: true,
    sortBy: "createdAt",
    order: "desc",
  });

  if (!result.success || !result.data?.lists?.length) {
    return null;
  }

  const posts = result.data.lists;
  const [firstPost, ...restPosts] = posts as [typeof posts[0], ...typeof posts];

  return (
    <section className="space-y-8">
      {/* 主推文章 */}
      <Link href={`/blog/${firstPost.slug}`} className="group block">
        <Card className="relative aspect-[21/9] overflow-hidden p-0">
          {firstPost.cover ? (
            <Image
              src={firstPost.cover}
              alt={firstPost.title}
              fill
              className={`
                object-cover transition-transform duration-500
                group-hover:scale-105
              `}
            />
          ) : null}
          {/* 渐变遮罩 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          {/* 内容 */}
          <div className={`
            absolute right-0 bottom-0 left-0 p-6
            md:p-8
          `}>
            {firstPost.category && (
              <Badge variant="secondary" className="mb-3 bg-white/20 text-white backdrop-blur-sm">
                {firstPost.category.name}
              </Badge>
            )}
            <h2 className={`
              mb-2 line-clamp-2 text-xl font-bold text-white
              md:text-2xl
              lg:text-3xl
            `}>
              {firstPost.title}
            </h2>
            <p className={`
              mb-4 line-clamp-2 max-w-2xl text-sm text-white/80
              md:text-base
            `}>
              {firstPost.description}
            </p>
            <div className={`
              flex items-center gap-4 text-xs text-white/60
              md:text-sm
            `}>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatSimpleDate(new Date(firstPost.createdAt))}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {Math.max(1, Math.ceil(firstPost.content.length / 300))} 分钟阅读
              </span>
            </div>
          </div>
        </Card>
      </Link>

      {/* 其他文章 */}
      <div className={`
        grid gap-4
        sm:grid-cols-2
        lg:grid-cols-3
      `}>
        {restPosts.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="group">
            <Card className={`
              flex h-full flex-col overflow-hidden p-0 transition-all duration-200 ease-apple
              hover:shadow-lg
            `}>
              {post.cover ? (
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={post.cover}
                    alt={post.title}
                    fill
                    className={`
                      object-cover transition-transform duration-500
                      group-hover:scale-105
                    `}
                  />
                </div>
              ) : (
                <div className="aspect-[16/9] bg-gradient-to-br from-surface to-surface-hover" />
              )}
              <div className="flex flex-1 flex-col gap-2 p-4">
                {post.category && (
                  <Badge variant="outline" className="w-fit text-xs">
                    {post.category.name}
                  </Badge>
                )}
                <h3 className={`
                  line-clamp-2 text-base font-semibold text-text
                  group-hover:text-accent
                `}>
                  {post.title}
                </h3>
                <p className="line-clamp-2 flex-1 text-sm text-text-secondary">
                  {post.description}
                </p>
                <span className="text-xs text-text-tertiary">
                  {formatSimpleDate(new Date(post.createdAt))}
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}

// 分类导航
async function CategoryNav() {
  const result = await getCategoriesAction({ page: 1, pageSize: 10 });

  if (!result.success || !result.data?.lists?.length) {
    return null;
  }

  const categories = result.data.lists;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text">探索分类</h2>
        <Link
          href="/blog"
          className={`
            flex items-center gap-1 text-sm text-accent transition-colors
            hover:text-accent-hover-color
          `}
        >
          查看全部
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/blog?categoryId=${category.id}`}
            className="group"
          >
            <Badge
              variant="secondary"
              className={`
                rounded-full px-4 py-2 text-sm transition-all duration-200
                group-hover:bg-accent group-hover:text-white
              `}
            >
              {category.name}
              <span className={`
                ml-1.5 text-xs text-text-tertiary
                group-hover:text-white/70
              `}>
                {category.blogCount}
              </span>
            </Badge>
          </Link>
        ))}
      </div>
    </section>
  );
}

// Hero 区域
function Hero() {
  return (
    <section className={`
      relative overflow-hidden py-16
      md:py-24
      lg:py-32
    `}>
      {/* 装饰性渐变 */}
      <div className={`
        pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b
        from-accent/10 via-accent/5 to-transparent blur-3xl
      `} />
      <div className={`
        pointer-events-none absolute -top-20 -right-40 h-[300px] w-[400px] rounded-full bg-gradient-to-br from-info/10
        to-transparent blur-3xl
      `} />

      <div className="relative mx-auto max-w-3xl text-center">
        {/* 标签 */}
        <div className={`
          mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface/50 px-4 py-1.5 text-sm
          text-text-secondary backdrop-blur-sm
        `}>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          持续更新中
        </div>

        {/* 主标题 */}
        <h1 className={`
          mb-6 text-4xl font-bold tracking-tight text-text
          md:text-5xl
          lg:text-6xl
        `}>
          探索技术
          <span className="bg-gradient-to-r from-accent via-info to-accent bg-clip-text text-transparent">
            {" "}
            无限可能
          </span>
        </h1>

        {/* 副标题 */}
        <p className={`
          mx-auto mb-8 max-w-xl text-base text-text-secondary
          md:text-lg
          lg:text-xl
        `}>
          记录前端开发与技术探索的点滴，分享学习心得与实践经验
        </p>

        {/* CTA 按钮 */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button variant="primary" size="lg" asChild>
            <Link href="/blog" className="gap-2">
              开始阅读
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="secondary" size="lg" asChild>
            <Link href="/about">关于我</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// 底部 CTA
function BottomCTA() {
  return (
    <section className={`
      relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface via-surface to-surface-hover py-12
      md:py-16
    `}>
      {/* 装饰 */}
      <div className={`
        pointer-events-none absolute -top-20 -right-20 h-[200px] w-[200px] rounded-full bg-accent/10 blur-3xl
      `} />
      <div className={`
        pointer-events-none absolute -bottom-20 -left-20 h-[200px] w-[200px] rounded-full bg-info/10 blur-3xl
      `} />

      <div className="relative mx-auto max-w-2xl px-6 text-center">
        <h2 className={`
          mb-4 text-2xl font-bold text-text
          md:text-3xl
        `}>
          发现更多精彩内容
        </h2>
        <p className="mb-8 text-text-secondary">
          探索技术文章、学习笔记和项目分享
        </p>
        <Button variant="primary" size="lg" asChild>
          <Link href="/blog" className="gap-2">
            浏览全部文章
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}

export default async function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4">
      {/* Hero */}
      <Hero />

      {/* 分隔线 */}
      <div className="mb-12 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* 精选文章 */}
      <section className="mb-16 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-text">精选文章</h2>
            <p className="mt-1 text-sm text-text-secondary">最新的技术分享与学习笔记</p>
          </div>
          <Link
            href="/blog"
            className={`
              hidden items-center gap-1 text-sm text-accent transition-colors
              hover:text-accent-hover-color
              sm:flex
            `}
          >
            查看全部
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <FeaturedPosts />
      </section>

      {/* 分类导航 */}
      <section className="mb-16">
        <CategoryNav />
      </section>

      {/* 底部 CTA */}
      <BottomCTA />
    </div>
  );
}
