export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-white/5 px-8 py-12">
      <div
        className={`
          mx-auto flex max-w-7xl flex-col items-center justify-between gap-6
          md:flex-row
        `}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
            <span className="font-mono-tech text-xs font-bold text-black">
              AC
            </span>
          </div>
          <span className="font-mono-tech text-xs text-muted">Alex Chen</span>
        </div>

        <span className="font-mono-tech text-xs text-white/40">
          © 2024 Alex Chen. 保留所有权利。
        </span>
      </div>
    </footer>
  );
}
