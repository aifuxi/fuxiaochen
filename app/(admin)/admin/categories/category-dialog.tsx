"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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
        await updateCategoryAction(category.id, values);
      } else {
        await createCategoryAction(values);
      }
      onOpenChange(false);
      form.reset();
      onSuccess?.();
    } catch (error) {
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
          <DialogTitle className="text-neon-cyan">
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
                  <FormLabel className="text-gray-400">名称</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="分类名称"
                      className="border-white/10 bg-white/5 text-white focus:border-neon-cyan/50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-400">Slug</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="URL 标识"
                      className="border-white/10 bg-white/5 text-white focus:border-neon-cyan/50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-400">描述</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="分类描述"
                      className="resize-none border-white/10 bg-white/5 text-white focus:border-neon-cyan/50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-neon-cyan text-black hover:bg-cyan-400"
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
