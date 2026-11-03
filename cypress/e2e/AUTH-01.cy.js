describe('Abstract Support', () => {
  it('passes', () => {
    cy.visit('http://localhost:3000/login')
  })

  it('Connexion avec les données valides',()=>{
    cy.get('input[name="email"]').type('jean.jacque@mail.com')
    cy.get('input[name="password"]').type('Jean@31!')
    cy.contains('button','Se Connecter').click()
    // Vérification de la redirection vers le dashboard
    cy.location('pathname').should('eq','/dashboard')
  })
})