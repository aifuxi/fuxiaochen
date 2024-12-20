import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { Role } from "@prisma/client";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { getQueryClient } from "@/lib/get-query-client";

import { useGetUser, useUpdateUser } from "../api";
import { useUpdateUserSheet } from "../hooks/use-update-user-sheet";
import { type UpdateUserRequestType, updateUserSchema } from "../schema";

export const UpdateUserSheet = () => {
  const { isOpen, email, setIsOpen, closeSheet, setEmail } =
    useUpdateUserSheet();
  const form = useForm<UpdateUserRequestType>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: "",
      email: "",
      role: Role.USER,
    },
  });
  const queryClient = getQueryClient();

  const { data } = useGetUser(email);
  const { mutate, isPending: updateUserLoading } = useUpdateUser();

  useEffect(() => {
    if (data?.data) {
      form.setValue("email", data?.data?.email);
      form.setValue("name", data?.data?.name);
      form.setValue("role", data?.data?.role);
    }
  }, [data, form]);

  const handleSubmit = (values: UpdateUserRequestType) => {
    mutate(values, {
      onSuccess: () => {
        toast.success("更新成功");
        void closeSheet();
        void queryClient.invalidateQueries({
          queryKey: ["getUsers"],
        });
      },
      onError: (error) => {
        toast.error(`更新失败，${error}`);
      },
    });
  };

  const handleOpenChange = (value: boolean) => {
    void setIsOpen(value);
    if (!value) {
      void setEmail(null);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>更新用户</SheetTitle>
          <SheetDescription>填写以下信息来更新一个用户</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form autoComplete="off">
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>昵称</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>邮箱</FormLabel>
                    <FormControl>
                      <Input disabled placeholder="请输入" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>角色</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value={Role.ADMIN} />
                          </FormControl>
                          <FormLabel className="font-normal">管理员</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value={Role.USER} />
                          </FormControl>
                          <FormLabel className="font-normal">
                            普通用户
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        <SheetFooter>
          <Button
            type="button"
            disabled={updateUserLoading}
            onClick={() => form.handleSubmit(handleSubmit)()}
          >
            更新
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
