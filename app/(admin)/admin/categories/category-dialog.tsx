"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import NiceModal from "@ebay/nice-modal-react";
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
  DialogDescription,
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
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  name: z.string().min(1, "名称不能为空"),
  slug: z.string().min(1, "Slug 不能为空"),
});

interface CategoryDialogProps {
  category?: Category;
  onSuccess?: () => void;
}

export const CategoryDialog = NiceModal.create(
  ({ category, onSuccess }: CategoryDialogProps) => {
    const [loading, setLoading] = useState(false);
    const modal = NiceModal.useModal();

    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        name: category?.name || "",
        slug: category?.slug || "",
      },
    });

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
        modal.remove();
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
      <Dialog open={modal.visible} onOpenChange={modal.remove}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{category ? "编辑分类" : "新增分类"}</DialogTitle>
          </DialogHeader>

          <DialogDescription>
            {category ? "编辑分类数据" : "新增分类数据"}
          </DialogDescription>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-secondary">名称</FormLabel>
                    <FormControl>
                      <Input placeholder="分类名称" {...field} />
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
                    <FormLabel className="text-text-secondary">Slug</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className={`
                          border-border bg-surface text-text
                          focus:border-accent focus:ring-accent/20
                        `}
                        placeholder="frontend"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <div className="flex w-full justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => modal.remove()}
                    className={`
                      border-border bg-transparent text-text-secondary
                      hover:bg-surface hover:text-text
                    `}
                  >
                    取消
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className={`
                      bg-accent text-white transition-all duration-200
                      hover:-translate-y-0.5 hover:bg-accent/90
                    `}
                  >
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    保存
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  },
);
