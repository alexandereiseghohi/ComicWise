import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./src/tests/setup.ts"],
    include: ["src/tests/unit/**/*.test.ts", "src/tests/unit/**/*.test.tsx"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
      "**/playwright-report/**",
      "**/test-results/**",
      "src/tests/**/*.spec.ts", // Exclude Playwright E2E tests
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "tests/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/mockData/",
        "**/*.spec.ts",
        "**/*.test.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      actions: path.resolve(__dirname, "./src/lib/actions"),
      admin: path.resolve(__dirname, "./src/components/admin"),
      appConfig: path.resolve(__dirname, "./appConfig"),
      assets: path.resolve(__dirname, "./src/assets"),
      auth: path.resolve(__dirname, "./src/lib/auth"),
      authAdapter: path.resolve(__dirname, "./src/lib/authAdapter"),
      authConfig: path.resolve(__dirname, "./src/lib/authConfig"),
      dal: path.resolve(__dirname, "./src/dal"),
      database: path.resolve(__dirname, "./src/database"),
      db: path.resolve(__dirname, "./src/database/db"),
      dto: path.resolve(__dirname, "./src/dto"),
      emails: path.resolve(__dirname, "./src/components/emails"),
      env: path.resolve(__dirname, "./src/lib/env"),
      hooks: path.resolve(__dirname, "./src/hooks"),
      layout: path.resolve(__dirname, "./src/components/layout"),
      lib: path.resolve(__dirname, "./src/lib"),
      mutations: path.resolve(__dirname, "./src/database/mutations"),
      public: path.resolve(__dirname, "./public"),
      queries: path.resolve(__dirname, "./src/database/queries"),
      redis: path.resolve(__dirname, "./redis"),
      schema: path.resolve(__dirname, "./src/database/schema"),
      services: path.resolve(__dirname, "./src/services"),
      src: path.resolve(__dirname, "./src"),
      stores: path.resolve(__dirname, "./src/stores"),
      styles: path.resolve(__dirname, "./src/styles"),
      tests: path.resolve(__dirname, "./src/tests"),
      types: path.resolve(__dirname, "./src/types"),
      ui: path.resolve(__dirname, "./src/ui"),
      utils: path.resolve(__dirname, "./src/lib/utils"),
      validations: path.resolve(__dirname, "./src/lib/validations"),
    },
  },
});
