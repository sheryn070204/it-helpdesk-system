// This file helps catch mistakes in your code (like a spell checker for code)
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  // Use the standard rules for Next.js projects
  ...nextVitals,
  // Tell the tool which folders it should NOT check
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

// Export the rules so the tool can use them
export default eslintConfig;
