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
    <div className="flex items-center gap-3 rounded-lg bg-white/5 p-3">
      <div className="h-10 w-10 rounded-full bg-neon-purple/20 p-0.5">
        {user.image ? (
          <img
            src={user.image}
            alt={user.name}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <div className="h-full w-full rounded-full bg-neon-purple/50" />
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        <p className="truncate text-sm font-bold text-white">{user.name}</p>
        <p className="truncate text-xs text-gray-500">
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
              text-gray-400
              hover:bg-red-500/10 hover:text-red-500
            `}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="border-neon-cyan/20 bg-black/90 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-neon-cyan">
              确认退出登录？
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              您将退出当前账号，需要重新登录才能访问后台管理系统。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className={`
                border-white/10 bg-transparent text-gray-300
                hover:bg-white/10 hover:text-white
              `}
            >
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className={`
                bg-red-500/80 text-white
                hover:bg-red-500
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
