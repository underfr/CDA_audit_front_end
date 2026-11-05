describe('Abstract Support', () => {
  beforeEach(() => {
    cy.visit('/login', {
      onBeforeLoad(win) {
        win.indexedDB.deleteDatabase('firebaseLocalStorageDb')
      },
    })
  })

  // On vérifie l'état de validité du champ (validity) et pas le message du navigateur :
  // le message dépend de la langue (français en local, anglais dans GitHub Actions).

  it('Connexion avec identifiant invalides', () => {
    cy.get('input[name="email"]').type('adresse-sans-arobase.com')
    cy.get('input[name="password"]').type('peu-importe')
    cy.contains('button', 'Se connecter').click()
    cy.get('input[name="email"]').invoke('prop', 'validity').its('typeMismatch').should('be.true')
    cy.location('pathname').should('eq', '/login')
  })

  it('Connexion avec mot de passe invalide', () => {
    // Vrai compte de test + faux mot de passe
    cy.env(['COLLABORATOR_EMAIL']).then(({ COLLABORATOR_EMAIL }) => {
      cy.get('input[name="email"]').type(COLLABORATOR_EMAIL)
    })
    cy.get('input[name="password"]').type('mauvais-mot-de-passe')
    cy.contains('button', 'Se connecter').click()
    // Message affiché par l'appli (toujours en français)
    cy.get('div').should('contain', 'Adresse e-mail ou mot de passe incorrect.')
  })

  it('Connexion sans identifiant', () => {
    cy.get('input[name="password"]').type('peu-importe')
    cy.contains('button', 'Se connecter').click()
    cy.get('input[name="email"]').invoke('prop', 'validity').its('valueMissing').should('be.true')
    cy.location('pathname').should('eq', '/login')
  })

  it('Connexion sans mot de passe', () => {
    cy.get('input[name="email"]').type('test@example.com')
    cy.contains('button', 'Se connecter').click()
    cy.get('input[name="password"]').invoke('prop', 'validity').its('valueMissing').should('be.true')
    cy.location('pathname').should('eq', '/login')
  })

  it('Connexion sans aucun champs', () => {
    cy.contains('button', 'Se connecter').click()
    cy.get('input[name="email"]').invoke('prop', 'validity').its('valueMissing').should('be.true')
    cy.location('pathname').should('eq', '/login')
  })
})