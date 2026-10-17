"use client";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";

import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const links = [
  ["/", "首页"],
  ["/posts", "文章"],
  ["/changelog", "日志"],
  ["/friends-links", "友链"],
  ["/about", "关于"],
] as const;
export function SiteHeader({ title }: { title: string }) {
  const pathname = usePathname();
  const active = links.find(
    ([href]) => pathname === href || (href !== "/" && pathname.startsWith(`${href}/`)),
  )?.[0];
  const header = useRef<HTMLElement>(null);
  const nav = useRef<HTMLElement>(null);
  const brand = useRef<HTMLAnchorElement>(null);
  const actions = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(true);
  const [open, setOpen] = useState(false);
  useLayoutEffect(() => {
    const measure = () => {
      if (header.current && nav.current && brand.current && actions.current) {
        // 始终预留主题按钮和菜单按钮的宽度，避免折叠后测量阈值变化。
        const themeWidth = actions.current.firstElementChild?.getBoundingClientRect().width ?? 44;
        const actionsWidth = themeWidth + 44 + 8;
        const nextCollapsed =
          window.matchMedia("(max-width: 767px)").matches ||
          nav.current.offsetWidth + 2 * Math.max(brand.current.offsetWidth, actionsWidth) + 64 >
            header.current.clientWidth;
        setCollapsed(nextCollapsed);
        if (!nextCollapsed) setOpen(false);
      }
    };
    const observer = new ResizeObserver(measure);
    for (const element of [header.current, nav.current, brand.current, actions.current])
      if (element) observer.observe(element);
    measure();
    return () => observer.disconnect();
  }, []);
  const items = (mobile = false) =>
    links.map(([href, label]) => (
      <Link
        key={href}
        href={href}
        className={active === href ? "is-current" : undefined}
        aria-current={active === href ? "page" : undefined}
        onClick={mobile ? () => setOpen(false) : undefined}
      >
        {label}
      </Link>
    ));
  return (
    <header className="site-header" ref={header} data-collapsed={collapsed}>
      <Link className="site-brand" ref={brand} href="/" title={title}>
        <BrandLogo className="site-brand-logo" />
        <span>{title}</span>
      </Link>
      <nav
        className="site-navigation"
        aria-label="主导航"
        ref={nav}
        inert={collapsed}
        aria-hidden={collapsed}
      >
        {items()}
      </nav>
      <div className="site-header-actions" ref={actions}>
        <ThemeToggle />
        <Dialog open={open && collapsed} onOpenChange={setOpen}>
          {collapsed && (
            <DialogTrigger
              render={
                <Button variant="ghost" aria-label="打开导航菜单" className="site-menu-button" />
              }
            >
              <Menu size={20} aria-hidden="true" />
            </DialogTrigger>
          )}
          <DialogContent
            className="site-mobile-menu"
            finalFocus={() =>
              collapsed
                ? true
                : (nav.current?.querySelector<HTMLAnchorElement>('[aria-current="page"]') ??
                  brand.current)
            }
          >
            <div className="site-menu-heading">
              <DialogTitle>浏览栏目</DialogTitle>
              <Button variant="ghost" aria-label="关闭导航菜单" onClick={() => setOpen(false)}>
                <X size={20} aria-hidden="true" />
              </Button>
            </div>
            <nav aria-label="移动导航">{items(true)}</nav>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}
