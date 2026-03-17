import Link from "next/link";
import {
  BEI_AN_NUMBER,
  BEI_AN_LINK,
  GONG_AN_NUMBER,
  GONG_AN_LINK,
} from "@/constants/info";

export function Footer() {
  return (
    <footer
      className="relative z-10 mt-12 py-10"
      style={{
        borderTop: "1px solid var(--border-subtle)",
        background: "oklch(0.07 0 0 / 0.5)",
      }}
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className={`
          flex flex-col items-center justify-between gap-6
          md:flex-row
        `}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.72rem",
              color: "var(--foreground-subtle)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            © {new Date().getFullYear()} FU XIAOCHEN · ALL RIGHTS RESERVED
            {BEI_AN_NUMBER && (
              <>
                {" · "}
                <a
                  href={BEI_AN_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`
                    transition-colors
                    hover:text-[var(--primary)]
                  `}
                  style={{ color: "var(--foreground-subtle)" }}
                >
                  {BEI_AN_NUMBER}
                </a>
              </>
            )}
            {GONG_AN_NUMBER && (
              <>
                {" · "}
                <a
                  href={GONG_AN_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`
                    transition-colors
                    hover:text-[var(--primary)]
                  `}
                  style={{ color: "var(--foreground-subtle)" }}
                >
                  {GONG_AN_NUMBER}
                </a>
              </>
            )}
          </div>
          <div
            className="flex items-center gap-8"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.72rem",
              color: "var(--foreground-subtle)",
            }}
          >
            <Link
              href="/"
              className={`
                uppercase transition-colors
                hover:text-[var(--primary)]
              `}
            >
              HOME
            </Link>
            <Link
              href="/blog"
              className={`
                uppercase transition-colors
                hover:text-[var(--primary)]
              `}
            >
              BLOG
            </Link>
            <Link
              href="/about"
              className={`
                uppercase transition-colors
                hover:text-[var(--primary)]
              `}
            >
              ABOUT
            </Link>
            <Link
              href="/changelog"
              className={`
                uppercase transition-colors
                hover:text-[var(--primary)]
              `}
            >
              CHANGELOG
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
