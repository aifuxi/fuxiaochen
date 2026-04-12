import Image from "next/image";

import { FriendLinkApplicationForm } from "@/components/blocks/friend-link-application-form";
import { listPublicFriendLinks } from "@/lib/public/public-content-client";

export default async function FriendsPage() {
  const friendLinks = await listPublicFriendLinks({ page: 1, pageSize: 50 });

  return (
    <div>
      <section className="relative px-8 pt-32 pb-16">
        <div className="mx-auto max-w-4xl">
          <span className="font-mono-tech text-primary-accent mb-4 block text-xs tracking-widest uppercase">连接</span>
          <h1 className={`
            font-serif text-5xl tracking-tighter
            lg:text-6xl
          `} style={{ lineHeight: 0.95 }}>
            朋友们
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed font-light text-muted">
            与志同道合的创作者建立连接。这里收录了优秀的个人博客和项目，每一行链接都是一次思想的碰撞。
          </p>

          <div className="glass-card mt-10 rounded-2xl border border-white/10 p-6">
            <div className="flex items-start gap-4">
              <div className={`
                text-primary-accent flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10
              `}>⌘</div>
              <div>
                <h3 className="font-mono-tech mb-2 text-sm font-semibold">如何添加友链</h3>
                <ul className="space-y-2 text-sm text-muted">
                  <li className="flex items-start gap-2"><span className="text-primary-accent">01</span><span>网站内容为原创，遵守法律法规和道德规范</span></li>
                  <li className="flex items-start gap-2"><span className="text-primary-accent">02</span><span>网站有自己的持续更新内容，非纯导航页</span></li>
                  <li className="flex items-start gap-2"><span className="text-primary-accent">03</span><span>网站设计美观，无恶意弹窗或广告</span></li>
                  <li className="flex items-start gap-2"><span className="text-primary-accent">04</span><span>在下方表单提交申请，我会尽快处理</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative px-8 pb-32">
        <div className={`
          mx-auto grid max-w-4xl gap-6
          md:grid-cols-2
          lg:grid-cols-3
        `}>
          {friendLinks.items.map((friend) => (
            <a key={friend.id} className={`
              glass-card block rounded-2xl border border-white/10 p-6 transition-transform duration-300
              hover:-translate-y-1
            `} href={friend.siteUrl}>
              <div className="mb-4 flex items-center gap-4">
                {friend.avatarUrl ? (
                  <Image
                    alt={friend.avatarAlt ?? friend.siteName}
                    className="h-16 w-16 rounded-full object-cover"
                    height={100}
                    src={friend.avatarUrl}
                    width={100}
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                    <span className="font-mono-tech text-sm text-muted">{friend.siteName.slice(0, 2).toUpperCase()}</span>
                  </div>
                )}
                <div>
                  <h4 className="font-mono-tech text-sm font-semibold">{friend.siteName}</h4>
                  <p className="text-xs text-muted">{friend.role}</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-muted">{friend.description}</p>
              <div className="text-primary-accent mt-4 flex items-center gap-2 text-xs">
                <span>⌁</span>
                <span className="font-mono-tech">{friend.domain}</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="relative px-8 pb-32">
        <div className="mx-auto max-w-4xl">
          <div className="glass-card rounded-2xl border border-white/10 p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="text-primary-accent flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">✉</div>
              <h2 className="font-serif text-2xl tracking-tight">申请友链</h2>
            </div>
            <p className="mb-8 text-sm text-muted">填写以下信息提交友链申请，我会尽快处理。请确保您的网站符合上述要求。</p>
            <FriendLinkApplicationForm />
          </div>
        </div>
      </section>
    </div>
  );
}
