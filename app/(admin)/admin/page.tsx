import { IllustrationConstruction } from '@/components/illustrations';

export default function AdminPage() {
  return (
    <div className="h-screen flex flex-col gap-4">
      <h2 className="text-3xl font-semibold tracking-tight transition-colors">
        Dashboard
      </h2>

      <div className="flex-1 grid place-items-center">
        <div className="grid gap-8">
          <IllustrationConstruction className="w-[300px] h-[300px]" />

          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight text-center">
            页面建设中
          </h3>
        </div>
      </div>
    </div>
  );
}
