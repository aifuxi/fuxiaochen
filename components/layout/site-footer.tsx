export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-white/8 px-8">
      <div className={`
        site-frame flex flex-col gap-6 py-10
        md:flex-row md:items-end md:justify-between
      `}>
        <div className="space-y-2">
          <div className="font-serif text-2xl tracking-[-0.04em] text-foreground">Alex Chen</div>
          <p className="max-w-md text-sm leading-6 text-muted">
            Design systems, web engineering, and long-form notes on building calmer interfaces.
          </p>
        </div>

        <div className="font-mono-tech text-[11px] tracking-[0.18em] text-muted uppercase">© 2026 Alex Chen</div>
      </div>
    </footer>
  );
}
