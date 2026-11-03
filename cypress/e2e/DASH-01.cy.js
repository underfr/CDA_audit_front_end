describe('Abstract Support', () => {
  it('passes', () => {
    cy.visit('http://localhost:3000/login')
    
  })

  it('Accès à la page sans être connecté',()=>{
    cy.visit('http://localhost:3000/dashboard')
    cy.location('pathname').should('eq','/dashboard')
    
  })
})