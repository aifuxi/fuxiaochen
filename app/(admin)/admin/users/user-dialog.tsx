"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";
import { updateUserAction } from "@/app/actions/user";
import { type User } from "@/types/user";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  role: z.enum(["admin", "visitor"]),
});

interface UserDialogProps {
  user?: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function UserDialog({
  user,
  open,
  onOpenChange,
  trigger,
  onSuccess,
}: UserDialogProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: user?.role || "visitor",
    },
  });

  useEffect(() => {
    if (open && user) {
      form.reset({
        role: user.role,
      });
    }
  }, [user, open, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return; // Should not happen as we only support edit for now
    setLoading(true);
    try {
      const res = await updateUserAction(user.id, values);
      if (!res.success) throw new Error(res.error);
      onOpenChange(false);
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error(`${error}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className={`
          border-neon-cyan/20 bg-black/90 text-white
          sm:max-w-[425px]
        `}
      >
        <DialogHeader>
          <DialogTitle className="text-neon-cyan">编辑用户角色</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-400">用户</div>
              <div className="font-medium text-white">{user?.name}</div>
              <div className="text-xs text-gray-500">{user?.email}</div>
            </div>

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-400">角色</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger
                        className={`
                          border-white/10 bg-white/5 text-white
                          focus:border-neon-cyan/50
                        `}
                      >
                        <SelectValue placeholder="选择角色" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="border-neon-cyan/20 bg-black/90 text-white">
                      <SelectItem value="visitor">Visitor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="submit"
                disabled={loading}
                className={`
                  w-full bg-neon-cyan text-black
                  hover:bg-cyan-400
                `}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                保存
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
