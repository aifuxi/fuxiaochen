"use client";

import NiceModal from "@ebay/nice-modal-react";
import { useState } from "react";
import { toast } from "sonner";

import { SubscribeDialog } from "@/components/modals/subscribe-dialog";

export function NewsletterCard() {
  const [email, setEmail] = useState("");

  return (
    <section className="relative px-8 py-32">
      <div className="relative mx-auto max-w-3xl text-center">
        <div className={`
          absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 bg-primary opacity-15
          blur-[120px]
        `} />

        <div className="relative z-10">
          <h2 className={`
            gradient-text mb-4 font-serif text-5xl
            lg:text-6xl
          `}>保持更新</h2>
          <p className="mx-auto mb-10 max-w-md text-lg text-muted">
            订阅我的 newsletter，获取关于设计与开发的最新文章、教程和见解。
          </p>

          <form
            className={`
              mx-auto flex max-w-lg flex-col gap-4
              sm:flex-row
            `}
            onSubmit={(event) => {
              event.preventDefault();
              toast.success("订阅请求已收到。");
              void NiceModal.show(SubscribeDialog, { email });
            }}
          >
            <input
              className={`
                newsletter-input flex-1 rounded-full px-6 py-4 text-white
                placeholder:text-muted
              `}
              placeholder="your@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <button className="btn-primary-glow font-mono-tech rounded-full px-8 py-4 text-sm tracking-wider uppercase" type="submit">
              订阅
            </button>
          </form>

          <p className="mt-6 text-xs text-muted">无垃圾邮件，可随时取消订阅。</p>
        </div>
      </div>
    </section>
  );
}
