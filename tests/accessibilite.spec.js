/**
 * @file Accessibility audit of the signed-in pages with axe, using an admin test account.
 */

import { existsSync, readFileSync } from "node:fs";
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/** Same credentials as Cypress: `cypress.env.json` locally, `CYPRESS_*` secrets in GitHub Actions. */
const local = existsSync("cypress.env.json") ? JSON.parse(readFileSync("cypress.env.json", "utf8")) : {};
/** E-mail address of the admin test account. */
const email = process.env.CYPRESS_ADMIN_EMAIL || local.ADMIN_EMAIL;
/** Password of the admin test account. */
const password = process.env.CYPRESS_ADMIN_PASSWORD || local.ADMIN_PASSWORD;

/**
 * Signs in before each test.
 *
 * @throws {Error} When the credentials are missing.
 */
test.beforeEach(async ({ page }) => {
    if (!email || !password) {
        throw new Error("ADMIN_EMAIL / ADMIN_PASSWORD manquants : ajoute-les dans cypress.env.json (ou en secrets CYPRESS_* sur GitHub).");
    }
    await page.goto("/login");
    await page.fill("#login-email", email);
    await page.fill("#login-password", password);
    await page.click("button[type='submit']");
    // La page login redirige vers /dashboard après connexion
    await page.waitForURL("**/dashboard");
});

/**
 * Pages to audit.
 *
 * @type {{nom: string, url: string}[]}
 */
const pages = [
    { nom: "accueil", url: "/dashboard" },
    { nom: "tickets", url: "/tickets" },
    { nom: "pilotage", url: "/analytics" },
    { nom: "utilisateurs", url: "/admin/users" },
    { nom: "catégories", url: "/admin/categories" },
    { nom: "nouveaux tickets", url: "/tickets/new" },
    { nom: "notifications", url: "/notifications" },
];

// One test generated for each page of the list
for (const p of pages) {
    test(`la page ${p.nom} n'a pas de problème d'accessibilité`, async ({ page }) => {
        await page.goto(p.url);

        // Le contenu s'affiche une fois le middleware passé : sans redirection, on est bien sur la bonne page
        await expect(page.locator("main")).toBeVisible();
        await expect(page).toHaveURL(p.url);
        // Les données Firebase arrivent par WebSocket : on attend la fin du chargement avant d'analyser
        await expect(page.getByText(/Chargement/)).toHaveCount(0);

        const resultats = await new AxeBuilder({ page }).analyze();

        const problemes = [];
        for (const v of resultats.violations) {
            for (const n of v.nodes) {
                problemes.push(v.id + " : " + n.target.join(" "));
            }
        }

        // Le test échouera vraiment s'il y a des violations
        expect(problemes).toEqual([]);
    });
}