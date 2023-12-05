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
          F西，努力做一个更好的程序员。
        </h1>
      </div>
    </div>
  );
}
