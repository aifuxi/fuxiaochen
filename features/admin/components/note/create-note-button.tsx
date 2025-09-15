"use client";

import * as React from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Plus } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";

import { BytemdEditor } from "@/components/bytemd";

import {
  type CreateNoteRequest,
  createNoteSchema,
  useCreateNote,
} from "@/features/note";

interface CreateNoteButtonProps {
  onSuccess?: () => void;
}

export const CreateNoteButton = ({ onSuccess }: CreateNoteButtonProps) => {
  const [open, setOpen] = React.useState(false);
  const form = useForm<CreateNoteRequest>({
    resolver: zodResolver(createNoteSchema),
    defaultValues: {
      body: "",
      published: true,
      tags: [],
    },
  });

  const mutation = useCreateNote();

  React.useEffect(() => {
    if (!open) {
      form.reset();
      form.clearErrors();
    }
  }, [form, open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={() => {
            setOpen(true);
          }}
        >
          <Plus />
          创建笔记
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>创建笔记</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form autoComplete="off">
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="published"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>是否发布</FormLabel>
                    <FormControl>
                      <div>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>内容</FormLabel>
                    <FormControl>
                      <div>
                        <BytemdEditor
                          body={field.value}
                          setContent={field.onChange}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  取消
                </Button>
                <Button
                  type="button"
                  disabled={mutation.isMutating}
                  onClick={() => form.handleSubmit(handleSubmit)()}
                >
                  {mutation.isMutating && (
                    <LoaderCircle className="animate-spin" />
                  )}
                  创建
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );

  async function handleSubmit(values: CreateNoteRequest) {
    await mutation.trigger(values);
    setOpen(false);
    onSuccess?.();
  }
};
