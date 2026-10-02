export function safeContentUrl(value: string, image = false) {
  if (
    !value ||
    Array.from(value).some((character) => {
      const code = character.charCodeAt(0);
      return code <= 32 || code === 127 || character === "\\";
    })
  )
    return false;
  try {
    // 相对路径与旧 Markdown 一致；协议仍须在白名单内。
    const url = new URL(value, "https://article.invalid");
    return (image ? ["https:", "http:"] : ["https:", "http:", "mailto:", "tel:"]).includes(
      url.protocol,
    );
  } catch {
    return false;
  }
}
