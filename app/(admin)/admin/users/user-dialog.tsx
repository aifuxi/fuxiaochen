"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import NiceModal from "@ebay/nice-modal-react";
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
  role: z.number(), // 1: admin, 2: normal
});

interface UserDialogProps {
  user?: User;
  onSuccess?: () => void;
}

export const UserDialog = NiceModal.create(
  ({ user, onSuccess }: UserDialogProps) => {
    const [loading, setLoading] = useState(false);
    const modal = NiceModal.useModal();

    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        role: user?.role ?? 2, // 2: normal (default)
      },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
      if (!user) return; // Should not happen as we only support edit for now
      setLoading(true);
      try {
        const res = await updateUserAction(user.id, values);
        if (!res.success) throw new Error(res.error);
        modal.remove();
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
      <Dialog open={modal.visible} onOpenChange={modal.remove}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-text">编辑用户角色</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm text-text-secondary">用户</div>
                <div className="font-medium text-text">{user?.name}</div>
                <div className="text-xs text-text-secondary">{user?.email}</div>
              </div>

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>角色</FormLabel>
                    <Select
                      onValueChange={(v) => field.onChange(Number.parseInt(v, 10))}
                      defaultValue={String(field.value)}
                    >
                      <FormControl>
                        <SelectTrigger
                          className={`
                            border-border bg-surface text-text
                            focus:border-accent focus:ring-accent/20
                          `}
                        >
                          <SelectValue placeholder="选择角色" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent
                        className={`border-border bg-surface text-text`}
                      >
                        <SelectItem value="1">Admin</SelectItem>
                        <SelectItem value="2">Normal</SelectItem>
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
                    w-full bg-accent text-white
                    hover:bg-accent/90
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
  },
);
