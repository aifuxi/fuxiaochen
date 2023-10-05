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
        'flex items-center justify-between border-b pb-8 pt-16 font-extrabold',
        'text-4xl lg:text-5xl',
        className,
      )}
    >
      <span>{title}</span>
      <BarCode className="w-[300px] hidden md:block" />
    </h2>
  );
}
