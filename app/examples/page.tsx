import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tag } from "@/components/ui/tag";

export default function ExamplesPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="mb-8 text-4xl font-bold text-foreground">
        macOS Big Sur 风格组件库
      </h1>
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>按钮 (Button)</CardTitle>
            <CardDescription>不同变体的按钮组件</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button variant="default">默认</Button>
              <Button variant="primary">主要</Button>
              <Button variant="secondary">次要</Button>
              <Button variant="ghost">幽灵</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>输入框 (Input)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="默认输入框" />
            <Input variant="filled" placeholder="填充风格输入框" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>文本域 (Textarea)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea placeholder="默认文本域" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>选择器 (Select)</CardTitle>
          </CardHeader>
          <CardContent>
            <Select>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="选择一个选项" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">选项 1</SelectItem>
                <SelectItem value="option2">选项 2</SelectItem>
                <SelectItem value="option3">选项 3</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>对话框 (Dialog)</CardTitle>
            <CardDescription>模态对话框组件</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button>打开对话框</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>对话框标题</DialogTitle>
                  <DialogDescription>
                    这是一个模态对话框，采用 Big Sur 风格设计
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input placeholder="输入内容..." />
                  <Button className="w-full">确认</Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>抽屉 (Drawer)</CardTitle>
            <CardDescription>侧边抽屉组件</CardDescription>
          </CardHeader>
          <CardContent>
            <Drawer>
              <DrawerTrigger asChild>
                <Button>打开抽屉</Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>抽屉标题</DrawerTitle>
                </DrawerHeader>
                <div className="space-y-4 p-4">
                  <p className="text-muted-foreground">
                    这是一个从底部滑出的抽屉组件
                  </p>
                  <Input placeholder="输入内容..." />
                  <Button className="w-full">确认</Button>
                </div>
              </DrawerContent>
            </Drawer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>弹窗 (Popover)</CardTitle>
            <CardDescription>悬浮弹窗组件</CardDescription>
          </CardHeader>
          <CardContent>
            <Popover>
              <PopoverTrigger asChild>
                <Button>打开弹窗</Button>
              </PopoverTrigger>
              <PopoverContent>
                <div className="space-y-2">
                  <p className="font-medium">弹窗内容</p>
                  <p className="text-sm text-muted-foreground">
                    这是一个悬浮弹窗，点击外部可以关闭
                  </p>
                </div>
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>徽章 (Badge)</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Badge variant="default">默认</Badge>
            <Badge variant="secondary">次要</Badge>
            <Badge variant="destructive">危险</Badge>
            <Badge variant="outline">轮廓</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>标签 (Tag)</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Tag>默认</Tag>
            <Tag variant="primary">主要</Tag>
            <Tag variant="secondary">次要</Tag>
            <Tag variant="outline">轮廓</Tag>
            <Tag removable>删除我</Tag>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
