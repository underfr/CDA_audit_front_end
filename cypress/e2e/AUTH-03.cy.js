describe('Abstract Support', () => {
  beforeEach(() => {
    cy.login('COLLABORATOR')
  })

  it('Déconnexion', () => {
    cy.contains('button', 'Déconnexion').click()
    cy.location('pathname').should('eq', '/login')
  })
})