/**
 * @file Custom Cypress commands.
 */

/**
 * Signs in with a test account from an empty Firebase session, then waits for the dashboard.
 * The credentials come from `cypress.env.json` (local)
 * or from the `CYPRESS_<ROLE>_EMAIL` / `CYPRESS_<ROLE>_PASSWORD` secrets (GitHub Actions).
 *
 * @example cy.login('MANAGER')
 * @param {string} role - Upper-case account name, for example `COLLABORATOR` or `TECHNICIAN`.
 * @throws {Error} When the credentials of this account are missing.
 */
Cypress.Commands.add('login', (role) => {
    const emailKey = `${role}_EMAIL`
    const passwordKey = `${role}_PASSWORD`

    cy.env([emailKey, passwordKey]).then((env) => {
        if (!env[emailKey] || !env[passwordKey]) {
            throw new Error(`${emailKey} / ${passwordKey} manquants : ajoute-les dans cypress.env.json (ou en secrets CYPRESS_* sur GitHub).`)
        }

        cy.visit('/login', {
            // Repart d'une session Firebase vide
            onBeforeLoad(win) {
                win.indexedDB.deleteDatabase('firebaseLocalStorageDb')
            },
        })
        cy.get('input[name="email"]').type(env[emailKey])
        cy.get('input[name="password"]').type(env[passwordKey], { log: false })
        cy.contains('button', 'Se connecter').click()
        cy.location('pathname').should('eq', '/dashboard')
    })
})