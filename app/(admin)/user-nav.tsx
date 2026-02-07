"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

interface UserNavProps {
  user: {
    name: string;
    role: string;
    image?: string | null;
  };
}

export function UserNav({ user }: UserNavProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/login");
          },
        },
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3">
      <div className="h-10 w-10 rounded-full bg-[var(--accent-color)]/20 p-0.5">
        {user.image ? (
          <img
            src={user.image}
            alt={user.name}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <div className="h-full w-full rounded-full bg-[var(--accent-color)]/50" />
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        <p className="truncate text-sm font-bold text-[var(--text-color)]">
          {user.name}
        </p>
        <p className="truncate text-xs text-[var(--text-color-secondary)]">
          {user.role || "visitor"}
        </p>
      </div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            disabled={loading}
            className={`
              text-[var(--text-color-secondary)]
              hover:bg-red-500/10 hover:text-red-500
            `}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[var(--text-color)]">
              确认退出登录？
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[var(--text-color-secondary)]">
              您将退出当前账号，需要重新登录才能访问后台管理系统。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className={`
                border-[var(--glass-border)] bg-transparent text-[var(--text-color)]
                hover:bg-[var(--accent-color)]/5 hover:text-[var(--accent-color)]
              `}
            >
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className={`
                bg-red-500 text-white
                hover:bg-red-600
              `}
            >
              退出登录
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
