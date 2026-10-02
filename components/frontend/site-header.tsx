"use client";
import { BookOpen, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const links = [
  ["/", "首页"],
  ["/posts", "文章"],
  ["/categories", "分类"],
  ["/tags", "标签"],
  ["/changelog", "更新日志"],
  ["/friends-links", "友情链接"],
  ["/about", "关于"],
] as const;
export function SiteHeader({ title }: { title: string }) {
  const pathname = usePathname();
  const active = pathname.startsWith("/posts/") ? "/posts" : pathname;
  const header = useRef<HTMLElement>(null);
  const nav = useRef<HTMLElement>(null);
  const brand = useRef<HTMLAnchorElement>(null);
  const [collapsed, setCollapsed] = useState(true);
  const [open, setOpen] = useState(false);
  useLayoutEffect(() => {
    const measure = () => {
      if (header.current && nav.current && brand.current)
        setCollapsed(
          nav.current.offsetWidth + 2 * Math.max(brand.current.offsetWidth, 44) + 64 >
            header.current.clientWidth,
        );
    };
    const observer = new ResizeObserver(measure);
    for (const element of [header.current, nav.current, brand.current])
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
        aria-current={active === href ? (pathname === href ? "page" : "location") : undefined}
        onClick={mobile ? () => setOpen(false) : undefined}
      >
        {label}
      </Link>
    ));
  return (
    <header className="site-header" ref={header} data-collapsed={collapsed}>
      <Link className="site-brand" ref={brand} href="/" title={title}>
        <BookOpen size={20} aria-hidden="true" />
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
      {collapsed && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button variant="ghost" aria-label="打开导航菜单" className="site-menu-button" />
            }
          >
            <Menu size={20} />
          </DialogTrigger>
          <DialogContent className="site-mobile-menu">
            <div className="site-menu-heading">
              <DialogTitle>导航</DialogTitle>
              <Button variant="ghost" aria-label="关闭导航菜单" onClick={() => setOpen(false)}>
                <X size={20} />
              </Button>
            </div>
            <nav aria-label="主导航">{items(true)}</nav>
          </DialogContent>
        </Dialog>
      )}
    </header>
  );
}
