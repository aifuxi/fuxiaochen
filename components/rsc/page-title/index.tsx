import { cn } from '@/utils';

import { BarCode } from '../illustrations';

type Props = {
  title: string;
  className?: string;
};

export default function PageTitle({ title, className }: Props) {
  return (
    <h2
      className={cn(
        'font-extrabold border-b pb-8 pt-16 flex justify-between items-center',
        'text-4xl sm:text-5xl',
        'leading-9 sm:leading-10',
        className,
      )}
    >
      <span>{title}</span>
      <BarCode className="w-[300px]" />
    </h2>
  );
}
