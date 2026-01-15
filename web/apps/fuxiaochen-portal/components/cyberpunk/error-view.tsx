"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface ErrorViewProps {
  code: string;
  title: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorView({ code, title, message, onRetry }: ErrorViewProps) {
  const router = useRouter();

  const handleRefresh = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center relative overflow-hidden">
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

      <div className="text-center z-10 space-y-8 px-4 max-w-3xl mx-auto">
        {/* Error Code Glitch Effect */}
        <div className="relative">
          <h1 className="text-9xl md:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-800 tracking-tighter opacity-20 select-none">
            {code}
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <h2 className="text-4xl md:text-6xl font-bold text-neon-cyan uppercase tracking-widest bg-black/50 backdrop-blur-sm px-8 py-4 border border-neon-cyan/30">
              {title}
            </h2>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-red-400 font-mono text-sm tracking-[0.2em] uppercase animate-pulse">
            /// SYSTEM_ALERT: {message}
          </p>
          <p className="text-gray-500 font-mono text-xs">
            ERROR_TRACE_ID: XXXX-XXXX-XXXX-XXXX
            <br />
            TIMESTAMP: {new Date().toISOString()}
          </p>
        </div>

        <div className="pt-8 flex flex-col md:flex-row gap-6 justify-center">
          <button
            onClick={handleRefresh}
            className="px-8 py-3 bg-neon-cyan/10 border border-neon-cyan text-neon-cyan font-bold uppercase tracking-widest hover:bg-neon-cyan hover:text-black transition-all duration-300 shadow-[0_0_15px_rgba(0,255,255,0.2)] hover:shadow-[0_0_30px_rgba(0,255,255,0.5)] cursor-pointer"
          >
            重启系统 / REBOOT
          </button>

          <Link
            href="/"
            className="px-8 py-3 border border-white/20 text-white font-bold uppercase tracking-widest hover:bg-white/5 transition-all duration-300 hover:border-white/40 flex items-center justify-center gap-2 cursor-pointer"
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
            返回基地 / HOME
          </Link>
        </div>
      </div>
    </div>
  );
}
