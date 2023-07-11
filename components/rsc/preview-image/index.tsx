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
        className={cn('max-w-[60vw] flex justify-center', className)}
      >
        <img
          src={imageUrl}
          alt="cover"
          className={cn('block w-full h-auto mt-6', className)}
        />
      </DialogContent>
    </Dialog>
  );
}
