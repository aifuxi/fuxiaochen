import React from 'react';
import QRCode from 'react-qr-code';

type PreviewQrCodeProps = {
  url: string;
};

export const PreviewQrCode = ({ url }: PreviewQrCodeProps) => {
  return (
    <div className="hidden lg:flex border p-4 pb-2  flex-col rounded-lg fixed right-[calc((100%-678px)/2-100px-64px)] top-16 translate-y-8">
      <QRCode
        size={256}
        style={{ height: 'auto', width: '100px' }}
        value={url}
        viewBox={`0 0 256 256`}
      />
      <p className="text-primary/30 text-sm text-center pt-2">手机扫码查看</p>
    </div>
  );
};
