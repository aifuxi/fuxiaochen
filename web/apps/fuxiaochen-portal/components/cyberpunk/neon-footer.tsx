import {
  BEI_AN_LINK,
  BEI_AN_NUMBER,
  GONG_AN_LINK,
  GONG_AN_NUMBER,
  WEBSITE,
} from "@/constants/info";

export function NeonFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 py-12 mt-20 bg-black/50 backdrop-blur-md relative overflow-hidden">
      {/* Decorative top line gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-cyan/50 to-transparent opacity-50" />

      <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-sm font-mono tracking-widest text-gray-500">
          <p>
            © {currentYear} {WEBSITE}.OS{" "}
            <span className="text-neon-cyan">//</span> SYSTEM ONLINE 系统在线
          </p>
        </div>

        {/* Filing Information */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6 text-xs text-gray-600">
          <a
            href={BEI_AN_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-neon-cyan transition-colors duration-300 flex items-center gap-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gray-600" />
            {BEI_AN_NUMBER}
          </a>
          <a
            href={GONG_AN_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-neon-cyan transition-colors duration-300 flex items-center gap-2"
          >
            {/* Police Icon placeholder or just text */}
            <span className="w-1.5 h-1.5 rounded-full bg-gray-600" />
            {GONG_AN_NUMBER}
          </a>
        </div>
      </div>
    </footer>
  );
}
