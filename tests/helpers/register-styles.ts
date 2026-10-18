import { registerHooks } from "node:module";

// Node 的服务端组件测试只核对 HTML；样式由类型检查、构建与真实浏览器回归覆盖。
registerHooks({
  load(url, context, nextLoad) {
    if (url.endsWith(".css")) return { format: "module", source: "export {};", shortCircuit: true };
    return nextLoad(url, context);
  },
});
