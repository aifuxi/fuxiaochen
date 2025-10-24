"use client";

import * as React from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { values } from "es-toolkit/compat";
import { LoaderCircle, Pen } from "lucide-react";

import { type UpdateUserRequest, updateUserSchema } from "@/types/user";

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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { showSuccessToast } from "@/components/toast";

import { ROLES, ROLE_LABEL_MAP } from "@/constants";
import { cn } from "@/lib/utils";

import { useGetUser, useUpdateUser } from "../api";

interface UpdateUserButtonProps {
  onSuccess?: () => void;
  id: string;
}
export const UpdateUserButton = ({ onSuccess, id }: UpdateUserButtonProps) => {
  const [open, setOpen] = React.useState(false);
  const form = useForm<UpdateUserRequest>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      id: "",
      name: "",
      email: "",
      password: "",
      role: ROLES.visitor,
    },
  });

  const { data, isLoading } = useGetUser(id, { enable: open });
  const mutation = useUpdateUser();

  React.useEffect(() => {
    if (!open) {
      form.reset();
      form.clearErrors();
    }

    if (data) {
      form.setValue("id", data.id);
      form.setValue("name", data.name ?? "");
      form.setValue("email", data.email ?? "");
      form.setValue("role", (data.role as keyof typeof ROLES) ?? ROLES.visitor);
    }
  }, [form, open, data]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size={"icon"}
              variant="outline"
              onClick={() => {
                setOpen(true);
              }}
            >
              <Pen />
            </Button>
          </TooltipTrigger>
          <TooltipContent>编辑</TooltipContent>
        </Tooltip>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑用户</DialogTitle>
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
                  name="id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>id</FormLabel>
                      <FormControl>
                        <Input {...field} disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                        <Input placeholder="请输入邮箱" {...field} disabled />
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
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
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

  async function handleSubmit(values: UpdateUserRequest) {
    const user = await mutation.trigger(values);
    if (user?.name) {
      showSuccessToast(`更新成功`);
    }
    setOpen(false);
    onSuccess?.();
  }
};
