import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Connexion avant chaque test
test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/login");
    await page.fill("#login-email", "jean.jacque@mail.com");
    await page.fill("#login-password", "Jean@31!");
    await page.click("button[type='submit']");
    // La page login redirige vers /dashboard après connexion
    await page.waitForURL("**/dashboard");
});

// Liste des pages à auditer
const pages = [
    { nom: "accueil", url: "/dashboard" },
    { nom: "tickets", url: "/tickets" },
    { nom: "pilotage", url: "/analytics" },
    { nom: "utilisateurs", url: "/admin/users" },
    { nom: "catégories", url: "/admin/categories" },
    { nom: "nouveaux tickets", url: "/tickets/new" },
    { nom: "notifications", url: "/notifications" },
];

// Un test généré pour chaque page de la liste
for (const p of pages) {
    test(`la page ${p.nom} n'a pas de problème d'accessibilité`, async ({ page }) => {
        await page.goto("http://localhost:3000" + p.url);
        await page.waitForLoadState("networkidle");
        console.log("Page analysée :", page.url());

        const resultats = await new AxeBuilder({ page })
            .exclude(".nuxt-devtools-frame, .nuxt-devtools-label, .nuxt-devtools-label-secondary")
            .analyze();

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