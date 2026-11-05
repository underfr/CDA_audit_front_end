import { mkdirSync, writeFileSync } from "node:fs";
import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    viewportWidth: 1280,
    viewportHeight: 720,
    setupNodeEvents(on) {
      // Résultats bruts, transformés en rapport par scripts/test-report.mjs
      on("after:run", (results) => {
        mkdirSync("reports", { recursive: true });
        writeFileSync("reports/e2e.json", JSON.stringify(results.runs ?? []));
      });
    },
  },
});