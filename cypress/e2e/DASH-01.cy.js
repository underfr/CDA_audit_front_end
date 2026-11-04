describe('Abstract Support', () => {
  it('Redirige vers /login si on accède au dashboard sans être connecté', () => {
    cy.visit('http://localhost:3000/dashboard', {
      onBeforeLoad(win) {
        win.indexedDB.deleteDatabase('firebaseLocalStorageDb')
      },
    })

    cy.location('pathname').should('eq', '/login')
    cy.get('input[name="email"]').should('be.visible')
  })
})
