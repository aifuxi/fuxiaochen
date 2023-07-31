import dynamic from 'next/dynamic';

import BackToTop from './back-to-top';
import { BytemdEditor, BytemdViewer } from './bytemd';
import EmailDialog from './email-dialog';
import EmptyPage from './empty-page';
import Navbar from './navbar';
import ClientPagination from './pagination/client-pagination';
import { AnalyticsProvider, AuthProvider, ToastProvider } from './provider';

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
  Navbar,
  ClientPagination,
  AuthProvider,
  AnalyticsProvider,
  ToastProvider,
  EmptyPage,
  BackToTop,
  GiscusComment,
  EmailDialog,
};
