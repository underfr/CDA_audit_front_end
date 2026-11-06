/**
 * @file The dashboard redirects signed-out visitors to the login page.
 * @see docs/tests/DASH-01.md
 */

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

  it('Refuse la lecture des tickets côté serveur sans être connecté', () => {
    cy.visit('/login')
    cy.window().its('__NUXT__.config.public.firebase').then((firebase) => {
      cy.request({
        url: `${firebase.databaseURL}/tickets.json`,
        failOnStatusCode: false, // on attend un refus : Cypress ne doit pas s'arrêter dessus
      }).then((response) => {
        expect(response.status).to.eq(401)
      })
    })
  })
})