'use client';

import React from 'react';

import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import Script from 'next/script';

import { Toaster } from '@/components/ui/toaster';

type Props = {
  children?: React.ReactNode;
  session: Session;
};

export const AuthProvider = ({ children, session }: Props) => {
  return (
    <SessionProvider session={session}>
      {children}
      <Toaster />
    </SessionProvider>
  );
};

export const AnalyticsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const domain = process.env.NEXT_PUBLIC_GTM_DOMAIN;
  const reportDomain = process.env.NEXT_PUBLIC_GTM_REPORT_DOMAIN;

  return (
    <>
      {children}

      <Script
        id="baidu-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
        var _hmt = _hmt || [];
        (function() {
          var hm = document.createElement("script");
          hm.src = "https://hm.baidu.com/hm.js?51710f2d608b0bcb4ebf43b7ae473b14";
          var s = document.getElementsByTagName("script")[0]; 
          s.parentNode.insertBefore(hm, s);
        })();
      `,
        }}
      />
      <Script
        id="google-analytics-js"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
        var _hmt = _hmt || [];
        (function() {
          var hm = document.createElement("script");
          hm.src = "${domain}/gtag/js?id=${gaMeasurementId}";
          var s = document.getElementsByTagName("script")[0]; 
          s.parentNode.insertBefore(hm, s);
        })();
      `,
        }}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
            
              gtag('config', '${gaMeasurementId}', {
                 page_path: window.location.pathname,
                 transport_url: '${reportDomain}',
                 first_party_collection: true
              });
          `,
        }}
      />
    </>
  );
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
};
