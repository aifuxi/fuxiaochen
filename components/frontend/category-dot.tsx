export function CategoryDot({ color }: { color: string }) {
  const backgroundColor = /^#[0-9a-fA-F]{6}$/.test(color) ? color : "var(--color-muted)";
  return (
    <span
      aria-hidden="true"
      className="site-category-dot inline-block size-2 shrink-0 rounded-full border border-[var(--color-subtle)]"
      style={{ backgroundColor }}
    />
  );
}
