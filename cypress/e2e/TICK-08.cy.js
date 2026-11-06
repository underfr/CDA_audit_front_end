/**
 * @file The ticket creation page redirects signed-out visitors to the login page.
 * @see docs/tests/TICK-08.md
 */

describe('Abstract Support', () => {
  it('Redirige vers /login si on accède à la page de création d\'un ticket sans être connecté', () => {
    cy.visit('http://localhost:3000/tickets/new', {
      onBeforeLoad(win) {
        win.indexedDB.deleteDatabase('firebaseLocalStorageDb')
      },
    })

    cy.location('pathname').should('eq', '/login')
    cy.get('input[name="email"]').should('be.visible')
  })
})