import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      thresholds: { lines: 100, branches: 100, functions: 100, statements: 100 },
      include: ["src/**/*.ts"], exclude: ["src/index.ts"]
    }
  }
});
