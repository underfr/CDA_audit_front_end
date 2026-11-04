describe('Abstract Support', () => {
beforeEach(() => {
  cy.visit('http://localhost:3000/login', {
    onBeforeLoad(win) {
      win.indexedDB.deleteDatabase('firebaseLocalStorageDb')
    },
  })
})

  it('Connexion avec identifiant invalides',()=>{
    cy.get('input[name="email"]').type('jeanjacque.com')
    cy.get('input[name="password"]').type('Jean@31!')
    cy.contains('button',' Se connecter').click()
    cy.get('input[name="email"]').invoke('prop', 'validationMessage').should('contain', '@')
  })

  it('Connexion avec mot de passe invalide',()=>{
    cy.get('input[name="email"]').type('jean.jacque@mail.com')
    cy.get('input[name="password"]').type('unAutreMotDePasse')
    cy.contains('button','Se connecter').click()
    // Récupérer le message d'erreur
    cy.get('div').should('contain',"Adresse e-mail ou mot de passe incorrect.")
  })

  it('Connexion sans identifiant',()=>{
    cy.get('input[name="password"]').type('Jean@31!')
    cy.contains('button',' Se connecter').click()
    // Récupérer le message d'erreur
    
    cy.get('input[name="email"]').invoke('prop', 'validationMessage').should('contain', 'Veuillez renseigner ce champ.')

  })

  it('Connexion sans mot de passe',()=>{
    cy.get('input[name="email"]').type('jean.jacque@mail.com')
    cy.contains('button',' Se connecter').click()
    // Récupérer le message d'erreur
    cy.get('input[name="password"]').invoke('prop', 'validationMessage').should('contain', 'Veuillez renseigner ce champ.')

    
  })
  it('Connexion sans aucun champs',()=>{
    cy.contains('button',' Se connecter').click()
    // Récupérer le message d'erreur
        cy.get('input[name="email"]').invoke('prop', 'validationMessage').should('contain', 'Veuillez renseigner ce champ.')

    
  })

})