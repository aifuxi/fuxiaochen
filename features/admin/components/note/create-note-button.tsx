'use client';

import React from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { TagTypeEnum } from '@prisma/client';

import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { BytemdEditor } from '@/components/bytemd';
import { IconSolarAddSquare, IconSolarRestartLinear } from '@/components/icons';

import {
  type CreateNoteDTO,
  createNoteSchema,
  useCreateNote,
} from '@/features/note';
import { useGetAllTags } from '@/features/tag';

import { CreateTagButton } from '../tag';

export const CreateNoteButton = () => {
  const [open, setOpen] = React.useState(false);
  const form = useForm<CreateNoteDTO>({
    resolver: zodResolver(createNoteSchema),
    defaultValues: {
      body: '',
      tags: [],
    },
  });

  const createNoteQuery = useCreateNote();

  const getTagsQuery = useGetAllTags(TagTypeEnum.NOTE);
  const tags = React.useMemo(() => {
    return getTagsQuery.data?.tags ?? [];
  }, [getTagsQuery]);

  React.useEffect(() => {
    if (open) {
      form.reset();
      form.clearErrors();
    }
  }, [form, open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)}>
          <IconSolarAddSquare className="mr-2 text-base" />
          创建笔记
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>创建笔记</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form autoComplete="off">
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>标签</FormLabel>
                    <FormControl>
                      <div className="flex space-x-4 items-center">
                        <div className="flex-1">
                          <Combobox
                            options={
                              tags?.map((el) => ({
                                label: el.name,
                                value: el.id,
                              })) ?? []
                            }
                            multiple
                            clearable
                            selectPlaceholder="请选择"
                            value={field.value}
                            onValueChange={field.onChange}
                          />
                        </div>

                        <CreateTagButton />
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
                      <BytemdEditor
                        body={field.value}
                        setContent={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button
                  type="button"
                  disabled={createNoteQuery.isPending}
                  onClick={() => form.handleSubmit(handleSubmit)()}
                >
                  {createNoteQuery.isPending && (
                    <IconSolarRestartLinear className="mr-2 text-base animate-spin" />
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

  async function handleSubmit(values: CreateNoteDTO) {
    await createNoteQuery.mutateAsync(values);
    setOpen(false);
  }
};
