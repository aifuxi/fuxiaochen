import Link from 'next/link';

import { EmailDialog } from '@/components/client';
import { BILIBILI_PAGE, EMAIL, GITHUB_PAGE, JUEJIN_PAGE } from '@/constants';
import { cn } from '@/utils';

import {
  IconBilibili,
  IconEmail,
  IconGithub,
  IconJuejin,
  IconWechat,
} from '../icons';
import PreviewImage from '../preview-image';

type Props = {
  className?: string;
};

export default function SocialInfo({ className }: Props) {
  return (
    <div
      className={cn(
        'flex justify-center space-x-2 text-4xl text-gray-300',
        className,
      )}
    >
      <EmailDialog
        triggerNode={
          <IconEmail
            className={cn(
              'transition-all',
              'hover:scale-110 hover:text-gray-800  dark:hover:text-white',
            )}
          />
        }
        email={EMAIL}
      />
      <Link
        target="_blank"
        href={GITHUB_PAGE}
        className={cn(
          'transition-all',
          'hover:scale-110 hover:text-gray-800  dark:hover:text-white',
        )}
      >
        <IconGithub />
      </Link>
      <Link
        target="_blank"
        href={JUEJIN_PAGE}
        className="transition-all hover:scale-110 hover:text-[#1e80ff]"
      >
        <IconJuejin />
      </Link>
      <Link
        target="_blank"
        href={BILIBILI_PAGE}
        className="transition-all hover:scale-110 hover:text-[#00aeec]"
      >
        <IconBilibili />
      </Link>
      <PreviewImage
        triggerNode={
          <IconWechat className="cursor-pointer transition-all hover:scale-110 hover:text-[#07c160]" />
        }
        imageUrl="/images/wechat-qr-code.jpg"
        className="w-[500px]"
      />
    </div>
  );
}
