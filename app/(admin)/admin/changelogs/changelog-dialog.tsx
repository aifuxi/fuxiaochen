"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";
import {
  createChangelogAction,
  updateChangelogAction,
} from "@/app/actions/changelog";
import { type Changelog } from "@/types/changelog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  version: z.string().min(1, "版本号不能为空"),
  content: z.string().min(1, "内容不能为空"),
  date: z.string().optional(),
});

interface ChangelogDialogProps {
  changelog?: Changelog;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function ChangelogDialog({
  changelog,
  open,
  onOpenChange,
  trigger,
  onSuccess,
}: ChangelogDialogProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      version: changelog?.version || "",
      content: changelog?.content || "",
      date: changelog?.date
        ? new Date(changelog.date).toISOString().split("T")[0]
        : "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        version: changelog?.version || "",
        content: changelog?.content || "",
        date: changelog?.date
          ? new Date(changelog.date).toISOString().split("T")[0]
          : "",
      });
    }
  }, [changelog, open, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const payload = {
        version: values.version,
        content: values.content,
        date: values.date ? new Date(values.date).getTime() : undefined,
      };

      if (changelog) {
        const res = await updateChangelogAction(changelog.id, payload);
        if (!res.success) throw new Error(res.error);
      } else {
        const res = await createChangelogAction(payload);
        if (!res.success) throw new Error(res.error);
      }
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
          border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text-color)] backdrop-blur-md
          sm:max-w-[600px]
        `}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight text-[var(--text-color)] uppercase">
            {changelog ? "编辑日志" : "新建日志"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="version"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[var(--text-color-secondary)]">
                    版本号
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className={`
                        border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text-color)]
                        focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)]/20
                      `}
                      placeholder="v1.0.0"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[var(--text-color-secondary)]">
                    发布日期
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="date"
                      className={`
                        border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text-color)]
                        focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)]/20
                        [&::-webkit-calendar-picker-indicator]:invert
                      `}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[var(--text-color-secondary)]">
                    内容
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className={`
                        min-h-[200px] border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text-color)]
                        focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)]/20
                      `}
                      placeholder="更新内容..."
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className={`
                  border-[var(--glass-border)] bg-transparent text-[var(--text-color-secondary)]
                  hover:bg-[var(--glass-border)] hover:text-[var(--text-color)]
                `}
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className={`
                  bg-[var(--accent-color)] text-white
                  hover:bg-[var(--accent-color)]/90
                `}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                保存
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
