describe('Abstract Support', () => {
  it('passes', () => {
    cy.visit('http://localhost:3000/login')
  })

  it('Connexion avec identifiant invalides',()=>{
    cy.get('input[name="email"]').type('jeanjacque.com')
    cy.get('input[name="password"]').type('Jean@31!')
    cy.contains('button','Se Connecter').click()
    cy.get('p').should('contain',"identifiant ou mot de passe incorect.")
  })

  it('Connexion avec mot de passe invalide',()=>{
    cy.get('input[name="email"]').type('jean.jacque@mail.com')
    cy.get('input[name="password"]').type('unAutreMotDePasse')
    cy.contains('button','Se Connecter').click()
    // Récupérer le message d'erreur
    cy.get('p').should('contain',"identifiant ou mot de passe incorect.")
  })

  it('Connexion sans identifiant',()=>{
    cy.get('input[name="password"]').type('Jean@31!')
    cy.contains('button','Se Connecter').click()
    // Récupérer le message d'erreur
    cy.get('p').should('contain',"Veuillez remplir tout les champs.")

  })

  it('Connexion sans mot de passe',()=>{
    cy.get('input[name="email"]').type('jean.jacque@mail.com')
    cy.contains('button','Se Connecter').click()
    // Récupérer le message d'erreur
    cy.get('p').should('contain',"Veuillez remplir tout les champs.")
    
  })
  it('Connexion sans aucun champs',()=>{
    cy.contains('button','Se Connecter').click()
    // Récupérer le message d'erreur
    cy.get('p').should('contain',"Veuillez remplir tout les champs.")
    
  })

})