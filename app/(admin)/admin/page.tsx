import { Flex, Heading } from '@radix-ui/themes';

export default function AdminPage() {
  return (
    <Flex direction={'column'} gap={'4'}>
      <Heading size={'6'} as="h4">
        Dashboard
      </Heading>
    </Flex>
  );
}
