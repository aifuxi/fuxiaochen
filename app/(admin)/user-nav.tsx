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
    role: number; //1: admin, 2: normal
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
    <div className="flex items-center gap-3 rounded-md border border-white/10 bg-white/4 p-3">
      <div className={`
        flex size-11 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-primary/12
      `}>
        {user.image ? (
          <img
            src={user.image}
            alt={user.name}
            className="size-full object-cover"
          />
        ) : (
          <span className="text-sm font-medium text-primary">
            {user.name.slice(0, 1).toUpperCase()}
          </span>
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        <p className="truncate text-sm font-semibold text-foreground">
          {user.name}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {user.role === 1 ? "Admin" : "Normal"}
        </p>
      </div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            disabled={loading}
            className={`
              text-muted-foreground
              hover:bg-white/6 hover:text-foreground
            `}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认退出登录？</AlertDialogTitle>
            <AlertDialogDescription className="text-text-secondary">
              您将退出当前账号，需要重新登录才能访问后台管理系统。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className={`
                bg-primary text-primary-foreground
                hover:brightness-110
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
