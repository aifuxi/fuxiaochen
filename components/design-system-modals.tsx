"use client";

import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const BasicActionDialog = NiceModal.create(() => {
  const modal = useModal();

  return (
    <Dialog open={modal.visible} onOpenChange={() => modal.remove()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>确认操作</DialogTitle>
          <DialogDescription>
            确定要执行此操作吗？此操作无法撤销，但这套对话框样式可以直接复用到后台管理场景。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={() => modal.remove()}>
            取消
          </Button>
          <Button onClick={() => modal.remove()}>确定</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

export const ProfileFormDialog = NiceModal.create(() => {
  const modal = useModal();

  return (
    <Dialog open={modal.visible} onOpenChange={() => modal.remove()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑资料</DialogTitle>
          <DialogDescription>
            使用统一的 Chen Serif 表单输入规范，搭配 Radix Select 和 NiceModal 管理弹窗状态。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
              名称
            </label>
            <Input defaultValue="Sarah Chen" />
          </div>
          <div className="grid gap-2">
            <label className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
              邮箱
            </label>
            <Input defaultValue="sarah@example.com" type="email" />
          </div>
          <div className="grid gap-2">
            <label className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
              角色
            </label>
            <Select defaultValue="designer">
              <SelectTrigger>
                <SelectValue placeholder="请选择角色" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="designer">Design Lead</SelectItem>
                <SelectItem value="engineer">Frontend Engineer</SelectItem>
                <SelectItem value="editor">Content Editor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => modal.remove()}>
            取消
          </Button>
          <Button onClick={() => modal.remove()}>保存修改</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
