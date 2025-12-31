/** 代码来自 https://github.com/fx1422/semi-theme-vite-plugin/blob/master/src/index.ts
 * 做了一些修改，使其能适配 @douyinfe/semi-ui-19
 */

import * as FS from "fs";
import { platform } from "os";
import * as Path from "path";
import type { Importer } from "sass";
import { compileString, Logger } from "sass";
import { pathToFileURL } from "url";
// 使用更灵活的类型定义避免版本冲突
interface VitePlugin {
  name: string;
  enforce?: "pre" | "post";
  load?: (
    id: string
  ) => string | null | undefined | Promise<string | null | undefined>;
  [key: string]: unknown;
}

// 定义插件选项接口
export interface SemiPluginOptions {
  theme: string;
  options?: {
    prefixCls?: string;
    variables?: Record<string, string | number>;
    include?: string;
  };
}

// 定义 loader 函数的选项接口
interface LoaderOptions {
  name?: string;
  prefixCls?: string;
  variables?: string;
  include?: string;
}

/**
 * Semi Design 主题插件
 *
 * 1. 解析 css 到对应 scss
 * 2. 替换 scss 内容
 * 3. 再构建成对应的 css
 */
export default function SemiPlugin({
  theme,
  options = {},
}: SemiPluginOptions): VitePlugin {
  return {
    name: "semi-theme",
    enforce: "post",
    load(id: string): string | null | undefined {
      const filePath = normalizePath(id);
      if (options.include) {
        options.include = normalizePath(options.include);
      }

      // https://github.com/DouyinFE/semi-design/blob/main/packages/semi-webpack/src/semi-webpack-plugin.ts#L83
      if (
        // ** 这里需要匹配到 @douyinfe/semi-ui-19，才能正确加载主题 **
        /@douyinfe\/semi-(ui|ui-19|icons|foundation)\/lib\/.+\.css$/.test(
          filePath
        )
      ) {
        const scssFilePath = filePath.replace(/\.css$/, ".scss");

        // 目前只有 name
        // https://github.com/DouyinFE/semi-design/blob/04d17a72846dfb5452801a556b6e01f9b0e8eb9d/packages/semi-webpack/src/semi-webpack-plugin.ts#L23
        const semiSemiLoaderOptions = { name: theme };

        try {
          const result = compileString(
            // TODO (boen): 未解析 file query
            loader(FS.readFileSync(scssFilePath), {
              ...semiSemiLoaderOptions,
              ...options,
              variables: convertMapToString(options.variables ?? {}),
            }),
            {
              importers: [
                {
                  findFileUrl(url: string) {
                    if (url.startsWith("~")) {
                      // 移除 ~ 符号并解析 node_modules 路径
                      const packagePath = url.substring(1);

                      // 从当前文件路径向上查找 node_modules
                      let currentDir = Path.dirname(scssFilePath);
                      while (currentDir !== Path.dirname(currentDir)) {
                        const nodeModulesPath = Path.join(
                          currentDir,
                          "node_modules",
                          packagePath
                        );
                        if (FS.existsSync(nodeModulesPath)) {
                          return pathToFileURL(nodeModulesPath);
                        }
                        currentDir = Path.dirname(currentDir);
                      }

                      // 如果没找到，尝试从项目根目录查找
                      const projectRoot = process.cwd();
                      const rootNodeModulesPath = Path.join(
                        projectRoot,
                        "node_modules",
                        packagePath
                      );
                      if (FS.existsSync(rootNodeModulesPath)) {
                        return pathToFileURL(rootNodeModulesPath);
                      }

                      return null;
                    }

                    const resolvedFilePath = Path.resolve(
                      Path.dirname(scssFilePath),
                      url
                    );

                    if (FS.existsSync(resolvedFilePath)) {
                      return pathToFileURL(resolvedFilePath);
                    }

                    return null;
                  },
                } as unknown as Importer,
              ],
              logger: Logger.silent,
            }
          );
          return result.css;
        } catch (error) {
          console.error("Semi theme plugin compilation error:", error);
          return null;
        }
      }
    },
  };
}

// copy from https://github.com/DouyinFE/semi-design/blob/main/packages/semi-webpack/src/semi-theme-loader.ts
function loader(source: Buffer, options: LoaderOptions): string {
  let fileStr = source.toString("utf8");

  const theme = options.name ?? "@douyinfe/semi-theme-default";
  // always inject
  const scssVarStr = `@import "~${theme}/scss/index.scss";\n`;
  // inject once
  const cssVarStr = `@import "~${theme}/scss/global.scss";\n`;
  // [vite-plugin]: sync from https://github.com/DouyinFE/semi-design/commit/a6064489a683495a737cbe7abd72c0b49a3bcd06
  let animationStr = `@import "~${theme}/scss/animation.scss";\n`;

  try {
    // 在 ES modules 环境中，我们需要使用动态导入或其他方式来检查模块是否存在
    // 这里我们简化处理，假设 animation.scss 存在
    // require.resolve(`${theme}/scss/animation.scss`);
  } catch {
    animationStr = ""; // fallback to empty string
  }

  const shouldInject = fileStr.includes("semi-base");

  let componentVariables: string | undefined;

  try {
    // 在 TypeScript/ES modules 环境中，我们需要替代 resolve.sync 的实现
    // 这里简化处理，假设 local.scss 不存在
    // componentVariables = resolve.sync(this.context, `${theme}/scss/local.scss`);
  } catch {
    // ignore error
  }

  if (options.include || options.variables || componentVariables) {
    let localImport = "";
    if (componentVariables) {
      localImport += `\n@import "~${theme}/scss/local.scss";`;
    }
    if (options.include) {
      localImport += `\n@import "${options.include}";`;
    }
    if (options.variables) {
      localImport += `\n${options.variables}`;
    }
    try {
      const regex =
        /(@import '.\/variables.scss';?|@import ".\/variables.scss";?)/g;
      const fileSplit = fileStr.split(regex).filter((item) => Boolean(item));
      if (fileSplit.length > 1) {
        fileSplit.splice(fileSplit.length - 1, 0, localImport);
        fileStr = fileSplit.join("");
      }
    } catch {
      // ignore error
    }
  }

  // inject prefix
  const prefixCls = options.prefixCls ?? "semi";

  const prefixClsStr = `$prefix: '${prefixCls}';\n`;

  if (shouldInject) {
    return `${animationStr}${cssVarStr}${scssVarStr}${prefixClsStr}${fileStr}`;
  } else {
    return `${scssVarStr}${prefixClsStr}${fileStr}`;
  }
}

// copy from https://github.com/DouyinFE/semi-design/blob/main/packages/semi-webpack/src/semi-webpack-plugin.ts#L136
function convertMapToString(map: Record<string, string | number>): string {
  return Object.keys(map).reduce(function (prev, curr) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    return prev + `${curr}: ${map[curr]};\n`;
  }, "");
}

function normalizePath(id: string): string {
  return Path.posix.normalize(
    platform() === "win32" ? id.replace(/\\/g, "/") : id
  );
}

// 导出类型（避免重复导出）
export type { SemiPluginOptions as SemiThemePluginOptions };
