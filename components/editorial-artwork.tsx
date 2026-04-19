import { cn } from "@/lib/utils";

type ArtworkProps = {
  className?: string;
};

export function TopographyArtwork({ className }: ArtworkProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden rounded-panel bg-surface-2",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(166,206,207,0.18),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(73,110,111,0.22),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0))]" />
      <svg
        viewBox="0 0 800 500"
        className="absolute inset-0 h-full w-full opacity-80"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="ridge" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a6cecf" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#486e6f" stopOpacity="0.08" />
          </linearGradient>
        </defs>
        {Array.from({ length: 11 }).map((_, index) => {
          const offset = 210 + index * 18;
          const opacity = 0.55 - index * 0.035;
          return (
            <path
              key={offset}
              d={`M-20 ${offset} C 70 ${offset - 90}, 120 ${offset + 50}, 210 ${offset - 28} S 360 ${offset + 20}, 470 ${offset - 70} S 620 ${offset + 32}, 820 ${offset - 12} L 820 520 L -20 520 Z`}
              fill="url(#ridge)"
              opacity={opacity}
            />
          );
        })}
      </svg>
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-canvas via-canvas/70 to-transparent" />
    </div>
  );
}

export function LightBeamArtwork({ className }: ArtworkProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden rounded-panel bg-[linear-gradient(180deg,#111,#080808)]",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(255,255,255,0.12),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.04),transparent_40%)]" />
      <div className="absolute top-[-20%] left-[48%] h-[140%] w-[18%] -rotate-[8deg] bg-[linear-gradient(180deg,rgba(255,255,255,0.65),rgba(255,255,255,0.12),transparent_78%)] blur-[2px]" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-canvas via-canvas/60 to-transparent" />
      <div className="absolute top-0 left-[26%] h-full w-px bg-white/6" />
      <div className="absolute top-0 right-[23%] h-full w-px bg-white/4" />
    </div>
  );
}

export function PortraitArtwork({ className }: ArtworkProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden rounded-panel bg-surface-2",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_26%),linear-gradient(140deg,rgba(255,255,255,0.08),transparent_38%),linear-gradient(180deg,#191919,#0b0b0b)]" />
      <div className="absolute top-[18%] right-[10%] h-[58%] w-[48%] rounded-[45%] bg-[linear-gradient(180deg,rgba(255,255,255,0.24),rgba(255,255,255,0.08))] blur-[1px]" />
      <div className="absolute top-[27%] right-[18%] h-[34%] w-[28%] rounded-[46%] bg-[linear-gradient(180deg,rgba(255,255,255,0.45),rgba(255,255,255,0.12))]" />
      <div className="absolute top-[48%] right-[17%] h-[40%] w-[33%] rounded-t-[48%] rounded-b-[18%] bg-[linear-gradient(180deg,rgba(255,255,255,0.2),rgba(255,255,255,0.06))]" />
      <div className="absolute top-[22%] right-[12%] h-[10%] w-[18%] rounded-full bg-black/25 blur-xl" />
      <div className="absolute bottom-[10%] left-[8%] h-20 w-40 rounded-full bg-brand-strong/12 blur-3xl" />
    </div>
  );
}

export function HaloGlyph({ className }: ArtworkProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-surface-3",
        className,
      )}
    >
      <div className="absolute h-24 w-24 rounded-full border border-brand/20" />
      <div className="absolute h-12 w-12 rounded-full border border-brand/30" />
      <div className="h-3 w-3 rounded-full bg-brand/80 shadow-[0_0_28px_rgba(166,206,207,0.3)]" />
    </div>
  );
}
