import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { toNumber } from "lodash-es";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { useGetAllCategories } from "../../categories/api";
import { useGetAllTags } from "../../tags/api";
import { useCreateBlog } from "../api";
import { useCreateBlogSheet } from "../hooks/use-create-blog-sheet";
import { type CreateBlogRequestType, createBlogSchema } from "../schema";

type Props = {
  title: string;
  body: string;
};

export const CreateBlogSheet = ({ title, body }: Props) => {
  const { isOpen, setIsOpen, closeSheet } = useCreateBlogSheet();
  const form = useForm<CreateBlogRequestType>({
    resolver: zodResolver(createBlogSchema),
    defaultValues: {
      title,
      body,
      slug: "",
      description: "",
      published: true,
      tagIds: [],
    },
  });
  const { mutate, isPending: createBlogLoading } = useCreateBlog();
  const { data: allCategoriesResp } = useGetAllCategories();
  const { categories } = allCategoriesResp?.data ?? {};
  const { data: allTagsResp } = useGetAllTags();
  const { tags } = allTagsResp?.data ?? {};

  const router = useRouter();

  useEffect(() => {
    form.setValue("title", title);
    form.setValue("body", body);
  }, [title, body, form]);

  const handleSubmit = (values: CreateBlogRequestType) => {
    mutate(values, {
      onSuccess: () => {
        toast.success("创建成功");

        closeSheet()
          .then(() => {
            router.push("/admin/blogs");
          })
          .catch((error) => {
            toast.error(`关闭抽屉失败，${error}`);
          });
      },
      onError: (error) => {
        toast.error(`创建失败，${error}`);
      },
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="md:max-w-2xl">
        <SheetHeader>
          <SheetTitle>创建文章</SheetTitle>
          <SheetDescription>填写以下信息来创建一个新文章</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form autoComplete="off">
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>别名</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入" {...field} />
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
                    <FormLabel>描述</FormLabel>
                    <FormControl>
                      <Textarea placeholder="请输入" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cover"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>封面</FormLabel>
                    <FormControl>
                      <Textarea placeholder="请输入" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>分类</FormLabel>
                    <Select
                      onValueChange={(v) => field.onChange(toNumber(v))}
                      defaultValue={`${field.value}`}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择分类" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((el) => (
                          <SelectItem value={`${el.id}`} key={el.id}>
                            {el.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tagIds"
                render={() => (
                  <FormItem>
                    <FormLabel>标签</FormLabel>
                    <div className="flex flex-wrap gap-4">
                      {tags?.map((item) => (
                        <FormField
                          key={item.id}
                          control={form.control}
                          name="tagIds"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={item.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([
                                            ...field.value!,
                                            item.id,
                                          ])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== item.id,
                                            ),
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {item.name}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="published"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>发布状态</FormLabel>
                    <div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="请输入" {...field} type="hidden" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="请输入" {...field} type="hidden" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        <SheetFooter className="pt-8">
          <Button
            type="button"
            className="w-full"
            disabled={createBlogLoading}
            onClick={() => form.handleSubmit(handleSubmit)()}
          >
            创建
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
