import { SpinLoading } from './spin-loading';

export const PageLoading = () => {
  return (
    <div className="flex flex-col items-center h-[60vh] pt-[10vh]">
      <SpinLoading />
      <h2 className="flex text-2xl md:text-3xl xl:text-4xl font-black">
        加载中<div className="animate-bounce ml-2">...</div>
      </h2>
    </div>
  );
};
