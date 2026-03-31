import { PageHero } from "@/components/shared/page-hero";
import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className={`
      container-shell space-y-10 py-10
      md:py-14
    `}>
      <PageHero
        badge="About"
        eyebrow="Profile"
        title="About page scaffolded in the site route group."
        description="This route is intentionally lean: shell, hero and content surface first; biography, timeline and philosophy sections can now be layered in without changing structure."
      />
      <Card>
        <CardContent className="max-w-3xl space-y-5 p-0">
          <p className="prose-muted">
            The design draft describes an editorial profile page with a spotlight
            card, structured biography and high-contrast typography. The scaffold
            now exists in the correct route group and can absorb those sections as
            standalone components.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
