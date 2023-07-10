import Link from 'next/link';

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

const SocialInfo = ({ className }: Props) => {
  return (
    <div
      className={cn(
        'flex justify-center space-x-2 text-4xl text-gray-300',
        className,
      )}
    >
      <Link
        rel="noopener noreferrer"
        href={`mailto:${EMAIL}`}
        className="hover:text-gray-800 transition-all hover:scale-105"
      >
        <IconEmail />
      </Link>
      <Link
        target="_blank"
        rel="noopener noreferrer"
        href={GITHUB_PAGE}
        className="hover:text-gray-800 transition-all hover:scale-105"
      >
        <IconGithub />
      </Link>
      <Link
        target="_blank"
        rel="noopener noreferrer"
        href={JUEJIN_PAGE}
        className="hover:text-[#1e80ff] transition-all hover:scale-105"
      >
        <IconJuejin />
      </Link>
      <Link
        target="_blank"
        rel="noopener noreferrer"
        href={BILIBILI_PAGE}
        className="hover:text-[#00aeec] transition-all hover:scale-105"
      >
        <IconBilibili />
      </Link>
      <PreviewImage
        triggerNode={
          <IconWechat className="hover:text-[#07c160] transition-all hover:scale-105 cursor-pointer" />
        }
        imageUrl="/images/wechat-qr-code.jpg"
        className="w-[500px]"
      />
    </div>
  );
};

export default SocialInfo;
