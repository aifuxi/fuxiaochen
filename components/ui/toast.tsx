'use client';

import toast, { Toaster as HotToaster, ToastBar } from 'react-hot-toast';

import { CheckCircleIcon, Loader2Icon, XCircleIcon, XIcon } from 'lucide-react';

import { Button } from './button';

export const Toaster = () => {
  return (
    <HotToaster
      gutter={32}
      toastOptions={{
        className:
          '!bg-primary !text-primary-foreground !rounded-full !shadow-2xl !p-4 text-xl !font-semibold !max-w-[50vw]',
        success: {
          icon: <CheckCircleIcon size={36} className="text-green-500" />,
        },
        error: {
          icon: <XCircleIcon size={36} className="text-red-500" />,
        },
        loading: {
          icon: <Loader2Icon size={36} className="animate-spin" />,
        },
      }}
    >
      {(t) => (
        <ToastBar toast={t}>
          {({ icon, message }) => (
            <>
              {icon}
              {message}
              {t.type !== 'loading' && (
                <Button onClick={() => toast.dismiss(t.id)}>
                  <XIcon />
                </Button>
              )}
            </>
          )}
        </ToastBar>
      )}
    </HotToaster>
  );
};
