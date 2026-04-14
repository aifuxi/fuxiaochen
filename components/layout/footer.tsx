import Link from "next/link";
import { Github, Mail, Sparkles } from "lucide-react";
import {
  WEBSITE,
  BEI_AN_NUMBER,
  BEI_AN_LINK,
  GONG_AN_NUMBER,
  GONG_AN_LINK,
  SLOGAN,
} from "@/constants/info";

const footerLinks = [
  { href: "/", label: "首页" },
  { href: "/blog", label: "文章" },
  { href: "/about", label: "关于" },
  { href: "/changelog", label: "更新日志" },
  { href: "/ui-preview", label: "设计系统" },
];

const socialLinks = [
  {
    href: "https://github.com/aifuxi/fuxiaochen",
    icon: Github,
    label: "GitHub",
  },
  { href: "mailto:aifuxi.js@gmail.com", icon: Mail, label: "邮箱" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-24 border-t border-white/10 bg-black/30">
      <div className={`
        pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50
        to-transparent
      `} />
      <div className={`
        pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-primary/6 to-transparent
      `} />

      <div className="container-shell relative py-16">
        <div className={`
          grid gap-12
          lg:grid-cols-[1.4fr_1fr]
        `}>
          <div className="space-y-6">
            <div className={`
              inline-flex items-center gap-3 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs
              tracking-[0.18em] text-primary uppercase
            `}>
              <Sparkles className="size-3.5" />
              Chen Serif
            </div>
            <div>
              <h2 className="font-serif text-4xl leading-tight text-foreground">
                为博客与后台统一一套克制、锋利又带一点光泽的视觉语言。
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                {SLOGAN}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {socialLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    className={`
                      inline-flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/4
                      text-muted-foreground transition-all duration-[var(--duration-normal)]
                      hover:border-primary/40 hover:bg-primary/10 hover:text-primary
                    `}
                  >
                    <Icon className="size-4.5" />
                  </a>
                );
              })}
            </div>
          </div>

          <div className={`
            grid gap-10
            sm:grid-cols-2
          `}>
            <div className="space-y-4">
              <div className="text-label text-muted-foreground">导航</div>
              <div className="space-y-3">
                {footerLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      block text-sm text-muted-foreground transition-colors duration-[var(--duration-fast)]
                      hover:text-foreground
                    `}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-label text-muted-foreground">备案信息</div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  © {currentYear} {WEBSITE}
                </p>
                <a
                  href={BEI_AN_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`
                    block transition-colors duration-[var(--duration-fast)]
                    hover:text-foreground
                  `}
                >
                  {BEI_AN_NUMBER}
                </a>
                <a
                  href={GONG_AN_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`
                    block transition-colors duration-[var(--duration-fast)]
                    hover:text-foreground
                  `}
                >
                  {GONG_AN_NUMBER}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
