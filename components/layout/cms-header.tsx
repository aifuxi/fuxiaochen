"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, LogOut, Mail } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

function getUserInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

type CmsHeaderProps = {
  title: string;
  description: string;
  user: {
    name: string;
    email: string;
  };
};

export function CmsHeader({ title, description, user }: CmsHeaderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(() => {
      void (async () => {
        const { error } = await authClient.signOut();

        if (error) {
          toast.error(error.message || "退出登录失败");

          return;
        }

        toast.success("已成功退出登录");
        router.replace("/cms/login");
        router.refresh();
      })();
    });
  }

  return (
    <>
      <header className="cms-header flex">
        <div className="flex-1"></div>
        <div className="flex items-center gap-3">
          <button
            className={`
              relative rounded-xl p-3 text-muted transition
              hover:bg-white/8 hover:text-foreground
            `}
          >
            <Bell className="h-5 w-5" />
            <span
              className={`
                absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1
                text-[10px] font-semibold text-black
              `}
            >
              3
            </span>
          </button>
          <button
            className={`
              rounded-xl p-3 text-muted transition
              hover:bg-white/8 hover:text-foreground
            `}
          >
            <Mail className="h-5 w-5" />
          </button>
          <button
            className={`
              rounded-xl p-3 text-muted transition
              hover:bg-white/8 hover:text-foreground
              disabled:cursor-not-allowed disabled:opacity-60
            `}
            disabled={isPending}
            onClick={handleSignOut}
            type="button"
          >
            <LogOut className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3 rounded-xl border border-white/8 px-3 py-2">
            <div
              className={`
                flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#10b981,#059669)]
                text-sm font-semibold text-black
              `}
            >
              {getUserInitials(user.name)}
            </div>
            <div>
              <div className="text-sm text-foreground">{user.name}</div>
              <div className="text-xs text-muted">{user.email}</div>
            </div>
          </div>
        </div>
      </header>
      <div className="mb-8 px-8 pt-8">
        <h1 className="font-serif text-3xl font-semibold tracking-[-0.05em]">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-base leading-6 text-muted">
          {description}
        </p>
      </div>
    </>
  );
}
