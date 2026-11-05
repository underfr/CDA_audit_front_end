describe('Abstract Support', () => {
    beforeEach(() => {
        cy.login('COLLABORATOR')
    })

    it('Persistance des données apres rechargement du formulaire de création d\'un ticket',()=>{
        const titre = `Persistance des données ${Date.now()}`
        // Se rendre sur la page création d'un nouveau ticket
        cy.get('main a[href="/tickets/new"]').click()
        //Remplir le formulaire
        cy.get('input[name="title"]').type(titre)
        cy.get('select[name="categoryId"]').select('Réseaux')
        cy.get('input[name="priority"]').check('medium')
        cy.get('textarea[name="description"]').type('Vérifier si le formulaire reste rempli après le rechargement de la page.')
        // Recharger la page 
        cy.reload()
        cy.location('pathname').should('eq', '/tickets/new')
        // Vérifier que les données remplies sont toujours présentes
        cy.get('input[name="title"]').should('have.value', titre)
        cy.get('select[name="categoryId"]').find('option:selected').should('have.text', 'Réseaux')
        cy.get('input[name="priority"][value="medium"]').should('be.checked')
        cy.get('textarea[name="description"]').should('have.value', 'Vérifier si le formulaire reste rempli après le rechargement de la page.')
    })
})