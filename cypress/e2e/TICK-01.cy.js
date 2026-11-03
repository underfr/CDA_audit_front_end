describe('Abstract Support', () => {
  beforeEach(() => {
    cy.session('jean', ()=>{
      cy.visit('http://localhost:3000/login')
      cy.get('input[name="email"]').type('jeanjacque@gmail.com')
      cy.get('input[name="password"]').type('Jean@31!')
      cy.contains('button','Se Connecter').click()
      cy.location('pathname').should('not.eq', '/login')
    })
  })

  it('Créer un nouveau ticket',()=>{
    cy.visit('http://localhost:3000/tickets/new')
    cy.get('input[name="title"]').type('Mot de passe expiré, compte verrouillé')
    cy.get('select[name="categorieId"]').select('Réseau')
    cy.get('input[name="priority"]').check('URGENT')
    cy.get('textarea[name="description"]').type('Depuis ce matin, impossible de me connecter à mon poste et à ma messagerie.')
    cy.contains('button','Envoyer le ticket').click()
    
    // Vérifier si le ticket est bien affiché
    cy.visit('http://localhost:3000/tickets')
    cy.contains('tr','Mot de passe expiré, compte verrouillé').should('be.visible')
  })



})