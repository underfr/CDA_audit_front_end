/**
 * @file Cypress configuration of the E2E tests, run against the local server.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    viewportWidth: 1280,
    viewportHeight: 720,
    /**
     * Saves the raw results at the end of the run, in `reports/e2e.json`.
     *
     * @param {Cypress.PluginEvents} on - Registers a handler for a Cypress event.
     */
    setupNodeEvents(on) {
      // Résultats bruts, transformés en rapport par scripts/test-report.mjs
      on("after:run", (results) => {
        mkdirSync("reports", { recursive: true });
        writeFileSync("reports/e2e.json", JSON.stringify(results.runs ?? []));
      });
    },
  },
});