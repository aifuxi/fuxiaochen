import Image from "next/image";

import { FriendLinkApplicationForm } from "@/components/blocks/friend-link-application-form";
import { SiteSectionHeading } from "@/components/blocks/site-section-heading";
import { listPublicFriendLinks } from "@/lib/public/public-content-client";

export default async function FriendsPage() {
  const friendLinks = await listPublicFriendLinks({ page: 1, pageSize: 50 });

  return (
    <div className="space-y-14 pb-24">
      <section className="px-8 pt-32">
        <div className="mx-auto max-w-4xl">
          <div className="space-y-8">
            <SiteSectionHeading
              description="这里收录的是我认可的个人博客、作品集和独立项目链接。"
              eyebrow="Connections / 友链"
              meta={`${friendLinks.total} 个链接`}
              title="朋友们"
            />
            <div className="glass-card rounded-[2rem] border border-white/10 p-6">
              <div className="space-y-4">
                <div className="font-mono-tech text-[11px] tracking-[0.22em] text-muted uppercase">申请说明</div>
                <ul className="space-y-3 text-sm leading-7 text-muted">
                  <li>网站内容以原创为主，遵守法律法规与基本公序良俗。</li>
                  <li>网站保持持续更新，不是纯导航页或一次性项目页。</li>
                  <li>页面设计与内容表达清晰，没有明显骚扰性广告或弹窗。</li>
                  <li>如符合上述条件，可以直接在下方表单提交申请。</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-8">
        <div className={`
          mx-auto grid max-w-4xl gap-6
          md:grid-cols-2
          lg:grid-cols-3
        `}>
          {friendLinks.items.map((friend) => (
            <a key={friend.id} className={`
              glass-card block rounded-[1.75rem] border border-white/10 p-6 transition-colors
              hover:border-primary/30
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
                  <h4 className="font-serif text-xl tracking-[-0.03em] text-foreground">{friend.siteName}</h4>
                  <p className="font-mono-tech text-[11px] tracking-[0.18em] text-muted uppercase">{friend.role}</p>
                </div>
              </div>
              <p className="text-sm leading-7 text-muted">{friend.description}</p>
              <div className="text-primary-accent mt-4 flex items-center gap-2 text-xs">
                <span>⌁</span>
                <span className="font-mono-tech tracking-[0.18em]">{friend.domain}</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="px-8">
        <div className="mx-auto max-w-4xl">
          <div className="space-y-8">
            <SiteSectionHeading
              description="如果你的站点也在认真更新，欢迎提交申请。"
              eyebrow="Apply / 申请"
              title="提交友链申请"
            />
            <div className="glass-card rounded-[2rem] border border-white/10 p-8">
              <p className="mb-8 max-w-2xl text-sm leading-7 text-muted">
                填写下面的信息后，我会按顺序查看申请。只要信息完整且符合上面的条件，通常都能很快处理。
              </p>
              <FriendLinkApplicationForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
