import { BarCode } from '../illustrations';

type Props = {
  title: string;
  className?: string;
};

export function PageTitle({ title }: Props) {
  return (
    <div className="flex justify-between items-center py-8">
      <h2 className="text-3xl font-semibold tracking-tight transition-colors">
        {title}
      </h2>

      <BarCode className="w-[300px] h-[40px]" />
    </div>
  );
}
