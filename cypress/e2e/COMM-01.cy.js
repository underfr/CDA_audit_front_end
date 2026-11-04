describe('Abstract Support', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/login', {
      // Supprime la session Firebase avant le chargement de l'application
        onBeforeLoad(win) {
            win.indexedDB.deleteDatabase('firebaseLocalStorageDb')
        },
    })
    cy.get('input[name="email"]').type('jean.jacque@mail.com')
    cy.get('input[name="password"]').type('Jean@31!')
    cy.contains('button',' Se connecter').click()
    cy.location('pathname').should('not.eq', '/login')
        
    })
    it('Création d\'un commentaire avec des données valides',()=>{
        cy.visit('http://localhost:3000/tickets')
        cy.contains('a','Mot de passe expiré, compte verrouillé').click()
        cy.get('textarea[name="body"]').type('Je suis un commentaire')
        cy.contains('button',' Publier').click()
    })
})