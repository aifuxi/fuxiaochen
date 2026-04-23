type SiteStatusIllustrationProps = {
  code: "404" | "500";
  title: string;
};

export function SiteStatusIllustration({
  code,
  title,
}: SiteStatusIllustrationProps) {
  const accent = code === "500" ? "var(--destructive)" : "var(--chart-1)";
  const accentSoft =
    code === "500"
      ? "color-mix(in oklch, var(--destructive) 22%, transparent)"
      : "color-mix(in oklch, var(--chart-1) 22%, transparent)";

  return (
    <svg
      viewBox="0 0 640 520"
      role="img"
      aria-label={title}
      className="h-auto w-full"
    >
      <defs>
        <linearGradient id="status-surface" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="var(--card)" />
          <stop offset="100%" stopColor="var(--muted)" />
        </linearGradient>
        <linearGradient id="status-glow" x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stopColor={accentSoft} />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>

      <rect
        x="24"
        y="24"
        width="592"
        height="472"
        rx="36"
        fill="url(#status-surface)"
        stroke="var(--border)"
      />
      <rect
        x="52"
        y="52"
        width="536"
        height="416"
        rx="28"
        fill="var(--background)"
        stroke="var(--border)"
      />
      <path
        d="M52 132H588"
        stroke="var(--border)"
        strokeDasharray="5 10"
        strokeLinecap="round"
      />
      <path
        d="M52 308H588"
        stroke="var(--border)"
        strokeDasharray="5 10"
        strokeLinecap="round"
      />
      <path
        d="M196 52V468"
        stroke="var(--border)"
        strokeDasharray="5 10"
        strokeLinecap="round"
      />
      <path
        d="M444 52V468"
        stroke="var(--border)"
        strokeDasharray="5 10"
        strokeLinecap="round"
      />

      <rect
        x="88"
        y="90"
        width="232"
        height="128"
        rx="28"
        fill="var(--card)"
        stroke="var(--border)"
      />
      <rect
        x="114"
        y="118"
        width="102"
        height="10"
        rx="5"
        fill="var(--muted)"
      />
      <text
        x="114"
        y="192"
        fill="var(--foreground)"
        fontFamily="var(--font-mono)"
        fontSize="72"
        fontWeight="700"
        letterSpacing="-0.08em"
      >
        {code}
      </text>

      <rect
        x="354"
        y="88"
        width="190"
        height="94"
        rx="24"
        fill="var(--card)"
        stroke="var(--border)"
      />
      <rect
        x="382"
        y="116"
        width="74"
        height="10"
        rx="5"
        fill={accent}
        opacity="0.9"
      />
      <rect
        x="382"
        y="144"
        width="124"
        height="10"
        rx="5"
        fill="var(--muted)"
      />
      <circle cx="514" cy="134" r="12" fill={accentSoft} stroke={accent} />

      <rect
        x="94"
        y="266"
        width="450"
        height="148"
        rx="30"
        fill="var(--card)"
        stroke="var(--border)"
      />
      <path
        d="M132 360C176 330 198 290 240 290C292 290 300 376 354 376C408 376 412 314 472 314"
        fill="none"
        stroke={accent}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="10"
      />
      <circle
        cx="132"
        cy="360"
        r="11"
        fill="var(--background)"
        stroke={accent}
        strokeWidth="6"
      />
      <circle
        cx="240"
        cy="290"
        r="11"
        fill="var(--background)"
        stroke={accent}
        strokeWidth="6"
      />
      <circle
        cx="354"
        cy="376"
        r="11"
        fill="var(--background)"
        stroke={accent}
        strokeWidth="6"
      />
      <circle
        cx="472"
        cy="314"
        r="11"
        fill="var(--background)"
        stroke={accent}
        strokeWidth="6"
      />

      <rect
        x="126"
        y="292"
        width="98"
        height="12"
        rx="6"
        fill="url(#status-glow)"
      />
      <rect
        x="396"
        y="250"
        width="112"
        height="44"
        rx="22"
        fill="var(--muted)"
      />
      <rect
        x="396"
        y="250"
        width={code === "500" ? "54" : "68"}
        height="44"
        rx="22"
        fill={accent}
      />

      <rect
        x="442"
        y="346"
        width="120"
        height="82"
        rx="24"
        fill="var(--card)"
        stroke="var(--border)"
      />
      <path
        d="M470 378H534"
        stroke="var(--foreground)"
        strokeLinecap="round"
        strokeOpacity="0.24"
        strokeWidth="10"
      />
      <path
        d="M470 404H512"
        stroke={accent}
        strokeLinecap="round"
        strokeWidth="10"
      />
    </svg>
  );
}
