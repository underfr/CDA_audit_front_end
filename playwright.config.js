/**
 * @file Playwright configuration of the accessibility tests. It starts the application when needed
 * (built server in CI, dev server locally) and saves the raw results in `reports/a11y.json`.
 */

import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  reporter: [["list"], ["json", { outputFile: "reports/a11y.json" }]],
  use: {
    baseURL: "http://localhost:3000",
  },
  webServer: {
    command: process.env.CI ? "node .output/server/index.mjs" : "pnpm dev",
    url: "http://localhost:3000/login",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});