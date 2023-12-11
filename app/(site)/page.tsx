import { SLOGAN } from '@/constants/info';

export default function HomePage() {
  return (
    <div className="container">
      <div className="h-screen flex flex-col justify-center items-center">
        <img
          src="/images/nyan-cat.webp"
          alt="Nyan Cat"
          className={'w-full h-auto'}
        />

        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          {SLOGAN}
        </h1>
      </div>
    </div>
  );
}
