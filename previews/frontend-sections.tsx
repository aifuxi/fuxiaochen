"use client";

import { ArrowLeft, ArrowRight, Check, Copy, ExternalLink, Link2, UserRound } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { CardLink } from "@/components/ui/card";

import { author, categories, posts, tags, type PreviewPost } from "./frontend-data";

function displayDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      }).format(date);
}

function subscribeHash(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

const exampleCode = `// 筛选状态保存在地址中，刷新和返回时仍能恢复。
const filters = new URLSearchParams(location.hash.split("?")[1]);
const categoryId = filters.get("categoryId");

const visiblePosts = posts.filter((post) =>
  categoryId ? post.categoryId === categoryId : true,
);`;

function ArticleCode() {
  const [copyState, setCopyState] = useState<"idle" | "copying" | "success" | "error">("idle");
  const codeRef = useRef<HTMLPreElement>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  async function copyCode() {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    setCopyState("copying");
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(exampleCode);
      setCopyState("success");
      resetTimer.current = setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      // file:// 或剪贴板权限受限时保留原文，提供可操作的手动复制路径。
      setCopyState("error");
    }
  }

  function selectCode() {
    if (!codeRef.current) return;
    codeRef.current.focus();
    const range = document.createRange();
    range.selectNodeContents(codeRef.current);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  return (
    <div className="fp-code-block">
      <div className="fp-code-toolbar">
        <span>JavaScript</span>
        <Button
          variant="ghost"
          size="compact"
          onClick={copyCode}
          disabled={copyState === "copying"}
        >
          {copyState === "success" ? <Check size={16} /> : <Copy size={16} />}
          {copyState === "success" ? "已复制" : copyState === "copying" ? "复制中" : "复制代码"}
        </Button>
      </div>
      {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- 长代码提供键盘滚动及手动选择复制。 */}
      <pre ref={codeRef} tabIndex={0} aria-label="JavaScript 示例代码，可横向滚动">
        <code>{exampleCode}</code>
      </pre>
      <output className="sr-only">{copyState === "success" ? "代码已复制到剪贴板。" : ""}</output>
      {copyState === "error" && (
        <div className="fp-copy-error">
          <p role="alert">无法自动复制。选中代码后，请使用系统的复制操作。</p>
          <Button variant="secondary" size="compact" onClick={selectCode}>
            选中代码
          </Button>
        </div>
      )}
    </div>
  );
}

export function ArticleDetail({ post, returnHref }: { post: PreviewPost; returnHref: string }) {
  const category = categories.find((item) => item.id === post.categoryId);
  const isFullExample = post.id === posts[0]?.id;

  return (
    <main id="main-content" className="fp-main fp-reading fp-detail-page">
      <Button
        className="fp-detail-back"
        render={<a href={returnHref} aria-label="返回文章列表" />}
        nativeButton={false}
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- Base UI render 输出真实链接，需要覆盖默认按钮角色。
        role="link"
        variant="ghost"
        size="compact"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        返回文章列表
      </Button>
      <article>
        <header className="fp-detail-heading">
          <div className="fp-detail-meta">
            <span>{author.name}</span>
            <time dateTime={post.date}>{displayDate(post.date)}</time>
            <span>示例文章</span>
          </div>
          <h1 tabIndex={-1}>{post.title}</h1>
          <p className="fp-detail-summary">{post.excerpt}</p>
          <nav className="fp-article-taxonomy" aria-label="文章分类和标签">
            {category && (
              <a
                className="fp-link fp-detail-category"
                href={`#/posts?${new URLSearchParams({ categoryId: category.id })}`}
              >
                {category.name}
              </a>
            )}
            {post.tagIds.map((id) => {
              const tag = tags.find((item) => item.id === id);
              return tag ? (
                <a
                  key={id}
                  className="fp-link fp-detail-tag"
                  href={`#/posts?${new URLSearchParams({ tagId: id })}`}
                >
                  #{tag.name}
                </a>
              ) : null;
            })}
          </nav>
        </header>
        <div className="article-prose fp-article-prose">
          {post.body.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
          {isFullExample && (
            <>
              <h2>先让规则有一个清晰的归属</h2>
              <p>
                颜色、字号和交互状态属于共享规范；内容的先后顺序、栏目宽度与筛选位置属于页面。
                把两者分开，调整一处规则时，才知道哪些地方应该一起变化。
              </p>
              <blockquote>
                <p>一份有用的设计规范，应该帮助我们做出下一次选择，也应该能在页面里被验证。</p>
              </blockquote>
              <p>
                以文章页为例，读者真正需要的是<strong>找到想读的内容，然后顺畅地读完</strong>。
                分类与标签更适合作为筛选条件，而不是让读者反复进出不同的目录。
              </p>
              <figure className="fp-article-figure">
                {/* oxlint-disable-next-line next/no-img-element -- 独立离线 HTML 内嵌图片，不运行 Next 图片优化服务。 */}
                <img
                  src="/frontend-article.webp"
                  alt="冷灰蓝色的纸张与阅读工具，呈现从记录到整理的写作过程"
                  width={1536}
                  height={1024}
                  loading="lazy"
                />
                <figcaption>写下、整理，再把值得留下的内容分享出来。预览生成插图。</figcaption>
              </figure>
              <h2>把筛选变成一个连续的过程</h2>
              <p>与其增加更多入口，不如把当前状态说清楚。这里保留三个简单的原则：</p>
              <ul>
                <li>搜索、分类与标签可以组合，已选条件始终可见。</li>
                <li>条件变化时回到第一页，避免读者停留在没有结果的页码。</li>
                <li>从文章返回列表，仍然能看到刚才的筛选和阅读位置。</li>
              </ul>
              <h3>让地址也能表达状态</h3>
              <p>
                把筛选条件放进地址，浏览器的刷新与返回就有了明确含义。下面是简化后的逻辑，
                实际项目还需要处理分页及无效参数。
              </p>
              <ArticleCode />
              <h2>用真实的操作检查设计</h2>
              <p>
                截图能检查层级与留白，但操作会暴露更多问题。试着只用键盘完成一次搜索、进入文章，
                再返回列表，往往比增加一组装饰更有帮助。
              </p>
              {/* oxlint-disable jsx-a11y/no-noninteractive-tabindex -- 表格横向滚动区必须支持键盘滚动。 */}
              <section
                className="fp-table-scroll"
                tabIndex={0}
                aria-label="设计检查清单，窄屏可横向滚动"
              >
                <table>
                  <caption className="sr-only">从设计意图到实际检查的对应关系</caption>
                  <thead>
                    <tr>
                      <th scope="col">设计意图</th>
                      <th scope="col">实际检查</th>
                      <th scope="col">完成标准</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">筛选状态清晰</th>
                      <td>组合搜索、分类和标签</td>
                      <td>条件与结果一致，可以逐项清除</td>
                    </tr>
                    <tr>
                      <th scope="row">阅读不被打断</th>
                      <td>在手机上阅读代码与表格</td>
                      <td>仅内容局部滚动，页面不被撑宽</td>
                    </tr>
                    <tr>
                      <th scope="row">返回路径连续</th>
                      <td>列表进入详情，再返回</td>
                      <td>筛选与页码保持原样</td>
                    </tr>
                  </tbody>
                </table>
              </section>
              {/* oxlint-enable jsx-a11y/no-noninteractive-tabindex */}
              <p>
                最后，让规范保持简短，让验证保持具体。下一次调整页面时，我们就能从已有的决定继续，
                而不是重新猜一次。
              </p>
            </>
          )}
        </div>
        <footer className="fp-article-end">
          <span>感谢阅读</span>
          <a className="fp-link" href={returnHref}>
            继续浏览文章 <ArrowRight size={16} aria-hidden="true" />
          </a>
        </footer>
      </article>
    </main>
  );
}

const exampleReleases = [
  {
    version: "v0.8.0",
    date: "2026-10-16",
    title: "让内容更容易找到，也更适合阅读",
    type: "界面优化",
    changes: [
      "将分类与标签整合到文章页，搜索和筛选可以一起使用。",
      "重新整理首页与文章详情的信息层级，保留熟悉的冷灰蓝配色。",
      "补齐窄屏导航、代码复制反馈及键盘焦点。",
    ],
  },
  {
    version: "v0.7.2",
    date: "2026-10-10",
    title: "把阅读中的小细节照顾好",
    type: "体验改进",
    changes: [
      "调整文章正文的行距与内容宽度，让长段落更容易阅读。",
      "代码和表格在自身区域滚动，长内容不再影响页面宽度。",
    ],
  },
  {
    version: "v0.7.0",
    date: "2026-10-06",
    title: "统一深浅主题与基础组件",
    type: "界面优化",
    changes: [
      "统一前台的颜色、排版和控件状态。",
      "优化主题切换与移动端触达区域，减少不必要的视觉干扰。",
    ],
  },
  {
    version: "v0.6.0",
    date: "2026-09-28",
    title: "开始记录网站的每一次变化",
    type: "新功能",
    changes: ["增加公开更新日志，用版本和日期串起迭代过程。", "完善友链与关于页面的基础信息。"],
  },
];

export function ChangelogPage() {
  const hash = useSyncExternalStore(
    subscribeHash,
    () => window.location.hash,
    () => "#/changelog",
  );
  const rawPage = new URLSearchParams(hash.split("?")[1]).get("page") ?? "1";
  const page = Number(rawPage);
  const pageCount = Math.ceil(exampleReleases.length / 3);
  const validPage = /^[1-9]\d*$/.test(rawPage) && page >= 1 && page <= pageCount;
  const visibleReleases = validPage ? exampleReleases.slice((page - 1) * 3, page * 3) : [];

  return (
    <main id="main-content" className="fp-main fp-column fp-changelog-page">
      <header className="fp-page-heading">
        <h1 tabIndex={-1}>更新日志</h1>
        <p className="fp-lead">记录每一次改进。以下为预览示例记录。</p>
      </header>
      {!validPage ? (
        <div className="fp-empty">
          <p role="alert">页码无效，请返回更新日志。</p>
          <Button
            render={<a href="#/changelog" aria-label="返回更新日志" />}
            nativeButton={false}
            // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- render 输出真实链接。
            role="link"
          >
            返回更新日志
          </Button>
        </div>
      ) : (
        <>
          {/* Safari 在无列表样式时会移除语义，显式 list 保留时间线结构。 */}
          {/* oxlint-disable-next-line jsx-a11y/no-redundant-roles */}
          <ol className="fp-release-list" role="list" aria-label="版本迭代时间线">
            {visibleReleases.map((release, index) => (
              <li key={release.version} className="fp-release">
                <div className="fp-release-meta">
                  <div className="fp-release-labels">
                    <span className="fp-release-version">{release.version}</span>
                    <span className="fp-release-type">{release.type}</span>
                    {page === 1 && index === 0 && <span className="fp-release-latest">最新</span>}
                  </div>
                  <time dateTime={release.date}>{release.date.replaceAll("-", ".")}</time>
                </div>
                <h2>{release.title}</h2>
                <ul>
                  {release.changes.map((change) => (
                    <li key={change}>{change}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
          <nav className="fp-section-pagination" aria-label="更新日志分页">
            {page > 1 ? (
              <Button
                render={
                  <a
                    href={page === 2 ? "#/changelog" : `#/changelog?page=${page - 1}`}
                    aria-label="上一页"
                  />
                }
                nativeButton={false}
                // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- render 输出真实链接。
                role="link"
              >
                <ArrowLeft size={16} aria-hidden="true" /> 上一页
              </Button>
            ) : (
              <Button disabled>
                <ArrowLeft size={16} aria-hidden="true" /> 上一页
              </Button>
            )}
            <span aria-label={`第 ${page} 页，共 ${pageCount} 页`}>
              {page} / {pageCount}
            </span>
            {page < pageCount ? (
              <Button
                render={<a href={`#/changelog?page=${page + 1}`} aria-label="下一页" />}
                nativeButton={false}
                // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- render 输出真实链接。
                role="link"
              >
                下一页 <ArrowRight size={16} aria-hidden="true" />
              </Button>
            ) : (
              <Button disabled>
                下一页 <ArrowRight size={16} aria-hidden="true" />
              </Button>
            )}
          </nav>
        </>
      )}
    </main>
  );
}

const exampleFriends = [
  {
    name: "MDN Web Docs",
    description: "查阅 HTML、CSS、JavaScript 与 Web 平台的文档和实践指南。",
    url: "https://developer.mozilla.org/zh-CN/",
    category: "技术",
  },
  {
    name: "web.dev",
    description: "学习性能、可访问性与现代 Web 体验的开发方法。",
    url: "https://web.dev/",
    category: "技术",
  },
  {
    name: "React",
    description: "通过文档与交互示例理解组件、状态和用户界面。",
    url: "https://react.dev/",
    category: "技术",
  },
  {
    name: "Next.js",
    description: "从页面到完整应用，了解 React 框架的开发方式。",
    url: "https://nextjs.org/",
    category: "技术",
  },
  {
    name: "Base UI",
    description: "为设计系统提供可组合、注重可访问性的无样式组件。",
    url: "https://base-ui.com/",
    category: "设计",
  },
  {
    name: "Semi Design",
    description: "围绕设计语言、组件与工具，连接设计和开发。",
    url: "https://semi.design/",
    category: "设计",
  },
];

export function FriendsPage({ category }: { category?: string }) {
  const visibleFriends = category
    ? exampleFriends.filter((friend) => friend.category === category)
    : exampleFriends;

  return (
    <main id="main-content" className="fp-main fp-column fp-friends-page">
      <header className="fp-page-heading">
        <h1 tabIndex={-1}>友情链接</h1>
        <p className="fp-lead">值得走走看看的地方。本页使用公开网站作为示例。</p>
      </header>
      <nav className="fp-friend-filters" aria-label="友链分类">
        {["全部", "技术", "设计"].map((item) => {
          const selected = item === "全部" ? !category : category === item;
          return (
            <Button
              key={item}
              render={
                <a
                  aria-label={item}
                  href={
                    item === "全部"
                      ? "#/friends-links"
                      : `#/friends-links?${new URLSearchParams({ category: item })}`
                  }
                />
              }
              nativeButton={false}
              // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- 分类使用可刷新、可返回的真实链接。
              role="link"
              variant={selected ? "secondary" : "ghost"}
              size="compact"
              aria-current={selected ? "page" : undefined}
            >
              {item}
            </Button>
          );
        })}
      </nav>
      <output className="fp-friend-count fp-muted">
        {category ? `${category}分类` : "全部网站"}，共 {visibleFriends.length} 个
      </output>
      {visibleFriends.length ? (
        <div className="fp-friend-grid">
          {visibleFriends.map((friend) => (
            <CardLink
              key={friend.url}
              className="fp-friend-card"
              href={friend.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="fp-friend-icon" aria-hidden="true">
                <Link2 size={20} />
              </span>
              <div className="fp-friend-content">
                <h2>{friend.name}</h2>
                <p>{friend.description}</p>
                <div className="fp-friend-meta">
                  <span className="fp-friend-url" title={friend.url}>
                    <ExternalLink size={14} aria-hidden="true" />
                    <span>
                      {new URL(friend.url).host}
                      {new URL(friend.url).pathname === "/" ? "" : new URL(friend.url).pathname}
                    </span>
                  </span>
                  <span>{friend.category}</span>
                </div>
              </div>
              <span className="sr-only">在新窗口打开</span>
            </CardLink>
          ))}
        </div>
      ) : (
        <div className="fp-empty">
          <p>这个分类暂时没有友情链接。</p>
          <a className="fp-link" href="#/friends-links">
            查看全部网站 <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
      )}
    </main>
  );
}

export function AboutPage() {
  const [avatarFailed, setAvatarFailed] = useState(false);

  return (
    <main id="main-content" className="fp-main fp-column fp-about-page">
      <header className="fp-page-heading">
        <h1 tabIndex={-1}>关于</h1>
      </header>
      <section className="fp-about-identity" aria-label="作者介绍">
        <span className="fp-about-avatar">
          {avatarFailed ? (
            <UserRound size={28} aria-hidden="true" />
          ) : (
            // oxlint-disable-next-line next/no-img-element -- 离线预览将现有头像内嵌为 data URL。
            <img
              src="/avatar.avif"
              width={56}
              height={56}
              alt=""
              onError={() => setAvatarFailed(true)}
            />
          )}
        </span>
        <div>
          <h2>{author.name}</h2>
          <p>{author.role}</p>
        </div>
      </section>
      <div className="fp-about-copy">
        {author.about.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      {author.socials.length > 0 && (
        <nav className="fp-about-socials" aria-label="联系博主">
          {author.socials.map((social) => (
            <a
              key={social.url}
              className="fp-link"
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Link2 size={20} aria-hidden="true" />
              <span>{social.label}</span>
              <ExternalLink size={14} aria-hidden="true" />
              <span className="sr-only">在新窗口打开</span>
            </a>
          ))}
        </nav>
      )}
    </main>
  );
}
