import Link from "next/link";
import { Github, Mail } from "lucide-react";
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
  { href: "/blog", label: "博客" },
  { href: "/about", label: "关于" },
  { href: "/changelog", label: "更新日志" },
];

const socialLinks = [
  {
    href: "https://github.com/aifuxi/fuxiaochen",
    icon: Github,
    label: "GitHub",
  },
  { href: "mailto:aifuxi.js@gmail.com", icon: Mail, label: "邮箱" },
  // { href: "/rss.xml", icon: Rss, label: "RSS" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-20 border-t border-border/50 bg-surface/50">
      {/* 装饰性渐变 */}
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-accent/5 to-transparent`}
      />

      <div
        className={`
          relative mx-auto max-w-6xl px-4 py-12
          md:px-6 md:py-16
        `}
      >
        <div
          className={`
            flex flex-col gap-8
            md:flex-row md:items-start md:justify-between md:gap-12
          `}
        >
          {/* 左侧：品牌信息 */}
          <div
            className={`
              flex flex-col items-center gap-4
              md:items-start
            `}
          >
            {/* Logo */}
            <Link
              href="/"
              className={`
                group flex items-center gap-2 text-xl font-bold tracking-tight text-text transition-opacity duration-200
                hover:opacity-80
              `}
            >
              <img
                src="/images/logo.svg"
                alt="Logo"
                className={`
                  h-8 w-8 transition-transform duration-300
                  group-hover:scale-105
                `}
              />
              <span>{WEBSITE}</span>
            </Link>
            <p
              className={`
                max-w-xs text-center text-sm text-text-secondary
                md:text-left
              `}
            >
              {SLOGAN}
            </p>

            {/* 社交链接 */}
            <div className="flex items-center gap-3">
              {socialLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`
                      flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface
                      text-text-secondary transition-all duration-200
                      hover:border-accent/30 hover:text-accent
                    `}
                    aria-label={item.label}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* 右侧：链接 */}
          <div
            className={`
              flex flex-col items-center gap-6
              md:items-end
            `}
          >
            {/* 导航链接 */}
            <div className="flex flex-wrap items-center justify-center gap-6">
              {footerLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    text-sm text-text-secondary transition-colors duration-200
                    hover:text-accent
                  `}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* 备案信息 */}
            <div
              className={`
                flex flex-col items-center gap-2 text-xs text-text-tertiary
                md:flex-row md:gap-4
              `}
            >
              <span>
                © {currentYear} {WEBSITE}
              </span>
              <a
                href={BEI_AN_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  transition-colors duration-200
                  hover:text-accent
                `}
              >
                {BEI_AN_NUMBER}
              </a>
              <a
                href={GONG_AN_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  transition-colors duration-200
                  hover:text-accent
                `}
              >
                {GONG_AN_NUMBER}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
