import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getPublicSettings } from "@/lib/settings/service";

export default async function HomePage() {
  const settings = await getPublicSettings();
  return (
    <main id="main-content" className="site-main site-home">
      <section className="site-intro">
        <p className="site-eyebrow">{settings.authorRole}</p>
        <h1>{settings.title}</h1>
        <p>{settings.subtitle}</p>
      </section>
      <Button render={<Link href="/posts" />} nativeButton={false} variant="primary">
        阅读文章
      </Button>
    </main>
  );
}
