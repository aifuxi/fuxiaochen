import { DesignSystemShowcase } from "@/components/blocks/design-system-showcase";
import { PageIntro } from "@/components/blocks/page-intro";

export default function DesignSpecPage() {
  return (
    <>
      <PageIntro
        description="The canonical reference for tokens, component primitives, and interactive patterns implemented in this repository."
        eyebrow="Design Spec"
        title="Chen Serif tokens, controls, and interaction patterns."
      />
      <section className="shell-container">
        <DesignSystemShowcase />
      </section>
    </>
  );
}
