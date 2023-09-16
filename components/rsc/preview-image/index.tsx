import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/utils';

type Props = {
  triggerNode: React.ReactNode;
  imageUrl: string;
  className?: string;
};

export default function PreviewImage({
  triggerNode,
  imageUrl,
  className,
}: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>{triggerNode}</DialogTrigger>
      <DialogContent
        className={cn('flex max-w-[60vw] justify-center', className)}
      >
        <img
          src={imageUrl}
          alt="cover"
          className={cn('mt-6 block h-auto w-full', className)}
        />
      </DialogContent>
    </Dialog>
  );
}
