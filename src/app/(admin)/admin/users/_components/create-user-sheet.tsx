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

import { useCreateUser } from "../api";
import { useCreateUserSheet } from "../hooks/use-create-user-sheet";
import { type CreateUserRequestType, createUserSchema } from "../schema";

export const CreateUserSheet = () => {
  const { isOpen, setIsOpen, closeSheet } = useCreateUserSheet();
  const form = useForm<CreateUserRequestType>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      role: Role.USER,
      password: "",
    },
  });
  const queryClient = getQueryClient();
  const { mutate, isPending: createUserLoading } = useCreateUser();

  const handleSubmit = (values: CreateUserRequestType) => {
    mutate(values, {
      onSuccess: () => {
        toast.success("创建成功");
        void closeSheet();
        void queryClient.invalidateQueries({
          queryKey: ["getUsers"],
        });
      },
      onError: (error) => {
        toast.error(`创建失败，${error}`);
      },
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>创建用户</SheetTitle>
          <SheetDescription>填写以下信息来创建一个新用户</SheetDescription>
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
                      <Input placeholder="请输入" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>密码</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入" {...field} />
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
            disabled={createUserLoading}
            onClick={() => form.handleSubmit(handleSubmit)()}
          >
            创建
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
