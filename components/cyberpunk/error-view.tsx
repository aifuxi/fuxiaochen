"use client";

import Link from "next/link";

interface ErrorViewProps {
  code: string;
  title: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorView({ code, title, message, onRetry }: ErrorViewProps) {
  const handleRefresh = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="relative flex min-h-[80vh] items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,0,0,0.05),transparent_60%)]" />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255, 0, 0, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 0, 0, 0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="z-10 mx-auto max-w-3xl space-y-8 px-4 text-center">
        {/* Error Code Glitch Effect */}
        <div className="relative">
          <h1
            className={`
              bg-gradient-to-b from-white to-gray-800 bg-clip-text text-9xl font-black tracking-tighter text-transparent
              opacity-20 select-none
              md:text-[12rem]
            `}
          >
            {code}
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <h2
              className={`
                border border-neon-cyan/30 bg-black/50 px-8 py-4 text-4xl font-bold tracking-widest text-neon-cyan
                uppercase backdrop-blur-sm
                md:text-6xl
              `}
            >
              {title}
            </h2>
          </div>
        </div>

        <div className="space-y-4">
          <p className="animate-pulse font-mono text-sm tracking-[0.2em] text-red-400 uppercase">
            /// 系统警报: {message}
          </p>
          <p className="font-mono text-xs text-gray-500">
            ERROR_TRACE_ID: XXXX-XXXX-XXXX-XXXX
            <br />
            TIMESTAMP: {new Date().toISOString()}
          </p>
        </div>

        <div
          className={`
            flex flex-col justify-center gap-6 pt-8
            md:flex-row
          `}
        >
          <button
            onClick={handleRefresh}
            className={`
              cursor-pointer border border-neon-cyan bg-neon-cyan/10 px-8 py-3 font-bold tracking-widest text-neon-cyan
              uppercase shadow-[0_0_15px_rgba(0,255,255,0.2)] transition-all duration-300
              hover:bg-neon-cyan hover:text-black hover:shadow-[0_0_30px_rgba(0,255,255,0.5)]
            `}
          >
            重启系统
          </button>

          <Link
            href="/"
            className={`
              flex cursor-pointer items-center justify-center gap-2 border border-white/20 px-8 py-3 font-bold
              tracking-widest text-white uppercase transition-all duration-300
              hover:border-white/40 hover:bg-white/5
            `}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
