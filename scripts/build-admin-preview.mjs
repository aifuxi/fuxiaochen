import tailwind from "@tailwindcss/postcss";
import { build } from "esbuild";
import { execFile } from "node:child_process";
/**
 * 将后台交互预览打包为单个离线 HTML；不读取环境变量，不连接业务服务。
 * 用法：node scripts/build-admin-preview.mjs
 * 字体沿用已有设计工作台快照与 public 内资产，生成过程无需下载依赖。
 */
import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import postcss from "postcss";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "public/previews/admin-workspace.html");
const snapshot = await readFile(path.join(root, "design-spec.html"), "utf8");
const fonts = new Map();
for (const match of snapshot.matchAll(/<style>([\s\S]*?)<\/style>/g)) {
  postcss.parse(match[1]).walkAtRules("font-face", (rule) => {
    const values = Object.fromEntries(
      rule.nodes.filter((node) => node.type === "decl").map((node) => [node.prop, node.value]),
    );
    if (values["font-family"]?.includes("Source Sans Pro")) {
      const url = values.src?.match(/url\(["']?(data:[^"')]+)["']?\)/)?.[1];
      if (url) fonts.set(values["font-weight"] + ":" + values["font-style"], url);
    }
  });
}

const bundle = await build({
  absWorkingDir: root,
  entryPoints: ["previews/admin-preview.tsx"],
  bundle: true,
  minify: true,
  write: false,
  outfile: "admin-preview.js",
  platform: "browser",
  format: "iife",
  target: ["es2022"],
  define: { "process.env.NODE_ENV": '"production"' },
  loader: { ".avif": "dataurl" },
  legalComments: "inline",
  metafile: true,
});
const avatar =
  "data:image/avif;base64," +
  (await readFile(path.join(root, "public/avatar.avif"))).toString("base64");
const js = bundle.outputFiles
  .find((file) => file.path.endsWith(".js"))
  .text.replaceAll('"/avatar.avif"', JSON.stringify(avatar));
const componentCss = bundle.outputFiles.find((file) => file.path.endsWith(".css"))?.text ?? "";
const [globalCss, adminCss, workspaceCss, previewCss, sectionsCss] = await Promise.all(
  [
    "app/globals.css",
    "components/admin/admin.css",
    "components/admin/admin-data-workspace.css",
    "previews/admin-preview.css",
    "previews/admin-preview-sections.css",
  ].map((file) => readFile(path.join(root, file), "utf8")),
);
// 从当前共享样式编译，而非沿用历史快照的颜色和控件密度。
const compiled = await postcss([tailwind({ base: root, optimize: true })]).process(
  globalCss.replace("@theme {", "@theme static {") +
    "\n" +
    componentCss +
    "\n" +
    adminCss +
    "\n" +
    workspaceCss +
    "\n" +
    previewCss +
    "\n" +
    sectionsCss,
  { from: path.join(root, "app/globals.css"), map: false },
);
let css = compiled.css;
for (const match of css.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
  const url = match[1];
  if (url.startsWith("data:")) continue;
  let data;
  if (url.startsWith("https://cdn.jsdelivr.net/npm/@fontsource/source-sans-pro")) {
    const info = url.match(/-(\d+)-(normal|italic)\.woff2$/);
    data = info && fonts.get(info[1] + ":" + info[2]);
    if (!data) throw new Error("已有快照缺少字体：" + url);
  } else if (url.startsWith("/")) {
    const localPath = path.join(root, "public", url);
    const mime = url.endsWith(".svg") ? "image/svg+xml" : "font/ttf";
    data = "data:" + mime + ";base64," + (await readFile(localPath)).toString("base64");
  } else {
    throw new Error("预览存在未内嵌资源：" + url);
  }
  css = css.replaceAll(match[0], 'url("' + data + '")');
}
const interLicense = await readFile(path.join(root, "public/fonts/inter/OFL.txt"), "utf8");
const sourceLicense = snapshot.match(/Source Sans Pro 字体许可[\s\S]*?(?=-->)/)?.[0];
if (!sourceLicense) throw new Error("缺少 Source Sans Pro 字体许可");
const themeLicense = (await readFile(path.join(root, "app/semi-theme-tokens.css"), "utf8")).match(
  /^\/\*([\s\S]*?)\*\//,
)?.[1];
if (!themeLicense) throw new Error("缺少 Semi 视觉 token 的来源与 MIT 许可");
const favicon =
  "data:image/svg+xml;base64," +
  (await readFile(path.join(root, "public/logo.svg"))).toString("base64");

const html = [
  "<!DOCTYPE html>",
  '<html lang="zh-CN" data-theme="dark">',
  "<head>",
  '<meta charset="utf-8">',
  '<meta name="viewport" content="width=device-width, initial-scale=1">',
  '<meta name="robots" content="noindex,nofollow">',
  '<meta name="description" content="付小晨后台交互预览，遵循现行设计规范，全部操作使用内存中的示例数据。">',
  "<meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; font-src data:; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'\">",
  "<title>后台交互预览 · 付小晨</title>",
  '<link rel="icon" href="' + favicon + '">',
  // 使用独立的预览偏好；既不读取也不覆盖正式后台的主题状态。
  "<script>try{var t=localStorage.getItem('fuxiaochen-admin-preview-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch{}</script>",
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
  '<noscript><p style="padding:32px">这是可离线打开的后台交互预览，请启用 JavaScript。</p></noscript>',
  "<script>" + js.replaceAll("</script", "<\\/script") + "</script>",
  "</body></html>",
].join("\n");
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, html);
// 内嵌压缩 bundle 首次展开后需再规范缩进，最终 HTML 必须通过仓库格式检查。
for (let pass = 0; pass < 2; pass += 1) {
  await promisify(execFile)(path.join(root, "node_modules/.bin/oxfmt"), ["--write", output]);
}
console.log(
  JSON.stringify({
    output,
    bytes: (await readFile(output)).byteLength,
    embeddedSourceFonts: fonts.size,
    inputCount: Object.keys(bundle.metafile.inputs).length,
  }),
);
