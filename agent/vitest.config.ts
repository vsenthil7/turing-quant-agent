import { defineConfig } from "vitest/config";
import { resolve } from "node:path";
export default defineConfig({
  resolve: {
    alias: { "@tqa/core": resolve(__dirname, "../packages/core/src/index.ts") }
  },
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      thresholds: { lines: 100, branches: 100, functions: 100, statements: 100 },
      include: ["src/**/*.ts"],
      exclude: ["src/index.ts", "src/types.ts", "src/main.ts", "src/adapters/**"]
    }
  }
});
