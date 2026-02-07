import Image from "next/image";
import { getChangelogsAction } from "@/app/actions/changelog";
import {
  BEI_AN_LINK,
  BEI_AN_NUMBER,
  GONG_AN_LINK,
  GONG_AN_NUMBER,
  WEBSITE,
} from "@/constants/info";

export async function NeonFooter() {
  const currentYear = new Date().getFullYear();

  const { data } = await getChangelogsAction({
    page: 1,
    pageSize: 1,
    order: "desc",
    sortBy: "createdAt",
  });

  const changelogs = data?.lists || [];

  const version = changelogs?.[0]?.version || "unknown";

  return (
    <footer className="relative mt-20 overflow-hidden border-t border-white/10 bg-black/50 py-12 backdrop-blur-md">
      {/* Decorative top line gradient */}
      <div
        className={`
          absolute top-0 right-0 left-0 h-px bg-gradient-to-r from-transparent via-neon-cyan/50 to-transparent
          opacity-50
        `}
      />

      <div className="mx-auto max-w-7xl space-y-4 px-4 text-center">
        <div
          className={`
            flex flex-col items-center justify-center gap-4 text-sm tracking-widest text-gray-500
            md:flex-row md:gap-8
          `}
        >
          <p>
            © {currentYear} {WEBSITE}.OS {version}
            <span className="mx-2 text-neon-cyan">//</span>
            系统在线
          </p>
        </div>

        {/* Filing Information */}
        <div
          className={`
            flex flex-col items-center justify-center gap-2 text-xs text-gray-600
            md:flex-row md:gap-6
          `}
        >
          <a
            href={BEI_AN_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              flex items-center gap-2 transition-colors duration-300
              hover:text-neon-cyan
            `}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-gray-600" />
            {BEI_AN_NUMBER}
          </a>
          <a
            href={GONG_AN_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              flex items-center gap-2 transition-colors duration-300
              hover:text-neon-cyan
            `}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-gray-600" />
            <Image
              src="/images/gongan.png"
              alt={GONG_AN_NUMBER}
              width={12}
              height={12}
            />
            {GONG_AN_NUMBER}
          </a>
        </div>
      </div>
    </footer>
  );
}
