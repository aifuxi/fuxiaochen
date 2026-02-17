"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import NiceModal from "@ebay/nice-modal-react";
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

interface TagDialogProps {
  tag?: Tag;
  onSuccess?: () => void;
}

export const TagDialog = NiceModal.create(
  ({ tag, onSuccess }: TagDialogProps) => {
    const [loading, setLoading] = useState(false);
    const modal = NiceModal.useModal();

    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        name: tag?.name || "",
        slug: tag?.slug || "",
      },
    });

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
            <DialogTitle>{tag ? "编辑标签" : "新建标签"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-secondary">名称</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className={`
                          border-border bg-surface text-text
                          focus:border-accent focus:ring-accent/20
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
                    <FormLabel className="text-text-secondary">Slug</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className={`
                          border-border bg-surface text-text
                          focus:border-accent focus:ring-accent/20
                        `}
                        placeholder="react"
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
                    bg-accent text-white
                    hover:bg-accent/90
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
  },
);
