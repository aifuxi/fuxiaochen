type ArticleStatsPanelProps = {
  authorName: string;
  authorAvatar: string;
  date: string;
  readTime: string;
  category: string;
  title: string;
  initialLikes?: number;
  initialViews?: number;
};

export function ArticleStatsPanel({
  authorAvatar,
  authorName,
  category,
  date,
  initialLikes = 328,
  initialViews = 2847,
  readTime,
  title,
}: ArticleStatsPanelProps) {
  return (
    <section className={`
      px-6 pt-8
      sm:px-8
    `}>
      <div className="mx-auto max-w-6xl border-b border-white/8 pb-6">
        <div className="flex flex-wrap items-center gap-3 text-[11px] tracking-[0.22em] text-muted uppercase">
          <span>{category}</span>
          <span className="text-white/20">/</span>
          <span>文章信息</span>
        </div>

        <h1 className={`
          mt-4 max-w-4xl font-serif text-4xl leading-tight text-balance
          sm:text-5xl
        `}>{title}</h1>

        <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-muted">
          <div className="flex items-center gap-3">
            <img alt={authorName} className="h-10 w-10 rounded-full border border-white/10 object-cover" src={authorAvatar} />
            <span className="font-medium text-foreground">{authorName}</span>
          </div>
          <p className="leading-6 text-muted">
            <span>{date}</span>
            <span className="mx-2 text-white/20">·</span>
            <span>{readTime}</span>
            <span className="mx-2 text-white/20">·</span>
            <span>{initialViews.toLocaleString()} 次阅读</span>
            <span className="mx-2 text-white/20">·</span>
            <span>{initialLikes.toLocaleString()} 次喜欢</span>
          </p>
        </div>
      </div>
    </section>
  );
}
