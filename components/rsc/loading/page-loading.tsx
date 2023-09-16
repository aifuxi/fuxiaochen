import { SpinLoading } from './spin-loading';

export const PageLoading = () => {
  return (
    <div className="flex h-[60vh] flex-col items-center pt-[10vh]">
      <SpinLoading />
      <h2 className="flex text-2xl font-black md:text-3xl xl:text-4xl">
        加载中<div className="ml-2 animate-bounce">...</div>
      </h2>
    </div>
  );
};
