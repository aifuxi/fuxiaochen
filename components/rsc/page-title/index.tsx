import { cn } from '@/utils';

type Props = {
  title: string;
  className?: string;
};

export default function PageTitle({ title, className }: Props) {
  return (
    <h2
      className={cn(
        'font-extrabold border-b pb-8 pt-16',
        'text-4xl sm:text-5xl',
        'leading-9 sm:leading-10',
        className,
      )}
    >
      {title}
    </h2>
  );
}
