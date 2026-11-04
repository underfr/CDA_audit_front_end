// Connexion avec un compte de test. Les identifiants viennent de cypress.env.json (local)
// ou des secrets CYPRESS_<ROLE>_EMAIL / CYPRESS_<ROLE>_PASSWORD (GitHub Actions).
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