describe('Abstract Support', () => {
  beforeEach(() => {
  
  cy.window().then((win) => {
    win.indexedDB.deleteDatabase('firebaseLocalStorageDb')
  })
  cy.visit('http://localhost:3000/login')
  cy.get('input[name="email"]').type('jean.jacque@mail.com')
  cy.get('input[name="password"]').type('Jean@31!')
  cy.contains('button',' Se connecter').click()
    // Vérification de la redirection vers le dashboard
  cy.location('pathname').should('eq','/dashboard')
})

  it('Déconnexion',()=>{
    cy.contains('button', 'Déconnexion').click()
   cy.location('pathname').should('eq', '/login')
  })
})