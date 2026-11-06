/**
 * @file A collaborator cannot see another collaborator's ticket, in their list or through its URL.
 * @see docs/tests/ROLE-01.md
 */

describe('Abstract Support', () => {
    it("Un collaborateur ne peut pas consulter le ticket d'un autre collaborateur", () => {
        const titre = `test confidentialité ticket entre collaborateurs ${Date.now()}`

        // Se connecter avec le compte du collaborateur B
        cy.login('COLLABORATOR')
        // Créer un nouveau ticket
        cy.get('main a[href="/tickets/new"]').click()
        cy.get('input[name="title"]').type(titre)
        cy.get('select[name="categoryId"]').select('Réseaux')
        cy.get('input[name="priority"]').check('urgent')
        cy.get('textarea[name="description"]').type("Test si un collaborateur peut consulter le ticket d'un autre collaborateur.")
        cy.contains('button', 'Envoyer le ticket').click()
        cy.contains('button', /Confirmer l.envoi/).click()
        // Selectionner le ticket et garder son URL
        cy.contains('a', titre).click()
        cy.location('pathname').as('urlTicket')
        // Se deconnecter
        cy.contains('button', 'Déconnexion').click()

        // Se connecter avec le compte du collaborateur A
        cy.login('COLLABORATOR_2')
        // Vérifier que le ticket n'apparaît pas dans sa liste
        cy.get('aside a[href="/tickets"]').click()
        cy.get('main').should('be.visible')
        cy.contains('a', titre).should('not.exist')
        // Vérifier que l'accès par l'URL directe est refusé
        cy.get('@urlTicket').then((url) => {
            cy.visit(url)
            cy.contains(titre).should('not.exist')
        })
    })
})