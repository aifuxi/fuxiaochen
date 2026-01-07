import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig, loadEnv } from "vite";

// 导入 ES 模块的路径解析方法
import semiThemePlugin from "./src/semi-theme-plugin";

// 1. 生成当前文件的绝对路径（替代 __dirname）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  console.log("加载的环境变量：", env); // 打印验证！

  return {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    plugins: [
      react({
        babel: {
          plugins: [["babel-plugin-react-compiler"]],
        },
      }),

      tailwindcss(),
      semiThemePlugin({
        theme: "@semi-bot/semi-theme-fgo",
      }),
    ],

    server: {
      // 代理配置
      proxy: {
        // 匹配以 /api 开头的请求（前端请求路径）
        "/api": {
          target: env.VITE_API_BASE_URL, // 后端接口的基础域名（真实请求地址）
          changeOrigin: true, // 关键：修改请求头的 Origin 为 target 域名（解决跨域核心）
          // 可选：支持 HTTPS 接口（如后端是 https 域名）
          // secure: false, // 忽略 SSL 证书验证（开发环境用）
          // 可选：自定义请求头
          // headers: {
          //   'X-Real-IP': '127.0.0.1'
          // }
        },
      },
    },
  };
});
