import { Badge } from "@/components/ui/badge";

type PageIntroProps = {
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  action?: React.ReactNode;
};

export function PageIntro({ action, description, eyebrow, title }: PageIntroProps) {
  return (
    <section className="relative px-8 pt-32 pb-16">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-4xl">
          <Badge className={`
            font-mono-tech text-primary-accent mb-4 w-fit border-0 bg-transparent px-0 text-xs tracking-widest uppercase
          `} variant="primary">
            {eyebrow}
          </Badge>
          <h1 className={`
            mb-6 font-serif text-5xl tracking-tighter
            lg:text-6xl
          `} style={{ lineHeight: 0.95 }}>
            {title}
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-muted">{description}</p>
          {action ? <div className="mt-8">{action}</div> : null}
        </div>
      </div>
    </section>
  );
}
