'use client';

import { ClipboardPaste } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/utils';

type Props = {
  email?: string;
  className?: string;
  triggerNode: React.ReactNode;
};

export default function EmailDialog({ email, triggerNode, className }: Props) {
  const { toast } = useToast();
  return (
    <Dialog>
      <DialogTrigger asChild>{triggerNode}</DialogTrigger>
      <DialogContent
        className={cn('flex max-w-[60vw] justify-center', className)}
      >
        <div className="flex items-center space-x-4">
          <p className="text-2xl">{email}</p>
          <Button
            size={'icon'}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(email ?? '');
                toast({
                  variant: 'default',
                  title: 'Success',
                  description: '已复制邮箱到粘贴板',
                });
                /* Resolved - 文本被成功复制到剪贴板 */
              } catch (err) {
                /* Rejected - 文本未被复制到剪贴板 */
                toast({
                  variant: 'destructive',
                  title: 'Error',
                  description: '复制失败',
                });
              }
            }}
          >
            <ClipboardPaste size={24} />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
