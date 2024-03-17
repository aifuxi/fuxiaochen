'use client';

// 使用react-hot-toast模仿semi的light主题的toast样式
// https://semi.bytedance.net/zh-CN/feedback/toast
import { type Message } from 'react-hook-form';
import toast, { type ToastOptions, Toaster } from 'react-hot-toast';

import {
  IconSolarCheckCircle,
  IconSolarDangerCircle,
  IconSolarDangerTriangle,
  IconSolarInfoCircle,
  IconSolarRestartLinear,
} from '@/components/icons';

export const ReactHotToaster = () => {
  return <Toaster gutter={32}></Toaster>;
};

export const showSuccessToast = (msg: Message, opts?: ToastOptions) => {
  toast(msg, {
    ...opts,
    icon: (
      <IconSolarCheckCircle className="text-xl text-green-500 dark:text-green-600" />
    ),
    className:
      'border-2 border-green-500 dark:border-green-500 !bg-green-50 dark:!bg-green-50 !rounded-2xl !font-semibold !px-3 !py-2 !text-sm',
  });
};

export const showInfoToast = (msg: Message, opts?: ToastOptions) => {
  toast(msg, {
    ...opts,
    icon: (
      <IconSolarInfoCircle className="text-xl text-blue-500 dark:text-blue-600" />
    ),
    className:
      'border-2 border-blue-500 dark:border-blue-500 !bg-blue-50 dark:!bg-blue-50 !rounded-2xl !font-semibold !px-3 !py-2 !text-sm',
  });
};

export const showWarningToast = (msg: Message, opts?: ToastOptions) => {
  toast(msg, {
    ...opts,
    icon: (
      <IconSolarDangerTriangle className="text-xl text-yellow-500 dark:text-yellow-600" />
    ),
    className:
      'border-2 border-yellow-500 dark:border-yellow-500 !bg-yellow-50 dark:!bg-yellow-50 !rounded-2xl !font-semibold !px-3 !py-2 !text-sm',
  });
};

export const showErrorToast = (msg: Message, opts?: ToastOptions) => {
  toast(msg, {
    ...opts,
    icon: (
      <IconSolarDangerCircle className="text-xl text-red-500 dark:text-red-600" />
    ),
    className:
      'border-2 border-red-500 dark:border-red-500 !bg-red-50 dark:!bg-red-50 !rounded-2xl !font-semibold !px-3 !py-2 !text-sm',
  });
};

export const showLoadingToast = (msg: Message, opts?: ToastOptions) => {
  return toast(msg, {
    ...opts,
    icon: <IconSolarRestartLinear className="text-xl animate-spin" />,
    className: 'bg-foreground !rounded-2xl !font-semibold !px-3 !py-2 !text-sm',
  });
};

export const hideToast = (id: string) => {
  toast.dismiss(id);
};
