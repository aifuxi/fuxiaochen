import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    globals: false,
    include: ["lib/**/*.test.ts", "components/**/*.test.ts", "components/**/*.test.tsx"],
  },
});
