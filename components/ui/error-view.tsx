"use client";

import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";

interface ErrorViewProps {
  code?: string;
  title: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorView({ code, title, message, onRetry }: ErrorViewProps) {
  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <GlassCard className="w-full max-w-md p-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6 flex justify-center">
            <div className={`
              flex h-20 w-20 items-center justify-center rounded-full bg-[var(--accent-color)]/10
              text-[var(--accent-color)]
            `}>
              {code === "404" ? (
                <span className="text-3xl font-bold">404</span>
              ) : (
                <AlertTriangle className="h-10 w-10" />
              )}
            </div>
          </div>

          <h1 className="mb-2 text-3xl font-bold text-[var(--text-color)]">
            {title}
          </h1>
          <p className="mb-8 text-[var(--text-color-secondary)]">{message}</p>

          <div className={`
            flex flex-col gap-3
            sm:flex-row sm:justify-center
          `}>
            <Link href="/">
              <Button variant="outline" className={`
                w-full
                sm:w-auto
              `}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back Home
              </Button>
            </Link>
            {onRetry && (
              <Button onClick={onRetry} className={`
                w-full
                sm:w-auto
              `}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            )}
          </div>
        </motion.div>
      </GlassCard>
    </div>
  );
}
