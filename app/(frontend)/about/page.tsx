import { ConfiguredImage, SocialIcon } from "@/components/frontend/configured-image";
import { getPublicSettings } from "@/lib/settings/service";
export const metadata = { title: "关于" };
export default async function AboutPage() {
  const settings = await getPublicSettings();
  return (
    <main id="main-content" className="site-main site-reading">
      <header className="site-page-heading">
        <h1>关于</h1>
      </header>
      <section className="site-about">
        <ConfiguredImage src={settings.avatarUrl} size={80} profile />
        <h2>{settings.authorName}</h2>
        <p className="site-eyebrow">{settings.authorRole}</p>
        <p className="site-about-content">{settings.aboutMe}</p>
      </section>
      {settings.socials.length > 0 && (
        <nav className="site-socials" aria-label="联系博主">
          {settings.socials.map((s) => (
            <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer">
              <SocialIcon account={s} />
              <span>{s.label}</span>
            </a>
          ))}
        </nav>
      )}
    </main>
  );
}
