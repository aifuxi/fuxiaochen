"use client";

import * as React from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Pen } from "lucide-react";

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
  type UpdateNoteRequest,
  updateNoteSchema,
  useGetNote,
  useUpdateNote,
} from "@/features/note";

interface UpdateNoteButtonProps {
  id: string;
  onSuccess?: () => void;
}

export const UpdateNoteButton = ({ id, onSuccess }: UpdateNoteButtonProps) => {
  const [open, setOpen] = React.useState(false);
  const form = useForm<UpdateNoteRequest>({
    resolver: zodResolver(updateNoteSchema),
  });

  const { data, isLoading } = useGetNote(id, { enable: open });
  const mutation = useUpdateNote();

  React.useEffect(() => {
    if (!open) {
      form.reset();
      form.clearErrors();
    }

    if (data) {
      form.setValue("body", data.body);
      form.setValue("published", data.published);

      form.setValue("id", data.id);
    }
  }, [form, open, data]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size={"icon"}
          variant="outline"
          onClick={() => {
            setOpen(true);
          }}
        >
          <Pen />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>编辑笔记</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex min-h-72 items-center justify-center">
            <LoaderCircle className="size-9 animate-spin" />
          </div>
        ) : (
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
                    onClick={() => form.handleSubmit(handleSubmit)()}
                    disabled={mutation.isMutating}
                  >
                    {mutation.isMutating && (
                      <LoaderCircle className="animate-spin" />
                    )}
                    保存
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );

  async function handleSubmit(values: UpdateNoteRequest) {
    await mutation.trigger(values);
    setOpen(false);
    onSuccess?.();
  }
};
