import { cn } from '@/utils';

type Props = {
  title: string;
  className?: string;
};

export default function PageTitle({ title, className }: Props) {
  return (
    <h2
      className={cn(
        'font-extrabold tracking-tight border-b py-8',
        'text-4xl sm:text-5xl',
        'leading-9 sm:leading-10',
        'text-gray-900 dark:text-white',
        className,
      )}
    >
      {title}
    </h2>
  );
}
