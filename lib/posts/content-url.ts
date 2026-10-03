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
    // 用固定基准解析相对路径和锚点，再统一检查协议白名单。
    const url = new URL(value, "https://article.invalid");
    return (image ? ["https:", "http:"] : ["https:", "http:", "mailto:", "tel:"]).includes(
      url.protocol,
    );
  } catch {
    return false;
  }
}
