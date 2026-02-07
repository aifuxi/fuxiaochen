"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";
import { createTagAction, updateTagAction } from "@/app/actions/tag";
import { type Tag } from "@/types/tag";
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
  name: z.string().min(1, "名称不能为空"),
  slug: z.string().min(1, "Slug 不能为空"),
  description: z.string().optional(),
});

interface TagDialogProps {
  tag?: Tag;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function TagDialog({
  tag,
  open,
  onOpenChange,
  trigger,
  onSuccess,
}: TagDialogProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: tag?.name || "",
      slug: tag?.slug || "",
      description: tag?.description || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: tag?.name || "",
        slug: tag?.slug || "",
        description: tag?.description || "",
      });
    }
  }, [tag, open, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      if (tag) {
        const res = await updateTagAction(tag.id, values);
        if (!res.success) throw new Error(res.error);
      } else {
        const res = await createTagAction(values);
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{tag ? "编辑标签" : "新建标签"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[var(--text-color-secondary)]">
                    名称
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className={`
                        border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text-color)]
                        focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)]/20
                      `}
                      placeholder="React"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[var(--text-color-secondary)]">
                    Slug
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className={`
                        border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text-color)]
                        focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)]/20
                      `}
                      placeholder="react"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[var(--text-color-secondary)]">
                    描述
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className={`
                        resize-none border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text-color)]
                        focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)]/20
                      `}
                      placeholder="标签描述..."
                    />
                  </FormControl>
                  <FormMessage />
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
