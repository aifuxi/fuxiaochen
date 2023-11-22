import dynamic from 'next/dynamic';

import BackToTop from './back-to-top';
import { BytemdEditor, BytemdViewer } from './bytemd';
import EmailDialog from './email-dialog';
import EmptyPage from './empty-page';
import { NavbarV0, NavbarV1 } from './navbar';
import ClientPagination from './pagination/client-pagination';
import { AuthProvider } from './provider';
import ToggleTheme from './toggle-theme';

/**
 * 因为这个组件里面用到了window对象，正常情况下使用ssr会在服务端进行预渲染，
 * 导致报错 window is not defined，设置ssr: false让组件甚至不在服务端呈现
 * */
const GiscusComment = dynamic(
  () => {
    return import('./giscus-comment');
  },
  { ssr: false },
);

export {
  BytemdEditor,
  BytemdViewer,
  NavbarV0,
  NavbarV1,
  ClientPagination,
  AuthProvider,
  EmptyPage,
  BackToTop,
  GiscusComment,
  EmailDialog,
  ToggleTheme,
};
