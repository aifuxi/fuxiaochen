import { WEBSITE, BEI_AN_NUMBER, BEI_AN_LINK, GONG_AN_NUMBER, GONG_AN_LINK } from "@/constants/info";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className={`
          flex flex-col items-center justify-between gap-6
          md:flex-row
        `}>
          <div className={`
            text-center
            md:text-left
          `}>
            <p className="text-sm text-[var(--text-color-secondary)]">
              © {currentYear} {WEBSITE}. All rights reserved.
            </p>
          </div>

          <div className={`
            flex flex-col items-center gap-4 text-xs text-[var(--text-color-secondary)]
            md:flex-row md:gap-8
          `}>
            <a
              href={BEI_AN_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className={`
                transition-colors
                hover:text-[var(--accent-color)]
              `}
            >
              {BEI_AN_NUMBER}
            </a>
            <a
              href={GONG_AN_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className={`
                transition-colors
                hover:text-[var(--accent-color)]
              `}
            >
              {GONG_AN_NUMBER}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
