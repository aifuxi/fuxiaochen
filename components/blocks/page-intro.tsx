import { Badge } from "@/components/ui/badge";

type PageIntroProps = {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function PageIntro({ action, description, eyebrow, title }: PageIntroProps) {
  return (
    <section className="shell-container mb-14">
      <div className={`
        relative overflow-hidden rounded-[2.2rem] border border-white/8 px-6 py-8 card-surface
        md:px-10 md:py-12
      `}>
        <div className="absolute inset-0 grid-frost opacity-25" />
        <div className={`
          relative flex flex-col gap-8
          lg:flex-row lg:items-end lg:justify-between
        `}>
          <div className="max-w-3xl space-y-4">
            <Badge className="w-fit" variant="primary">
              {eyebrow}
            </Badge>
            <h1 className="font-serif text-6xl tracking-[-0.06em] text-balance">{title}</h1>
            <p className="max-w-2xl text-base leading-7 text-muted">{description}</p>
          </div>
          {action ? <div className="relative">{action}</div> : null}
        </div>
      </div>
    </section>
  );
}
