import { type Metadata } from 'next';

import { Container, Flex, Heading } from '@radix-ui/themes';

import { NICKNAME } from '@/constants';

export const revalidate = 60;

export const metadata: Metadata = {
  description: `${NICKNAME}，一个正在努力的程序员。`,
  keywords: 'F西、aifuxi',
};

export default function HomePage() {
  return (
    <Container size={'4'}>
      <Flex
        direction={'column'}
        className="h-screen"
        justify={'center'}
        align={'center'}
      >
        <img
          src="/images/nyan-cat.webp"
          alt="Nyan Cat"
          className={'w-full h-auto'}
        />

        <Heading as="h2" size={'9'}>
          F西，努力做一个更好的程序员。
        </Heading>
      </Flex>
    </Container>
  );
}
