export function adminPostReturnTo(value: string | null) {
  if (!value || /[\\\r\n]/.test(value)) return "/admin/posts";
  try {
    const url = new URL(value, "https://admin.invalid");
    return url.origin === "https://admin.invalid" && url.pathname === "/admin/posts"
      ? url.pathname + url.search
      : "/admin/posts";
  } catch {
    return "/admin/posts";
  }
}
