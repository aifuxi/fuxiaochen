import Link from "next/link";

import { ConfiguredImage } from "@/components/frontend/configured-image";
import { Button } from "@/components/ui/button";
import { getPublicSettings } from "@/lib/settings/service";

export default async function HomePage() {
  const settings = await getPublicSettings();
  return (
    <main id="main-content" className="site-main site-home">
      <h1>{settings.title}</h1>
      {settings.subtitle && <p className="site-home-description">{settings.subtitle}</p>}
      <Button render={<Link href="/posts" />} nativeButton={false} variant="primary" size="sm">
        阅读文章
      </Button>
      <div className="site-profile">
        <ConfiguredImage src={settings.avatarUrl} size={56} profile />
        <div>
          <p className="site-profile-name">{settings.authorName}</p>
          {settings.authorRole && <p>{settings.authorRole}</p>}
        </div>
      </div>
    </main>
  );
}
