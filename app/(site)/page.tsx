import { Heading } from '@radix-ui/themes';

export default function HomePage() {
  return (
    <div className="container">
      <div className="h-screen flex flex-col justify-center items-center">
        <img
          src="/images/nyan-cat.webp"
          alt="Nyan Cat"
          className={'w-full h-auto'}
        />

        <Heading as="h2" size={'9'}>
          F西，努力做一个更好的程序员。
        </Heading>
      </div>
    </div>
  );
}
