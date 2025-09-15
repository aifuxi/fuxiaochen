"use client";

import * as React from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { values } from "es-toolkit/compat";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { showSuccessToast } from "@/components/toast";

import { ROLES, ROLE_LABEL_MAP } from "@/constants";
import {
  type CreateUserRequest,
  createUserSchema,
  useCreateUser,
} from "@/features/user";
import { cn } from "@/lib/utils";

interface CreateUserButtonProps {
  onSuccess?: () => void;
}
export const CreateUserButton = ({ onSuccess }: CreateUserButtonProps) => {
  const [open, setOpen] = React.useState(false);
  const form = useForm<CreateUserRequest>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: ROLES.visitor,
    },
  });

  const mutation = useCreateUser();

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
          创建用户
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>创建用户</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form autoComplete="off">
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>用户名</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入用户名" {...field} />
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
                      <Input placeholder="请输入邮箱" {...field} />
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
                      <Input placeholder="请输入密码" {...field} />
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger
                          className={cn({
                            "text-muted-foreground": !field.value,
                          })}
                        >
                          <SelectValue placeholder="请选择角色" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {values(ROLES).map((el) => (
                          <SelectItem key={el} value={el}>
                            {ROLE_LABEL_MAP[el]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

  async function handleSubmit(values: CreateUserRequest) {
    const user = await mutation.trigger(values);
    if (user?.name) {
      showSuccessToast(
        `【${ROLE_LABEL_MAP[user.role as keyof typeof ROLE_LABEL_MAP]}】用户 【${user.name}】 创建成功`,
      );
    }
    setOpen(false);
    onSuccess?.();
  }
};
