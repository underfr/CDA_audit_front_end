describe('Abstract Support', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/login', {
            onBeforeLoad(win) {
            win.indexedDB.deleteDatabase('firebaseLocalStorageDb')
            },
        })
    })
    it("Un collaborateur ne peut pas consulter le ticket d'un autre collaborateur", ()=>{
        // Se connecter avec le compte du collaborateur B
        cy.get('input[name="email"]').type('benoitvicaireformation@gmail.com')
        cy.get('input[name="password"]').type('Poilutes13!')
        cy.contains('button',' Se connecter').click()
        cy.location('pathname').should('not.eq', '/login')
        // Créer un nouveau ticket
        cy.get('main a[href="/tickets/new"]').click()
        cy.get('input[name="title"]').type('test confidentialité ticket entre collaborateurs')
        cy.get('select[name="categoryId"]').select('Réseaux')
        cy.get('input[name="priority"]').check('urgent')
        cy.get('textarea[name="description"]').type("Test si un collaborateur peut consulter le ticket d'un autre collaborateur.")
        cy.contains('button','Envoyer le ticket').click()
        cy.contains('button'," Confirmer l’envoi ").click()
        // Selectionner le ticket et garder son URL
        cy.contains('a','test confidentialité ticket entre collaborateurs').click()
        cy.location('pathname').as('urlTicket')
        // Se deconnecter
        cy.contains('button','Déconnexion').click()
        // Se connecter avec le compte du collaborateur A
        cy.get('input[name="email"]').type('underfr31@icloud.com')
        cy.get('input[name="password"]').type('dytgob-hYjqoc-5morpo')
        cy.contains('button',' Se connecter').click()
        cy.location('pathname').should('not.eq', '/login')
        // Vérifier que le ticket n'apparaît pas dans sa liste
        cy.get('aside a[href="/tickets"]').click()
        cy.get('main').should('be.visible')
        cy.contains('a','test confidentialité ticket entre collaborateurs').should('not.exist')
        // Vérifier que l'accès par l'URL directe est refusé
        cy.get('@urlTicket').then((url) => {
            cy.visit('http://localhost:3000' + url)
            cy.contains('test confidentialité ticket entre collaborateurs').should('not.exist')
        })
    })
})