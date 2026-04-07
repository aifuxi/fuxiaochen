import { PageIntro } from "@/components/blocks/page-intro";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <>
      <PageIntro
        description="This route mirrors the personality of the design system: literary typography, technical discipline, and surfaces that feel intentionally composed."
        eyebrow="About"
        title="Designing a blog and CMS as one coherent product."
      />
      <section className={`
        shell-container grid gap-5
        lg:grid-cols-[0.8fr_1.2fr]
      `}>
        <Card className="space-y-5">
          <Avatar alt="Fuxiaochen" className="size-20 rounded-[1.75rem]" fallback="FC" src="/images/gongan.png" />
          <div className="space-y-3">
            <h2 className="font-serif text-4xl tracking-[-0.05em]">Fuxiaochen</h2>
            <p className="text-sm leading-6 text-muted">
              Building a personal publishing stack with the same care usually reserved for product marketing sites.
            </p>
          </div>
        </Card>
        <Card className="space-y-4">
          <div className="type-label">Approach</div>
          <p className="text-base leading-8 text-muted">
            The system pairs a quiet, serif-heavy public experience with a more operational CMS surface. Both are built
            from the same token set, which keeps the product coherent as more features arrive.
          </p>
          <p className="text-base leading-8 text-muted">
            This first implementation pass focuses on interaction foundations, page shells, and reusable components. Data
            persistence, auth integration, and editorial workflows can layer on top without revisiting the visual system.
          </p>
        </Card>
      </section>
    </>
  );
}
