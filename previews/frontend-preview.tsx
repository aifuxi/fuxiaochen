/** 前台离线交互预览；hash 与示例数据都只存在于当前浏览器。 */
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Menu as MenuIcon,
  Moon,
  Search,
  Sun,
  X,
} from "lucide-react";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { createRoot } from "react-dom/client";

import { BrandLogo } from "@/components/brand-logo";
import { MotionProvider, useMotionSettings } from "@/components/motion/motion-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

import { author, categories, posts, postsHref, tags, type PreviewPost } from "./frontend-data";
import { AboutPage, ArticleDetail, ChangelogPage, FriendsPage } from "./frontend-sections";

type Route = { path: string; params: URLSearchParams; hash: string };
const navigation = [
  { path: "/", name: "首页" },
  { path: "/posts", name: "文章" },
  { path: "/changelog", name: "日志" },
  { path: "/friends-links", name: "友链" },
  { path: "/about", name: "关于" },
];
const themeKey = "fuxiaochen-frontend-preview-theme";
const pageSize = 6;

function readRoute(): Route {
  const hash = window.location.hash || "#/";
  const [path, query = ""] = hash.slice(1).split("?");
  return { path: path || "/", params: new URLSearchParams(query), hash };
}

function PreviewLink({
  href,
  children,
  className,
  variant = "ghost",
  ...props
}: { href: string; children: ReactNode } & Omit<ComponentProps<typeof Button>, "render">) {
  return (
    <Button
      render={<a href={href}>{children}</a>}
      nativeButton={false}
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- Base UI 链接组合输出真实 a，保留 link 语义。
      role="link"
      variant={variant}
      className={className}
      {...props}
    >
      {children}
    </Button>
  );
}

function Header({
  route,
  theme,
  toggleTheme,
}: {
  route: Route;
  theme: string;
  toggleTheme: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const activePath = route.path.startsWith("/posts/") ? "/posts" : route.path;

  useEffect(() => {
    // 手机菜单跨到桌面后关闭，重新缩窗不会恢复旧展开状态。
    const desktop = window.matchMedia("(min-width: 768px)");
    const close = () => {
      if (desktop.matches) setMenuOpen(false);
    };
    desktop.addEventListener("change", close);
    return () => desktop.removeEventListener("change", close);
  }, []);

  const links = (mobile = false) =>
    navigation.map(({ path, name }) => (
      <a
        key={path}
        href={"#" + path}
        className="fp-nav-link"
        aria-current={activePath === path ? "page" : undefined}
        onClick={mobile ? () => setMenuOpen(false) : undefined}
      >
        {name}
        {mobile && activePath === path && <Check size={16} aria-hidden="true" />}
      </a>
    ));

  return (
    <header className="fp-header">
      <div className="fp-header-inner">
        <a className="fp-brand" href="#/" aria-label="付小晨，返回首页">
          <BrandLogo aria-hidden="true" />
          <span>{author.name}</span>
        </a>
        <nav className="fp-desktop-nav" aria-label="主导航">
          {links()}
        </nav>
        <div className="fp-header-actions">
          <Button
            variant="ghost"
            size="compact"
            className="fp-icon-button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "切换到浅色模式" : "切换到深色模式"}
          >
            {theme === "dark" ? (
              <Sun size={18} aria-hidden="true" />
            ) : (
              <Moon size={18} aria-hidden="true" />
            )}
          </Button>
          <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
            <DialogTrigger
              ref={trigger}
              render={
                <Button
                  variant="ghost"
                  size="compact"
                  className="fp-mobile-trigger fp-icon-button"
                />
              }
              aria-label="打开导航菜单"
            >
              <MenuIcon size={20} aria-hidden="true" />
            </DialogTrigger>
            <DialogContent
              className="fp-mobile-menu"
              finalFocus={() =>
                window.matchMedia("(min-width: 768px)").matches
                  ? (document.querySelector<HTMLElement>(".fp-brand") ?? false)
                  : (trigger.current ?? true)
              }
            >
              <div className="fp-dialog-heading">
                <DialogTitle>浏览栏目</DialogTitle>
                <DialogClose
                  render={<Button variant="ghost" size="compact" className="fp-icon-button" />}
                  aria-label="关闭导航菜单"
                >
                  <X size={18} aria-hidden="true" />
                </DialogClose>
              </div>
              <DialogDescription className="sr-only">
                选择一个栏目，或按 Escape 关闭菜单。
              </DialogDescription>
              <nav className="fp-mobile-nav" aria-label="移动导航">
                {links(true)}
              </nav>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}

function ArticleItem({
  post,
  compact = false,
  returnHref,
}: {
  post: PreviewPost;
  compact?: boolean;
  returnHref?: string;
}) {
  const category = categories.find((item) => item.id === post.categoryId);
  const Title = compact ? "h3" : "h2";
  const href =
    "#/posts/" +
    post.slug +
    (returnHref ? "?" + new URLSearchParams({ from: returnHref.slice(1) }) : "");
  return (
    <article className={"fp-post" + (compact ? " fp-post-compact" : "")}>
      <a className="fp-post-link" href={href} aria-labelledby={"title-" + post.id}>
        <Title id={"title-" + post.id}>{post.title}</Title>
        <p>{post.excerpt}</p>
      </a>
      <div className="fp-post-meta">
        <time dateTime={post.date}>{post.date}</time>
        {post.featured && <span className="fp-featured">精选</span>}
        <a className="fp-meta-link" href={postsHref({ categoryId: post.categoryId })}>
          {category?.name}
        </a>
        {!compact &&
          post.tagIds.map((id) => (
            <a key={id} className="fp-meta-link fp-tag-link" href={postsHref({ tagId: id })}>
              #{tags.find((tag) => tag.id === id)?.name}
            </a>
          ))}
      </div>
    </article>
  );
}

function HomePage() {
  return (
    <main id="main-content" className="fp-main fp-home">
      <section className="fp-hero" aria-labelledby="home-title">
        <div className="fp-hero-copy">
          <div className="fp-author-inline">
            {/* oxlint-disable-next-line next/no-img-element -- 离线预览内嵌头像，无图片优化服务。 */}
            <img src="/avatar.avif" alt="" width={48} height={48} />
            <div>
              <span>{author.name}</span>
              <p>{author.role}</p>
            </div>
          </div>
          <h1 id="home-title" tabIndex={-1}>
            {author.subtitle}
          </h1>
          <p className="fp-hero-description">关于开发、设计，以及日常里值得记下的事。</p>
          <PreviewLink href="#/posts" variant="primary" className="fp-home-cta fp-primary">
            阅读文章
            <ArrowRight size={16} aria-hidden="true" />
          </PreviewLink>
        </div>
        <div className="fp-hero-visual">
          {/* oxlint-disable-next-line next/no-img-element -- 构建时将生成图片内嵌为 data URL，离线可用。 */}
          <img
            src="/frontend-hero.webp"
            alt="冷灰桌面上的笔记本、蓝色铅笔与键盘"
            width={1200}
            height={900}
            fetchPriority="high"
          />
        </div>
      </section>
      <section className="fp-recent fp-column" aria-labelledby="recent-heading">
        <h2 id="recent-heading">近期文章</h2>
        <div className="fp-post-list">
          {posts.slice(0, 3).map((post) => (
            <ArticleItem key={post.id} post={post} compact />
          ))}
        </div>
      </section>
    </main>
  );
}

function Pagination({
  page,
  count,
  href,
}: {
  page: number;
  count: number;
  href: (page: number) => string;
}) {
  if (count <= 1) return null;
  return (
    <nav className="fp-pagination" aria-label="文章分页">
      {page > 1 ? (
        <PreviewLink href={href(page - 1)} variant="secondary">
          <ArrowLeft size={16} aria-hidden="true" />
          上一页
        </PreviewLink>
      ) : (
        <Button variant="secondary" disabled>
          <ArrowLeft size={16} aria-hidden="true" />
          上一页
        </Button>
      )}
      <span aria-label={`第 ${page} 页，共 ${count} 页`}>
        {page} / {count}
      </span>
      {page < count ? (
        <PreviewLink href={href(page + 1)} variant="secondary">
          下一页
          <ArrowRight size={16} aria-hidden="true" />
        </PreviewLink>
      ) : (
        <Button variant="secondary" disabled>
          下一页
          <ArrowRight size={16} aria-hidden="true" />
        </Button>
      )}
    </nav>
  );
}

function PostsPage({ route }: { route: Route }) {
  const q = (route.params.get("q") || "").slice(0, 200).trim();
  const categoryId = route.params.get("categoryId") || "";
  const tagId = route.params.get("tagId") || "";
  const [search, setSearch] = useState({ source: q, value: q });
  const query = search.source === q ? search.value : q;
  const [tagPanel, setTagPanel] = useState({ source: tagId, open: Boolean(tagId) });
  const tagsOpen = tagPanel.source === tagId ? tagPanel.open : Boolean(tagId) || tagPanel.open;
  const state = route.params.get("previewState");
  // 地址恢复时同步草稿，普通输入不触发额外 effect 渲染。
  if (search.source !== q) setSearch({ source: q, value: q });
  if (tagPanel.source !== tagId) setTagPanel({ source: tagId, open: tagsOpen });
  const matching = posts.filter((post) => {
    if (categoryId && post.categoryId !== categoryId) return false;
    if (tagId && !post.tagIds.includes(tagId)) return false;
    const content = [
      post.title,
      post.excerpt,
      ...post.body,
      categories.find((c) => c.id === post.categoryId)?.name,
      ...post.tagIds.map((id) => tags.find((tag) => tag.id === id)?.name),
    ]
      .join(" ")
      .toLocaleLowerCase();
    return !q || content.includes(q.toLocaleLowerCase());
  });
  const filtered = state === "empty" ? [] : matching;
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Number(route.params.get("page") || 1);
  const invalidPage = !Number.isSafeInteger(page) || page < 1 || page > pages;
  const hasFilters = Boolean(q || categoryId || tagId);
  const conditions = { q, categoryId, tagId };
  const category = categories.find((c) => c.id === categoryId);
  const tag = tags.find((t) => t.id === tagId);

  return (
    <main id="main-content" className="fp-main fp-column">
      <header className="fp-page-heading">
        <div className="fp-title-row">
          <h1 tabIndex={-1}>文章</h1>
          <span className="fp-count">{posts.length} 篇</span>
        </div>
        <p className="fp-lead">开发实践、设计思考，和一些日常记录。</p>
      </header>
      <section className="fp-discovery" aria-label="查找文章">
        <search aria-label="搜索文章">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              window.location.assign(postsHref({ ...conditions, q: query }));
            }}
          >
            <label className="fp-search-label" htmlFor="fp-search">
              搜索文章
            </label>
            <InputGroup>
              <InputGroupInput
                id="fp-search"
                type="search"
                placeholder="搜索标题、正文、分类或标签"
                maxLength={200}
                value={query}
                onChange={(event) => setSearch({ source: q, value: event.target.value })}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton type="submit" aria-label="提交搜索">
                  <Search size={18} aria-hidden="true" />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </form>
        </search>
        <nav className="fp-categories" aria-label="按分类浏览">
          <PreviewLink
            href={postsHref({ ...conditions, categoryId: "" })}
            size="compact"
            variant={!categoryId ? "secondary" : "ghost"}
            aria-current={!categoryId ? "true" : undefined}
          >
            全部<span className="fp-filter-count">{posts.length}</span>
          </PreviewLink>
          {categories.map((item) => (
            <PreviewLink
              key={item.id}
              href={postsHref({ ...conditions, categoryId: item.id })}
              size="compact"
              variant={categoryId === item.id ? "secondary" : "ghost"}
              aria-current={categoryId === item.id ? "true" : undefined}
            >
              {item.name}
              <span className="fp-filter-count">
                {posts.filter((p) => p.categoryId === item.id).length}
              </span>
            </PreviewLink>
          ))}
        </nav>
        <div className="fp-tags-disclosure">
          <Button
            variant="ghost"
            size="compact"
            aria-expanded={tagsOpen}
            aria-controls="fp-tags"
            onClick={() => setTagPanel({ source: tagId, open: !tagsOpen })}
            className="fp-tags-trigger"
          >
            按标签浏览{tagId && <span className="fp-filter-count">1</span>}
            <ChevronDown size={15} aria-hidden="true" className={tagsOpen ? "is-open" : ""} />
          </Button>
          <div id="fp-tags" hidden={!tagsOpen}>
            <nav className="fp-tags" aria-label="按标签浏览">
              {tags.map((item) => (
                <a
                  className="fp-tag-choice"
                  key={item.id}
                  href={postsHref({ ...conditions, tagId: tagId === item.id ? "" : item.id })}
                  aria-current={tagId === item.id ? "true" : undefined}
                >
                  #{item.name}
                  <span>{posts.filter((post) => post.tagIds.includes(item.id)).length}</span>
                </a>
              ))}
            </nav>
          </div>
        </div>
      </section>
      <div className="fp-results-bar" aria-live="polite" aria-atomic="true">
        <p>{hasFilters ? `找到 ${filtered.length} 篇文章` : "全部文章"}</p>
        {hasFilters && (
          <a className="fp-link" href="#/posts">
            清除筛选
          </a>
        )}
      </div>
      {hasFilters && (
        <div className="fp-applied" aria-label="已选条件">
          {q && (
            <a href={postsHref({ ...conditions, q: "" })} aria-label={`移除关键词：${q}`}>
              搜索：{q}
              <X size={13} aria-hidden="true" />
            </a>
          )}
          {categoryId && (
            <a href={postsHref({ ...conditions, categoryId: "" })} aria-label="移除分类">
              {category?.name || "已不可用的分类"}
              <X size={13} aria-hidden="true" />
            </a>
          )}
          {tagId && (
            <a href={postsHref({ ...conditions, tagId: "" })} aria-label="移除标签">
              #{tag?.name || "已不可用的标签"}
              <X size={13} aria-hidden="true" />
            </a>
          )}
        </div>
      )}
      {state === "loading" ? (
        <div className="fp-loading">
          <div className="fp-skeletons" aria-hidden="true">
            {[1, 2, 3].map((id) => (
              <div className="fp-skeleton" key={id}>
                <i />
                <i />
                <i />
              </div>
            ))}
          </div>
          <output>正在加载文章…</output>
          <PreviewLink href="#/posts" variant="secondary">
            结束加载预览
          </PreviewLink>
        </div>
      ) : state === "error" ? (
        <div className="fp-empty" role="alert">
          <h2>文章暂时无法显示</h2>
          <p>请稍后重试。</p>
          <PreviewLink href={postsHref(conditions)} variant="secondary">
            重新加载
          </PreviewLink>
        </div>
      ) : invalidPage ? (
        <div className="fp-empty">
          <h2>页码无效</h2>
          <p>回到第一页继续阅读。</p>
          <PreviewLink href={postsHref(conditions)} variant="secondary">
            返回第一页
          </PreviewLink>
        </div>
      ) : filtered.length === 0 ? (
        <div className="fp-empty">
          <h2>{state === "empty" ? "这里还没有文章" : "没有找到匹配的文章"}</h2>
          <p>
            {state === "empty" ? "文章发布后会出现在这里。" : "换个关键词，或移除一个筛选条件。"}
          </p>
          <PreviewLink href="#/posts" variant="secondary">
            {state === "empty" ? "返回文章" : "清除筛选"}
          </PreviewLink>
        </div>
      ) : (
        <>
          <div className="fp-post-list">
            {filtered.slice((page - 1) * pageSize, page * pageSize).map((post) => (
              <ArticleItem key={post.id} post={post} returnHref={route.hash} />
            ))}
          </div>
          <Pagination
            page={page}
            count={pages}
            href={(nextPage) => postsHref({ ...conditions, page: nextPage })}
          />
        </>
      )}
    </main>
  );
}

function Footer() {
  const [open, setOpen] = useState(false);
  return (
    <footer className="fp-footer">
      <div className="fp-footer-inner">
        <span>{author.name}</span>
        <p>独立预览，文章与日志为示例内容</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button variant="ghost" size="compact" />}>预览说明</DialogTrigger>
          <DialogContent className="fp-preview-notes">
            <div className="fp-dialog-heading">
              <DialogTitle>关于这版预览</DialogTitle>
              <DialogClose
                render={<Button variant="ghost" size="compact" className="fp-icon-button" />}
                aria-label="关闭预览说明"
              >
                <X size={18} aria-hidden="true" />
              </DialogClose>
            </div>
            <DialogDescription>
              这是可离线打开的前台设计提案。所有文章、日志和筛选数据均为本地示例，操作不会写入正式站点。
            </DialogDescription>
            <p>
              分类与标签已合并到文章页。顶部导航、首页、阅读页、日志、友链与关于页均可切换，主题选择只保存在本预览中。
            </p>
            <h3>查看文章状态</h3>
            <div className="fp-state-links">
              {[
                { key: "empty", name: "空集合" },
                { key: "loading", name: "加载中" },
                { key: "error", name: "加载失败" },
              ].map((item) => (
                <a
                  key={item.key}
                  href={`#/posts?previewState=${item.key}`}
                  className="fp-link"
                  onClick={() => setOpen(false)}
                >
                  {item.name}
                  <ArrowRight size={14} aria-hidden="true" />
                </a>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </footer>
  );
}

function PreviewApp() {
  const [route, setRoute] = useState(readRoute);
  const [theme, setTheme] = useState(() =>
    document.documentElement.dataset.theme === "light" ? "light" : "dark",
  );
  const previousPath = useRef(route.path);
  const previousPage = useRef(route.params.get("page") || "1");
  const [listLocation, setListLocation] = useState({ href: "#/posts", scroll: 0 });
  const settings = useMotionSettings();
  const animation = useRef<Animation | null>(null);
  const view = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => setRoute(readRoute());
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  useLayoutEffect(() => {
    document.body.classList.add("fp-preview");
    return () => document.body.classList.remove("fp-preview");
  }, []);
  useLayoutEffect(() => {
    const label =
      navigation.find((item) => item.path === route.path)?.name ||
      (route.path.startsWith("/posts/")
        ? posts.find((post) => route.path === "/posts/" + post.slug)?.title
        : "页面不存在");
    document.title = `${label || "文章不存在"} · 付小晨前台预览`;
    const currentPage = route.params.get("page") || "1";
    const pageChanged = currentPage !== previousPage.current;
    previousPage.current = currentPage;
    if (previousPath.current === route.path) {
      if (pageChanged) {
        const heading = view.current?.querySelector<HTMLElement>("h1");
        heading?.scrollIntoView({ behavior: "instant", block: "start" });
        heading?.focus({ preventScroll: true });
      }
      return;
    }
    const returning = previousPath.current.startsWith("/posts/") && route.path === "/posts";
    previousPath.current = route.path;
    animation.current?.cancel();
    window.scrollTo({
      top: returning && route.hash === listLocation.href ? listLocation.scroll : 0,
      behavior: "instant",
    });
    const heading = view.current?.querySelector<HTMLElement>("h1");
    heading?.focus({ preventScroll: true });
    if (settings.ready && !settings.reducedMotion)
      animation.current =
        view.current?.animate(
          [
            { opacity: 0, transform: `translateY(${settings.distance}px)` },
            { opacity: 1, transform: "translateY(0)" },
          ],
          {
            duration: settings.standardDuration * 1000,
            easing: `cubic-bezier(${settings.ease.join(",")})`,
          },
        ) ?? null;
  }, [route, settings, listLocation]);
  useEffect(() => {
    if (settings.reducedMotion) animation.current?.cancel();
    return () => animation.current?.cancel();
  }, [settings.reducedMotion]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    setTheme(next);
    try {
      localStorage.setItem(themeKey, next);
    } catch {
      /* 禁止存储时仍可在当前页面切换。 */
    }
  };
  const captureList = () => {
    // 在离开列表的点击阶段记录位置，不注册逐帧 scroll 监听。
    if (route.path === "/posts") setListLocation({ href: route.hash, scroll: window.scrollY });
  };
  const post = posts.find((item) => route.path === "/posts/" + item.slug);
  let content: ReactNode;
  if (route.path === "/") content = <HomePage />;
  else if (route.path === "/posts") content = <PostsPage route={route} />;
  else if (post) {
    const from = route.params.get("from");
    // 只接受当前离线文章列表路径，避免返回参数导航到其他站点。
    const returnHref = from && /^\/posts(?:\?|$)/.test(from) ? "#" + from : listLocation.href;
    content = <ArticleDetail post={post} returnHref={returnHref} />;
  } else if (route.path === "/changelog") content = <ChangelogPage />;
  else if (route.path === "/friends-links")
    content = <FriendsPage category={route.params.get("category") || undefined} />;
  else if (route.path === "/about") content = <AboutPage />;
  else
    content = (
      <main id="main-content" className="fp-main fp-column fp-empty">
        <h1 tabIndex={-1}>页面不存在</h1>
        <p>这个页面可能已移动，回到文章页继续浏览。</p>
        <PreviewLink href="#/posts" variant="secondary">
          阅读文章
        </PreviewLink>
      </main>
    );

  return (
    <div className="fp-shell">
      <a
        href="#main-content"
        className="fp-skip"
        onClick={(event) => {
          event.preventDefault();
          view.current?.querySelector<HTMLElement>("h1")?.focus();
        }}
      >
        跳转到正文
      </a>
      <Header route={route} theme={theme} toggleTheme={toggleTheme} />
      {/* oxlint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events -- 捕获阶段只记录列表位置，子元素均为语义化链接与控件。 */}
      <div className="fp-view" ref={view} onClickCapture={captureList}>
        {content}
      </div>
      <Footer />
    </div>
  );
}

createRoot(document.getElementById("preview-root")!).render(
  <MotionProvider>
    <PreviewApp />
  </MotionProvider>,
);
