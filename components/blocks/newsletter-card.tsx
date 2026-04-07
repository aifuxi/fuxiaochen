"use client";

import NiceModal from "@ebay/nice-modal-react";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { SubscribeDialog } from "@/components/modals/subscribe-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterCard() {
  const [email, setEmail] = useState("");

  return (
    <section className="shell-container mt-16">
      <div className={`
        relative overflow-hidden rounded-[2.2rem] border border-primary/16 px-6 py-8 card-surface
        md:px-10
      `}>
        <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-primary/12 to-transparent" />
        <div className={`
          relative grid gap-8
          lg:grid-cols-[1.2fr_0.9fr] lg:items-center
        `}>
          <div className="space-y-4">
            <div className="type-label text-primary">Newsletter</div>
            <h2 className="font-serif text-5xl tracking-[-0.05em] text-balance">Writing notes, product fragments, and changelog drops.</h2>
            <p className="max-w-xl text-sm leading-6 text-muted">
              This is a mock flow for the first implementation pass. It demonstrates form styling, modal orchestration,
              and CTA behavior before real subscriber persistence exists.
            </p>
          </div>
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              toast.success("Captured locally for the mock flow.");
              void NiceModal.show(SubscribeDialog, { email });
            }}
          >
            <Input
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              value={email}
            />
            <Button className="w-full justify-center" type="submit">
              <Sparkles className="size-4" />
              Open confirmation flow
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
