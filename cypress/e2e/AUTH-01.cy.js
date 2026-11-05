describe('Abstract Support', () => {
  it('Connexion avec les données valides', () => {
    cy.login('COLLABORATOR')
    // Vérification de la redirection vers le dashboard
    cy.location('pathname').should('eq', '/dashboard')
  })
})