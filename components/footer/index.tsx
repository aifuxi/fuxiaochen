import Link from 'next/link';

import { Flex, Link as RadixLink, Separator, Text } from '@radix-ui/themes';

import { WEBSITE } from '@/constants/info';

import { SocialInfo } from '../rsc/social-info';

export function Footer() {
  return (
    <Flex direction={'column'} align={'center'} gap={'1'} py={'8'}>
      <SocialInfo />
      <RadixLink asChild color="gray">
        <Link
          href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=36100202000364"
          target="_blank"
          rel="nofollow"
        >
          <Flex align={'center'} gap={'2'}>
            <img src="/images/beian.png" alt="gongan" className="w-4 h-4" />
            <Text size={'1'} color="gray">
              赣公网安备 36100202000364号
            </Text>
          </Flex>
        </Link>
      </RadixLink>

      <Flex align={'center'} gap={'2'}>
        <Text
          size={'1'}
          color="gray"
        >{`© ${new Date().getFullYear()} • ${WEBSITE}`}</Text>
        <Separator orientation="vertical" color="gray" size={'1'} />
        <RadixLink asChild color="gray">
          <Link
            href="https://beian.miit.gov.cn/"
            target="_blank"
            className="flex items-center"
            rel="nofollow"
          >
            <Text size={'1'} color="gray">
              赣ICP备2023001797号
            </Text>
          </Link>
        </RadixLink>
      </Flex>
    </Flex>
  );
}
