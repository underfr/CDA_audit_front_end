/**
 * @file A ticket created with valid data appears in the ticket list.
 * @see docs/tests/TICK-01.md
 */

describe('Abstract Support', () => {
    beforeEach(() => {
        cy.login('COLLABORATOR')
    })

    it('Créer un ticket avec des données valides', () => {
        // Titre unique : on est sûr de retrouver CE ticket et pas un ancien
        const titre = `Mot de passe expiré, compte verrouillé ${Date.now()}`

        cy.get('main a[href="/tickets/new"]').click()
        cy.get('input[name="title"]').type(titre)
        cy.get('select[name="categoryId"]').select('Réseaux')
        cy.get('input[name="priority"]').check('urgent')
        cy.get('textarea[name="description"]').type('Depuis ce matin, impossible de me connecter à mon poste et à ma messagerie.')
        cy.contains('button', 'Envoyer le ticket').click()
        cy.contains('button', /Confirmer l.envoi/).click()
        // Vérifier si le ticket est bien affiché
        // On attend la redirection faite par l'appli après la création (un cy.visit l'interromprait)
        cy.location('pathname').should('eq', '/tickets')
        cy.contains('a', titre).should('be.visible')
    })
})