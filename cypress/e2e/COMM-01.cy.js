describe('Abstract Support', () => {
    beforeEach(() => {
        cy.login('COLLABORATOR')
    })

    it('Création d\'un commentaire avec des données valides', () => {
        // Le test crée son propre ticket : il ne dépend plus de TICK-01
        const titre = `Ticket à commenter ${Date.now()}`
        const commentaire = 'Je suis un commentaire'

        cy.get('main a[href="/tickets/new"]').click()
        cy.get('input[name="title"]').type(titre)
        cy.get('select[name="categoryId"]').select('Réseaux')
        cy.get('input[name="priority"]').check('low')
        cy.get('textarea[name="description"]').type('Ticket créé pour tester les commentaires.')
        cy.contains('button', 'Envoyer le ticket').click()
        cy.contains('button', /Confirmer l.envoi/).click()
        cy.location('pathname').should('eq', '/tickets')

        // Ajouter le commentaire
        cy.contains('a', titre).click()
        cy.get('textarea[name="body"]').type(commentaire)
        cy.contains('button', 'Publier').click()

        // Vérifier que le commentaire est affiché
        cy.contains('p', commentaire).should('be.visible')
    })
})