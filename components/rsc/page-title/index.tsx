import { Flex, Heading } from '@radix-ui/themes';

import { BarCode } from '../illustrations';

type Props = {
  title: string;
  className?: string;
};

export function PageTitle({ title }: Props) {
  return (
    <Flex
      justify={'between'}
      align={'center'}
      py={'8'}
      className="border-b border-b-gray-6"
    >
      <Heading as="h4" size={'9'}>
        {title}
      </Heading>

      <BarCode className="w-[450px] h-[60px]" />
    </Flex>
  );
}
