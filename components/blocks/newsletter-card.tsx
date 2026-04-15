"use client";

import NiceModal from "@ebay/nice-modal-react";
import { useState } from "react";

import { SubscribeDialog } from "@/components/modals/subscribe-dialog";
import { buttonVariants } from "@/components/ui/button-variants";

export function NewsletterCard() {
  const [email, setEmail] = useState("");

  return (
    <section className="px-8 py-24">
      <div className="site-frame">
        <div className={`
          grid gap-10 rounded-[1.75rem] p-8 editorial-panel
          lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:p-10
        `}>
          <div className="space-y-4">
            <div className="font-mono-tech text-[11px] tracking-[0.28em] text-primary uppercase">
              EDITORIAL NOTE
            </div>
            <h2 className={`
              font-serif text-4xl tracking-[-0.05em] text-foreground
              lg:text-5xl
            `}>
              订阅编辑部通讯
            </h2>
            <p className="max-w-xl text-base leading-7 text-muted">
              每周收到关于设计、工程和内容结构的简短更新。更像一封编辑部往来信，而不是营销邮件。
            </p>
            <p className="font-mono-tech text-[11px] tracking-[0.18em] text-muted uppercase">
              无垃圾邮件 · 可随时取消订阅
            </p>
          </div>

          <div className="space-y-5">
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                const form = event.currentTarget;

                if (!form.checkValidity()) {
                  form.reportValidity();
                  return;
                }

                const normalizedEmail = email.trim();

                if (normalizedEmail.length === 0) {
                  form.reportValidity();
                  return;
                }

                void NiceModal.show(SubscribeDialog, { email: normalizedEmail });
              }}
            >
              <label className="block space-y-2">
                <span className="font-mono-tech text-[11px] tracking-[0.18em] text-muted uppercase">
                  电子邮箱
                </span>
                <input
                  className={`
                    newsletter-input w-full rounded-full px-6 py-4 text-foreground
                    placeholder:text-muted
                  `}
                  autoComplete="email"
                  inputMode="email"
                  required
                  placeholder="your@email.com"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
              <button
                className={`
                  ${buttonVariants({ size: "lg", variant: "outline" })}
                  font-mono-tech w-full text-[11px] tracking-[0.18em] uppercase
                `}
                type="submit"
              >
                订阅通讯
              </button>
            </form>
            <div className={`
              border-t
              border-[color:var(--color-line-subtle)]
              pt-4 text-sm leading-7 text-muted
            `}>
              你会收到精选文章、项目更新和写作笔记，频率保持克制。
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
