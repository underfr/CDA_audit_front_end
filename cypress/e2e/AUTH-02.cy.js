describe('Abstract Support', () => {
  beforeEach(() => {
    cy.visit('/login', {
      onBeforeLoad(win) {
        win.indexedDB.deleteDatabase('firebaseLocalStorageDb')
      },
    })
  })

  it('Connexion avec identifiant invalides', () => {
    cy.get('input[name="email"]').type('adresse-sans-arobase.com')
    cy.get('input[name="password"]').type('peu-importe')
    cy.contains('button', 'Se connecter').click()
    cy.get('input[name="email"]').invoke('prop', 'validationMessage').should('contain', '@')
  })

  it('Connexion avec mot de passe invalide', () => {
    // Vrai compte de test + faux mot de passe
    cy.env(['COLLABORATOR_EMAIL']).then(({ COLLABORATOR_EMAIL }) => {
      cy.get('input[name="email"]').type(COLLABORATOR_EMAIL)
    })
    cy.get('input[name="password"]').type('mauvais-mot-de-passe')
    cy.contains('button', 'Se connecter').click()
    // Récupérer le message d'erreur
    cy.get('div').should('contain', 'Adresse e-mail ou mot de passe incorrect.')
  })

  it('Connexion sans identifiant', () => {
    cy.get('input[name="password"]').type('peu-importe')
    cy.contains('button', 'Se connecter').click()
    // Récupérer le message d'erreur
    cy.get('input[name="email"]').invoke('prop', 'validationMessage').should('contain', 'Veuillez renseigner ce champ.')
  })

  it('Connexion sans mot de passe', () => {
    cy.get('input[name="email"]').type('test@example.com')
    cy.contains('button', 'Se connecter').click()
    // Récupérer le message d'erreur
    cy.get('input[name="password"]').invoke('prop', 'validationMessage').should('contain', 'Veuillez renseigner ce champ.')
  })

  it('Connexion sans aucun champs', () => {
    cy.contains('button', 'Se connecter').click()
    // Récupérer le message d'erreur
    cy.get('input[name="email"]').invoke('prop', 'validationMessage').should('contain', 'Veuillez renseigner ce champ.')
  })
})