import tailwind from "@tailwindcss/postcss";
import { build } from "esbuild";
import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import postcss from "postcss";

/**
 * 将前台交互预览打包为单个离线 HTML；不读取环境配置，不连接数据库或业务服务。
 * 用法：node scripts/build-frontend-preview.mjs
 * 使用现有设计规范、依赖和本地资产，缺少任意资源时明确失败，不回退到网络地址。
 */
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "public/previews/frontend.html");
const execute = promisify(execFile);

async function readRequired(relativePath, encoding) {
  try {
    return await readFile(path.join(root, relativePath), encoding);
  } catch (error) {
    throw new Error("前台预览缺少或无法读取资源：" + relativePath, { cause: error });
  }
}

const mimeTypes = {
  ".avif": "image/avif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
};

async function embedFile(relativePath) {
  const mime = mimeTypes[path.extname(relativePath).toLowerCase()];
  if (!mime) throw new Error("前台预览无法识别资源格式：" + relativePath);
  return "data:" + mime + ";base64," + (await readRequired(relativePath)).toString("base64");
}

const [snapshot, globalCss, articleCss, previewCss, sectionsCss, interLicense, themeSource] =
  await Promise.all(
    [
      "design-spec.html",
      "app/globals.css",
      "app/article-prose.css",
      "previews/frontend-preview.css",
      "previews/frontend-sections.css",
      "public/fonts/inter/OFL.txt",
      "app/semi-theme-tokens.css",
    ].map((file) => readRequired(file, "utf8")),
  );

// 只从快照提取已内嵌的字体文件；颜色和控件尺寸始终编译当前共享样式。
const sourceFonts = new Map();
for (const match of snapshot.matchAll(/<style(?:\s[^>]*)?>([\s\S]*?)<\/style>/g)) {
  postcss.parse(match[1]).walkAtRules("font-face", (rule) => {
    const declarations = Object.fromEntries(
      rule.nodes.filter((node) => node.type === "decl").map((node) => [node.prop, node.value]),
    );
    if (!declarations["font-family"]?.includes("Source Sans Pro")) return;
    const url = declarations.src?.match(/url\(["']?(data:[^"')]+)["']?\)/)?.[1];
    if (url) {
      sourceFonts.set(declarations["font-weight"] + ":" + declarations["font-style"], url);
    }
  });
}
if (sourceFonts.size === 0) throw new Error("设计规范快照缺少 Source Sans Pro 内嵌字体");

const assets = new Map(
  await Promise.all(
    [
      ["/avatar.avif", "public/avatar.avif"],
      ["/frontend-hero.webp", "previews/assets/writing-hero.webp"],
      ["/frontend-article.webp", "previews/assets/article-illustration.webp"],
    ].map(async ([reference, file]) => [reference, await embedFile(file)]),
  ),
);

const bundle = await build({
  absWorkingDir: root,
  entryPoints: ["previews/frontend-preview.tsx"],
  bundle: true,
  minify: true,
  write: false,
  outfile: "frontend-preview.js",
  platform: "browser",
  format: "iife",
  target: ["es2022"],
  define: { "process.env.NODE_ENV": '"production"' },
  loader: { ".avif": "dataurl", ".webp": "dataurl" },
  legalComments: "inline",
  metafile: true,
});
let js = bundle.outputFiles.find((file) => file.path.endsWith(".js"))?.text;
if (!js) throw new Error("前台预览未生成 JavaScript bundle");
for (const [reference, data] of assets) {
  const literal = JSON.stringify(reference);
  if (!js.includes(literal)) throw new Error("前台预览未使用预期图片：" + reference);
  js = js.replaceAll(literal, JSON.stringify(data));
}
const componentCss = bundle.outputFiles.find((file) => file.path.endsWith(".css"))?.text ?? "";
// globals.css 已导入正文样式，这里显式汇总时移除该 import，避免重复编译同一规则。
const sharedCss = globalCss
  .replace(/@import\s+["']\.\/article-prose\.css["'];\s*/, "")
  .replace("@theme {", "@theme static {");
const compiled = await postcss([tailwind({ base: root, optimize: true })]).process(
  [sharedCss, articleCss, componentCss, previewCss, sectionsCss].join("\n"),
  { from: path.join(root, "app/globals.css"), map: false },
);
let css = compiled.css;
for (const match of css.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
  const url = match[1];
  if (url.startsWith("data:")) continue;
  let data;
  if (url.startsWith("https://cdn.jsdelivr.net/npm/@fontsource/source-sans-pro")) {
    const info = url.match(/-(\d+)-(normal|italic)\.woff2$/);
    data = info && sourceFonts.get(info[1] + ":" + info[2]);
    if (!data) throw new Error("设计规范快照缺少 Source Sans Pro 字体：" + url);
  } else if (url.startsWith("/") && !url.startsWith("//")) {
    // 包括 Inter 和共享鼠标资产；规范中的公共路径均转为内嵌资源。
    const file = path.posix.normalize(url).replace(/^\/+/, "");
    data = await embedFile("public/" + file);
  } else {
    throw new Error("前台预览存在未内嵌 CSS 资源：" + url);
  }
  css = css.replaceAll(match[0], 'url("' + data + '")');
}
if (/@import\b/.test(css)) throw new Error("前台预览仍包含未解析的 CSS import");

const sourceLicense = snapshot.match(/Source Sans Pro 字体许可[\s\S]*?(?=-->)/)?.[0];
if (!sourceLicense) throw new Error("设计规范快照缺少 Source Sans Pro 字体许可");
const themeLicense = themeSource.match(/^\/\*([\s\S]*?)\*\//)?.[1];
if (!themeLicense) throw new Error("共享样式缺少 Semi token 来源与 MIT 许可");
const favicon = await embedFile("public/logo.svg");
const html = [
  "<!DOCTYPE html>",
  '<html lang="zh-CN" data-theme="dark">',
  "<head>",
  '<meta charset="utf-8">',
  '<meta name="viewport" content="width=device-width, initial-scale=1">',
  '<meta name="robots" content="noindex,nofollow">',
  '<meta name="description" content="付小晨前台重构交互预览，全部内容为内存示例，可离线打开。">',
  "<meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; font-src data:; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'\">",
  "<title>前台重构预览 · 付小晨</title>",
  '<link rel="icon" href="' + favicon + '">',
  // 预览偏好与正式站点隔离；file:// 不支持存储时仍按默认深色正常展示。
  "<script>try{var t=localStorage.getItem('fuxiaochen-frontend-preview-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch{}</script>",
  "<!-- 字体及第三方许可：\n" +
    themeLicense.trimEnd() +
    "\n" +
    sourceLicense +
    "\nInter:\n" +
    interLicense +
    "\n-->",
  "<style>" + css.replaceAll("</style", "<\\/style") + "</style>",
  "</head>",
  '<body><div id="preview-root"></div>',
  '<noscript><p style="padding:32px">这是可离线打开的前台交互预览，请启用 JavaScript。</p></noscript>',
  "<script>" + js.replaceAll("</script", "<\\/script") + "</script>",
  "</body></html>",
].join("\n");

// 不扫描许可证和外链导航文字，只拒绝会在打开页面时加载的外部 HTML 资源。
for (const match of html.matchAll(/<(?:script|link|img|iframe|source|audio|video)\b[^>]*>/gi)) {
  const tag = match[0];
  for (const attribute of tag.matchAll(/\b(?:src|href|poster)\s*=\s*["']([^"']+)["']/gi)) {
    if (!attribute[1].startsWith("data:")) {
      throw new Error("前台预览存在未内嵌 HTML 资源：" + attribute[1]);
    }
  }
}
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, html);
// 压缩 bundle 首次展开后需再规范缩进，与现有后台离线预览构建方式一致。
for (let pass = 0; pass < 2; pass += 1) {
  await execute(path.join(root, "node_modules/.bin/oxfmt"), ["--write", output]);
}
console.log(
  JSON.stringify({
    output,
    bytes: (await readFile(output)).byteLength,
    embeddedSourceFonts: sourceFonts.size,
    embeddedImages: assets.size,
    inputCount: Object.keys(bundle.metafile.inputs).length,
  }),
);
