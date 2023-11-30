import { Flex, Heading } from '@radix-ui/themes';

import { BarCode } from '../illustrations';

type Props = {
  title: string;
  className?: string;
};

export function PageTitle({ title }: Props) {
  return (
    <Flex justify={'between'} align={'center'} pt={'8'} pb={'4'}>
      <Heading as="h4" size={'8'}>
        {title}
      </Heading>

      <BarCode className="w-[300px] h-12" />
    </Flex>
  );
}
