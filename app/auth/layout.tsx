import { redirect } from 'next/navigation';

import { PATHS } from '@/constants';

// export default function Layout({ children }: React.PropsWithChildren) {

//   return <AuthLayout>{children}</AuthLayout>;
// }

export default function Layout() {
  // 自己实现的登录注册页面有BUG，暂不开放，都跳到next-auth的默认界面
  redirect(PATHS.NEXT_AUTH_SIGNIN);
}
