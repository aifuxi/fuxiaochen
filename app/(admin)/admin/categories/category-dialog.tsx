"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";
import {
  createCategoryAction,
  updateCategoryAction,
} from "@/app/actions/category";
import { type Category } from "@/types/category";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  name: z.string().min(1, "名称不能为空"),
  slug: z.string().min(1, "Slug 不能为空"),
  description: z.string().optional(),
});

interface CategoryDialogProps {
  category?: Category;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function CategoryDialog({
  category,
  open,
  onOpenChange,
  trigger,
  onSuccess,
}: CategoryDialogProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || "",
      slug: category?.slug || "",
      description: category?.description || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: category?.name || "",
        slug: category?.slug || "",
        description: category?.description || "",
      });
    }
  }, [category, open, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      if (category) {
        const res = await updateCategoryAction(category.id, values);
        if (!res.success) {
          throw new Error(res.error);
        }
      } else {
        const res = await createCategoryAction(values);
        if (!res.success) {
          throw new Error(res.error);
        }
      }
      onOpenChange(false);
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error(`${error}`);
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
          sm:max-w-[425px]
        `}
      >
        <DialogHeader>
          <DialogTitle className="text-[var(--text-color)]">
            {category ? "编辑分类" : "新增分类"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      placeholder="分类名称"
                      className={`
                        border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text-color)]
                        focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)]/20
                      `}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
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
                      placeholder="URL 标识"
                      className={`
                        border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text-color)]
                        focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)]/20
                      `}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
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
                      placeholder="分类描述"
                      className={`
                        resize-none border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text-color)]
                        focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)]/20
                      `}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="submit"
                disabled={loading}
                className={`
                  w-full bg-[var(--accent-color)] text-white
                  hover:bg-[var(--accent-color)]/90
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
