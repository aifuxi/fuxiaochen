const PUBLIC_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function computeReadTimeMinutes(content: string) {
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  return Math.max(1, Math.ceil(wordCount / 200));
}

export function formatPublicDate(date: Date) {
  return PUBLIC_DATE_FORMATTER.format(date);
}

export function formatIsoDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function normalizeNullableString(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
