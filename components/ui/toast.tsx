'use client';

import toast, {
  Toaster as HotToaster,
  type Toast,
  ToastBar,
} from 'react-hot-toast';

import { Button } from './button';

import {
  IconSolarCheckCircle,
  IconSolarCloseCircle,
  IconSolarCloseSquare,
  IconSolarRestart,
} from '../icons';

export const Toaster = () => {
  return (
    <HotToaster
      gutter={32}
      toastOptions={{
        className:
          '!bg-primary !text-primary-foreground !rounded-full !shadow-2xl !p-4 text-xl !font-semibold !max-w-[50vw]',
        success: {
          icon: <IconSolarCheckCircle className="text-green-500 text-4xl" />,
        },
        error: {
          icon: <IconSolarCloseCircle className="text-red-500 text-4xl" />,
        },
        loading: {
          icon: <IconSolarRestart className="animate-spin text-4xl" />,
        },
      }}
    >
      {(t: Toast) => (
        <ToastBar toast={t}>
          {({ icon, message }: Toast) => (
            <>
              {icon}
              {message}
              {t.type !== 'loading' && (
                <Button size="icon" onClick={() => toast.dismiss(t.id)}>
                  <IconSolarCloseSquare className="text-2xl" />
                </Button>
              )}
            </>
          )}
        </ToastBar>
      )}
    </HotToaster>
  );
};
