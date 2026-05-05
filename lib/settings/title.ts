import type {
  SiteSeoPage,
  SiteSeoPageKey,
  SiteSettings,
} from "@/lib/settings/types";

export const DEFAULT_TITLE_SEPARATOR = "|";
export const TITLE_SEPARATOR_MAX_LENGTH = 8;

const LEGACY_TITLE_SEPARATORS = ["|", "-", "–", "—", "·", "•", "｜"] as const;

const escapeRegExp = (value: string) =>
  value.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&");

const uniqueSeparators = (separator: string) =>
  Array.from(
    new Set([normalizeTitleSeparator(separator), ...LEGACY_TITLE_SEPARATORS]),
  );

export function normalizeTitleSeparator(value: string | null | undefined) {
  const separator = value?.trim() ?? "";

  return separator.length > 0
    ? separator.slice(0, TITLE_SEPARATOR_MAX_LENGTH)
    : DEFAULT_TITLE_SEPARATOR;
}

export function normalizeTitleBase(
  title: string,
  siteName: string,
  titleSeparator: string | null | undefined,
) {
  const originalTitle = title.trim();
  const normalizedSiteName = siteName.trim();

  if (!originalTitle || !normalizedSiteName) {
    return originalTitle || normalizedSiteName;
  }

  let normalizedTitle = originalTitle;

  for (const separator of uniqueSeparators(
    normalizeTitleSeparator(titleSeparator),
  )) {
    const escapedSeparator = escapeRegExp(separator);
    const escapedSiteName = escapeRegExp(normalizedSiteName);

    normalizedTitle = normalizedTitle
      .replace(
        new RegExp(`\\s*${escapedSeparator}\\s*${escapedSiteName}\\s*$`, "i"),
        "",
      )
      .replace(
        new RegExp(`^\\s*${escapedSiteName}\\s*${escapedSeparator}\\s*`, "i"),
        "",
      )
      .trim();
  }

  return normalizedTitle || originalTitle;
}

export function buildTitleTemplate(settings: SiteSettings) {
  const separator = normalizeTitleSeparator(settings.seo.titleSeparator);

  return `%s ${separator} ${settings.general.siteName.trim()}`;
}

export function buildFullTitle(
  settings: SiteSettings,
  title = settings.seo.defaultTitle,
) {
  const siteName = settings.general.siteName.trim();
  const separator = normalizeTitleSeparator(settings.seo.titleSeparator);
  const baseTitle = normalizeTitleBase(title, siteName, separator);

  if (!baseTitle || baseTitle.toLowerCase() === siteName.toLowerCase()) {
    return siteName;
  }

  return `${baseTitle} ${separator} ${siteName}`;
}

export function buildTitleMetadata(
  settings: SiteSettings,
  defaultTitle = settings.seo.defaultTitle,
) {
  return {
    default: buildFullTitle(settings, defaultTitle),
    template: buildTitleTemplate(settings),
  };
}

export function getSeoPageMetadata(
  settings: SiteSettings,
  key: SiteSeoPageKey,
): SiteSeoPage {
  const page = settings.seo.pages[key];

  return {
    ...page,
    title: normalizeTitleBase(
      page.title,
      settings.general.siteName,
      settings.seo.titleSeparator,
    ),
  };
}

export function normalizeSiteSettingsTitles(settings: SiteSettings) {
  const titleSeparator = normalizeTitleSeparator(settings.seo.titleSeparator);
  const siteName = settings.general.siteName;
  const pages = Object.fromEntries(
    Object.entries(settings.seo.pages).map(([key, page]) => [
      key,
      {
        ...page,
        title: normalizeTitleBase(page.title, siteName, titleSeparator),
      },
    ]),
  ) as Record<SiteSeoPageKey, SiteSeoPage>;

  return {
    ...settings,
    seo: {
      ...settings.seo,
      titleSeparator,
      defaultTitle: normalizeTitleBase(
        settings.seo.defaultTitle,
        siteName,
        titleSeparator,
      ),
      pages,
    },
  };
}
