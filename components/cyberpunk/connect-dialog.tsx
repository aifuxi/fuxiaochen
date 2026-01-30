"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

import {
  BILIBILI_PAGE,
  EMAIL,
  GITHUB_PAGE,
  JUEJIN_PAGE,
} from "@/constants/info";
import { cn } from "@/lib/utils";

interface SocialLink {
  name: string;
  url: string;
  icon: React.ReactNode;
  color: string;
}

export function ConnectDialog() {
  const [isOpen, setIsOpen] = useState(false);

  const socialLinks: SocialLink[] = [
    {
      name: "GitHub",
      url: GITHUB_PAGE,
      color: "hover:text-white",
      icon: (
        <svg
          role="img"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-6 w-6"
        >
          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
        </svg>
      ),
    },
    {
      name: "掘金",
      url: JUEJIN_PAGE,
      color: "hover:text-blue-400",
      icon: (
        <svg
          role="img"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-6 w-6"
        >
          <path d="M11.69 3.732l2.96 2.454-2.96 2.455-2.958-2.455zm5.72 2.383l-1.317-1.072-4.403-3.612a.792.792 0 0 0-.98 0l-4.403 3.612-1.317 1.072 5.72 4.67zM2.872 10.36l1.455-1.192 7.362 5.96 7.364-5.96 1.454 1.192-8.818 7.15zM0 13.988l1.455-1.192 10.235 8.272 10.234-8.272 1.455 1.192-11.69 9.536z" />
        </svg>
      ),
    },
    {
      name: "Bilibili",
      url: BILIBILI_PAGE,
      color: "hover:text-pink-400",
      icon: (
        <svg
          role="img"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-6 w-6"
        >
          <path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.897 0 17.387V9.987c.036-1.511.556-2.765 1.56-3.76C2.564 5.23 3.823 4.71 5.333 4.653h.854L3.44 1.907a1.44 1.44 0 0 1 .46-2.027 1.436 1.436 0 0 1 1.94.48L9.047 4.653h5.906l3.207-4.293a1.436 1.436 0 0 1 1.94-.48 1.44 1.44 0 0 1 .46 2.027L17.813 4.653zM10.013 9.987c-.694 0-1.258.23-1.693.693-.435.463-.653 1.018-.653 1.666 0 .649.218 1.205.653 1.667.435.462 1.0.693 1.693.693.694 0 1.258-.231 1.693-.693.435-.462.653-1.018.653-1.667 0-.648-.218-1.203-.653-1.666-.435-.463-1.0-.693-1.693-.693zm7.987 0c-.694 0-1.258.23-1.693.693-.435.463-.653 1.018-.653 1.666 0 .649.218 1.205.653 1.667.435.462 1.0.693 1.693.693.694 0 1.258-.231 1.693-.693.435-.462.653-1.018.653-1.667 0-.648-.218-1.203-.653-1.666-.435-.463-1.0-.693-1.693-.693z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`
          rounded-full border border-neon-purple px-6 py-2 text-xs font-bold tracking-widest text-neon-purple uppercase
          shadow-[0_0_10px_rgba(123,97,255,0.2)] transition-all duration-300
          hover:bg-neon-purple/20 hover:shadow-[0_0_20px_rgba(123,97,255,0.4)]
        `}
      >
        建立连接
      </button>

      {/* Modal Overlay */}
      {isOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            <div
              className={`
                relative w-full max-w-md animate-in space-y-8 rounded-xl border border-neon-purple/50 bg-black/90 p-8
                shadow-[0_0_50px_rgba(123,97,255,0.2)] duration-300 fade-in zoom-in
              `}
            >
              {/* Header */}
              <div className="space-y-2 text-center">
                <h3 className="text-2xl font-bold tracking-wider text-white uppercase">
                  建立 <span className="text-neon-purple">连接</span>
                </h3>
                <p className="font-mono text-xs tracking-widest text-gray-400">
                  /// 正在建立安全连接...
                </p>
              </div>

              {/* Social Links Grid */}
              <div className="grid grid-cols-3 gap-4">
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    className={cn(
                      `
                        group flex flex-col items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-4
                        transition-all duration-300
                        hover:bg-white/10
                      `,
                      link.color,
                    )}
                  >
                    <div
                      className={`
                        flex h-10 w-10 items-center justify-center rounded-full bg-black/50 transition-transform
                        duration-300
                        group-hover:scale-110
                      `}
                    >
                      {link.icon}
                    </div>
                    <span
                      className={`
                        text-xs font-medium text-gray-400
                        group-hover:text-white
                      `}
                    >
                      {link.name}
                    </span>
                  </a>
                ))}
              </div>

              {/* Email Section */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-black px-2 font-mono text-gray-500">
                    或者发送邮件
                  </span>
                </div>
              </div>

              <a
                href={`mailto:${EMAIL}`}
                className={`
                  group flex w-full items-center justify-center gap-2 rounded-lg border border-neon-purple/30
                  bg-neon-purple/10 py-3 text-sm font-bold tracking-wider text-neon-purple uppercase transition-all
                  duration-300
                  hover:bg-neon-purple/20
                `}
              >
                <svg
                  role="img"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className={`
                    h-4 w-4 transition-transform duration-300
                    group-hover:translate-x-1
                  `}
                >
                  <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
                </svg>
                {EMAIL}
              </a>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className={`
                  absolute top-2 right-4 text-xl text-gray-500
                  hover:text-white
                `}
              >
                ×
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
