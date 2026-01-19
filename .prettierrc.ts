// ═══════════════════════════════════════════════════
// PRETTIER CONFIGURATION (Next.js 16 Best Practices)
// ═══════════════════════════════════════════════════

import type { Config } from "prettier";

const config: Config = {
  // ═══════════════════════════════════════════════════
  // Core Formatting Options
  // ═══════════════════════════════════════════════════
  semi: true,
  trailingComma: "es5",
  singleQuote: false,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  arrowParens: "always",
  endOfLine: "lf",
  bracketSpacing: true,
  bracketSameLine: false,

  // ═══════════════════════════════════════════════════
  // Plugin Configuration
  // ═══════════════════════════════════════════════════
  plugins: [
    "prettier-plugin-tailwindcss",
    "prettier-plugin-organize-imports",
    "prettier-plugin-packagejson",
    "prettier-plugin-sort-json",
  ],

  // Prettier Plugin: Tailwind CSS
  tailwindConfig: "",
  tailwindAttributes: ["class", "className"],
  tailwindFunctions: ["clsx", "cn", "cva", "twMerge", "twJoin"],

  // ═══════════════════════════════════════════════════
  // File-Specific Overrides
  // ═══════════════════════════════════════════════════
  overrides: [
    {
      files: "*.json",
      options: {
        printWidth: 80,
      },
    },
    {
      files: "*.md",
      options: {
        proseWrap: "always",
        printWidth: 80,
      },
    },
    {
      files: "*.yaml",
      options: {
        tabWidth: 2,
      },
    },
    {
      files: "*.yml",
      options: {
        tabWidth: 2,
      },
    },
  ],

  // ═══════════════════════════════════════════════════
  // Ignore Patterns
  // ═══════════════════════════════════════════════════
  // Note: Use .prettierignore file for complex patterns
};

export default config;
