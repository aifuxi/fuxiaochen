import Link from "next/link";
import Image from "next/image";
import { getBlogsAction } from "@/app/actions/blog";
import { getCategoriesAction } from "@/app/actions/category";
import { Card } from "@/components/ui/card";
import { ArrowRight, Calendar, Clock, Sparkles } from "lucide-react";
import { formatSimpleDate } from "@/lib/time";

// Hero 区域 - Apple 大胆风格
function Hero() {
  return (
    <section
      className={`
        relative flex min-h-[70vh] items-center justify-center overflow-hidden py-20
        md:py-32
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
      <div
        className={`
          pointer-events-none absolute right-0 -bottom-40 h-[400px] w-[500px] rounded-full bg-gradient-to-tl
          from-warning/5 to-transparent blur-3xl
        `}
      />

      {/* 内容 */}
      <div className="relative mx-auto max-w-4xl px-4 text-center">
        {/* 小标签 */}
        <div
          className={`
            mb-8 inline-flex items-center gap-2 rounded-full border border-border/50 bg-surface/50 px-5 py-2 text-sm
            text-text-secondary backdrop-blur-sm
          `}
        >
          <Sparkles className="h-4 w-4 text-accent" />
          技术博客 · 学习笔记 · 项目分享
        </div>

        {/* 大标题 */}
        <h1
          className={`
            mb-6 text-5xl font-bold tracking-tight
            md:text-7xl
            lg:text-8xl
          `}
        >
          <span className="block text-text">探索技术的</span>
          <span
            className={`block bg-gradient-to-r from-accent via-info to-accent bg-clip-text text-transparent`}
          >
            无限可能
          </span>
        </h1>

        {/* 描述 */}
        <p
          className={`
            mx-auto mb-10 max-w-xl text-lg text-text-secondary
            md:text-xl
          `}
        >
          记录前端开发与技术探索的点滴
          <br className={`
            hidden
            sm:block
          `} />
          分享学习心得与实践经验
        </p>

        {/* CTA 按钮组 */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/blog"
            className={`
              hover:bg-accent-hover
              inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-base font-medium text-white shadow-lg
              transition-all duration-300
              active:scale-[0.98]
            `}
          >
            开始阅读
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/about"
            className={`
              inline-flex items-center gap-2 rounded-full border border-border bg-surface/50 px-8 py-4 text-base
              font-medium text-text backdrop-blur-sm transition-all duration-300
              hover:border-accent/30 hover:bg-surface
              active:scale-[0.98]
            `}
          >
            关于我
          </Link>
        </div>
      </div>
    </section>
  );
}

// 精选文章卡片 - Apple 大胆风格
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
    <section
      className={`
        relative overflow-hidden py-20
        md:py-32
      `}
    >
      {/* 背景装饰 */}
      <div
        className={`
          pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-surface/50 to-transparent
        `}
      />

      <div className="relative space-y-10">
        {/* 主推文章 - 全屏大卡片 */}
        <Link href={`/blog/${firstPost.slug}`} className="group block">
          <Card
            className={`
              relative aspect-[21/9] overflow-hidden border-0 p-0 shadow-xl transition-all duration-500
              hover:shadow-2xl
              md:aspect-[21/10]
            `}
          >
            {firstPost.cover ? (
              <Image
                src={firstPost.cover}
                alt={firstPost.title}
                fill
                className={`
                  object-cover transition-transform duration-700
                  group-hover:scale-105
                `}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-surface to-info/20" />
            )}
            {/* 渐变遮罩 */}
            <div
              className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent`}
            />
            {/* 内容 */}
            <div
              className={`
                absolute right-0 bottom-0 left-0 p-6
                md:p-10
              `}
            >
              {firstPost.category && (
                <span
                  className={`
                    mb-4 inline-block rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white
                    backdrop-blur-sm
                  `}
                >
                  {firstPost.category.name}
                </span>
              )}
              <h2
                className={`
                  mb-3 line-clamp-2 text-2xl font-bold text-white
                  md:text-3xl
                  lg:text-4xl
                `}
              >
                {firstPost.title}
              </h2>
              <p
                className={`
                  mb-4 line-clamp-2 max-w-2xl text-sm text-white/80
                  md:text-base
                `}
              >
                {firstPost.description}
              </p>
              <div
                className={`
                  flex items-center gap-4 text-xs text-white/60
                  md:text-sm
                `}
              >
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {formatSimpleDate(new Date(firstPost.createdAt))}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {Math.max(1, Math.ceil(firstPost.content.length / 300))} 分钟阅读
                </span>
              </div>
            </div>
            {/* 悬浮箭头 */}
            <div
              className={`
                absolute top-6 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white
                opacity-0 backdrop-blur-sm transition-all duration-300
                group-hover:opacity-100
              `}
            >
              <ArrowRight className="h-5 w-5" />
            </div>
          </Card>
        </Link>

        {/* 其他文章 - 大卡片网格 */}
        <div
          className={`
            grid gap-6
            sm:grid-cols-2
            lg:grid-cols-3
          `}
        >
          {restPosts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group">
              <Card
                className={`
                  flex h-full flex-col overflow-hidden border-0 bg-surface/50 p-0 transition-all duration-300
                  hover:bg-surface hover:shadow-xl
                `}
              >
                {post.cover ? (
                  <div className="relative aspect-[16/10] overflow-hidden">
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
                  <div className="aspect-[16/10] bg-gradient-to-br from-surface-hover to-surface" />
                )}
                <div className={`
                  flex flex-1 flex-col gap-3 p-5
                  md:p-6
                `}>
                  {post.category && (
                    <span
                      className={`
                        inline-flex w-fit items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium
                        text-accent
                      `}
                    >
                      {post.category.name}
                    </span>
                  )}
                  <h3
                    className={`
                      line-clamp-2 text-lg font-bold text-text
                      group-hover:text-accent
                      md:text-xl
                    `}
                  >
                    {post.title}
                  </h3>
                  <p className="line-clamp-2 flex-1 text-sm text-text-secondary">
                    {post.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-text-tertiary">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatSimpleDate(new Date(post.createdAt))}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {Math.max(1, Math.ceil(post.content.length / 300))} 分钟
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// 分类导航 - Apple 大胆风格
async function CategoryNav() {
  const result = await getCategoriesAction({ page: 1, pageSize: 12 });

  if (!result.success || !result.data?.lists?.length) {
    return null;
  }

  const categories = result.data.lists;

  return (
    <section
      className={`
        py-20
        md:py-32
      `}
    >
      <div className="mx-auto max-w-5xl px-4">
        {/* 标题 */}
        <div
          className={`
            mb-12 text-center
            md:mb-16
          `}
        >
          <h2
            className={`
              mb-4 text-4xl font-bold tracking-tight text-text
              md:text-5xl
            `}
          >
            探索分类
          </h2>
          <p className="text-lg text-text-secondary">按主题浏览文章</p>
        </div>

        {/* 分类网格 */}
        <div className="flex flex-wrap justify-center gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/blog?categoryId=${category.id}`}
              className="group"
            >
              <div
                className={`
                  flex items-center gap-3 rounded-full border border-border bg-surface px-6 py-3 text-base font-medium
                  text-text transition-all duration-300
                  group-hover:border-accent/30 group-hover:bg-accent group-hover:text-white
                `}
              >
                <span>{category.name}</span>
                <span
                  className={`
                    rounded-full bg-text/10 px-2.5 py-0.5 text-sm
                    group-hover:bg-white/20
                  `}
                >
                  {category.blogCount}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// 底部 CTA - Apple 大胆风格
function BottomCTA() {
  return (
    <section
      className={`
        relative mb-20 overflow-hidden rounded-3xl bg-gradient-to-br from-accent/5 via-surface to-info/5 py-20
        md:py-28
      `}
    >
      {/* 装饰 */}
      <div
        className={`
          pointer-events-none absolute -top-20 -left-20 h-[300px] w-[300px] rounded-full bg-accent/20 blur-3xl
        `}
      />
      <div
        className={`
          pointer-events-none absolute -right-20 -bottom-20 h-[300px] w-[300px] rounded-full bg-info/20 blur-3xl
        `}
      />

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <h2
          className={`
            mb-6 text-3xl font-bold text-text
            md:text-4xl
          `}
        >
          发现更多精彩内容
        </h2>
        <p
          className={`
            mx-auto mb-10 max-w-md text-lg text-text-secondary
            md:text-xl
          `}
        >
          探索技术文章、学习笔记和项目分享
        </p>
        <Link
          href="/blog"
          className={`
            hover:bg-accent-hover
            inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-base font-medium text-white shadow-lg
            transition-all duration-300
            active:scale-[0.98]
          `}
        >
          浏览全部文章
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

export default async function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4">
      {/* Hero - 全屏大胆设计 */}
      <Hero />

      {/* 分隔线 */}
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* 精选文章 */}
      <FeaturedPosts />

      {/* 分类导航 */}
      <CategoryNav />

      {/* 底部 CTA */}
      <BottomCTA />
    </div>
  );
}
