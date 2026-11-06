/**
 * @file A technician can see and open the tickets assigned to them.
 * @see docs/tests/TICK-12.md
 */

describe('Abstract Support', () => {
    it('Le technicien peux voir les tickets qui lui sont assigné', () => {
        const titre = `test visibilité des ticket assigner au technicien ${Date.now()}`

        // Se connecter avec un compte responsable support
        cy.login('MANAGER')
        // Créer un nouveau ticket
        cy.get('main a[href="/tickets/new"]').click()
        cy.get('input[name="title"]').type(titre)
        cy.get('select[name="categoryId"]').select('Réseaux')
        cy.get('input[name="priority"]').check('urgent')
        cy.get('textarea[name="description"]').type('Test si un technicien à acces aux tickets qui lui sont assignés.')
        cy.contains('button', 'Envoyer le ticket').click()
        cy.contains('button', /Confirmer l.envoi/).click()
        // Selectionner le ticket
        cy.contains('a', titre).click()
        // Assignation du ticket
        cy.get('select[id="ticket-assignee"]').select('Quentin')
        cy.get('select[id="ticket-priority"]').select('Moyenne')
        cy.contains('button', 'Affecter').click()
        // Se deconnecter
        cy.contains('button', 'Déconnexion').click()

        // Se connecter avec le compte technicien Quentin
        cy.login('TECHNICIAN')
        // Vérifier que le ticket lui est bien assigné
        cy.get('aside a[href="/tickets"]').click()
        cy.contains('a', titre).click()
        cy.get('h1').should('contain', titre)
    })
})