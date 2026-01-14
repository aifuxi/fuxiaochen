import Link from "next/link";

export function NeonHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-4 py-6">
      <nav className="glass-panel mx-auto max-w-7xl rounded-full px-8 py-4 flex items-center justify-between shadow-[0_0_20px_rgba(0,0,0,0.5)]">
        <div className="text-xl md:text-2xl font-bold text-neon-cyan tracking-widest uppercase flex items-center gap-2">
          <span className="w-2 h-2 bg-neon-magenta rounded-full animate-pulse" />
          Portal<span className="text-neon-magenta">.OS</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium tracking-wide">
          <Link
            href="/"
            className="text-gray-300 hover:text-neon-cyan transition-colors duration-300"
          >
            Home
          </Link>
          <Link
            href="/blog"
            className="text-gray-300 hover:text-neon-cyan transition-colors duration-300"
          >
            Blog
          </Link>
          <Link
            href="/changelog"
            className="text-gray-300 hover:text-neon-cyan transition-colors duration-300"
          >
            Changelog
          </Link>
          <Link
            href="/about"
            className="text-gray-300 hover:text-neon-cyan transition-colors duration-300"
          >
            About
          </Link>
        </div>
        <button className="hidden md:block px-6 py-2 border border-neon-purple text-neon-purple rounded-full hover:bg-neon-purple/20 transition-all duration-300 text-xs font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(123,97,255,0.2)] hover:shadow-[0_0_20px_rgba(123,97,255,0.4)]">
          Connect
        </button>
      </nav>
    </header>
  );
}
